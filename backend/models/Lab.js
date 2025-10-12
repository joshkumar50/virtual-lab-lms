const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a lab title'],
    trim: true,
    maxlength: [100, 'Lab title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a lab description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  labType: {
    type: String,
    required: [true, 'Please specify lab type'],
    enum: ['LogicGateSimulator', 'PendulumLab', 'DoubleSlitLab', 'ChemistryLab', 'CircuitAnalysis']
  },
  instructions: {
    type: String,
    required: [true, 'Please provide lab instructions']
  },
  objectives: [{
    type: String,
    trim: true
  }],
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Please provide estimated duration'],
    min: [5, 'Duration must be at least 5 minutes']
  },
  difficulty: {
    type: String,
    required: [true, 'Please specify difficulty level'],
    enum: ['Easy', 'Medium', 'Hard']
  },
  maxScore: {
    type: Number,
    default: 100,
    min: [1, 'Max score must be at least 1']
  },
  parameters: {
    // Lab-specific parameters (e.g., for pendulum: length, gravity, etc.)
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
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
labSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lab', labSchema);

