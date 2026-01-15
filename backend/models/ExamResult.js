const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    examTitle: { type: String, required: true },
    examType: { type: String, default: 'Internal' }, // 'Internal', 'External', 'Lab'
    date: { type: Date, default: Date.now },

    // Context
    year: String,
    semester: String,
    branch: String,
    subject: String,

    // Student Data
    studentId: { type: String, required: true },
    studentName: String,

    // Scores
    marksObtained: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
    grade: String,

    summary: String, // Remarks

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExamResult', examResultSchema, 'StudentDashboardDB_Sections_Exams');
