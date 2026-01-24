const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true
  },
  studentId: {
    type: String,
    required: true,
    index: true
  },
  studentName: {
    type: String
  },
  subject: {
    type: String,
    required: true,
    index: true
  },
  year: {
    type: String, // e.g., "1", "2", "3", "4"
    required: true
  },
  branch: {
    type: String, // e.g., "CSE", "ECE"
    required: true
  },
  section: {
    type: String, // e.g., "A", "B"
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave', 'Late'],
    default: 'Present',
    required: true
  },
  facultyId: {
    type: String,
    required: true
  },
  facultyName: {
    type: String
  },
  remarks: String,
  markedAt: {
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

// Update the updatedAt field before saving
attendanceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Compound index for efficient querying
attendanceSchema.index({ date: 1, subject: 1, section: 1, branch: 1, year: 1 });
// Index for student-specific queries (Critical for Dashboard performance)
attendanceSchema.index({ studentId: 1, date: 1 });
// Index for subject-wise attendance
attendanceSchema.index({ subject: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
