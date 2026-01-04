const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: [true, 'Message text is required']
    },
    target: {
        type: String,
        enum: ['all', 'students', 'students-specific', 'faculty', 'admin'],
        default: 'all'
    },
    type: {
        type: String, // 'announcement', 'urgent', 'reminder'
        default: 'announcement'
    },
    targetYear: {
        type: String,
        default: null
    },
    targetSections: {
        type: [String],
        default: []
    },
    sender: {
        type: String,
        default: 'System'
    },
    facultyId: {
        type: String,
        default: null
    },
    subject: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', MessageSchema);
