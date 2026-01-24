const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  sid: {
    type: String,
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  phone: String,
  address: String,
  profileImage: String,
  avatar: String,
  studentToken: String,
  tokenIssuedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // New Stats Fields for Dashboards
  stats: {
    streak: { type: Number, default: 0 },
    lastLogin: { type: Date },
    aiUsageCount: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    advancedProgress: { type: Number, default: 0 }, // % completed
    totalClasses: { type: Number, default: 0 },
    totalPresent: { type: Number, default: 0 }
  }
});

// Update the updatedAt field before saving
studentSchema.pre('save', function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Student', studentSchema, 'AdminDashboardDB_Sections_Students');
