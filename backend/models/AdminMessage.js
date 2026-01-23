const mongoose = require('mongoose');

const adminMessageSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    senderName: String,
    
    // Recipient can be Student, Faculty, or Admin
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    recipientType: {
        type: String,
        enum: ['Student', 'Faculty', 'Admin'],
        required: true
    },
    recipientName: String,
    
    // Message content
    subject: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    messageType: {
        type: String,
        enum: ['text', 'announcement', 'alert', 'notification'],
        default: 'text'
    },
    
    // Message status
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    readAt: Date,
    important: {
        type: Boolean,
        default: false
    },
    archived: {
        type: Boolean,
        default: false
    },
    
    // Conversation tracking
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminConversation',
        index: true
    },
    
    // Attachments
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Reply information
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminMessage'
    },
    
    // Metadata
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: Date
});

// Index for quick lookups
adminMessageSchema.index({ adminId: 1, read: 1 });
adminMessageSchema.index({ recipientId: 1, recipientType: 1 });
adminMessageSchema.index({ conversationId: 1, timestamp: 1 });

// Pre-save middleware to update updatedAt
adminMessageSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Method to mark message as read
adminMessageSchema.methods.markAsRead = function() {
    if (!this.read) {
        this.read = true;
        this.readAt = new Date();
        return this.save();
    }
    return Promise.resolve();
};

// Method to archive message
adminMessageSchema.methods.archive = function() {
    this.archived = true;
    return this.save();
};

// Static method to get conversation
adminMessageSchema.statics.getConversation = function(adminId, recipientId) {
    return this.find({
        $or: [
            { adminId, recipientId },
            { adminId: recipientId, recipientId: adminId }
        ]
    }).sort({ timestamp: -1 });
};

// Static method to get unread messages count
adminMessageSchema.statics.getUnreadCount = function(recipientId, recipientType) {
    return this.countDocuments({
        recipientId,
        recipientType,
        read: false,
        deletedAt: null
    });
};

module.exports = mongoose.model('AdminMessage', adminMessageSchema);
