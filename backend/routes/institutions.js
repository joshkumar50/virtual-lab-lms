const express = require('express');
const { body } = require('express-validator');
const Institution = require('../models/Institution');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Register a government school / institution
// @route   POST /api/institutions/register
// @access  Public (any teacher/principal can register their school)
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Institution name is required'),
  body('institutionalCode').trim().notEmpty().withMessage('Institutional code is required')
    .matches(/^(?:\d{11}|[CUS]-\d{4,5})$/).withMessage('Must be an 11-digit UDISE code or valid AISHE code'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('type').optional().isIn([
    'Government', 'Govt-Aided', 'Local Body', 'Kendriya Vidyalaya', 'Navodaya Vidyalaya',
    'State University', 'Central University', 'Deemed University', 'Private University', 'Govt Degree College', 'Private Engineering College', 'NIT/IIT/IIIT'
  ]),
  body('board').optional().isIn(['CBSE', 'ICSE', 'State Board', 'University Affiliated', 'Autonomous', 'Other']),
  body('category').optional().isIn(['Primary', 'Upper Primary', 'Secondary', 'Higher Secondary', 'Composite', 'Undergraduate', 'Postgraduate', 'Technical/Engineering'])
], validateRequest, asyncHandler(async (req, res) => {
  const { name, institutionalCode, state, district, block, type, category, board,
    principalName, contactEmail, contactPhone, address, pincode, isRural } = req.body;

  // Check for duplicate institutional code
  const existing = await Institution.findOne({ institutionalCode });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'An institution with this code is already registered'
    });
  }

  const institutionOptions = {
    name, institutionalCode, state, district, block, type, category, board,
    principalName, contactEmail, contactPhone, address, isRural,
    status: 'Active' // Auto-approve for immediate use
  };
  if (pincode) institutionOptions.pincode = pincode;

  const institution = await Institution.create(institutionOptions);

  res.status(201).json({
    success: true,
    message: 'Institution registered successfully.',
    institution
  });
}));

// @desc    Get all institutions (with optional filters)
// @route   GET /api/institutions
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { state, district, board, type, status } = req.query;
  const filter = {};
  if (state) filter.state = state;
  if (district) filter.district = district;
  if (board) filter.board = board;
  if (type) filter.type = type;
  if (status) filter.status = status;

  const institutions = await Institution.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: institutions.length, institutions });
}));

// @desc    Get institution by ID
// @route   GET /api/institutions/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const institution = await Institution.findById(req.params.id);
  if (!institution) {
    return res.status(404).json({ success: false, message: 'Institution not found' });
  }
  res.json({ success: true, institution });
}));

// @desc    Approve / verify an institution
// @route   PUT /api/institutions/:id/verify
// @access  Private (education_officer only)
router.put('/:id/verify', authenticate, authorize('education_officer'), asyncHandler(async (req, res) => {
  const institution = await Institution.findByIdAndUpdate(
    req.params.id,
    { status: 'Active' },
    { new: true }
  );
  if (!institution) {
    return res.status(404).json({ success: false, message: 'Institution not found' });
  }
  res.json({ success: true, message: 'Institution verified successfully', institution });
}));

// @desc    Get public transparency / impact metrics
// @route   GET /api/institutions/public/impact-metrics
// @access  Public (no auth required — transparency)
router.get('/public/impact-metrics', asyncHandler(async (req, res) => {
  const totalInstitutions = await Institution.countDocuments({ status: 'Active' });
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalTeachers = await User.countDocuments({ role: 'teacher' });
  const totalCourses = await Course.countDocuments({ isPublished: true });

  // Rural reach
  const ruralInstitutions = await Institution.countDocuments({ isRural: true, status: 'Active' });

  // Average score across all progress records
  const scoreAgg = await Progress.aggregate([
    { $match: { score: { $ne: null } } },
    { $group: { _id: null, avgScore: { $avg: '$score' }, totalCompleted: { $sum: 1 } } }
  ]);
  const avgScore = scoreAgg[0] ? Math.round(scoreAgg[0].avgScore) : 0;
  const totalLabsCompleted = scoreAgg[0] ? scoreAgg[0].totalCompleted : 0;

  // District-wise breakdown
  const districtBreakdown = await Institution.aggregate([
    { $match: { status: 'Active' } },
    { $group: { _id: { state: '$state', district: '$district' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);

  // State-wise breakdown
  const stateBreakdown = await Institution.aggregate([
    { $match: { status: 'Active' } },
    { $group: { _id: '$state', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    metrics: {
      totalInstitutions,
      totalStudents,
      totalTeachers,
      totalCourses,
      ruralInstitutions,
      totalLabsCompleted,
      platformAverageScore: avgScore,
      districtBreakdown: districtBreakdown.map(d => ({
        state: d._id.state,
        district: d._id.district,
        institutionCount: d.count
      })),
      stateBreakdown: stateBreakdown.map(s => ({
        state: s._id,
        institutionCount: s.count
      }))
    }
  });
}));

// @desc    Get district-level education analytics
// @route   GET /api/institutions/analytics/district
// @access  Private (education_officer, teacher)
router.get('/analytics/district', authenticate, authorize('education_officer', 'teacher'), asyncHandler(async (req, res) => {
  const { state, district } = req.query;
  const matchFilter = {};
  if (state) matchFilter.state = state;
  if (district) matchFilter.district = district;

  const institutionsByDistrict = await Institution.aggregate([
    { $match: { status: 'Active', ...matchFilter } },
    {
      $group: {
        _id: { state: '$state', district: '$district' },
        totalSchools: { $sum: 1 },
        ruralSchools: { $sum: { $cond: ['$isRural', 1, 0] } },
        totalStudents: { $sum: '$totalStudents' },
        totalTeachers: { $sum: '$totalTeachers' }
      }
    },
    { $sort: { totalSchools: -1 } }
  ]);

  res.json({
    success: true,
    analytics: institutionsByDistrict.map(d => ({
      state: d._id.state,
      district: d._id.district,
      totalSchools: d.totalSchools,
      ruralSchools: d.ruralSchools,
      totalStudents: d.totalStudents,
      totalTeachers: d.totalTeachers
    }))
  });
}));

module.exports = router;
