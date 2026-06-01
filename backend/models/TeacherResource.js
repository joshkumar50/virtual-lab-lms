const mongoose = require('mongoose');

const teacherResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  resourceType: {
    type: String,
    enum: ['Lab Guide', 'Lesson Plan', 'Worksheet', 'Assessment Template', 'Video Tutorial', 'Reference Material'],
    required: true
  },
  subject: {
    type: String,
    enum: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'Engineering'],
    required: true
  },
  board: {
    type: String,
    enum: ['CBSE', 'ICSE', 'State Board', 'All'],
    default: 'All'
  },
  gradeLevel: {
    type: Number,
    min: 1,
    max: 12,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    default: null
  },
  linkedLab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: false
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

teacherResourceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

teacherResourceSchema.index({ subject: 1, board: 1, gradeLevel: 1 });

module.exports = mongoose.model('TeacherResource', teacherResourceSchema);
