const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  subject: {
    type: String,
    required: true
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
  facultyId: {
    type: String,
    required: true
  },
  facultyName: {
    type: String
  },
  records: [{
    studentId: {
      type: String,
      required: true
    },
    studentName: {
      type: String
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave', 'Late'],
      default: 'Present'
    },
    remarks: String
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
attendanceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Compound index for efficient querying
attendanceSchema.index({ date: 1, subject: 1, section: 1, branch: 1, year: 1 }, { unique: false });
// Index for student-specific queries (Critical for Dashboard performance)
attendanceSchema.index({ "records.studentId": 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
