const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  year: {
    type: String,
    required: true
  },
  section: {
    type: String,
    default: 'All'
  },
  subject: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    default: 'All'
  },
  semester: {
    type: String,
    default: null
  },
  module: String,
  unit: String,
  topic: String,
  type: {
    type: String,
    enum: ['notes', 'assignment', 'assignments', 'question_paper', 'modelPapers', 'importantQuestions', 'syllabus', 'other', 'videos', 'interview'],
    required: true
  },
  downloads: {
    type: Number,
    default: 0
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
materialSchema.pre('save', function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Material', materialSchema);
