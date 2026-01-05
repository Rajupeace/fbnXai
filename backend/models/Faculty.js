const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  facultyId: {
    type: String,
    required: [true, 'Faculty ID is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  profileImage: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  facultyToken: {
    type: String,
    default: null
  },
  tokenIssuedAt: {
    type: Date,
    default: null
  },
  assignments: [{
    year: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    section: {
      type: String,
      required: true
    },
    branch: {
      type: String,
      required: true
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

// Update the updatedAt field before saving
facultySchema.pre('save', function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Faculty', facultySchema);
