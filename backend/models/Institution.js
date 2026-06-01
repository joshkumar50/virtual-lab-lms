const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide institution name'],
    trim: true,
    maxlength: [200, 'Name cannot be more than 200 characters']
  },
  institutionalCode: {
    type: String,
    required: [true, 'Institutional code (UDISE or AISHE) is required'],
    unique: true,
    trim: true,
    // Accepts either 11-digit UDISE (e.g., 27252001404) or AISHE code (e.g., C-12345, U-0123, S-1234)
    match: [/^(?:\d{11}|[CUS]-\d{4,5})$/, 'Code must be an 11-digit UDISE code or a valid AISHE code (e.g., C-12345)']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  block: {
    type: String,
    trim: true,
    default: null
  },
  type: {
    type: String,
    enum: [
      // Schools
      'Government', 'Govt-Aided', 'Local Body', 'Kendriya Vidyalaya', 'Navodaya Vidyalaya',
      // Higher Education
      'State University', 'Central University', 'Deemed University', 'Private University', 'Govt Degree College', 'Private Engineering College', 'NIT/IIT/IIIT'
    ],
    default: 'Government'
  },
  category: {
    type: String,
    enum: ['Primary', 'Upper Primary', 'Secondary', 'Higher Secondary', 'Composite', 'Undergraduate', 'Postgraduate', 'Technical/Engineering'],
    default: 'Secondary'
  },
  board: {
    type: String,
    enum: ['CBSE', 'ICSE', 'State Board', 'University Affiliated', 'Autonomous', 'Other'],
    default: 'State Board'
  },
  principalName: {
    type: String,
    trim: true,
    default: null
  },
  contactEmail: {
    type: String,
    lowercase: true,
    default: null
  },
  contactPhone: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  pincode: {
    type: String,
    match: [/^\d{6}$/, 'Pincode must be exactly 6 digits'],
    default: null
  },
  isRural: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Pending Verification', 'Inactive'],
    default: 'Pending Verification'
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  totalTeachers: {
    type: Number,
    default: 0
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
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

institutionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for analytics queries
institutionSchema.index({ state: 1, district: 1 });
institutionSchema.index({ institutionalCode: 1 }, { unique: true });

module.exports = mongoose.model('Institution', institutionSchema);
