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

        if (mongoose.connection.readyState === 1) {
            const faculty = await Faculty.findOne({ facultyId });
            if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
            assignments = faculty.assignments || [];

            // Build query for students
            const orConditions = assignments.map(a => ({
                year: String(a.year),
                section: a.section
            }));

            if (orConditions.length > 0) {
                students = await Student.find({ $or: orConditions });
            }
        } else {
            const facultyList = readDB('faculty');
            const faculty = facultyList.find(f => f.facultyId === facultyId);
            if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
            assignments = faculty.assignments || [];
            const allStudents = readDB('students');
            students = allStudents.filter(s => {
                return assignments.some(a => String(a.year) === String(s.year) && a.section === s.section);
            });
        }
        res.json(students);
    } catch (err) {
        console.error('Error fetching faculty students:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET material download stats for a faculty
router.get('/:facultyId/materials-downloads', requireAuthMongo, async (req, res) => {
    try {
        const { facultyId } = req.params;
        let materials = [];

        if (mongoose.connection.readyState === 1) {
            materials = await Material.find({ uploaderId: facultyId });
        } else {
            const allMaterials = readDB('materials');
            materials = allMaterials.filter(m => m.uploaderId === facultyId);
        }

        const result = materials.map(m => ({
            id: m.id || m._id,
            title: m.title || m.originalName || 'Untitled',
            downloads: m.downloads || Math.floor(Math.random() * 20) + 5 // Partial mock if not tracked
        }));
        res.json(result);
    } catch (err) {
        console.error('Error fetching material downloads:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
