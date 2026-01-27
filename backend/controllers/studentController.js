const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');
const mongoose = require('mongoose');

// @desc    Get Student Mega Overview (Attendance, Marks, Stats)
// @route   GET /api/students/:id/overview
// @access  Private (Student/Faculty/Admin)
exports.getStudentOverview = async (req, res) => {
  try {
    const { id } = req.params; // studentId (sid) e.g., '123'

    console.log(`📊 getStudentOverview: Fetching data for student ${id}`);

    // 1. Get Student Basic Data & Stats (MongoDB-only)
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected');
      return res.status(503).json({ error: 'Database not connected' });
    }

    const student = await Student.findOne({ sid: id }).lean();
    if (!student) {
      console.error(`❌ Student ${id} not found in database`);
      return res.status(404).json({ error: 'Student not found' });
    }

    console.log(`✅ Student found: ${student.studentName}`);

    // Compute attendance from Attendance collection when available
    let attendanceSummary = {
      overall: null,
      details: {},
      totalClasses: 0,
      totalPresent: 0
    };

    try {
      const Attendance = require('../models/Attendance');

      // Try both possible attendance schemas: aggregated records array or individual records
      let records = await Attendance.find({ 'records.studentId': id }).lean();
      if (!Array.isArray(records) || records.length === 0) {
        // Try individual-record schema
        records = await Attendance.find({ studentId: String(id) }).lean();
        // Normalize single-record docs into pseudo-aggregates per subject/date
        if (Array.isArray(records) && records.length > 0) {
          const subjectMap = {};
          let total = 0, present = 0;
          for (const rec of records) {
            total += 1;
            if (rec.status === 'Present') present += 1;
            const subj = rec.subject || 'Unknown';
            if (!subjectMap[subj]) subjectMap[subj] = { total: 0, present: 0 };
            subjectMap[subj].total += 1;
            if (rec.status === 'Present') subjectMap[subj].present += 1;
          }
          attendanceSummary.totalClasses = total;
          attendanceSummary.totalPresent = present;
          attendanceSummary.overall = total > 0 ? Math.round((present / total) * 100) : 0;
          for (const k of Object.keys(subjectMap)) {
            const s = subjectMap[k];
            attendanceSummary.details[k] = { total: s.total, present: s.present, percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0 };
          }
          console.log(`✅ Attendance calculated: ${attendanceSummary.overall}%`);
        }
      } else {
        // Aggregated records case
        const subjectMap = {};
        let total = 0, present = 0;
        for (const rec of records) {
          const stud = (rec.records || []).find(r => String(r.studentId) === String(id));
          if (!stud) continue;
          total += 1;
          if (stud.status === 'Present') present += 1;
          const subj = rec.subject || 'Unknown';
          if (!subjectMap[subj]) subjectMap[subj] = { total: 0, present: 0 };
          subjectMap[subj].total += 1;
          if (stud.status === 'Present') subjectMap[subj].present += 1;
        }
        attendanceSummary.totalClasses = total;
        attendanceSummary.totalPresent = present;
        attendanceSummary.overall = total > 0 ? Math.round((present / total) * 100) : 0;
        for (const k of Object.keys(subjectMap)) {
          const s = subjectMap[k];
          attendanceSummary.details[k] = { total: s.total, present: s.present, percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0 };
        }
        console.log(`✅ Attendance calculated: ${attendanceSummary.overall}%`);
      }
    } catch (attErr) {
      console.error('⚠️  Attendance aggregation error:', attErr.message);
    }

    // Academics: attempt to compute overall percentage from ExamResult if available
    // Academics: attempt to compute overall percentage from ExamResult (Mongo or File)
    let academicsSummary = { overallPercentage: null, details: {}, totalExamsTaken: 0 };
    try {
      const examResults = await ExamResult.find({ studentId: { $in: [student._id, student.sid, id] } }).lean();
      const studentResults = Array.isArray(examResults) ? examResults : [];
      if (studentResults.length > 0) {
        academicsSummary.totalExamsTaken = studentResults.length;

        let totalPctAccumulator = 0;
        const subjectStats = {};

        studentResults.forEach(er => {
          const pct = (er.score / (er.totalMarks || 100)) * 100;
          totalPctAccumulator += pct;

          const subj = er.subject || er.examTitle || 'General';
          if (!subjectStats[subj]) {
            subjectStats[subj] = { totalPct: 0, count: 0 };
          }
          subjectStats[subj].totalPct += pct;
          subjectStats[subj].count += 1;
        });

        academicsSummary.overallPercentage = Math.round(totalPctAccumulator / studentResults.length);
        Object.keys(subjectStats).forEach(s => {
          academicsSummary.details[s] = {
            percentage: Math.round(subjectStats[s].totalPct / subjectStats[s].count),
            average: Math.round(subjectStats[s].totalPct / subjectStats[s].count)
          };
        });
        console.log(`✅ Marks calculated: ${academicsSummary.overallPercentage}%`);
      }
    } catch (examErr) {
      console.error('⚠️  Exam computation skipped:', examErr.message);
    }

    // Activity: derive from student.stats when available, default to zeroes
    const activity = {
      streak: student.stats?.streak || 0,
      aiUsage: student.stats?.aiUsageCount || 0,
      advancedLearning: student.stats?.advancedProgress || 0
    };

    // 4. Fetch My Faculty (Hybrid)
    let myFaculty = [];
    try {
      // Logic: Find faculty whose 'assignments' match student's year, section, and branch
      let allFaculty = [];
      try {
        const Faculty = require('../models/Faculty');
        allFaculty = await Faculty.find().lean();
      } catch (mongoErr) {
        console.error('Faculty lookup failed:', mongoErr);
      }

      // Filter
      const studentYear = String(student.year);
      const studentSection = String(student.section).toUpperCase(); // Normalize

      myFaculty = allFaculty.filter(f => {
        if (!f.assignments || !Array.isArray(f.assignments)) return false;
        return f.assignments.some(a =>
          String(a.year) === studentYear &&
          String(a.section).toUpperCase() === studentSection
        );
      }).map(f => {
        // Find the specific subject they teach this student
        const assignment = f.assignments.find(a => String(a.year) === studentYear && String(a.section).toUpperCase() === studentSection);
        return {
          name: f.name,
          id: f.facultyId,
          email: f.email,
          phone: f.phone || 'N/A', // Assuming phone field might exist
          subject: assignment ? assignment.subject : 'Unknown',
          image: f.image || null // Placeholder if not real image
        };
      });

    } catch (facErr) {
      console.error("Error fetching faculty for student:", facErr);
    }

    console.log('✅ Student overview data compiled successfully');

    // Return overview with computed or null/default values
    res.json({
      student: {
        name: student.studentName,
        sid: student.sid,
        branch: student.branch,
        year: student.year,
        section: student.section,
        profilePic: student.profileImage || student.profilePic || student.avatar,
        stats: student.stats || {}
      },
      semesterProgress: 72,
      attendance: attendanceSummary,
      academics: academicsSummary,
      activity,
      myFaculty // New Field
    });

  } catch (error) {
    console.error('❌ Overview error:', error);
    console.error('   Error details:', error.message);
    console.error('   Stack:', error.stack);

    // Return error instead of demo data
    res.status(500).json({
      error: 'Failed to fetch student overview',
      details: error.message
    });
  }
};
