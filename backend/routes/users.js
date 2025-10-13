const express = require('express');
const { body, param } = require('express-validator');
const User = require('../models/User');
const Course = require('../models/Course');
const Lab = require('../models/Lab');
const Progress = require('../models/Progress');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user.getProfile()
  });
}));

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private (Teachers only)
router.get('/students', authenticate, authorize('teacher'), asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' })
    .select('name email avatar createdAt')
    .sort({ name: 1 });

  res.json({
    success: true,
    students
  });
}));

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', authenticate, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
], validateRequest, asyncHandler(async (req, res) => {
  const { name, email, avatar } = req.body;
  const userId = req.user._id;

  // Check if email is being changed and if it already exists
  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { 
      ...(name && { name }),
      ...(email && { email }),
      ...(avatar && { avatar })
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser.getProfile()
  });
}));

// @desc    Get user's learning progress
// @route   GET /api/users/progress
// @access  Private
router.get('/progress', authenticate, asyncHandler(async (req, res) => {
  const { course, status, page = 1, limit = 10 } = req.query;
  
  const filter = { student: req.user._id };
  if (course) filter.course = course;
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const progress = await Progress.find(filter)
    .populate('lab', 'title labType difficulty estimatedDuration')
    .populate('course', 'title instructor')
    .populate('gradedBy', 'name email')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Progress.countDocuments(filter);

  // Calculate overall statistics
  const stats = await Progress.aggregate([
    { $match: { student: req.user._id } },
    {
      $group: {
        _id: null,
        totalLabs: { $sum: 1 },
        completedLabs: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        submittedLabs: {
          $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] }
        },
        gradedLabs: {
          $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] }
        },
        averageScore: { $avg: '$score' },
        totalTimeSpent: { $sum: '$timeSpent' }
      }
    }
  ]);

  res.json({
    success: true,
    count: progress.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    progress,
    stats: stats[0] || {
      totalLabs: 0,
      completedLabs: 0,
      submittedLabs: 0,
      gradedLabs: 0,
      averageScore: 0,
      totalTimeSpent: 0
    }
  });
}));

// @desc    Get user's enrolled courses
// @route   GET /api/users/courses
// @access  Private
router.get('/courses', authenticate, asyncHandler(async (req, res) => {
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

// @desc    Get user dashboard statistics
// @route   GET /api/users/dashboard-stats
// @access  Private
router.get('/dashboard-stats', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get enrolled courses count
  const enrolledCoursesCount = await Course.countDocuments({
    enrolledStudents: userId,
    isPublished: true,
    isActive: true
  });

  // Get progress statistics
  const progressStats = await Progress.aggregate([
    { $match: { student: userId } },
    {
      $group: {
        _id: null,
        totalLabs: { $sum: 1 },
        completedLabs: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        submittedLabs: {
          $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] }
        },
        gradedLabs: {
          $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] }
        },
        averageScore: { $avg: '$score' },
        totalTimeSpent: { $sum: '$timeSpent' }
      }
    }
  ]);

  // Get recent activity
  const recentActivity = await Progress.find({ student: userId })
    .populate('lab', 'title labType')
    .populate('course', 'title')
    .sort({ updatedAt: -1 })
    .limit(5);

  const stats = progressStats[0] || {
    totalLabs: 0,
    completedLabs: 0,
    submittedLabs: 0,
    gradedLabs: 0,
    averageScore: 0,
    totalTimeSpent: 0
  };

  res.json({
    success: true,
    stats: {
      enrolledCourses: enrolledCoursesCount,
      totalLabs: stats.totalLabs,
      completedLabs: stats.completedLabs,
      submittedLabs: stats.submittedLabs,
      gradedLabs: stats.gradedLabs,
      averageScore: Math.round(stats.averageScore || 0),
      totalTimeSpent: stats.totalTimeSpent,
      progressPercentage: stats.totalLabs > 0 ? 
        Math.round((stats.completedLabs / stats.totalLabs) * 100) : 0
    },
    recentActivity
  });
}));

// @desc    Get all users (for admin/teacher)
// @route   GET /api/users
// @access  Private (Teachers only)
router.get('/', authenticate, authorize('teacher'), asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 10, search } = req.query;
  
  const filter = { isActive: true };
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    count: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    users
  });
}));

// @desc    Get user by ID (for admin/teacher)
// @route   GET /api/users/:id
// @access  Private (Teachers only)
router.get('/:id', authenticate, authorize('teacher'), [
  param('id').isMongoId().withMessage('Invalid user ID')
], validateRequest, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('enrolledCourses', 'title instructor');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user's progress if they're a student
  let progress = null;
  if (user.role === 'student') {
    progress = await Progress.find({ student: user._id })
      .populate('lab', 'title labType')
      .populate('course', 'title')
      .sort({ updatedAt: -1 })
      .limit(10);
  }

  res.json({
    success: true,
    user,
    progress
  });
}));

// @desc    Deactivate user account
// @route   PUT /api/users/:id/deactivate
// @access  Private (Teachers only)
router.put('/:id/deactivate', authenticate, authorize('teacher'), [
  param('id').isMongoId().withMessage('Invalid user ID')
], validateRequest, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent deactivating own account
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot deactivate your own account'
    });
  }

  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: 'User account deactivated successfully'
  });
}));

module.exports = router;

