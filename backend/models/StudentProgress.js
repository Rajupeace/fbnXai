const mongoose = require('mongoose');

const StudentProgressSchema = new mongoose.Schema({
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
    // Course Completion
    modulesCompleted: {
        type: Number,
        default: 0
    },
    totalModules: {
        type: Number,
        default: 0
    },
    completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    // Learning Progress
    topicsStudied: [{
        topicName: String,
        status: {
            type: String,
            enum: ['not-started', 'in-progress', 'completed', 'revision'],
            default: 'not-started'
        },
        proficiencyLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'mastered'],
            default: 'beginner'
        },
        timeSpent: {
            type: Number,
            default: 0
        },
        lastAccessedDate: Date
    }],
    // Resource Access
    lecturesWatched: {
        type: Number,
        default: 0
    },
    materialsDownloaded: {
        type: Number,
        default: 0
    },
    quizzesAttempted: {
        type: Number,
        default: 0
    },
    averageQuizScore: {
        type: Number,
        default: 0
    },
    // Time Tracking
    totalStudyHours: {
        type: Number,
        default: 0
    },
    lastStudyDate: {
        type: Date,
        default: null
    },
    // Performance Metrics
    strengthAreas: [String],
    weakAreas: [String],
    performanceComparison: {
        classAverage: Number,
        studentScore: Number,
        percentile: Number
    },
    // Recommendations
    recommendations: [{
        topic: String,
        reason: String,
        resourceLink: String
    }],
    // Milestones
    milestonesAchieved: [{
        milestoneName: String,
        description: String,
        achievedDate: Date,
        badge: String
    }],
    // Notes on Progress
    teacherNotes: {
        type: String,
        default: ''
    },
    studentNotes: {
        type: String,
        default: ''
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

module.exports = mongoose.model('StudentProgress', StudentProgressSchema);
