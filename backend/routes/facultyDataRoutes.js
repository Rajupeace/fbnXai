const express = require('express');
const router = express.Router();
const FacultyData = require('../models/FacultyData');
const { protect } = require('../middleware/authMiddleware');

// Get faculty data
router.get('/:facultyId', protect, async (req, res) => {
    try {
        const { facultyId } = req.params;
        let facultyData = await FacultyData.findOne({ facultyId })
            .populate('facultyId', 'name email');
        
        if (!facultyData) {
            facultyData = new FacultyData({ facultyId });
            await facultyData.save();
        }
        
        res.json(facultyData);
    } catch (error) {
        console.error('Error fetching faculty data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create faculty data
router.post('/', protect, async (req, res) => {
    try {
        const facultyData = new FacultyData(req.body);
        await facultyData.save();
        res.status(201).json(facultyData);
    } catch (error) {
        console.error('Error creating faculty data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update faculty data
router.put('/:facultyId', protect, async (req, res) => {
    try {
        const { facultyId } = req.params;
        const facultyData = await FacultyData.findOneAndUpdate(
            { facultyId },
            { ...req.body, updatedAt: new Date() },
            { new: true, upsert: true }
        );
        res.json(facultyData);
    } catch (error) {
        console.error('Error updating faculty data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update faculty section data
router.put('/:facultyId/section/:sectionName', protect, async (req, res) => {
    try {
        const { facultyId, sectionName } = req.params;
        const updateData = {
            [`sections.${sectionName}`]: req.body,
            updatedAt: new Date()
        };
        
        const facultyData = await FacultyData.findOneAndUpdate(
            { facultyId },
            updateData,
            { new: true }
        );
        
        res.json(facultyData);
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific section data
router.get('/:facultyId/section/:sectionName', protect, async (req, res) => {
    try {
        const { facultyId, sectionName } = req.params;
        const facultyData = await FacultyData.findOne({ facultyId });
        
        if (!facultyData) {
            return res.status(404).json({ error: 'Faculty data not found' });
        }
        
        const sectionData = facultyData.sections[sectionName];
        res.json(sectionData || {});
    } catch (error) {
        console.error('Error fetching section:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark attendance
router.post('/:facultyId/attendance', protect, async (req, res) => {
    try {
        const { facultyId } = req.params;
        const facultyData = await FacultyData.findOne({ facultyId });
        
        if (!facultyData) {
            return res.status(404).json({ error: 'Faculty data not found' });
        }
        
        facultyData.sections.attendance.attendanceRecords.push(req.body);
        facultyData.sections.attendance.totalClasses += 1;
        await facultyData.save();
        
        res.json(facultyData.sections.attendance);
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send message
router.post('/:facultyId/messages', protect, async (req, res) => {
    try {
        const { facultyId } = req.params;
        const { conversationId, message, senderId } = req.body;
        
        const facultyData = await FacultyData.findOne({ facultyId });
        
        if (!facultyData) {
            return res.status(404).json({ error: 'Faculty data not found' });
        }
        
        let conversation = facultyData.sections.messages.conversationList.find(
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
        
        facultyData.sections.messages.totalMessages += 1;
        facultyData.sections.messages.unreadMessages += 1;
        await facultyData.save();
        
        res.json(facultyData.sections.messages);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get faculty messages
router.get('/:facultyId/messages', protect, async (req, res) => {
    try {
        const { facultyId } = req.params;
        const facultyData = await FacultyData.findOne({ facultyId });
        
        if (!facultyData) {
            return res.status(404).json({ error: 'Faculty data not found' });
        }
        
        res.json(facultyData.sections.messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark messages as read
router.patch('/:facultyId/messages/:conversationId/read', protect, async (req, res) => {
    try {
        const { facultyId, conversationId } = req.params;
        const facultyData = await FacultyData.findOne({ facultyId });
        
        if (!facultyData) {
            return res.status(404).json({ error: 'Faculty data not found' });
        }
        
        const conversation = facultyData.sections.messages.conversationList.find(
            c => c.conversationId.toString() === conversationId
        );
        
        if (conversation) {
            conversation.messageHistory.forEach(msg => {
                if (!msg.read) {
                    msg.read = true;
                    facultyData.sections.messages.unreadMessages -= 1;
                }
            });
            conversation.unread = false;
        }
        
        await facultyData.save();
        res.json(facultyData.sections.messages);
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add activity log
router.post('/:facultyId/activity', protect, async (req, res) => {
    try {
        const { facultyId } = req.params;
        const facultyData = await FacultyData.findOneAndUpdate(
            { facultyId },
            { 
                $push: { activityLog: req.body },
                updatedAt: new Date()
            },
            { new: true }
        );
        
        res.json(facultyData);
    } catch (error) {
        console.error('Error adding activity:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete faculty data
router.delete('/:facultyId', protect, async (req, res) => {
    try {
        const { facultyId } = req.params;
        await FacultyData.findOneAndDelete({ facultyId });
        res.json({ message: 'Faculty data deleted successfully' });
    } catch (error) {
        console.error('Error deleting faculty data:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
