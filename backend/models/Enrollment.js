const mongoose = require('mongoose');

/**
 * ENROLLMENT MODEL
 * Tracks which faculty teaches which students
 * Links Student ↔ Faculty ↔ Subject
 */

const enrollmentSchema = new mongoose.Schema({
  // Student reference
  studentId: {
    type: String,
    required: true,
    index: true
  },
  studentName: {
    type: String,
    required: true
  },
  
  // Faculty reference
  facultyId: {
    type: String,
    required: true,
    index: true
  },
  facultyName: {
    type: String,
    required: true
  },
  
  // Subject & Class Information
  subject: {
    type: String,
    required: true,
    index: true
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
  semester: {
    type: String
  },
  
  // Contact Information
  studentEmail: String,
  studentPhone: String,
  facultyEmail: String,
  facultyPhone: String,
  
  // Status tracking
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'pending'],
    default: 'active',
    index: true
  },
  
  // Academic information
  academicYear: {
    type: String,
    required: true,
    index: true
  },
  
  // Statistics
  attendancePercentage: {
    type: Number,
    default: 0
  },
  marksPercentage: {
    type: Number,
    default: 0
  },
  examsAttempted: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
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

// Composite indexes for fast queries
enrollmentSchema.index({ studentId: 1, facultyId: 1, subject: 1 });
enrollmentSchema.index({ facultyId: 1, academicYear: 1, status: 1 });
enrollmentSchema.index({ studentId: 1, academicYear: 1, status: 1 });
enrollmentSchema.index({ year: 1, section: 1, branch: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema, 'enrollments');
