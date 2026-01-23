const mongoose = require('mongoose');

const StudentNotesSchema = new mongoose.Schema({
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
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['lecture-notes', 'summary', 'review', 'study-guide', 'personal-notes', 'important-concepts', 'solved-problems', 'revision-notes'],
        default: 'personal-notes'
    },
    tags: [String],
    // Formatting
    isPinned: {
        type: Boolean,
        default: false
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    textColor: {
        type: String,
        default: '#000000'
    },
    backgroundColor: {
        type: String,
        default: '#FFFFFF'
    },
    // Metadata
    semester: {
        type: String,
        enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'],
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    // Attachments
    attachments: [{
        fileName: String,
        fileURL: String,
        fileSize: Number,
        fileType: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Collaborative Features
    sharedWith: [{
        studentId: mongoose.Schema.Types.ObjectId,
        access: {
            type: String,
            enum: ['view', 'comment', 'edit'],
            default: 'view'
        }
    }],
    // Engagement
    viewCount: {
        type: Number,
        default: 0
    },
    comments: [{
        studentId: mongoose.Schema.Types.ObjectId,
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastReviewedAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('StudentNotes', StudentNotesSchema);
