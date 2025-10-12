const express = require('express');
const { body, param } = require('express-validator');
const Lab = require('../models/Lab');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Get all labs
// @route   GET /api/labs
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { course, labType, difficulty, page = 1, limit = 10 } = req.query;
  
  const filter = { isPublished: true, isActive: true };
  
  if (course) filter.course = course;
  if (labType) filter.labType = labType;
  if (difficulty) filter.difficulty = difficulty;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const labs = await Lab.find(filter)
    .populate('course', 'title instructor')
    .sort({ order: 1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Lab.countDocuments(filter);

  res.json({
    success: true,
    count: labs.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    labs
  });
}));

// @desc    Get single lab
// @route   GET /api/labs/:id
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid lab ID')
], validateRequest, asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.id)
    .populate('course', 'title instructor enrolledStudents');

  if (!lab) {
    return res.status(404).json({
      success: false,
      message: 'Lab not found'
    });
  }

  res.json({
    success: true,
    lab
  });
}));

// @desc    Create new lab
// @route   POST /api/labs
// @access  Private (Teachers only)
router.post('/', authenticate, authorize('teacher'), [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Lab title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Lab description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot be more than 1000 characters'),
  body('course')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('labType')
    .isIn(['LogicGateSimulator', 'PendulumLab', 'DoubleSlitLab', 'ChemistryLab', 'CircuitAnalysis'])
    .withMessage('Invalid lab type'),
  body('instructions')
    .trim()
    .notEmpty()
    .withMessage('Lab instructions are required'),
  body('estimatedDuration')
    .isInt({ min: 5 })
    .withMessage('Duration must be at least 5 minutes'),
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Invalid difficulty level'),
  body('maxScore')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Max score must be between 1 and 100'),
  body('objectives')
    .optional()
    .isArray()
    .withMessage('Objectives must be an array'),
  body('parameters')
    .optional()
    .isObject()
    .withMessage('Parameters must be an object')
], validateRequest, asyncHandler(async (req, res) => {
  const { course } = req.body;

  // Verify course exists and user is the instructor
  const courseDoc = await Course.findById(course);
  if (!courseDoc) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  if (courseDoc.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to create labs for this course'
    });
  }

  const lab = await Lab.create(req.body);

  // Add lab to course
  courseDoc.labs.push(lab._id);
  await courseDoc.save();

  // Populate course data
  await lab.populate('course', 'title instructor');

  res.status(201).json({
    success: true,
    message: 'Lab created successfully',
    lab
  });
}));

// @desc    Update lab
// @route   PUT /api/labs/:id
// @access  Private (Lab instructor only)
router.put('/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid lab ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot be more than 1000 characters'),
  body('estimatedDuration')
    .optional()
    .isInt({ min: 5 })
    .withMessage('Duration must be at least 5 minutes'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Invalid difficulty level'),
  body('maxScore')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Max score must be between 1 and 100')
], validateRequest, asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.id).populate('course');

  if (!lab) {
    return res.status(404).json({
      success: false,
      message: 'Lab not found'
    });
  }

  // Check if user is the instructor
  if (lab.course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this lab'
    });
  }

  const updatedLab = await Lab.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('course', 'title instructor');

  res.json({
    success: true,
    message: 'Lab updated successfully',
    lab: updatedLab
  });
}));

// @desc    Delete lab
// @route   DELETE /api/labs/:id
// @access  Private (Lab instructor only)
router.delete('/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid lab ID')
], validateRequest, asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.id).populate('course');

  if (!lab) {
    return res.status(404).json({
      success: false,
      message: 'Lab not found'
    });
  }

  // Check if user is the instructor
  if (lab.course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this lab'
    });
  }

  // Remove lab from course
  await Course.findByIdAndUpdate(lab.course._id, {
    $pull: { labs: lab._id }
  });

  // Delete all progress records for this lab
  await Progress.deleteMany({ lab: lab._id });

  // Delete the lab
  await Lab.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Lab deleted successfully'
  });
}));

// @desc    Start lab session
// @route   POST /api/labs/:id/start
// @access  Private (Students only)
router.post('/:id/start', authenticate, authorize('student'), [
  param('id').isMongoId().withMessage('Invalid lab ID')
], validateRequest, asyncHandler(async (req, res) => {
  const labId = req.params.id;
  const userId = req.user._id;

  const lab = await Lab.findById(labId).populate('course');

  if (!lab) {
    return res.status(404).json({
      success: false,
      message: 'Lab not found'
    });
  }

  if (!lab.isPublished) {
    return res.status(400).json({
      success: false,
      message: 'Lab is not published yet'
    });
  }

  // Check if student is enrolled in the course
  if (!lab.course.enrolledStudents.includes(userId)) {
    return res.status(403).json({
      success: false,
      message: 'You must be enrolled in the course to access this lab'
    });
  }

  // Find or create progress record
  let progress = await Progress.findOne({ student: userId, lab: labId });

  if (!progress) {
    progress = await Progress.create({
      student: userId,
      lab: labId,
      course: lab.course._id,
      status: 'in_progress',
      attempts: 1
    });
  } else {
    // Update status and increment attempts
    progress.status = 'in_progress';
    progress.attempts += 1;
    await progress.save();
  }

  res.json({
    success: true,
    message: 'Lab session started',
    progress: {
      _id: progress._id,
      status: progress.status,
      attempts: progress.attempts,
      timeSpent: progress.timeSpent,
      score: progress.score
    },
    lab: {
      _id: lab._id,
      title: lab.title,
      description: lab.description,
      instructions: lab.instructions,
      labType: lab.labType,
      parameters: lab.parameters,
      maxScore: lab.maxScore
    }
  });
}));

