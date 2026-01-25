const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        const { facultyId, name, email, password, department, designation, phone, assignments } = req.body;

        if (!facultyId || !name || !email || !password) {
            return res.status(400).json({ error: 'Please provide all required fields' });
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

module.exports = router;
