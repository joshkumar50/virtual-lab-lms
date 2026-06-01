const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'submitted', 'graded'],
    default: 'not_started'
  },
  score: {
    type: Number,
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100'],
    default: null
  },
  maxScore: {
    type: Number,
    default: 100
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  labData: {
    // Store lab-specific data (e.g., experiment results, parameters used)
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  submissionData: {
    // Store submission details (screenshots, answers, etc.)
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot be more than 1000 characters']
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  submittedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt field before saving
progressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index to ensure one progress record per student per lab
progressSchema.index({ student: 1, lab: 1 }, { unique: true });

// Virtual for percentage score
progressSchema.virtual('percentageScore').get(function() {
  if (this.score === null || this.maxScore === 0) return null;
  return Math.round((this.score / this.maxScore) * 100);
});

// Virtual for grade letter
progressSchema.virtual('gradeLetter').get(function() {
  if (this.score === null) return null;
  
  const percentage = (this.score / this.maxScore) * 100;
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
});

// Ensure virtual fields are serialized
progressSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Progress', progressSchema);

