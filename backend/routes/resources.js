const express = require('express');
const { body } = require('express-validator');
const TeacherResource = require('../models/TeacherResource');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Create a teacher resource
// @route   POST /api/resources
// @access  Private (teacher, education_officer)
router.post('/', authenticate, authorize('teacher', 'education_officer'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('resourceType').isIn(['Lab Guide', 'Lesson Plan', 'Worksheet', 'Assessment Template', 'Video Tutorial', 'Reference Material']),
  body('subject').isIn(['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'Engineering']),
  body('gradeLevel').isInt({ min: 1, max: 12 }).withMessage('Grade level must be between 1 and 12')
], validateRequest, asyncHandler(async (req, res) => {
  const resource = await TeacherResource.create({
    ...req.body,
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, message: 'Resource created', resource });
}));

// @desc    Get all resources (filterable by subject, board, grade)
// @route   GET /api/resources
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { subject, board, gradeLevel, resourceType } = req.query;
  const filter = {};
  if (subject) filter.subject = subject;
  if (board) filter.board = board;
  if (gradeLevel) filter.gradeLevel = parseInt(gradeLevel);
  if (resourceType) filter.resourceType = resourceType;

  const resources = await TeacherResource.find(filter)
    .populate('createdBy', 'name email')
    .populate('linkedLab', 'title labType')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: resources.length, resources });
}));

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const resource = await TeacherResource.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('linkedLab', 'title labType');

  if (!resource) {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }

  res.json({ success: true, resource });
}));

// @desc    Track resource download
// @route   PUT /api/resources/:id/download
// @access  Public
router.put('/:id/download', asyncHandler(async (req, res) => {
  const resource = await TeacherResource.findByIdAndUpdate(
    req.params.id,
    { $inc: { downloads: 1 } },
    { new: true }
  );

  if (!resource) {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }

  res.json({ success: true, downloads: resource.downloads });
}));

module.exports = router;
