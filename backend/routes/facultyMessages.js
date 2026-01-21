// routes/facultyMessages.js
const express = require('express');
const router = express.Router();
const { requireAuthMongo } = require('../middleware/authMiddleware');
const dbFile = require('../index').dbFile; // We'll import dbFile via require of index (circular?) but we can require directly.
// Since dbFile is defined in index.js, we can require it via path.
const path = require('path');
const fs = require('fs');
const dataDir = path.join(__dirname, '..', 'data');
const messagesDB = (() => {
    const p = path.join(dataDir, 'messages.json');
    if (!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify([], null, 2));
    return {
        read: () => {
            try { return JSON.parse(fs.readFileSync(p, 'utf8') || '[]'); } catch (e) { return []; }
        },
        write: (v) => { fs.writeFileSync(p, JSON.stringify(v, null, 2)); }
    };
})();

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
    const newMsg = {
        id: Date.now(),
        text,
        target: 'students-specific',
        targetYear,
        targetSections,
        subject,
        sender: user.name,
        date: new Date().toISOString()
    };
    const msgs = messagesDB.read();
    msgs.push(newMsg);
    messagesDB.write(msgs);
    res.status(201).json(newMsg);
});

module.exports = router;
