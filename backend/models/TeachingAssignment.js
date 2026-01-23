const mongoose = require('mongoose');

const teachingAssignmentSchema = new mongoose.Schema({
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  year: {
    type: String,
    required: true
  },
  sections: [{
    type: String,
    required: true
  }],
  subject: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

teachingAssignmentSchema.index(
  { faculty: 1, course: 1, year: 1, subject: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model('TeachingAssignment', teachingAssignmentSchema);
