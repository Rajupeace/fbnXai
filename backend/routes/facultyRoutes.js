const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { parseCSV } = require('../utils/csvParser');

const upload = multer({ storage: multer.memoryStorage() });


// @route   GET /api/faculty
// @desc    Get all faculty
router.get('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const faculty = await Faculty.find({})
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();

        // Normalize IDs
        const result = faculty.map(f => ({
            ...f,
            id: f.facultyId || f._id.toString(),
            assignments: f.assignments || []
        }));

        res.json(result);
    } catch (err) {
        console.error('Error fetching faculty:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/faculty
// @desc    Create new faculty
router.post('/', async (req, res) => {
    try {
        let { facultyId, name, email, password, department, designation, phone, assignments } = req.body;

        // Defensive: normalize facultyId/name
        facultyId = facultyId && String(facultyId).trim();
        name = name && String(name).trim();

        // If email is missing, generate a default to avoid create failures from incomplete forms
        if (!email || !String(email).trim()) {
            if (facultyId) {
                email = `${facultyId}@example.com`;
                console.warn('[Faculty Create] email missing — auto-generated:', email);
            } else {
                // facultyId also missing — reject with clear message
                return res.status(400).json({ error: 'Please provide required fields: facultyId, name, and password' });
            }
        }

        if (!facultyId || !name || !password) {
            return res.status(400).json({ error: 'Please provide required fields: facultyId, name, and password' });
        }

        const existing = await Faculty.findOne({ $or: [{ facultyId }, { email }] });
        if (existing) {
            return res.status(400).json({ error: 'Faculty with this ID or Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newFaculty = new Faculty({
            facultyId,
            name,
            email,
            password: hashedPassword,
            department: department || 'General',
            designation: designation || 'Assistant Professor',
            phone: phone || '',
            assignments: assignments || [],
            createdAt: new Date()
        });

        await newFaculty.save();

        // Broadcast update
        if (global.broadcastEvent) {
            global.broadcastEvent({ resource: 'faculty', action: 'create', data: newFaculty });
        }

        res.status(201).json(newFaculty);
    } catch (err) {
        console.error('Error creating faculty:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// @route   POST /api/faculty/bulk
// @desc    Bulk upload faculty from CSV/JSON
router.post('/bulk', upload.single('file'), async (req, res) => {
    try {
        let faculties = [];

        // Handle file upload (CSV)
        if (req.file) {
            const csvContent = req.file.buffer.toString('utf8');
            faculties = parseCSV(csvContent);
            console.log(`[Bulk Faculty] Parsed ${faculties.length} entries from CSV file: ${req.file.originalname}`);
        }
        // Handle JSON body
        else if (req.body.faculties && Array.isArray(req.body.faculties)) {
            faculties = req.body.faculties;
        }
        else {
            return res.status(400).json({
                success: false,
                error: 'Please provide an array of faculty members or upload a CSV file'
            });
        }

        if (faculties.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No faculty data found in request'
            });
        }

        const results = {
            success: [],
            errors: [],
            total: faculties.length
        };

        for (let i = 0; i < faculties.length; i++) {
            const faculty = faculties[i];

            try {
                // Extract and normalize data
                const facultyId = faculty.facultyId || faculty.id || faculty.FacultyID;
                const name = faculty.name || faculty.Name;
                const email = faculty.email || faculty.Email || `${facultyId}@example.com`;
                const password = faculty.password || faculty.Password || 'password123';
                const department = faculty.department || faculty.Department || 'General';
                const designation = faculty.designation || faculty.Designation || 'Lecturer';
                const phone = faculty.phone || faculty.Phone || '';

                // Parse assignments if provided
                let assignments = [];
                if (faculty.assignments) {
                    if (typeof faculty.assignments === 'string') {
                        // Parse from string format: "Year 3 Section A Subject AI; Year 3 Section B Subject ML"
                        const assignmentParts = faculty.assignments.split(';');
                        assignments = assignmentParts.map(part => {
                            const match = part.match(/Year\s*(\d+)\s*Section\s*([A-Z0-9]+)\s*Subject\s*(.+)/i);
                            if (match) {
                                return {
                                    year: match[1],
                                    section: match[2].toUpperCase(),
                                    subject: match[3].trim()
                                };
                            }
                            return null;
                        }).filter(Boolean);
                    } else if (Array.isArray(faculty.assignments)) {
                        assignments = faculty.assignments;
                    }
                }

                // Validate required fields
                if (!facultyId || !name) {
                    results.errors.push({
                        row: i + 1,
                        facultyId: facultyId || 'N/A',
                        error: 'Missing required fields (facultyId, name)'
                    });
                    continue;
                }

                // Check if exists
                const existing = await Faculty.findOne({
                    $or: [{ facultyId }, { email }]
                });

                if (existing) {
                    results.errors.push({
                        row: i + 1,
                        facultyId,
                        error: 'Faculty with this ID or Email already exists'
                    });
                    continue;
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create faculty
                const newFaculty = new Faculty({
                    facultyId,
                    name,
                    email,
                    password: hashedPassword,
                    department,
                    designation,
                    phone,
                    assignments,
                    createdAt: new Date()
                });

                await newFaculty.save();

                results.success.push({
                    row: i + 1,
                    facultyId,
                    name
                });

            } catch (error) {
                results.errors.push({
                    row: i + 1,
                    facultyId: faculty.facultyId || 'N/A',
                    error: error.message
                });
            }
        }

        // Broadcast update if any succeeded
        if (results.success.length > 0 && global.broadcastEvent) {
            global.broadcastEvent({ resource: 'faculty', action: 'bulk-create' });
        }

        res.json({
            success: true,
            message: `Bulk upload complete: ${results.success.length} succeeded, ${results.errors.length} failed`,
            results
        });

    } catch (err) {
        console.error('Bulk faculty upload error:', err);
        res.status(500).json({
            success: false,
            error: 'Server error: ' + err.message
        });
    }
});

// @route   PUT /api/faculty/:id
// @desc    Update faculty
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Hash password if updating
        if (updates.password && updates.password.trim() !== '') {
            updates.password = await bcrypt.hash(updates.password, 10);
        } else {
            delete updates.password; // Don't overwrite with empty
        }

        // Handle both MongoDB _id and custom facultyId
        const query = mongoose.Types.ObjectId.isValid(id)
            ? { _id: id }
            : { facultyId: id };

        const updated = await Faculty.findOneAndUpdate(
            query,
            { $set: { ...updates, updatedAt: new Date() } },
            { new: true }
        ).select('-password');

        if (!updated) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        // Broadcast update
        if (global.broadcastEvent) {
            global.broadcastEvent({ resource: 'faculty', action: 'update', data: updated });
        }

        res.json(updated);
    } catch (err) {
        console.error('Error updating faculty:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   DELETE /api/faculty/:id
// @desc    Delete faculty
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = mongoose.Types.ObjectId.isValid(id)
            ? { _id: id }
            : { facultyId: id };

        const deleted = await Faculty.findOneAndDelete(query);

        if (!deleted) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        // Broadcast update
        if (global.broadcastEvent) {
            global.broadcastEvent({ resource: 'faculty', action: 'delete', data: { id } });
        }

        res.json({ message: 'Faculty deleted successfully' });
    } catch (err) {
        console.error('Error deleting faculty:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/faculty/login
// @desc    Auth faculty & get token
router.post('/login', async (req, res) => {
    try {
        const { facultyId, password } = req.body;

        if (!facultyId || !password) {
            return res.status(400).json({ error: 'Please provide ID and password' });
        }

        // Check for faculty
        const faculty = await Faculty.findOne({ facultyId });
        if (!faculty) {
            return res.status(400).json({ error: 'Invalid Faculty ID' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, faculty.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        // Create token
        const payload = {
            id: faculty._id,
            facultyId: faculty.facultyId,
            name: faculty.name,
            role: 'faculty'
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token: token,
            facultyData: {
                id: faculty._id,
                facultyId: faculty.facultyId,
                name: faculty.name,
                email: faculty.email,
                department: faculty.department,
                designation: faculty.designation,
                assignments: faculty.assignments
            }
        });

    } catch (err) {
        console.error('Faculty login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
