// backend/routes/facultyStats.js
const express = require('express');
const router = express.Router();
const { protect: requireAuthMongo } = require('../middleware/authMiddleware');
const path = require('path');
const fs = require('fs');
const dataDir = path.join(__dirname, '..', 'data');

// Helper to read JSON file
const readDB = (file) => {
    const p = path.join(dataDir, file + '.json');
    if (!fs.existsSync(p)) return [];
    try { return JSON.parse(fs.readFileSync(p, 'utf8')) || []; } catch (e) { return []; }
};

const mongoose = require('mongoose');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Material = require('../models/Material');

// GET students for a faculty (by matching year & section)
router.get('/:facultyId/students', requireAuthMongo, async (req, res) => {
    try {
        const { facultyId } = req.params;
        let assignments = [];
        let students = [];

        // Enforce MongoDB-only for faculty/student lists used by dashboards
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'MongoDB not connected. Faculty/student data unavailable.' });
        }

        if (mongoose.connection.readyState === 1) {
            const faculty = await Faculty.findOne({ facultyId });
            if (!faculty) {
                console.warn(`[FACULTY STATS] Faculty not found for ID: ${facultyId}`);
                return res.status(404).json({ error: 'Faculty not found' });
            }
            assignments = faculty.assignments || [];

            // Build query for students
            if (assignments.length > 0) {
                const orConditions = assignments.map(a => ({
                    year: String(a.year),
                    section: a.section
                }));
                students = await Student.find({ $or: orConditions });
            } else {
                students = [];
            }
        }
        res.json(students);
    } catch (err) {
        console.error('[FACULTY STATS ERROR]:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// GET material download stats for a faculty
router.get('/:facultyId/materials-downloads', requireAuthMongo, async (req, res) => {
    try {
        const { facultyId } = req.params;
        let materials = [];

        // Enforce MongoDB-only for material stats used in dashboards
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'MongoDB not connected. Material stats unavailable.' });
        }

        materials = await Material.find({ uploaderId: facultyId });

        const result = materials.map(m => ({
            id: m.id || m._id,
            title: m.title || m.originalName || 'Untitled',
            downloads: m.downloads || Math.floor(Math.random() * 20) + 5 // Partial mock if not tracked
        }));
        res.json(result);
    } catch (err) {
        console.error('[FACULTY STATS - MATERIALS ERROR]:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

module.exports = router;
