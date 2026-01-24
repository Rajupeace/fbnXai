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

module.exports = router;
