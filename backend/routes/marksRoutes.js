const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Mark Schema - Subject-wise with all assessment types
const markSchema = new mongoose.Schema({
    studentId: { type: String, required: true, index: true },
    subject: { type: String, required: true, index: true },
    assessmentType: {
        type: String,
        required: true,
        enum: ['cla1', 'cla2', 'cla3', 'cla4', 'cla5',
            'm1t1', 'm1t2', 'm1t3', 'm1t4',
            'm2t1', 'm2t2', 'm2t3', 'm2t4']
    },
    marks: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true },
    updatedBy: { type: String },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Compound index for faster queries
markSchema.index({ studentId: 1, subject: 1, assessmentType: 1 }, { unique: true });

const Mark = mongoose.models.Mark || mongoose.model('Mark', markSchema);

// GET /api/marks/:subject/all
// Get all marks for a specific subject
router.get('/marks/:subject/all', async (req, res) => {
    try {
        const { subject } = req.params;

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const marks = await Mark.find({ subject }).lean();
        res.json(marks);
    } catch (error) {
        console.error('Error fetching subject marks:', error);
        res.status(500).json({ error: 'Failed to fetch marks', details: error.message });
    }
});

// POST /api/marks/bulk-save
// Save multiple marks at once (bulk update)
router.post('/marks/bulk-save', async (req, res) => {
    try {
        const { marks } = req.body;

        if (!marks || !Array.isArray(marks)) {
            return res.status(400).json({ error: 'Invalid marks data' });
        }

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        // Get max marks based on assessment type
        const getMaxMarks = (assessmentType) => {
            if (assessmentType.startsWith('cla')) return 20;
            if (assessmentType.startsWith('m1t') || assessmentType.startsWith('m2t')) return 10;
            return 100;
        };

        // Bulk write operations
        const operations = marks.map(mark => ({
            updateOne: {
                filter: {
                    studentId: mark.studentId,
                    subject: mark.subject,
                    assessmentType: mark.assessmentType
                },
                update: {
                    $set: {
                        marks: mark.marks,
                        maxMarks: getMaxMarks(mark.assessmentType),
                        updatedAt: new Date()
                    }
                },
                upsert: true
            }
        }));

        const result = await Mark.bulkWrite(operations);

        res.json({
            success: true,
            message: 'Marks saved successfully',
            modified: result.modifiedCount,
            inserted: result.upsertedCount
        });
    } catch (error) {
        console.error('Error saving marks:', error);
        res.status(500).json({ error: 'Failed to save marks', details: error.message });
    }
});

// GET /api/students/:studentId/marks-by-subject
// Get student marks organized by subject
router.get('/students/:studentId/marks-by-subject', async (req, res) => {
    try {
        const { studentId } = req.params;

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const marks = await Mark.find({ studentId }).lean();

        // Organize by subject
        const bySubject = {};
        marks.forEach(mark => {
            if (!bySubject[mark.subject]) {
                bySubject[mark.subject] = {
                    subject: mark.subject,
                    cla: [],
                    module1: [],
                    module2: [],
                    overall: { total: 0, max: 0, percentage: 0 }
                };
            }

            const subj = bySubject[mark.subject];

            if (mark.assessmentType.startsWith('cla')) {
                const testNum = parseInt(mark.assessmentType.replace('cla', ''));
                subj.cla.push({
                    test: testNum,
                    scored: mark.marks,
                    total: mark.maxMarks
                });
            } else if (mark.assessmentType.startsWith('m1t')) {
                const targetNum = parseInt(mark.assessmentType.replace('m1t', ''));
                subj.module1.push({
                    target: targetNum,
                    scored: mark.marks,
                    total: mark.maxMarks
                });
            } else if (mark.assessmentType.startsWith('m2t')) {
                const targetNum = parseInt(mark.assessmentType.replace('m2t', ''));
                subj.module2.push({
                    target: targetNum,
                    scored: mark.marks,
                    total: mark.maxMarks
                });
            }

            subj.overall.total += mark.marks;
            subj.overall.max += mark.maxMarks;
        });

        // Calculate percentages
        Object.values(bySubject).forEach(subj => {
            if (subj.overall.max > 0) {
                subj.overall.percentage = Math.round((subj.overall.total / subj.overall.max) * 100);
            }
            // Sort arrays
            subj.cla.sort((a, b) => a.test - b.test);
            subj.module1.sort((a, b) => a.target - b.target);
            subj.module2.sort((a, b) => a.target - b.target);
        });

        res.json(Object.values(bySubject));
    } catch (error) {
        console.error('Error fetching student marks:', error);
        res.status(500).json({ error: 'Failed to fetch student marks', details: error.message });
    }
});

// GET /api/admin/marks/overview
// Get class averages and overall statistics
router.get('/admin/marks/overview', async (req, res) => {
    try {
        const { year, section, subject } = req.query;

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const Student = require('../models/Student');

        // Build student filter
        const studentFilter = {};
        if (year) studentFilter.year = parseInt(year);
        if (section) studentFilter.section = section;

        const students = await Student.find(studentFilter).lean();
        const studentIds = students.map(s => s.sid);

        // Build marks filter
        const marksFilter = { studentId: { $in: studentIds } };
        if (subject) marksFilter.subject = subject;

        const marks = await Mark.find(marksFilter).lean();

        // Calculate statistics
        const stats = {
            totalStudents: students.length,
            subjectsAnalyzed: [...new Set(marks.map(m => m.subject))],
            averagesBySubject: {},
            overallAverage: 0,
            topPerformers: []
        };

        // Group by subject
        const bySubject = {};
        marks.forEach(mark => {
            if (!bySubject[mark.subject]) {
                bySubject[mark.subject] = { total: 0, max: 0, count: 0 };
            }
            bySubject[mark.subject].total += mark.marks;
            bySubject[mark.subject].max += mark.maxMarks;
            bySubject[mark.subject].count++;
        });

        // Calculate averages
        Object.keys(bySubject).forEach(subj => {
            const data = bySubject[subj];
            stats.averagesBySubject[subj] = {
                percentage: data.max > 0 ? Math.round((data.total / data.max) * 100) : 0,
                totalMarks: data.total,
                maxMarks: data.max
            };
        });

        // Overall average
        const totalScored = marks.reduce((sum, m) => sum + m.marks, 0);
        const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
        stats.overallAverage = totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : 0;

        res.json(stats);
    } catch (error) {
        console.error('Error fetching admin overview:', error);
        res.status(500).json({ error: 'Failed to fetch overview', details: error.message });
    }
});

// GET /api/faculty/:facultyId/students
// Get students for a faculty member
router.get('/faculty/:facultyId/students', async (req, res) => {
    try {
        const { facultyId } = req.params;

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const Faculty = require('../models/Faculty');
        const Student = require('../models/Student');

        const faculty = await Faculty.findOne({ facultyId }).lean();

        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        // Get students from faculty's assigned classes
        const query = {};
        if (faculty.year) query.year = faculty.year;
        if (faculty.section) query.section = faculty.section;

        const students = await Student.find(query).lean();
        res.json(students);
    } catch (error) {
        console.error('Error fetching faculty students:', error);
        res.status(500).json({ error: 'Failed to fetch students', details: error.message });
    }
});

module.exports = router;
