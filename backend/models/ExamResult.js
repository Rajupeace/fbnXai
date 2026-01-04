const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    wrongAnswers: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExamResult', examResultSchema);
