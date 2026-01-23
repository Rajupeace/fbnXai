const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const dbFile = require('../dbHelper');

// Middleware to get DB Access (Mongo or File)
const getAttendanceDB = () => {
    if (mongoose.connection.readyState === 1) {
        return { type: 'mongo', model: Attendance };
    } else {
        return { type: 'file', db: dbFile('attendance', []) };
    }
};

// POST: Save Attendance
router.post('/', async (req, res) => {
    try {
        const { date, subject, year, branch, section, facultyId, facultyName, records } = req.body;

        if (!date || !subject || !year || !section || !records) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const db = getAttendanceDB();

        // Normalize date to start of day for consistency
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        if (db.type === 'mongo') {
            // Check if attendance already exists for this slot (optional - maybe we want to allow overwriting or appending)
            // For now, let's just create a new record or update if strictly matching ID not provided

            const newAttendance = new Attendance({
                date: attendanceDate,
                subject,
                year,
                branch,
                section,
                facultyId,
                facultyName,
                records
            });

            // Prepare bulk updates
            const bulkOps = [];
            if (records && Array.isArray(records)) {
                for (const record of records) {
                    const update = { $inc: { "stats.totalClasses": 1 } };
                    if (record.status === 'Present') {
                        update.$inc["stats.totalPresent"] = 1;
                    }
                    bulkOps.push({
                        updateOne: {
                            filter: { sid: record.studentId },
                            update: update
                        }
                    });
                }
            }

            // Execute parallel: Save Record + Update Students
            // Using Promise.allSettled to ensure we at least try both, but prioritize responding to user
            const [saveResult, updateResult] = await Promise.allSettled([
                newAttendance.save(),
                bulkOps.length > 0 ? Student.bulkWrite(bulkOps) : Promise.resolve()
            ]);

            if (saveResult.status === 'rejected') {
                throw new Error('Failed to save attendance record: ' + saveResult.reason);
            }

            // Broadcast attendance creation so frontends can refresh
            try { global.broadcastEvent && global.broadcastEvent({ resource: 'attendance', action: 'create', data: newAttendance }); } catch (e) { }

            if (updateResult.status === 'fulfilled' && bulkOps.length > 0) {
                console.log(`✅ Parallel: Updated stats for ${bulkOps.length} students instantly.`);
            } else if (updateResult.status === 'rejected') {
                console.error("⚠️ Warning: Student stats sync failed (background)", updateResult.reason);
                // We don't fail the request here because the main attendance record IS saved.
            }

            res.status(201).json(newAttendance);
        } else {
            const all = db.db.read();
            const newRecord = {
                id: Date.now().toString(),
                date: attendanceDate.toISOString(),
                subject,
                year,
                branch,
                section,
                facultyId,
                facultyName,
                records,
                createdAt: new Date().toISOString()
            };
            all.push(newRecord);
            db.db.write(all);

            // Update local student stats file for dashboard sync
            try {
                console.log("Attempting to update student stats in file...");
                const studentsDB = dbFile('students', []);
                let studentsList = studentsDB.read();
                console.log(`Loaded ${studentsList.length} students from file.`);

                let updatedCount = 0;

                records.forEach(r => {
                    console.log(`Processing record for studentId: ${r.studentId}`);
                    const studentIdx = studentsList.findIndex(s => s.sid === r.studentId || s.id === r.studentId);

                    if (studentIdx !== -1) {
                        console.log(`Found student at index ${studentIdx}`);
                        const s = studentsList[studentIdx];
                        if (!s.stats) s.stats = {};
                        s.stats.totalClasses = (s.stats.totalClasses || 0) + 1;
                        if (r.status === 'Present') {
                            s.stats.totalPresent = (s.stats.totalPresent || 0) + 1;
                        }
                        studentsList[studentIdx] = s;
                        updatedCount++;
                    } else {
                        console.log(`Student ${r.studentId} NOT found in file list.`);
                    }
                });

                if (updatedCount > 0) {
                    studentsDB.write(studentsList);
                    console.log(`Updated stats for ${updatedCount} students in file DB`);
                } else {
                    console.log("No students updated.");
                }
            } catch (e) {
                console.error("Failed to update student stats file", e);
            }

            res.status(201).json(newRecord);
        }
    } catch (error) {
        console.error('Error saving attendance:', error);
        res.status(500).json({ error: 'Failed to save attendance' });
    }
});

