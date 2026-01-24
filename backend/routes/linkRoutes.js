const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');

/**
 * STUDENT-FACULTY LINKAGE ROUTES
 * Links show which faculty teaches which students
 */

// GET /api/links/student/:sid/faculty
// Show all faculty members teaching this student
router.get('/student/:sid/faculty', async (req, res) => {
  try {
    const { sid } = req.params;
    
    // Get all enrollments for this student
    const enrollments = await Enrollment.find({
      studentId: sid,
      status: 'active'
    }).lean();
    
    if (enrollments.length === 0) {
      return res.json([]);
    }
    
    // Get faculty details
    const facultyList = [];
    for (const enrollment of enrollments) {
      const faculty = await Faculty.findOne({
        facultyId: enrollment.facultyId
      }).lean();
      
      if (faculty) {
        facultyList.push({
          facultyId: enrollment.facultyId,
          facultyName: faculty.name,
          subject: enrollment.subject,
          email: faculty.email,
          phone: faculty.phone,
          qualification: faculty.qualification,
          experience: faculty.experience,
          image: faculty.image,
          enrollmentId: enrollment._id
        });
      }
    }
    
    res.json(facultyList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/links/faculty/:fid/students
// Show all students taught by this faculty
router.get('/faculty/:fid/students', async (req, res) => {
  try {
    const { fid } = req.params;
    
    // Get all enrollments for this faculty
    const enrollments = await Enrollment.find({
      facultyId: fid,
      status: 'active'
    }).lean();
    
    if (enrollments.length === 0) {
      return res.json([]);
    }
    
    // Get student details with stats
    const studentList = await Promise.all(
      enrollments.map(async (enrollment) => {
        const student = await Student.findOne({
          sid: enrollment.studentId
        }).lean();
        
        // Get attendance for this student-subject combo
        const attendanceRecords = await Attendance.find({
          studentId: enrollment.studentId,
          subject: enrollment.subject,
          facultyId: fid
        }).lean();
        
        const totalClasses = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(a => a.status === 'Present').length;
        const attendancePercentage = totalClasses > 0 
          ? Math.round((presentDays / totalClasses) * 100)
          : 0;
        
        return {
          studentId: enrollment.studentId,
          studentName: enrollment.studentName,
          email: student?.email,
          phone: student?.phone,
          year: enrollment.year,
          section: enrollment.section,
          branch: enrollment.branch,
          subject: enrollment.subject,
          attendancePercentage,
          classesAttended: presentDays,
          totalClasses,
          enrollmentStatus: enrollment.status
        };
      })
    );
    
    res.json(studentList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/links/class/:year/:section/:branch
// Show all students in a specific class
router.get('/class/:year/:section/:branch', async (req, res) => {
  try {
    const { year, section, branch } = req.params;
    
    const enrollments = await Enrollment.find({
      year,
      section,
      branch,
      status: 'active'
    }).lean();
    
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/links/subject/:subject/:year/:section
// Show all faculty teaching a specific subject
router.get('/subject/:subject/:year/:section', async (req, res) => {
  try {
    const { subject, year, section } = req.params;
    
    const enrollments = await Enrollment.find({
      subject,
      year,
      section,
      status: 'active'
    }).distinct('facultyId');
    
    const faculties = await Faculty.find({
      facultyId: { $in: enrollments }
    }).select('facultyId name email phone').lean();
    
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/links/enroll
// Create enrollment link (Admin only)
router.post('/enroll', async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      facultyId,
      facultyName,
      subject,
      branch,
      year,
      section,
      semester,
      academicYear
    } = req.body;
    
    // Validate inputs
    if (!studentId || !facultyId || !subject || !year || !section) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if enrollment already exists
    const existing = await Enrollment.findOne({
      studentId,
      facultyId,
      subject,
      academicYear: academicYear || new Date().getFullYear().toString()
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Enrollment already exists' });
    }
    
    // Create new enrollment
    const enrollment = new Enrollment({
      studentId,
      studentName,
      facultyId,
      facultyName,
      subject,
      branch,
      year,
      section,
      semester,
      academicYear: academicYear || new Date().getFullYear().toString(),
      status: 'active'
    });
    
    await enrollment.save();
    
    res.json({
      success: true,
      message: 'Enrollment created successfully',
      enrollmentId: enrollment._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/links/enroll/:enrollmentId
// Update enrollment
router.put('/enroll/:enrollmentId', async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const updates = req.body;
    
    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Enrollment updated',
      enrollment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/links/enroll/:enrollmentId
// Soft delete (change status to dropped)
router.delete('/enroll/:enrollmentId', async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    
    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { status: 'dropped', completedAt: new Date() },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Enrollment dropped',
      enrollment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/links/sync-status
// Get current database sync status
router.get('/sync-status', async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalEnrollments,
      activeEnrollments,
      totalAttendanceRecords
    ] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'active' }),
      Attendance.countDocuments()
    ]);
    
    res.json({
      timestamp: new Date(),
      counts: {
        students: totalStudents,
        faculty: totalFaculty,
        totalEnrollments,
        activeEnrollments,
        attendanceRecords: totalAttendanceRecords
      },
      health: 'Good',
      syncStatus: 'Current'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
