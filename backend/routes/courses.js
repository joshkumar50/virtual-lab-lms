const express = require('express');
const { body, param } = require('express-validator');
const Course = require('../models/Course');
const Lab = require('../models/Lab');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { category, level, instructor, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { isPublished: true, isActive: true };
  
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (instructor) filter.instructor = instructor;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const courses = await Course.find(filter)
    .populate('instructor', 'name email avatar')
    .populate('labs', 'title labType difficulty estimatedDuration')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Course.countDocuments(filter);

  res.json({
    success: true,
    count: courses.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    courses
  });
}));

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid course ID')
], validateRequest, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email avatar')
    .populate('labs', 'title description labType difficulty estimatedDuration maxScore')
    .populate('enrolledStudents', 'name email avatar');

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  res.json({
    success: true,
    course
  });
}));

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Teachers only)
router.post('/', authenticate, authorize('teacher'), [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Course description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('category')
    .isIn(['Engineering', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'])
    .withMessage('Invalid category'),
  body('level')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid level'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 week'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('prerequisites')
    .optional()
    .isArray()
    .withMessage('Prerequisites must be an array'),
  body('learningObjectives')
    .optional()
    .isArray()
    .withMessage('Learning objectives must be an array')
], validateRequest, asyncHandler(async (req, res) => {
  const courseData = {
    ...req.body,
    instructor: req.user._id
  };

  const course = await Course.create(courseData);

  // Populate instructor data
  await course.populate('instructor', 'name email avatar');

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    course
  });
}));

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Course instructor only)
router.put('/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid course ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('category')
    .optional()
    .isIn(['Engineering', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'])
    .withMessage('Invalid category'),
  body('level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid level'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 week')
], validateRequest, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check if user is the instructor or admin
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this course'
    });
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('instructor', 'name email avatar');

  res.json({
    success: true,
    message: 'Course updated successfully',
    course: updatedCourse
  });
}));

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Course instructor only)
router.delete('/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid course ID')
], validateRequest, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check if user is the instructor or admin
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this course'
    });
  }

  await Course.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Course deleted successfully'
  });
}));

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Students only)
router.post('/:id/enroll', authenticate, authorize('student'), [
  param('id').isMongoId().withMessage('Invalid course ID')
], validateRequest, asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user._id;

  const course = await Course.findById(courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  if (!course.isPublished) {
    return res.status(400).json({
      success: false,
      message: 'Course is not published yet'
    });
  }

  // Check if already enrolled
  if (course.enrolledStudents.includes(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Already enrolled in this course'
    });
  }

  // Add student to course
  course.enrolledStudents.push(userId);
  await course.save();

  // Add course to user's enrolled courses
  await User.findByIdAndUpdate(userId, {
    $addToSet: { enrolledCourses: courseId }
  });

  res.json({
    success: true,
    message: 'Successfully enrolled in course',
    course: {
      _id: course._id,
      title: course.title,
      studentCount: course.enrolledStudents.length
    }
  });
}));

// @desc    Unenroll from course
// @route   DELETE /api/courses/:id/enroll
// @access  Private (Students only)
router.delete('/:id/enroll', authenticate, authorize('student'), [
  param('id').isMongoId().withMessage('Invalid course ID')
], validateRequest, asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user._id;

  const course = await Course.findById(courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check if enrolled
  if (!course.enrolledStudents.includes(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Not enrolled in this course'
    });
  }

  // Remove student from course
  course.enrolledStudents = course.enrolledStudents.filter(
    studentId => studentId.toString() !== userId.toString()
  );
  await course.save();

  // Remove course from user's enrolled courses
  await User.findByIdAndUpdate(userId, {
    $pull: { enrolledCourses: courseId }
  });

  res.json({
    success: true,
    message: 'Successfully unenrolled from course'
  });
}));

// @desc    Get instructor's courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Teachers only)
router.get('/instructor/my-courses', authenticate, authorize('teacher'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const filter = { instructor: req.user._id };
  if (status === 'published') filter.isPublished = true;
  if (status === 'draft') filter.isPublished = false;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const courses = await Course.find(filter)
    .populate('labs', 'title labType difficulty estimatedDuration')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Course.countDocuments(filter);

  res.json({
    success: true,
    count: courses.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    courses
  });
}));

// @desc    Get student's enrolled courses
// @route   GET /api/courses/student/my-courses
// @access  Private (Students only)
router.get('/student/my-courses', authenticate, authorize('student'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const courses = await Course.find({
    enrolledStudents: req.user._id,
    isPublished: true,
    isActive: true
  })
    .populate('instructor', 'name email avatar')
    .populate('labs', 'title labType difficulty estimatedDuration')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Course.countDocuments({
    enrolledStudents: req.user._id,
    isPublished: true,
    isActive: true
  });

  res.json({
    success: true,
    count: courses.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    courses
  });
}));

module.exports = router;

