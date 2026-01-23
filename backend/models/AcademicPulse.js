const mongoose = require('mongoose');

const AcademicPulseSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    semester: {
        type: String,
        required: true,
        enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
    },
    academicYear: {
        type: String,
        required: true
    },
    cgpa: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    sgpa: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    creditsTaken: {
        type: Number,
        default: 0
    },
    creditsEarned: {
        type: Number,
        default: 0
    },
    attendancePercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    totalAssignmentsSubmitted: {
        type: Number,
        default: 0
    },
    totalProjectsCompleted: {
        type: Number,
        default: 0
    },
    examsAttended: {
        type: Number,
        default: 0
    },
    examsPass: {
        type: Number,
        default: 0
    },
    performanceTrend: {
        type: String,
        enum: ['improving', 'stable', 'declining'],
        default: 'stable'
    },
    strengths: [{
        type: String,
        default: ''
    }],
    areasForImprovement: [{
        type: String,
        default: ''
    }],
    overallPerformance: {
        type: String,
        enum: ['excellent', 'good', 'satisfactory', 'poor'],
        default: 'satisfactory'
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

module.exports = mongoose.model('AcademicPulse', AcademicPulseSchema);
