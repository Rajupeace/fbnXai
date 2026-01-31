const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');
const Mark = require('../models/Mark');
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
            attendanceSummary.details[k] = {
              total: s.total,
              present: s.present,
              totalClasses: s.total,
              totalPresent: s.present,
              percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
            };
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
          attendanceSummary.details[k] = {
            total: s.total,
            present: s.present,
            totalClasses: s.total,
            totalPresent: s.present,
            percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
          };
        }
        console.log(`✅ Attendance calculated: ${attendanceSummary.overall}%`);
      }
    } catch (attErr) {
      console.error('⚠️  Attendance aggregation error:', attErr.message);
    }

    // Academics: attempt to compute overall percentage from ExamResult if available
    let academicsSummary = { overallPercentage: 0, details: {}, totalExamsTaken: 0 };
    try {
      // 1. Fetch Marks from Marks Collection (Faculty Entries)
      const allMarks = await Mark.find({ studentId: id }).lean();

      // 2. Fetch ExamResults (Admin/Legacy)
      const examResults = await ExamResult.find({
        $or: [
          { studentId: id },
          { studentId: student._id }
        ]
      }).lean();

      const subjects = {};
      let totalExams = 0;

      // Process Marks
      if (allMarks && allMarks.length > 0) {
        allMarks.forEach(m => {
          const s = m.subject || 'General';
          if (!subjects[s]) subjects[s] = { obtained: 0, max: 0, count: 0 };
          subjects[s].obtained += m.marks;
          subjects[s].max += (m.maxMarks || 100);
          subjects[s].count += 1;
          totalExams++;
        });
      }

      // Process ExamResults
      if (examResults && examResults.length > 0) {
        examResults.forEach(er => {
          const s = er.subject || er.examTitle || 'General';
          if (!subjects[s]) subjects[s] = { obtained: 0, max: 0, count: 0 };
          subjects[s].obtained += (er.score || er.marks || 0);
          subjects[s].max += (er.totalMarks || 100);
          subjects[s].count += 1;
          totalExams++;
        });
      }

      if (totalExams > 0) {
        let totalPctSum = 0;
        let subjectCount = 0;

        Object.keys(subjects).forEach(subj => {
          const { obtained, max } = subjects[subj];
          const pct = max > 0 ? Math.round((obtained / max) * 100) : 0;
          academicsSummary.details[subj] = {
            percentage: pct,
            obtained,
            max,
            exams: subjects[subj].count
          };
          totalPctSum += pct;
          subjectCount++;
        });

        academicsSummary.overallPercentage = subjectCount > 0 ? Math.round(totalPctSum / subjectCount) : 0;
        academicsSummary.totalExamsTaken = totalExams;
      }
    } catch (examErr) {
      console.error('⚠️  Academics computation error:', examErr.message);
    }

    // 3. Activity Tracking (Dynamic)
    let aiUsageCount = student.stats?.aiUsageCount || 0;
    try {
      const Chat = require('../models/Chat');
      const chatCount = await Chat.countDocuments({ userId: id });
      aiUsageCount = Math.max(aiUsageCount, chatCount);
    } catch (cErr) { /* ignore */ }

    // Growth calculation (Dynamic if 0)
    let growth = student.stats?.advancedProgress || 0;
    if (growth === 0) {
      // Mocking growth based on roadmaps and marks
      const roadmapsCount = Object.keys(student.roadmapProgress || {}).length;
      growth = Math.min(100, (roadmapsCount * 15) + Math.floor((academicsSummary.overallPercentage || 0) / 10));
    }

    const activity = {
      streak: student.stats?.streak || 0,
      aiUsage: aiUsageCount,
      advancedLearning: growth,
      careerReadyScore: student.stats?.careerReadyScore || 75,
      weeklyActivity: student.stats?.weeklyActivity || [
        { day: 'Mon', hours: 2 }, { day: 'Tue', hours: 4 }, { day: 'Wed', hours: 3 },
        { day: 'Thu', hours: 5 }, { day: 'Fri', hours: 2 }, { day: 'Sat', hours: 6 }, { day: 'Sun', hours: 1 }
      ]
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
        stats: student.stats || {},
        roadmapProgress: student.roadmapProgress || {}
      },
      semesterProgress: 72,
      attendance: attendanceSummary,
      academics: academicsSummary,
      roadmapProgress: student.roadmapProgress || {}, // Also at top level for convenience
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
