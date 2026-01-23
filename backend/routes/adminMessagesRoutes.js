const express = require('express');
const router = express.Router();
const AdminMessage = require('../models/AdminMessage');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { protect } = require('../middleware/authMiddleware');

// Send message from admin to any user
router.post('/send', protect, async (req, res) => {
    try {
        const { adminId, recipientId, recipientType, message, subject, messageType } = req.body;
        
        // Validate recipient exists
        let recipient;
        if (recipientType === 'Student') {
            recipient = await Student.findById(recipientId);
        } else if (recipientType === 'Faculty') {
            recipient = await Faculty.findById(recipientId);
        } else if (recipientType === 'Admin') {
            recipient = await Admin.findById(recipientId);
        }
        
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        const newMessage = new AdminMessage({
            adminId,
            senderId: adminId,
            senderName: admin.name,
            recipientId,
            recipientType,
            recipientName: recipient.name || recipient.userName,
            message,
            subject,
            messageType: messageType || 'text'
        });
        
        await newMessage.save();
        
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get messages for admin (sent by admin)
router.get('/admin/:adminId/sent', protect, async (req, res) => {
    try {
        const { adminId } = req.params;
        const messages = await AdminMessage.find({ adminId })
            .sort({ timestamp: -1 })
            .limit(50);
        
        res.json(messages);
    } catch (error) {
        console.error('Error fetching sent messages:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get messages received by user
router.get('/inbox/:recipientId/:recipientType', protect, async (req, res) => {
    try {
        const { recipientId, recipientType } = req.params;
        const messages = await AdminMessage.find({ 
            recipientId, 
            recipientType,
            deletedAt: null 
        })
            .sort({ timestamp: -1 })
            .limit(50);
        
        res.json(messages);
    } catch (error) {
        console.error('Error fetching inbox messages:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get conversation between admin and user
router.get('/conversation/:adminId/:recipientId/:recipientType', protect, async (req, res) => {
    try {
        const { adminId, recipientId, recipientType } = req.params;
        
        const messages = await AdminMessage.find({
            $and: [
                {
                    $or: [
                        { adminId, recipientId, recipientType },
                        { adminId: recipientId, recipientId: adminId }
                    ]
                },
                { deletedAt: null }
            ]
        })
        .sort({ timestamp: 1 });
        
        res.json(messages);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark message as read
router.patch('/:messageId/read', protect, async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await AdminMessage.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        await message.markAsRead();
        
        res.json(message);
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark multiple messages as read
router.patch('/bulk/read', protect, async (req, res) => {
    try {
        const { messageIds } = req.body;
        
        await AdminMessage.updateMany(
            { _id: { $in: messageIds } },
            { read: true, readAt: new Date() }
        );
        
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark message as important
router.patch('/:messageId/important', protect, async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await AdminMessage.findByIdAndUpdate(
            messageId,
            { important: true },
            { new: true }
        );
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.json(message);
    } catch (error) {
        console.error('Error marking message as important:', error);
        res.status(500).json({ error: error.message });
    }
});

// Archive message
router.patch('/:messageId/archive', protect, async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await AdminMessage.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        await message.archive();
        
        res.json(message);
    } catch (error) {
        console.error('Error archiving message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Soft delete message
router.delete('/:messageId', protect, async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await AdminMessage.findByIdAndUpdate(
            messageId,
            { deletedAt: new Date() },
            { new: true }
        );
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get unread message count
router.get('/unread/:recipientId/:recipientType', protect, async (req, res) => {
    try {
        const { recipientId, recipientType } = req.params;
        const count = await AdminMessage.getUnreadCount(recipientId, recipientType);
        
        res.json({ unreadCount: count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all conversations for admin
router.get('/conversations/:adminId', protect, async (req, res) => {
    try {
        const { adminId } = req.params;
        
        const messages = await AdminMessage.aggregate([
            {
                $match: {
                    $or: [
                        { adminId: new require('mongoose').Types.ObjectId(adminId) },
                        { recipientId: new require('mongoose').Types.ObjectId(adminId), recipientType: 'Admin' }
                    ],
                    deletedAt: null
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$adminId', new require('mongoose').Types.ObjectId(adminId)] },
                            '$recipientId',
                            '$adminId'
                        ]
                    },
                    lastMessage: { $last: '$message' },
                    timestamp: { $last: '$timestamp' },
                    recipientName: { $first: '$recipientName' },
                    recipientType: { $first: '$recipientType' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $eq: ['$read', false] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { timestamp: -1 } }
        ]);
        
        res.json(messages);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send announcement to multiple recipients
router.post('/announcement', protect, async (req, res) => {
    try {
        const { adminId, recipientIds, recipientType, message, subject } = req.body;
        
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        const messages = await AdminMessage.insertMany(
            recipientIds.map(recipientId => ({
                adminId,
                senderId: adminId,
                senderName: admin.name,
                recipientId,
                recipientType,
                message,
                subject,
                messageType: 'announcement'
            }))
        );
        
        res.status(201).json({ created: messages.length });
    } catch (error) {
        console.error('Error sending announcement:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
