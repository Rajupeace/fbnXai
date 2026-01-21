const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    time: {
        type: String,
        required: true,
        // Format: "09:00 - 10:00"
    },
    subject: {
        type: String,
        required: true
    },
    faculty: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Theory', 'Lab', 'Tutorial', 'Seminar', 'Other'],
        default: 'Theory'
    },
    year: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    section: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        min: 1,
        max: 8
    },
    // For lab sessions
    batch: {
        type: String,
        default: null
    },
    // Additional metadata
    courseCode: {
        type: String
    },
    credits: {
        type: Number
    },
    // Admin who created/updated
    createdBy: {
        type: String
    },
    updatedBy: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
ScheduleSchema.index({ year: 1, section: 1, branch: 1, day: 1 });

module.exports = mongoose.model('Schedule', ScheduleSchema);
