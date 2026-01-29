const express = require('express');
const router = express.Router();
const StudentNotes = require('../models/StudentNotes');
const Student = require('../models/Student');
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// GET all notes for a student
router.get('/', async (req, res) => {
    try {
        const { sid, studentId } = req.query;
        let query = {};

        if (studentId) {
            query.studentId = studentId;
        } else if (sid) {
            const student = await Student.findOne({ sid: String(sid) });
            if (!student) return res.status(404).json({ error: 'Student not found' });
            query.studentId = student._id;
        } else {
            return res.status(400).json({ error: 'Student identity (sid or studentId) required' });
        }

        const notes = await StudentNotes.find(query).sort({ updatedAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE a note (requires authenticated student or admin)
router.post('/', protect, async (req, res) => {
    try {
        const { sid, studentId, courseId, title, content, semester, academicYear, category } = req.body;

        let resolvedStudentId = studentId;

        // If authenticated as a student, prefer token user id
        if (req.user && req.user.role === 'student') {
            resolvedStudentId = req.user._id;
        }

        // If still not resolved, try sid lookup
        if (!resolvedStudentId && sid) {
            const student = await Student.findOne({ sid: String(sid) });
            if (!student) return res.status(404).json({ error: 'Student not found' });
            resolvedStudentId = student._id;
        }

        if (!resolvedStudentId) return res.status(400).json({ error: 'Student identity required' });

        const note = new StudentNotes({
            studentId: resolvedStudentId,
            courseId: courseId || new mongoose.Types.ObjectId(), // Fallback if no specific course
            title: title || 'Untitled Note',
            content: content || '',
            semester: semester || '1st',
            academicYear: academicYear || new Date().getFullYear().toString(),
            category: category || 'personal-notes'
        });

        await note.save();
        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE a note (requires authenticated user and ownership/admin)
router.put('/:id', protect, async (req, res) => {
    try {
        const { title, content, isPinned, isFavorite } = req.body;

        const note = await StudentNotes.findById(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        // Only owner or admin can update
        if (!(req.user && (req.user.isAdmin || String(req.user._id) === String(note.studentId)))) {
            return res.status(403).json({ error: 'Not authorized to update this note' });
        }

        // Build update object only with provided fields
        const updates = { updatedAt: Date.now() };
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;
        if (isPinned !== undefined) updates.isPinned = isPinned;
        if (isFavorite !== undefined) updates.isFavorite = isFavorite;

        const updatedNote = await StudentNotes.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a note (requires authenticated user and ownership/admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const note = await StudentNotes.findById(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        if (!(req.user && (req.user.isAdmin || String(req.user._id) === String(note.studentId)))) {
            return res.status(403).json({ error: 'Not authorized to delete this note' });
        }

        await StudentNotes.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