// GET: Get Attendance for Faculty (My Classes)
router.get('/faculty/:facultyId', async (req, res) => {
    try {
        const { facultyId } = req.params;
        const db = getAttendanceDB();

        if (db.type === 'mongo') {
            const records = await Attendance.find({ facultyId }).sort({ date: -1 });
            res.json(records);
        } else {
            const all = db.db.read();
            const records = all.filter(r => r.facultyId === facultyId).sort((a, b) => new Date(b.date) - new Date(a.date));
            res.json(records);
        }
    } catch (error) {
        console.error('Error fetching faculty attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

// GET: Get Attendance for Student
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const db = getAttendanceDB();

        if (db.type === 'mongo') {
            const records = await Attendance.find({ "records.studentId": studentId }).sort({ date: -1 });
            res.json(records);
        } else {
            const all = db.db.read();
            const records = all.filter(r => r.records.some(rec => rec.studentId === studentId)).sort((a, b) => new Date(b.date) - new Date(a.date));
            res.json(records);
        }
    } catch (error) {
        console.error('Error fetching student attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

// GET: Get All Attendance (Admin) - Optionally filtered
router.get('/all', async (req, res) => {
    try {
        const { year, branch, section, subject, date } = req.query;
        const db = getAttendanceDB();

        let query = {};
        if (year) query.year = year;
        if (branch) query.branch = branch;
        if (section) query.section = section;
        if (subject) query.subject = subject;
        if (date) {
            const d = new Date(date);
            if (isNaN(d.getTime())) {
                console.warn('[ATTENDANCE] Invalid date parameter:', date);
                return res.status(400).json({ error: "Invalid date format" });
            }
            d.setHours(0, 0, 0, 0);
            query.date = d;
        }

        if (db.type === 'mongo') {
            const records = await Attendance.find(query).sort({ date: -1 });
            res.json(records);
        } else {
            let all = db.db.read();
            all = all.filter(r => {
                if (year && r.year !== year) return false;
                if (branch && r.branch !== branch) return false;
                if (section && r.section !== section) return false;
                if (subject && r.subject !== subject) return false;
                if (date) {
                    const rDate = new Date(r.date);
                    if (isNaN(rDate.getTime())) return false; // Skip invalid records
                    rDate.setHours(0, 0, 0, 0);
                    const qDate = new Date(date);
                    qDate.setHours(0, 0, 0, 0);
                    if (rDate.getTime() !== qDate.getTime()) return false;
                }
                return true;
            });
            res.json(all);
        }
    } catch (error) {
        console.error('[ATTENDANCE FETCH ERROR]:', error);
        res.status(500).json({ error: 'Failed to fetch attendance', details: error.message });
    }
});

// GET: Stats for Faculty (Counts)
router.get('/stats/faculty/:facultyId', async (req, res) => {
    // Return summary: Subject -> Total Classes, Recent Attendance %
    // This is useful for dashboard widgets
    try {
        const { facultyId } = req.params;
        const db = getAttendanceDB();
        let records = [];

        if (db.type === 'mongo') {
            records = await Attendance.find({ facultyId });
        } else {
            records = db.db.read().filter(r => r.facultyId === facultyId);
        }

        // Group by subject and section
        const stats = {};
        records.forEach(r => {
            const key = `${r.subject}-${r.section}-${r.year}`;
            if (!stats[key]) {
                stats[key] = { subject: r.subject, section: r.section, year: r.year, classesTaken: 0, totalStudents: 0, avgAttendance: 0 };
            }
            stats[key].classesTaken++;

            const presentCount = r.records.filter(rec => rec.status === 'Present').length;
            const total = r.records.length;
            const percentage = total > 0 ? (presentCount / total) * 100 : 0;

            // Running average approximation
            stats[key].avgAttendance = ((stats[key].avgAttendance * (stats[key].classesTaken - 1)) + percentage) / stats[key].classesTaken;
        });

        res.json(Object.values(stats));

    } catch (error) {
        console.error('Error fetching faculty stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }

});

module.exports = router;
