const express = require('express');
const router = express.Router();
const StudentNotes = require('../models/StudentNotes');
const Student = require('../models/Student');
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

// CREATE a note
router.post('/', async (req, res) => {
    try {
        const { sid, studentId, courseId, title, content, semester, academicYear, category } = req.body;

        let resolvedStudentId = studentId;
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

// UPDATE a note
router.put('/:id', async (req, res) => {
    try {
        const { title, content, isPinned, isFavorite } = req.body;
        const note = await StudentNotes.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    title,
                    content,
                    isPinned,
                    isFavorite,
                    updatedAt: Date.now()
                }
            },
            { new: true }
        );
        if (!note) return res.status(404).json({ error: 'Note not found' });
        res.json(note);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a note
router.delete('/:id', async (req, res) => {
    try {
        const note = await StudentNotes.findByIdAndDelete(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });
        res.json({ success: true, message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
