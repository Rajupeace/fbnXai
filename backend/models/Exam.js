const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true }, // 0-based index
  marks: { type: Number, default: 1 }
});

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  week: { type: String, required: true }, // e.g., "Week 3"
  branch: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String }, // Optional, if specific to a section
  durationMinutes: { type: Number, default: 20 },
  totalMarks: { type: Number, default: 10 },
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Exam', examSchema);
