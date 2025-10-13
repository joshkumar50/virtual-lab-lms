const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
    maxlength: [100, 'Course title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a course category'],
    enum: ['Engineering', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Biology']
  },
  level: {
    type: String,
    required: [true, 'Please provide a course level'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    type: Number, // in weeks
    required: [true, 'Please provide course duration'],
    min: [1, 'Duration must be at least 1 week']
  },
  thumbnail: {
    type: String,
    default: null
  },
  labs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab'
  }],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: String,
    trim: true
  }],
  learningObjectives: [{
    type: String,
    trim: true
  }],
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
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for student count
courseSchema.virtual('studentCount').get(function() {
  return this.enrolledStudents.length;
});

// Virtual for lab count
courseSchema.virtual('labCount').get(function() {
  return this.labs.length;
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);

