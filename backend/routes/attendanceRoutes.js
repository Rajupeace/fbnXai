const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Try to use Attendance model if available
let Attendance;
try {
    Attendance = require('../models/Attendance');
} catch (e) { }
let StudentData;
try {
    StudentData = require('../models/StudentData');
} catch (e) { }
let Enrollment;
try {
    Enrollment = require('../models/Enrollment');
} catch (e) { }
let Student;
try {
    Student = require('../models/Student');
} catch (e) { }

// File DB helper removed; attendance routes are MongoDB-only

// @route   POST /api/attendance
// @desc    Mark attendance (bulk) - Creates individual attendance records
router.post('/', async (req, res) => {
    try {
        const { date, records, subject, year, section, branch, facultyId, facultyName } = req.body;
        // records: [{ studentId: '...', studentName: '...', status: 'Present'|'Absent'|'Leave'|'Late' }, ...]

        console.log('[Attendance] Recording for:', { subject, year, section, branch, date, recordCount: records.length });

        if (!records || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ error: 'Records array is required and must not be empty' });
        }

        const dateStr = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD format

        // 1. MongoDB Save - Create individual document for each student
        if (mongoose.connection.readyState !== 1 || !Attendance) {
            return res.status(503).json({ error: 'Database not connected or Attendance model unavailable' });
        }

        try {
            const docsToInsert = records.map(r => ({
                date: dateStr,
                studentId: String(r.studentId),
                studentName: r.studentName || 'Unknown',
                subject,
                year: String(year),
                section: String(section),
                branch: String(branch),
                status: r.status || 'Present',
                facultyId,
                facultyName: facultyName || 'Unknown',
                remarks: r.remarks || '',
                markedAt: new Date()
            }));

            // Upsert to handle duplicates
            for (const doc of docsToInsert) {
                await Attendance.findOneAndUpdate(
                    {
                        date: doc.date,
                        studentId: doc.studentId,
                        subject: doc.subject
                    },
                    { $set: doc },
                    { upsert: true }
                );
            }
            console.log(`✅ Saved ${docsToInsert.length} attendance records to MongoDB`);

            // Recompute aggregates for affected students and student+subject enrollments
            try {
                const affectedStudents = new Set(docsToInsert.map(d => String(d.studentId)));
                const affectedPairs = new Set(docsToInsert.map(d => `${String(d.studentId)}::${d.subject}`));

                // Update per-student overall stats and StudentData attendance section
                for (const sid of affectedStudents) {
                    try {
                        const recordsAll = await Attendance.find({ studentId: sid }).lean();
                        const totalAll = recordsAll.length;
                        const presentAll = recordsAll.filter(r => r.status === 'Present').length;
                        const absentAll = recordsAll.filter(r => r.status === 'Absent').length;
                        const pctAll = totalAll > 0 ? Math.round((presentAll / totalAll) * 100) : 0;

                        // Build attendanceRecords array for StudentData
                        const attendanceRecords = recordsAll.map(r => ({
                            courseId: null,
                            courseName: r.subject,
                            date: r.date,
                            status: r.status,
                            markedBy: r.facultyName || r.facultyId || 'unknown',
                            markedTime: r.markedAt || r.updatedAt || new Date()
                        }));

                        if (StudentData) {
                            try {
                                // Resolve Student._id for StudentData.studentId (schema expects ObjectId)
                                let studentObj = null;
                                if (Student) studentObj = await Student.findOne({ sid }).select('_id').lean();
                                if (studentObj && studentObj._id) {
                                    await StudentData.findOneAndUpdate(
                                        { studentId: studentObj._id },
                                        {
                                            $set: {
                                                'sections.attendance.totalClasses': totalAll,
                                                'sections.attendance.totalPresent': presentAll,
                                                'sections.attendance.totalAbsent': absentAll,
                                                'sections.attendance.attendancePercentage': pctAll,
                                                'sections.attendance.attendanceRecords': attendanceRecords,
                                                'sections.attendance.lastUpdated': new Date()
                                            }
                                        },
                                        { upsert: true }
                                    );
                                    // Broadcast StudentData attendance update
                                    try { global.broadcastEvent && global.broadcastEvent({ resource: 'studentData', action: 'update', data: { studentId: studentObj._id.toString(), attendanceSummary: { total: totalAll, present: presentAll, absent: absentAll, pct: pctAll } } }); } catch (e) {}
                                } else {
                                    console.warn('StudentData update skipped: Student not found for sid', sid);
                                }
                            } catch (sdErr) {
                                console.error('Error updating StudentData (attendanceRoutes):', sdErr);
                            }
                        }

                        if (Student) {
                            await Student.findOneAndUpdate({ sid }, { $set: { 'stats.totalClasses': totalAll, 'stats.totalPresent': presentAll } });
                        }
                    } catch (sErr) {
                        console.error('Error recomputing student aggregates:', sErr);
                    }
                }

                // Update Enrollment attendance percentages per student+subject
                for (const key of affectedPairs) {
                    try {
                        const [sid, subj] = key.split('::');
                        const records = await Attendance.find({ studentId: sid, subject: subj }).lean();
                        const total = records.length;
                        const present = records.filter(r => r.status === 'Present').length;
                        const pct = total > 0 ? Math.round((present / total) * 100) : 0;

                        if (Enrollment) {
                            const enrs = await Enrollment.find({ studentId: sid, subject: subj }).lean();
                            for (const enr of enrs) {
                                await Enrollment.findByIdAndUpdate(enr._id, { $set: { attendancePercentage: pct, totalClasses: total, totalPresent: present, lastActivityAt: new Date() } });
                            }
                        }
                    } catch (e) {
                        console.error('Error updating enrollment aggregates:', e);
                    }
                }
                    // Broadcast overall attendance bulk update for dashboards
                    try { global.broadcastEvent && global.broadcastEvent({ resource: 'attendance', action: 'bulk-update', data: { date: dateStr, subject, section, branch, recordCount: docsToInsert.length, affectedStudents: Array.from(affectedStudents) } }); } catch (e) {}
            } catch (syncErr) {
                console.error('Error recomputing attendance aggregates:', syncErr);
            }
        } catch (mongoErr) {
            console.error("Mongo Attendance Save Error:", mongoErr);
            return res.status(500).json({ error: 'Failed to save attendance', details: mongoErr.message });
        }

        res.status(201).json({
            message: `Attendance recorded for ${records.length} students`,
            date: dateStr,
            subject,
            section,
            recordCount: records.length
        });

    } catch (err) {
        console.error("❌ Attendance Error:", err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// @route   GET /api/attendance/student/:sid
// @desc    Get attendance for a student
router.get('/student/:sid', async (req, res) => {
    try {
        const { sid } = req.params;
        let data = [];

        if (mongoose.connection.readyState !== 1 || !Attendance) {
            return res.status(503).json({ error: 'Database not connected or Attendance model unavailable' });
        }
        data = await Attendance.find({ studentId: String(sid) }).sort({ date: -1 }).lean();

        // Transform for frontend
        const transformed = data.map(rec => ({
            date: rec.date,
            studentId: rec.studentId,
            studentName: rec.studentName,
            subject: rec.subject,
            year: rec.year,
            section: rec.section,
            branch: rec.branch,
            status: rec.status,
            facultyId: rec.facultyId,
            facultyName: rec.facultyName,
            remarks: rec.remarks || ''
        }));

        res.json({
            studentId: sid,
            totalRecords: transformed.length,
            data: transformed
        });
    } catch (err) {
        console.error('Error fetching attendance:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// @route   GET /api/attendance/subject/:subject/section/:section
// @desc    Get attendance for a specific section and subject
router.get('/subject/:subject/section/:section', async (req, res) => {
    try {
        const { subject, section } = req.params;
        const { date } = req.query;

        let data = [];
        const query = { subject, section };
        if (date) query.date = date;

        if (mongoose.connection.readyState !== 1 || !Attendance) {
            return res.status(503).json({ error: 'Database not connected or Attendance model unavailable' });
        }
        data = await Attendance.find(query).sort({ date: -1 }).lean();

        // Group by date for easier processing
        const grouped = {};
        data.forEach(record => {
            if (!grouped[record.date]) {
                grouped[record.date] = [];
            }
            grouped[record.date].push(record);
        });

        res.json({
            subject,
            section,
            dateGroups: grouped,
            totalRecords: data.length
        });
    } catch (err) {
        console.error('Error fetching section attendance:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// @route   GET /api/attendance/all
// @desc    Get all attendance records (with optional filters)
router.get('/all', async (req, res) => {
    try {
        const { year, section, subject, date, branch } = req.query;

        let query = {};
        if (year) query.year = String(year);
        if (section) query.section = String(section);
        if (subject) query.subject = subject;
        if (date) query.date = date;
        if (branch) query.branch = String(branch);

        let data = [];

        if (mongoose.connection.readyState !== 1 || !Attendance) {
            return res.status(503).json({ error: 'Database not connected or Attendance model unavailable' });
        }
        data = await Attendance.find(query).sort({ date: -1 }).lean();

        // For compatibility with old client code that expects records array format
        // Group data by date/subject/section
        const grouped = {};
        data.forEach(record => {
            const key = `${record.date}_${record.subject}_${record.section}`;
            if (!grouped[key]) {
                grouped[key] = {
                    _id: key,
                    id: key,
                    date: record.date,
                    subject: record.subject,
                    section: record.section,
                    year: record.year,
                    branch: record.branch,
                    facultyId: record.facultyId,
                    facultyName: record.facultyName,
                    records: []
                };
            }
            grouped[key].records.push({
                studentId: record.studentId,
                studentName: record.studentName,
                status: record.status,
                remarks: record.remarks
            });
        });

        const result = Object.values(grouped);
        res.json(result);
    } catch (err) {
        console.error('Error fetching attendance records:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

module.exports = router;
