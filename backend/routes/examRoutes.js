const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const mongoose = require('mongoose');

const { protect, faculty, admin } = require('../middleware/authMiddleware');

// --- FACULTY ENDPOINTS ---

// Create a new Exam
router.post('/create', protect, faculty, async (req, res) => {
    try {
        const { title, subject, topic, week, branch, year, section, questions, durationMinutes, totalMarks, facultyId } = req.body;

        const newExam = new Exam({
            title,
            subject,
            topic,
            week,
            branch,
            year,
            section,
            questions,
            durationMinutes,
            totalMarks,
            createdBy: req.user && req.user._id ? req.user._id : facultyId
        });

        await newExam.save();
        res.status(201).json(newExam);
    } catch (error) {
        console.error("Error creating exam:", error);
        res.status(500).json({ message: "Server error creating exam", details: error.message });
    }
});

// Get Exams created by Faculty
router.get('/faculty/:facultyId', protect, faculty, async (req, res) => {
    try {
        let { facultyId } = req.params;
        let queryId = facultyId;

        // If ID is custom string (e.g., FAC001), resolve to ObjectId
        if (!mongoose.Types.ObjectId.isValid(facultyId)) {
            const Faculty = require('../models/Faculty');
            const facultyDoc = await Faculty.findOne({ facultyId: facultyId });
            if (!facultyDoc) {
                return res.status(404).json({ message: 'Faculty not found' });
            }
            queryId = facultyDoc._id;
        }

        const exams = await Exam.find({ createdBy: queryId }).sort({ createdAt: -1 });
        res.json(exams);
    } catch (err) {
        console.error("Error fetching faculty exams:", err);
        res.status(500).json({ message: "Failed to fetch exams", details: err.message });
    }
});

// Delete Exam
router.delete('/:id', protect, faculty, async (req, res) => {
    try {
        await Exam.findByIdAndDelete(req.params.id);
        res.json({ message: 'Exam deleted' });
    } catch (err) {
        console.error("Error deleting exam:", err);
        res.status(500).json({ message: "Failed to delete exam", details: err.message });
    }
});

// --- STUDENT ENDPOINTS ---

// Get Exams for a Student (based on Branch and Year)
router.get('/student', protect, async (req, res) => {
    try {
        const { branch, year, section } = req.query;
        // console.log("Fetching exams for:", { branch, year, section });

        // Build query to match branch and year
        // For section: match if section matches OR if exam has no specific section constraint
        let query = {
            branch: branch,
            year: year,
            isActive: true
        };

        if (section) {
            query.$or = [
                { section: section },
                { section: null },
                { section: "" }
            ];
        } else {
            query.$or = [
                { section: null },
                { section: "" }
            ];
        }

        const exams = await Exam.find(query).sort({ createdAt: -1 });
        res.json(exams);
    } catch (err) {
        console.error("Error fetching student exams:", err);
        res.status(500).json({ message: "Failed to fetch exams", details: err.message });
    }
});

// Submit Exam
router.post('/submit', protect, async (req, res) => {
    try {
        const { studentId, examId, answers } = req.body;
        // answers is expected to be an array of indices corresponding to the questions

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: "Exam not found" });

        let score = 0;
        let correct = 0;
        let wrong = 0;

        exam.questions.forEach((q, index) => {
            const selectedOption = answers[index];
            if (selectedOption === q.correctOptionIndex) {
                score += q.marks;
                correct++;
            } else {
                if (selectedOption !== null && selectedOption !== undefined) {
                    wrong++;
                }
            }
        });

        const result = new ExamResult({
            studentId,
            examId,
            score,
            totalMarks: exam.totalMarks,
            correctAnswers: correct,
            wrongAnswers: wrong
        });

        await result.save();
        res.status(201).json(result);

    } catch (err) {
        console.error("Error submitting exam:", err);
        res.status(500).json({ message: "Failed to submit exam", details: err.message });
    }
});

// Get Student Results
router.get('/results/student/:studentId', protect, async (req, res) => {
    try {
        const results = await ExamResult.find({ studentId: req.params.studentId })
            .populate('examId', 'title subject topic week questions durationMinutes totalMarks')
            .sort({ submittedAt: -1 });
        res.json(results);
    } catch (err) {
        console.error("Error fetching student results:", err);
        res.status(500).json({ message: "Failed to fetch results", details: err.message });
    }
});


// --- ADMIN ENDPOINTS ---

const dbFile = require('../dbHelper');

// Get Analytics (All results)
router.get('/analytics', protect, admin, async (req, res) => {
    try {
        const results = await ExamResult.find()
            .populate('studentId', 'name rollNumber branch year section')
            .populate('examId', 'title subject topic week totalMarks branch year section')
            .sort({ submittedAt: -1 });
        res.json(results);
    } catch (err) {
        console.error('MongoDB Analytics fetch failed:', err.message);
        return res.status(503).json({ message: 'Database error fetching analytics', details: err.message });
    }
});

module.exports = router;
