const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // Sender info
    sender: { type: String, default: 'Admin' }, // 'Admin' or Faculty Name
    senderRole: { type: String, default: 'admin' }, // 'admin', 'faculty', 'system'
    facultyId: String, // If sent by faculty

    // Target Audience
    target: { type: String, required: true }, // 'all', 'students', 'students-specific', 'faculty'
    targetYear: String,
    targetSections: [String], // Array of sections e.g. ['A', 'B']
    targetBranch: String,

    // Content
    type: { type: String, default: 'info' }, // 'urgent', 'info', 'reminder', 'announcement', 'warning'
    subject: String,
    message: { type: String, required: true },

    // Metadata
    expiresAt: Date, // For temporary announcements
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema, 'AdminDashboardDB_Sections_Messages');
