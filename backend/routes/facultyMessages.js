// routes/facultyMessages.js
const express = require('express');
const router = express.Router();
const { requireAuthMongo } = require('../middleware/authMiddleware');
const Message = require('../models/Message');

// POST a new message from faculty to students
router.post('/', requireAuthMongo, (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'faculty') {
        return res.status(403).json({ error: 'Only faculty can send messages' });
    }
    const { text, targetYear, targetSections, subject } = req.body;
    if (!text || !targetYear || !targetSections || !subject) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const msgDoc = new Message({
            sender: user.name,
            senderRole: 'faculty',
            facultyId: user._id || null,
            target: 'students-specific',
            targetYear,
            targetSections: Array.isArray(targetSections) ? targetSections : [String(targetSections)],
            subject,
            message: text
        });
        await msgDoc.save();
        res.status(201).json(msgDoc);
    } catch (err) {
        console.error('Error saving faculty message:', err);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

module.exports = router;