// @desc    Submit lab results
// @route   POST /api/labs/:id/submit
// @access  Private (Students only)
router.post('/:id/submit', authenticate, authorize('student'), [
  param('id').isMongoId().withMessage('Invalid lab ID'),
  body('labData')
    .isObject()
    .withMessage('Lab data is required'),
  body('submissionData')
    .isObject()
    .withMessage('Submission data is required'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive number')
], validateRequest, asyncHandler(async (req, res) => {
  const labId = req.params.id;
  const userId = req.user._id;
  const { labData, submissionData, timeSpent } = req.body;

  const lab = await Lab.findById(labId);

  if (!lab) {
    return res.status(404).json({
      success: false,
      message: 'Lab not found'
    });
  }

  // Find progress record
  const progress = await Progress.findOne({ student: userId, lab: labId });

  if (!progress) {
    return res.status(400).json({
      success: false,
      message: 'Lab session not started. Please start the lab first.'
    });
  }

  // Update progress with submission data
  progress.labData = labData;
  progress.submissionData = submissionData;
  progress.status = 'submitted';
  progress.submittedAt = new Date();
  if (timeSpent) progress.timeSpent = timeSpent;

  await progress.save();

  res.json({
    success: true,
    message: 'Lab submitted successfully',
    progress: {
      _id: progress._id,
      status: progress.status,
      submittedAt: progress.submittedAt,
      timeSpent: progress.timeSpent
    }
  });
}));

// @desc    Grade lab submission
// @route   PUT /api/labs/:id/grade
// @access  Private (Teachers only)
router.put('/:id/grade', authenticate, authorize('teacher'), [
  param('id').isMongoId().withMessage('Invalid lab ID'),
  body('studentId')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('score')
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('feedback')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot be more than 1000 characters')
], validateRequest, asyncHandler(async (req, res) => {
  const labId = req.params.id;
  const { studentId, score, feedback } = req.body;

  const lab = await Lab.findById(labId).populate('course');

  if (!lab) {
    return res.status(404).json({
      success: false,
      message: 'Lab not found'
    });
  }

  // Check if user is the instructor
  if (lab.course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to grade this lab'
    });
  }

  const progress = await Progress.findOne({ 
    student: studentId, 
    lab: labId 
  }).populate('student', 'name email');

  if (!progress) {
    return res.status(404).json({
      success: false,
      message: 'Student submission not found'
    });
  }

  // Update progress with grade
  progress.score = score;
  progress.feedback = feedback;
  progress.status = 'graded';
  progress.gradedBy = req.user._id;
  progress.gradedAt = new Date();

  await progress.save();

  res.json({
    success: true,
    message: 'Lab graded successfully',
    progress: {
      _id: progress._id,
      student: progress.student,
      score: progress.score,
      feedback: progress.feedback,
      status: progress.status,
      gradedAt: progress.gradedAt
    }
  });
}));

// @desc    Get lab submissions for teacher
// @route   GET /api/labs/:id/submissions
// @access  Private (Teachers only)
router.get('/:id/submissions', authenticate, authorize('teacher'), [
  param('id').isMongoId().withMessage('Invalid lab ID')
], validateRequest, asyncHandler(async (req, res) => {
  const labId = req.params.id;
  const { status, page = 1, limit = 10 } = req.query;

  const lab = await Lab.findById(labId).populate('course');

  if (!lab) {
    return res.status(404).json({
      success: false,
      message: 'Lab not found'
    });
  }

  // Check if user is the instructor
  if (lab.course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view submissions for this lab'
    });
  }

  const filter = { lab: labId };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const submissions = await Progress.find(filter)
    .populate('student', 'name email avatar')
    .populate('gradedBy', 'name email')
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Progress.countDocuments(filter);

  res.json({
    success: true,
    count: submissions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    submissions
  });
}));

// @desc    Get student's lab progress
// @route   GET /api/labs/:id/progress
// @access  Private (Students only)
router.get('/:id/progress', authenticate, authorize('student'), [
  param('id').isMongoId().withMessage('Invalid lab ID')
], validateRequest, asyncHandler(async (req, res) => {
  const labId = req.params.id;
  const userId = req.user._id;

  const progress = await Progress.findOne({ 
    student: userId, 
    lab: labId 
  }).populate('gradedBy', 'name email');

  if (!progress) {
    return res.json({
      success: true,
      progress: null,
      message: 'No progress found. Start the lab to begin.'
    });
  }

  res.json({
    success: true,
    progress
  });
}));

module.exports = router;

