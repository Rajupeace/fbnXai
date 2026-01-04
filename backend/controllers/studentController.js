const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');

// @desc    Get Student Mega Overview (Attendance, Marks, Stats)
// @route   GET /api/students/:id/overview
// @access  Private (Student/Faculty/Admin)
exports.getStudentOverview = async (req, res) => {
  try {
    const { id } = req.params; // studentId (sid) e.g., '123'

    // 1. Get Student Basic Data & Stats
    const student = await Student.findOne({ sid: id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // 2. Aggregate Attendance (Subject-wise & Overall)
    // We need to match records.studentId inside the array
    const attendanceData = await Attendance.aggregate([
      { $unwind: "$records" },
      { $match: { "records.studentId": id } },
      {
        $group: {
          _id: "$subject",
          totalClasses: { $sum: 1 },
          presentClasses: {
            $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] }
          }
        }
      }
    ]);

    let totalClasses = 0;
    let totalPresent = 0;
    const subjectAttendance = {};

    attendanceData.forEach(subj => {
      totalClasses += subj.totalClasses;
      totalPresent += subj.presentClasses;
      subjectAttendance[subj._id] = {
        total: subj.totalClasses,
        present: subj.presentClasses,
        percentage: subj.totalClasses > 0 ? Math.round((subj.presentClasses / subj.totalClasses) * 100) : 0
      };
    });

    const overallAttendance = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;


    // 3. Aggregate Exam Results (Subject-wise & Overall)
    // First get all results for this student
    const examResults = await ExamResult.find({ studentId: id }).populate('examId', 'subject title totalMarks');

    let totalMarksScored = 0;
    let totalMaxMarks = 0;
    const subjectMarks = {}; // { SubjectName: { scored: 0, total: 0 } }

    examResults.forEach(result => {
      if (!result.examId) return;
      const subject = result.examId.subject;
      const scored = result.score;
      const max = result.totalMarks;

      totalMarksScored += scored;
      totalMaxMarks += max;

      if (!subjectMarks[subject]) {
        subjectMarks[subject] = { scored: 0, max: 0, exams: 0 };
      }
      subjectMarks[subject].scored += scored;
      subjectMarks[subject].max += max;
      subjectMarks[subject].exams += 1;
    });

    // Convert subjectMarks to percentages
    const finalSubjectMarks = {};
    Object.keys(subjectMarks).forEach(sub => {
      const data = subjectMarks[sub];
      finalSubjectMarks[sub] = {
        percentage: data.max > 0 ? Math.round((data.scored / data.max) * 100) : 0,
        average: data.exams > 0 ? Math.round(data.scored / data.exams) : 0
      };
    });

    const overallMarksPercentage = totalMaxMarks > 0 ? Math.round((totalMarksScored / totalMaxMarks) * 100) : 0;

    // 4. Construct Response
    res.json({
      student: {
        name: student.studentName,
        sid: student.sid,
        branch: student.branch,
        year: student.year,
        section: student.section,
        stats: student.stats || {}
      },
      attendance: {
        overall: overallAttendance,
        details: subjectAttendance,
        totalClasses,
        totalPresent
      },
      academics: {
        overallPercentage: overallMarksPercentage,
        details: finalSubjectMarks,
        totalExamsTaken: examResults.length
      },
      activity: {
        streak: student.stats?.streak || 0,
        aiUsage: student.stats?.aiUsageCount || 0,
        advancedLearning: student.stats?.advancedProgress || 0
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
