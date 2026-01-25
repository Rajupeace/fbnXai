// routes/facultyMessages.js
const express = require('express');
const router = express.Router();
const { requireAuthMongo } = require('../middleware/authMiddleware');
const Message = require('../models/Message');

// POST a new message from faculty to students
router.post('/', requireAuthMongo, async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'faculty') {
        return res.status(403).json({ error: 'Only faculty can send messages' });
    }
    const { text, message, targetYear, year, targetSections, sections, subject } = req.body;

    // Support multiple field names for compatibility
    const finalMessage = text || message;
    const finalYear = targetYear || year;
    const finalSections = targetSections || sections;

    if (!finalMessage || !finalYear || !finalSections || !subject) {
        return res.status(400).json({ error: 'Missing required fields: message/text, year, sections, subject' });
    }

    try {
        const msgDoc = new Message({
            sender: user.name,
            senderRole: 'faculty',
            facultyId: user._id || user.facultyId,
            target: 'students-specific',
            targetYear: String(finalYear),
            targetSections: Array.isArray(finalSections) ? finalSections : [String(finalSections)],
            subject,
            message: finalMessage
        });
        await msgDoc.save();
        res.status(201).json(msgDoc);
    } catch (err) {
        console.error('Error saving faculty message:', err);
        res.status(500).json({ error: 'Failed to save message: ' + err.message });
    }
});

module.exports = router;
