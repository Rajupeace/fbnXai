const express = require('express');
const router = express.Router();
const AdminData = require('../models/AdminData');
const { protect } = require('../middleware/authMiddleware');

// Get admin data
router.get('/:adminId', protect, async (req, res) => {
    try {
        const { adminId } = req.params;
        let adminData = await AdminData.findOne({ adminId })
            .populate('adminId', 'name email');
        
        if (!adminData) {
            adminData = new AdminData({ adminId });
            await adminData.save();
        }
        
        res.json(adminData);
    } catch (error) {
        console.error('Error fetching admin data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create admin data
router.post('/', protect, async (req, res) => {
    try {
        const adminData = new AdminData(req.body);
        await adminData.save();
        res.status(201).json(adminData);
    } catch (error) {
        console.error('Error creating admin data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update admin data
router.put('/:adminId', protect, async (req, res) => {
    try {
        const { adminId } = req.params;
        const adminData = await AdminData.findOneAndUpdate(
            { adminId },
            { ...req.body, updatedAt: new Date() },
            { new: true, upsert: true }
        );
        res.json(adminData);
    } catch (error) {
        console.error('Error updating admin data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update admin section data
router.put('/:adminId/section/:sectionName', protect, async (req, res) => {
    try {
        const { adminId, sectionName } = req.params;
        const updateData = {
            [`sections.${sectionName}`]: req.body,
            updatedAt: new Date()
        };
        
        const adminData = await AdminData.findOneAndUpdate(
            { adminId },
            updateData,
            { new: true }
        );
        
        res.json(adminData);
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific section data
router.get('/:adminId/section/:sectionName', protect, async (req, res) => {
    try {
        const { adminId, sectionName } = req.params;
        const adminData = await AdminData.findOne({ adminId });
        
        if (!adminData) {
            return res.status(404).json({ error: 'Admin data not found' });
        }
        
        const sectionData = adminData.sections[sectionName];
        res.json(sectionData || {});
    } catch (error) {
        console.error('Error fetching section:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update messages
router.post('/:adminId/messages', protect, async (req, res) => {
    try {
        const { adminId } = req.params;
        const { conversationId, message, senderId } = req.body;
        
        const adminData = await AdminData.findOne({ adminId });
        
        if (!adminData) {
            return res.status(404).json({ error: 'Admin data not found' });
        }
        
        // Find or create conversation
        let conversation = adminData.sections.messages.conversationList.find(
            c => c.conversationId.toString() === conversationId
        );
        
        if (conversation) {
            conversation.messageHistory.push({
                senderId,
                message,
                timestamp: new Date(),
                read: false
            });
            conversation.lastMessage = message;
            conversation.timestamp = new Date();
        }
        
        adminData.sections.messages.totalMessages += 1;
        adminData.sections.messages.unreadMessages += 1;
        await adminData.save();
        
        res.json(adminData.sections.messages);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all admin messages
router.get('/:adminId/messages', protect, async (req, res) => {
    try {
        const { adminId } = req.params;
        const adminData = await AdminData.findOne({ adminId });
        
        if (!adminData) {
            return res.status(404).json({ error: 'Admin data not found' });
        }
        
        res.json(adminData.sections.messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark messages as read
router.patch('/:adminId/messages/:conversationId/read', protect, async (req, res) => {
    try {
        const { adminId, conversationId } = req.params;
        const adminData = await AdminData.findOne({ adminId });
        
        if (!adminData) {
            return res.status(404).json({ error: 'Admin data not found' });
        }
        
        const conversation = adminData.sections.messages.conversationList.find(
            c => c.conversationId.toString() === conversationId
        );
        
        if (conversation) {
            conversation.messageHistory.forEach(msg => {
                if (!msg.read) {
                    msg.read = true;
                    adminData.sections.messages.unreadMessages -= 1;
                }
            });
            conversation.unread = false;
        }
        
        await adminData.save();
        res.json(adminData.sections.messages);
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add activity log
router.post('/:adminId/activity', protect, async (req, res) => {
    try {
        const { adminId } = req.params;
        const adminData = await AdminData.findOneAndUpdate(
            { adminId },
            { 
                $push: { activityLog: req.body },
                updatedAt: new Date()
            },
            { new: true }
        );
        
        res.json(adminData);
    } catch (error) {
        console.error('Error adding activity:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete admin data
router.delete('/:adminId', protect, async (req, res) => {
    try {
        const { adminId } = req.params;
        await AdminData.findOneAndDelete({ adminId });
        res.json({ message: 'Admin data deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin data:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
