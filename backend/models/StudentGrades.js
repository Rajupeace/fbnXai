const mongoose = require('mongoose');

const StudentGradesSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    semester: {
        type: String,
        enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'],
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    // Assessment Scores
    assignmentScores: [{
        assignmentName: String,
        marksObtained: {
            type: Number,
            default: 0
        },
        totalMarks: {
            type: Number,
            default: 100
        },
        percentage: {
            type: Number,
            default: 0
        },
        submittedDate: Date,
        feedback: String
    }],
    projectScores: [{
        projectName: String,
        marksObtained: {
            type: Number,
            default: 0
        },
        totalMarks: {
            type: Number,
            default: 100
        },
        percentage: {
            type: Number,
            default: 0
        },
        submittedDate: Date,
        feedback: String
    }],
    internalMarks: {
        type: Number,
        default: 0,
        max: 30
    },
    externalMarks: {
        type: Number,
        default: 0,
        max: 70
    },
    practicalMarks: {
        type: Number,
        default: 0,
        max: 50
    },
    // Final Grade
    totalMarks: {
        type: Number,
        default: 0
    },
    totalMarksCapped: {
        type: Number,
        default: 0,
        max: 100
    },
    percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    letterGrade: {
        type: String,
        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
        default: 'F'
    },
    gradePoints: {
        type: Number,
        default: 0,
        max: 10
    },
    credits: {
        type: Number,
        default: 0
    },
    // Grade Details
    isPass: {
        type: Boolean,
        default: false
    },
    gradeRemarks: {
        type: String,
        default: ''
    },
    // Feedback
    teacherFeedback: {
        type: String,
        default: ''
    },
    // Submission Status
    isSubmitted: {
        type: Boolean,
        default: false
    },
    submittedDate: {
        type: Date,
        default: null
    },
    resultPublishedDate: {
        type: Date,
        default: null
    },
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudentGrades', StudentGradesSchema);
