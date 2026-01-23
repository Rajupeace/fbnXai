const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Try to use Attendance model if available
let Attendance;
try {
    Attendance = require('../models/Attendance');
} catch (e) { }

// Helper for file-based DB
const dbFile = (collection) => {
    try {
        const h = require('../dbHelper');
        return h(collection);
    } catch (e) {
        return { read: () => [], write: () => { } };
    }
};

// @route   POST /api/attendance
// @desc    Mark attendance (bulk)
router.post('/', async (req, res) => {
    try {
        const { date, records, subject, year, section, facultyId } = req.body;
        // records: [{ studentId: '...', status: 'P'|'A' }, ...]

        console.log('[Attendance] Recording for:', { subject, year, section, date });

        // 1. MongoDB Save
        if (mongoose.connection.readyState === 1 && Attendance) {
            try {
                // Bulk write or loop
                const ops = records.map(r => ({
                    updateOne: {
                        filter: {
                            date: new Date(date).toISOString().split('T')[0],
                            studentId: r.studentId,
                            subject
                        },
                        update: {
                            $set: {
                                status: r.status,
                                year,
                                section,
                                facultyId,
                                markedAt: new Date()
                            }
                        },
                        upsert: true
                    }
                }));
                await Attendance.bulkWrite(ops);
            } catch (mongoErr) {
                console.warn("Mongo Attendance Save Error:", mongoErr.message);
            }
        }

        // 2. File DB Save (Fallover)
        try {
            const attDB = dbFile('attendance');
            let all = attDB.read() || [];

            records.forEach(r => {
                all.push({
                    id: uuidv4(),
                    studentId: r.studentId,
                    date: date,
                    subject,
                    status: r.status,
                    year,
                    section,
                    facultyId,
                    timestamp: new Date().toISOString()
                });
            });
            attDB.write(all);
        } catch (fileErr) {
            console.warn("File Attendance Save Error:", fileErr.message);
        }

        res.status(201).json({ message: 'Attendance Recorded' });

    } catch (err) {
        console.error("Attendance Error:", err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   GET /api/attendance/student/:sid
// @desc    Get attendance for a student
router.get('/student/:sid', async (req, res) => {
    try {
        const { sid } = req.params;
        let data = [];

        if (mongoose.connection.readyState === 1 && Attendance) {
            data = await Attendance.find({ studentId: sid }).lean();
        } else {
            const all = dbFile('attendance').read() || [];
            data = all.filter(a => a.studentId === sid);
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
