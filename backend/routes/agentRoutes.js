const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Reload JS knowledge modules from backend/knowledge by clearing require cache
router.post('/reload', async (req, res) => {
    try {
        const kbDir = path.join(__dirname, '..', 'knowledge');
        if (!fs.existsSync(kbDir)) return res.status(404).json({ error: 'Knowledge directory not found' });

        const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.js') || f.endsWith('.json') || f.endsWith('.md'));
        const cleared = [];
        files.forEach(f => {
            const full = path.join(kbDir, f);
            const reqPath = require.resolve(full);
            if (require.cache[reqPath]) {
                delete require.cache[reqPath];
                cleared.push(f);
            }
        });

        // Re-require main knowledge modules to refresh in-memory references
        const reloaded = {};
        try {
            reloaded.studentKnowledge = require(path.join(kbDir, 'studentKnowledge.js'));
        } catch (e) { /* ignore */ }
        try {
            reloaded.facultyKnowledge = require(path.join(kbDir, 'facultyKnowledge.js'));
        } catch (e) { /* ignore */ }
        try {
            reloaded.adminKnowledge = require(path.join(kbDir, 'adminKnowledge.js'));
        } catch (e) { /* ignore */ }

        // Broadcast an update event if broadcastEvent is available
        try { global.broadcastEvent && global.broadcastEvent({ resource: 'knowledge', action: 'reload', files: cleared }); } catch (e) { }

        res.json({ ok: true, reloaded: Object.keys(reloaded), cleared });
    } catch (err) {
        console.error('Agent reload error:', err);
        res.status(500).json({ error: err.message });
    }
});


// Update knowledge into MongoDB (upsert)
router.post('/update-knowledge', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'MongoDB not connected' });
        }

        const kbDir = path.join(__dirname, '..', 'knowledge');
        // Clear require cache for knowledge modules so reload reads latest files
        const filesToLoad = ['studentKnowledge.js', 'facultyKnowledge.js', 'adminKnowledge.js'];
        const loaded = {};
        for (const fname of filesToLoad) {
            const full = path.join(kbDir, fname);
            try {
                const resolved = require.resolve(full);
                if (require.cache[resolved]) delete require.cache[resolved];
                loaded[fname.replace(/\.js$/, '')] = require(full);
            } catch (e) {
                // ignore missing
            }
        }

        const coll = mongoose.connection.collection('agentKnowledge');
        const now = new Date();
        const updateDoc = { $set: { knowledge: loaded, updatedAt: now } };
        await coll.updateOne({ name: 'agent_knowledge' }, updateDoc, { upsert: true });

        try { global.broadcastEvent && global.broadcastEvent({ resource: 'knowledge', action: 'db-upsert', timestamp: now }); } catch (e) { }

        res.json({ ok: true, loaded: Object.keys(loaded), timestamp: now });
    } catch (err) {
        console.error('update-knowledge error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
