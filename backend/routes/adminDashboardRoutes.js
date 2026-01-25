const express = require('express');
const router = express.Router();
const {
  syncDatabaseRelationships,
  validateDatabaseRelationships,
  migrateAssignmentsToEnrollments
} = require('../utils/databaseSync');

const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');
const StudentData = require('../models/StudentData');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');

/**
 * ADMIN ROUTES FOR DASHBOARD SYNC & VISIBILITY
 */

// POST /api/admin/sync-database
// Synchronize all relationships
router.post('/sync-database', async (req, res) => {
  try {
    const result = await syncDatabaseRelationships();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/validate-database
// Validate database integrity
router.get('/validate-database', async (req, res) => {
  try {
    const result = await validateDatabaseRelationships();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/migrate-to-enrollments
// Migrate legacy faculty assignments to enrollments
router.post('/migrate-to-enrollments', async (req, res) => {
  try {
    const result = await migrateAssignmentsToEnrollments();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/dashboard-status
// Overall system status
router.get('/dashboard-status', async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalEnrollments,
      activeEnrollments,
      totalAttendanceRecords,
      totalExams,
      totalExamResults
    ] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'active' }),
      Attendance.countDocuments(),
      Exam.countDocuments(),
      ExamResult.countDocuments()
    ]);
    
    res.json({
      timestamp: new Date(),
      counts: {
        students: totalStudents,
        faculty: totalFaculty,
        enrollments: {
          total: totalEnrollments,
          active: activeEnrollments
        },
        attendanceRecords: totalAttendanceRecords,
        exams: totalExams,
        examResults: totalExamResults
      },
      health: 'Good',
      syncStatus: 'Current'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/enrollments-report
// Detailed enrollment report
router.get('/enrollments-report', async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ status: 'active' })
      .select('studentId studentName facultyId facultyName subject year section branch')
      .lean();
    
    // Group by faculty
    const byFaculty = {};
    enrollments.forEach(e => {
      if (!byFaculty[e.facultyId]) {
        byFaculty[e.facultyId] = {
          facultyId: e.facultyId,
          facultyName: e.facultyName,
          students: [],
          subjects: new Set(),
          classes: new Set()
        };
      }
      byFaculty[e.facultyId].students.push(e.studentId);
      byFaculty[e.facultyId].subjects.add(e.subject);
      byFaculty[e.facultyId].classes.add(`${e.year}-${e.section}`);
    });
    
    // Convert sets to arrays and format
    const report = Object.values(byFaculty).map(f => ({
      facultyId: f.facultyId,
      facultyName: f.facultyName,
      totalStudents: f.students.length,
      subjects: Array.from(f.subjects),
      classes: Array.from(f.classes)
    }));
    
    res.json({
      timestamp: new Date(),
      totalEnrollments: enrollments.length,
      facultyReport: report
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/class-roster/:year/:section/:branch
// Get complete class roster
router.get('/class-roster/:year/:section/:branch', async (req, res) => {
  try {
    const { year, section, branch } = req.params;
    
    // Get all students in this class
    const students = await Student.find({
      year,
      section,
      branch
    }).select('sid studentName email phone').lean();
    
    // Get all faculty teaching this class
    const enrollments = await Enrollment.find({
      year,
      section,
      branch,
      status: 'active'
    }).lean();
    
    const facultyTeachingMap = {};
    enrollments.forEach(e => {
      if (!facultyTeachingMap[e.subject]) {
        facultyTeachingMap[e.subject] = [];
      }
      if (!facultyTeachingMap[e.subject].find(f => f.facultyId === e.facultyId)) {
        facultyTeachingMap[e.subject].push({
          facultyId: e.facultyId,
          facultyName: e.facultyName
        });
      }
    });
    
    res.json({
      classInfo: { year, section, branch },
      totalStudents: students.length,
      students,
      facultyTeaching: facultyTeachingMap
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/class-attendance/:year/:section/:branch
// Returns per-student overall attendance and subject-wise breakdown for a class
router.get('/class-attendance/:year/:section/:branch', async (req, res) => {
  try {
    const { year, section, branch } = req.params;

    // Get students in this class
    const students = await Student.find({ year: String(year), section: String(section), branch: String(branch) }).lean();

    const result = [];
    for (const s of students) {
      const sid = s.sid;

      // Prefer fast stats in Student.stats
      let totalClasses = s.stats?.totalClasses || 0;
      let totalPresent = s.stats?.totalPresent || 0;
      let overallPct = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

      // If StudentData exists, prefer its attendancePercentage
      try {
        const sd = await StudentData.findOne({ studentId: s._id }).lean();
        if (sd && sd.sections && sd.sections.attendance) {
          totalClasses = sd.sections.attendance.totalClasses || totalClasses;
          totalPresent = sd.sections.attendance.totalPresent || totalPresent;
          overallPct = sd.sections.attendance.attendancePercentage || overallPct;
        }
      } catch (e) {
        // ignore
      }

      // Subject-wise breakdown from Enrollment / Attendance
      const enrollments = await Enrollment.find({ studentId: sid, status: 'active' }).lean();
      const bySubject = {};
      for (const en of enrollments) {
        const records = await Attendance.find({ studentId: sid, subject: en.subject }).lean();
        const total = records.length;
        const present = records.filter(r => r.status === 'Present').length;
        bySubject[en.subject] = {
          total,
          present,
          percentage: total > 0 ? Math.round((present / total) * 100) : 0
        };
      }

      result.push({
        sid,
        name: s.studentName,
        totalClasses,
        totalPresent,
        overallPercentage: overallPct,
        subjects: bySubject
      });
    }

    res.json({ class: `${year}-${section}`, branch, students: result });
  } catch (err) {
    console.error('Error fetching class attendance:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/attendance-summary
// Attendance overview for all classes
router.get('/attendance-summary', async (req, res) => {
  try {
    const classes = await Enrollment.find({ status: 'active' })
      .distinct('year')
      .lean();
    
    const summary = [];
    
    for (const year of classes) {
      const sections = await Enrollment.find({ year, status: 'active' })
        .distinct('section')
        .lean();
      
      for (const section of sections) {
        const branches = await Enrollment.find({ year, section, status: 'active' })
          .distinct('branch')
          .lean();
        
        for (const branch of branches) {
          const enrollments = await Enrollment.find({
            year,
            section,
            branch,
            status: 'active'
          }).lean();
          
          const attendanceRecords = await Attendance.find({
            year,
            section,
            branch
          }).lean();
          
          const avgAttendance = attendanceRecords.length > 0
            ? Math.round(
              attendanceRecords.filter(a => a.status === 'Present').length /
              attendanceRecords.length * 100
            )
            : 0;
          
          summary.push({
            class: `${year}-${section}`,
            branch,
            students: enrollments.length,
            totalAttendanceRecords: attendanceRecords.length,
            averageAttendancePercentage: avgAttendance
          });
        }
      }
    }
    
    res.json({
      timestamp: new Date(),
      summary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/exam-summary
// Exam overview for all students
router.get('/exam-summary', async (req, res) => {
  try {
    const exams = await Exam.countDocuments();
    const results = await ExamResult.countDocuments();
    
    // Get average scores
    const avgScores = await ExamResult.aggregate([
      {
        $group: {
          _id: '$subject',
          avgScore: { $avg: '$score' },
          avgPercentage: { $avg: '$percentage' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      timestamp: new Date(),
      totals: {
        exams,
        results
      },
      averagesBySubject: avgScores
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/faculty-stats/:facultyId
// Detailed stats for a specific faculty
router.get('/faculty-stats/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;
    
    // Get faculty info
    const faculty = await Faculty.findOne({ facultyId }).lean();
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    
    // Get enrollments
    const enrollments = await Enrollment.find({
      facultyId,
      status: 'active'
    }).lean();
    
    // Get attendance records
    const attendanceRecords = await Attendance.find({
      facultyId
    }).lean();
    
    // Get exams created
    const examsCreated = await Exam.find({
      createdBy: facultyId
    }).lean();
    
    // Get exam results
    const examResults = await ExamResult.find({
      // assumingexam results have faculty link
    }).lean();
    
    res.json({
      faculty: {
        id: faculty.facultyId,
        name: faculty.name,
        email: faculty.email,
        phone: faculty.phone,
        designation: faculty.designation,
        department: faculty.department
      },
      statistics: {
        enrolledStudents: enrollments.length,
        classes: [...new Set(enrollments.map(e => `${e.year}-${e.section}`))].length,
        subjects: [...new Set(enrollments.map(e => e.subject))],
        attendanceRecordsCreated: attendanceRecords.length,
        examsCreated: examsCreated.length,
        averageAttendance: attendanceRecords.length > 0
          ? Math.round(
            attendanceRecords.filter(a => a.status === 'Present').length /
            attendanceRecords.length * 100
          )
          : 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/student-stats/:studentId
// Detailed stats for a specific student
router.get('/student-stats/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get student info
    const student = await Student.findOne({ sid: studentId }).lean();
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Get enrollments
    const enrollments = await Enrollment.find({
      studentId,
      status: 'active'
    }).lean();
    
    // Get attendance by subject
    const attendanceBySubject = {};
    for (const enrollment of enrollments) {
      const records = await Attendance.find({
        studentId,
        subject: enrollment.subject
      }).lean();
      
      const present = records.filter(r => r.status === 'Present').length;
      attendanceBySubject[enrollment.subject] = {
        total: records.length,
        present,
        percentage: records.length > 0 ? Math.round((present / records.length) * 100) : 0
      };
    }
    
    // Get exam results
    const examResults = await ExamResult.find({
      studentId
    }).lean();
    
    res.json({
      student: {
        id: student.sid,
        name: student.studentName,
        email: student.email,
        phone: student.phone,
        branch: student.branch,
        year: student.year,
        section: student.section
      },
      statistics: {
        enrolledFaculty: enrollments.length,
        enrolledSubjects: [...new Set(enrollments.map(e => e.subject))],
        attendanceBySubject,
        examsAttempted: examResults.length,
        averageExamScore: examResults.length > 0
          ? Math.round(
            examResults.reduce((sum, r) => sum + r.percentage, 0) / examResults.length
          )
          : 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/attendance-recompute
// Recompute attendance aggregates for all students from Attendance collection
router.post('/attendance-recompute', async (req, res) => {
  try {
    // Aggregate attendance by studentId
    const agg = await Attendance.aggregate([
      {
        $group: {
          _id: '$studentId',
          totalClasses: { $sum: 1 },
          totalPresent: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } }
        }
      }
    ]);

    let updatedCount = 0;
    for (const row of agg) {
      const sid = String(row._id);
      const total = row.totalClasses || 0;
      const present = row.totalPresent || 0;
      const absent = total - present;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;

      // Update Student collection stats
      try {
        const updated = await Student.findOneAndUpdate(
          { sid },
          {
            $set: {
              'stats.totalClasses': total,
              'stats.totalPresent': present
            }
          },
          { new: true }
        );
        if (updated) updatedCount++;
      } catch (uErr) {
        console.error('Error updating Student during recompute:', uErr);
      }

      // Update StudentData document (create if missing) with full attendance records
      try {
        const recordsAll = await Attendance.find({ studentId: sid }).lean();
        const attendanceRecords = recordsAll.map(r => ({
          courseId: null,
          courseName: r.subject,
          date: r.date,
          status: r.status,
          markedBy: r.facultyName || r.facultyId || 'unknown',
          markedTime: r.markedAt || r.updatedAt || new Date()
        }));

        // Resolve Student._id
        let studentObj = null;
        try {
          studentObj = await Student.findOne({ sid }).select('_id').lean();
        } catch (e) {
          console.warn('Student lookup failed during recompute for sid', sid, e.message);
        }

        if (studentObj && studentObj._id) {
          await StudentData.findOneAndUpdate(
            { studentId: studentObj._id },
            {
              $set: {
                'sections.attendance.totalClasses': total,
                'sections.attendance.totalPresent': present,
                'sections.attendance.totalAbsent': absent,
                'sections.attendance.attendancePercentage': pct,
                'sections.attendance.attendanceRecords': attendanceRecords,
                'sections.attendance.lastUpdated': new Date()
              }
            },
            { upsert: true }
          );
        } else {
          console.warn('StudentData recompute skipped: Student not found for sid', sid);
        }
      } catch (sdErr) {
        console.error('Error updating StudentData during recompute:', sdErr);
      }

      // Update Enrollment attendancePercentage per subject for this student
      try {
        const subjects = await Attendance.distinct('subject', { studentId: sid });
        for (const subj of subjects) {
          const records = await Attendance.find({ studentId: sid, subject: subj }).lean();
          const totalSub = records.length;
          const presentSub = records.filter(r => r.status === 'Present').length;
          const pctSub = totalSub > 0 ? Math.round((presentSub / totalSub) * 100) : 0;
          await Enrollment.updateMany({ studentId: sid, subject: subj }, { $set: { attendancePercentage: pctSub } });
        }
      } catch (enrErr) {
        console.error('Error updating Enrollment during recompute:', enrErr);
      }
    }

    // Broadcast student updates to connected frontends
    try { global.broadcastEvent && global.broadcastEvent({ resource: 'students', action: 'bulk-update', data: { studentsUpdated: updatedCount } }); } catch (e) { }

    res.json({ message: 'Recomputed attendance aggregates', studentsUpdated: updatedCount });
  } catch (err) {
    console.error('Error recomputing attendance aggregates:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/rebuild-faculty-assignments
// Rebuild `assignments` array on Faculty documents using active Enrollment records
router.post('/rebuild-faculty-assignments', async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ status: 'active' }).lean();
    if (!enrollments || enrollments.length === 0) {
      return res.json({ message: 'No active enrollments found' });
    }

    // Group by facultyId
    const byFaculty = {};
    enrollments.forEach(e => {
      const fid = String(e.facultyId);
      if (!byFaculty[fid]) byFaculty[fid] = {};
      const key = `${e.year}||${e.section}||${e.branch}||${e.subject}`;
      if (!byFaculty[fid][key]) {
        byFaculty[fid][key] = {
          year: String(e.year),
          section: String(e.section),
          branch: String(e.branch),
          subject: e.subject
        };
      }
    });

    let updated = 0;
    for (const fid of Object.keys(byFaculty)) {
      const assignments = Object.values(byFaculty[fid]);
      const faculty = await Faculty.findOneAndUpdate(
        { facultyId: fid },
        { $set: { assignments } },
        { new: true }
      );
      if (faculty) updated++;
    }

    // Notify frontends that faculty assignments changed
    try { global.broadcastEvent && global.broadcastEvent({ resource: 'faculty', action: 'assignments-rebuilt', data: { facultiesUpdated: updated } }); } catch (e) { }

    res.json({ message: 'Faculty assignments rebuilt', facultiesUpdated: updated });
  } catch (err) {
    console.error('Error rebuilding faculty assignments:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/sync-enrollments
// Create Enrollment records for students based on Faculty.assignments and Student classroom fields
router.post('/sync-enrollments', async (req, res) => {
  try {
    const faculties = await Faculty.find().lean();
    let created = 0;

    for (const f of faculties) {
      const assignments = f.assignments || [];
      for (const a of assignments) {
        // find students matching year/section/branch
        const students = await Student.find({ year: a.year, section: a.section, branch: a.branch }).lean();
        for (const s of students) {
          const exists = await Enrollment.findOne({ studentId: s.sid, facultyId: f.facultyId, subject: a.subject, year: a.year, section: a.section, branch: a.branch });
          if (!exists) {
            const en = new Enrollment({
              studentId: s.sid,
              studentName: s.studentName,
              facultyId: f.facultyId,
              facultyName: f.name,
              subject: a.subject,
              year: a.year,
              section: a.section,
              branch: a.branch,
              status: 'active',
              academicYear: a.year
            });
            await en.save();
            created++;
          }
        }
      }
    }

    // Broadcast updates
    try { global.broadcastEvent && global.broadcastEvent({ resource: 'enrollments', action: 'sync', data: { created } }); } catch (e) { }

    res.json({ message: 'Enrollments synchronized from faculty assignments', created });
  } catch (err) {
    console.error('Error syncing enrollments:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
