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
  createdBy: {
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
  courseImage: {
    type: String,
    default: null
  },
  zoomLink: {
    type: String,
    default: null
  },
  videoUrl: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        // Validate YouTube URL format
        return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]+/.test(v);
      },
      message: 'Please provide a valid YouTube URL'
    }
  },
  materialLinks: [{
    title: String,
    url: String,
    type: { type: String, enum: ['zoom', 'document', 'video', 'other'], default: 'other' }
  }],
  announcement: {
    type: String,
    maxlength: [1000, 'Announcement cannot be more than 1000 characters']
  },
  labs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab'
  }],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  students: [{
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
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
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
  assignments: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    dueDate: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // Newly added: who this assignment is assigned to
    assignedStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    // Auto-grading settings
    autoGrade: {
      type: Boolean,
      default: false
    },
    gradingCriteria: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    maxScore: {
      type: Number,
      default: 100
    },
    // Newly added: submissions under this assignment
    submissions: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
      },
      content: {
        type: String
      },
      submittedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'submitted', 'graded'],
        default: 'pending'
      },
      grade: {
        marks: Number,
        feedback: String,
        feedbackArray: [String],
        breakdown: mongoose.Schema.Types.Mixed,
        gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        gradedAt: Date,
        autoGraded: { type: Boolean, default: false },
        wasAutoGraded: { type: Boolean, default: false }, // Track if it was overridden
        previousAutoScore: Number // Store original auto-grade if overridden
      }
    }],
    // Reminders sent for this assignment
    reminders: [{
      subject: {
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      sentAt: {
        type: Date,
        default: Date.now
      },
      recipients: [{
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        read: {
          type: Boolean,
          default: false
        },
        readAt: Date
      }]
    }]
  }],
  // Global course notifications/reminders
  notifications: [{
    type: {
      type: String,
      enum: ['reminder', 'announcement', 'assignment', 'general'],
      default: 'general'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    recipients: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      read: {
        type: Boolean,
        default: false
      },
      readAt: Date
    }],
    relatedAssignment: {
      type: mongoose.Schema.Types.ObjectId
    }
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignment: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    grade: {
      marks: {
        type: Number
      },
      feedback: {
        type: String
      },
      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      gradedAt: {
        type: Date
      }
    }
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

