const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');
const { validateRequest, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['student', 'teacher'])
    .withMessage('Role must be either student or teacher')
], validateRequest, asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // ***** THIS IS THE CORRECTED PART *****
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], validateRequest, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated. Please contact support.'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: user.getProfile()
  });
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user.getProfile()
  });
}));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  // In a JWT-based system, logout is typically handled on the client side
  // by removing the token. However, we can implement token blacklisting
  // or update user's last activity here if needed.
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
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

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], validateRequest, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  // Get user with password
  const user = await User.findById(userId).select('+password');
  
  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

module.exports = router;
