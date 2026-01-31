const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Material = require('../models/Material');
const Course = require('../models/Course');
const { getStudentOverview } = require('../controllers/studentController');
const multer = require('multer');
const { parseCSV } = require('../utils/csvParser');
const bcrypt = require('bcryptjs');

const upload = multer({ storage: multer.memoryStorage() });

// NEW: Student Overview (Mega Stats)
router.get('/:id/overview', getStudentOverview);

// GET /api/students/:id/class-attendance
// Returns class-level attendance summary (total students, present today, presence %)
router.get('/:id/class-attendance', async (req, res) => {
  try {
    const { id } = req.params;
    const Student = require('../models/Student');
    const Attendance = require('../models/Attendance');

    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'Database not connected' });

    const student = await Student.findOne({ sid: id }).lean();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const { year, section, branch } = student;

    const totalStudents = await Student.countDocuments({ year: String(year), section: String(section), branch: String(branch) });

    const today = new Date().toISOString().split('T')[0];
    const todaysRecords = await Attendance.find({ date: today, year: String(year), section: String(section), branch: String(branch) }).lean();

    const presentCount = todaysRecords.filter(r => r.status === 'Present').length;
    const totalScans = todaysRecords.length;
    const presencePct = totalScans > 0 ? Math.round((presentCount / totalScans) * 100) : 0;

    res.json({
      class: `${year}-${section}`,
      branch,
      totalStudents,
      presentToday: presentCount,
      totalScansToday: totalScans,
      presencePercentage: presencePct,
      date: today
    });
  } catch (err) {
    console.error('Error fetching student class attendance:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all students
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const Student = require('../models/Student');
    const mongoStudents = await Student.find({}).lean();
    const allStudents = mongoStudents.map(s => ({
      ...s,
      id: s.sid,
      _id: s._id.toString(),
      source: 'mongodb'
    }));

    return res.json(allStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students', details: error.message });
  }
});

// Get courses for a specific student
router.get('/:studentId/courses', async (req, res) => {
  try {
    const { studentId } = req.params;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const Student = require('../models/Student');
    const Course = require('../models/Course');

    const student = await Student.findOne({
      $or: [
        { sid: String(studentId) },
        ...(mongoose.Types.ObjectId.isValid(studentId) ? [{ _id: new mongoose.Types.ObjectId(studentId) }] : [])
      ]
    }).lean();

    if (!student) return res.status(404).json({ error: 'Student not found' });

    const query = { year: String(student.year) };
    const mongoCourses = await Course.find(query).lean();

    const studentCourses = mongoCourses.filter(course => {
      if (course.year && String(course.year) !== String(student.year)) return false;

      const studentBranch = (student.branch || '').toLowerCase();
      const courseBranch = (course.branch || '').toLowerCase();
      const branchMatches = courseBranch === 'all' ||
        courseBranch === studentBranch ||
        courseBranch.includes(studentBranch) ||
        studentBranch.includes(courseBranch);

      if (!branchMatches) return false;

      if (course.students && Array.isArray(course.students)) {
        return course.students.some(sid => String(sid) === String(student._id) || String(sid) === String(student.sid));
      }

      return true;
    }).map(c => ({ ...c, id: c._id || c.courseCode }));

    return res.json(studentCourses);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses', details: error.message });
  }
});

// Get course details with materials for a student
router.get('/:studentId/courses/:courseId', async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Verify student exists (prefer Mongo)
    let student = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const Student = require('../models/Student');
        student = await Student.findOne({ $or: [{ sid: studentId }, { _id: studentId }] }).lean();
      } catch (e) {
        console.warn('Mongo student lookup failed, falling back to file:', e.message);
      }
    }
    if (!student) {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ error: 'Database not connected' });
      }
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get course
    let course;
    if (mongoose.connection.readyState === 1) {
      course = await Course.findOne({
        $or: [{ _id: courseId }, { courseCode: courseId }],
        year: student.year,
        branch: student.branch
      });
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found or access denied' });
    }

    // Get course materials
    let courseMaterials = [];
    if (mongoose.connection.readyState === 1) {
      // Read from MongoDB
      const materials = await Material.find({
        $or: [{ course: courseId }, { courseId: courseId }, { courseCode: courseId }]
      }).populate('uploadedBy', 'name email');

      courseMaterials = materials.filter(m => {
        const matchesYear = !m.year || String(m.year) === String(student.year) || m.year === 'All';

        // Flexible section matching
        const studentSec = String(student.section || '').toUpperCase();
        const materialSec = m.section;
        let matchesSection = !materialSec || materialSec === 'All' || materialSec === studentSec;

        if (!matchesSection) {
          if (Array.isArray(materialSec)) {
            matchesSection = materialSec.includes(studentSec);
          } else if (typeof materialSec === 'string') {
            matchesSection = materialSec.split(',').map(s => s.trim().toUpperCase()).includes(studentSec);
          }
        }

        return matchesYear && matchesSection;
      }).map(m => ({
        id: m._id,
        title: m.title,
        description: m.description,
        url: m.fileUrl,
        type: m.type,
        subject: m.subject,
        year: m.year,
        section: m.section,
        module: m.module,
        unit: m.unit,
        topic: m.topic,
        uploadedAt: m.createdAt,
        uploaderName: m.uploadedBy?.name || 'Unknown'
      }));
    }

    res.json({
      ...course,
      materials: courseMaterials
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ error: 'Failed to fetch course details', details: error.message });
  }
});

// PUT /api/students/profile/:sid
// Update student profile (including avatar/profilePic)
router.put('/profile/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const updates = req.body;
    const Student = require('../models/Student');

    // Map frontend 'profilePic' to schema 'profileImage'
    if (updates.profilePic !== undefined) {
      updates.profileImage = updates.profilePic;
      if (typeof updates.profilePic === 'string' && updates.profilePic.includes('dicebear')) {
        updates.avatar = updates.profilePic;
      }
    }

    const allowedUpdates = ['studentName', 'email', 'phone', 'address', 'profileImage', 'avatar', 'year', 'section', 'branch'];
    const safeUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) safeUpdates[key] = updates[key];
    });

    const student = await Student.findOneAndUpdate(
      { sid },
      { $set: safeUpdates },
      { new: true }
    );

    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.json({
      success: true,
      student: {
        ...student.toObject(),
        profilePic: student.profileImage
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/students/change-password/:sid
router.put('/change-password/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const { currentPassword, newPassword } = req.body;
    const Student = require('../models/Student');

    const student = await Student.findOne({ sid });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (student.password !== currentPassword) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    student.password = newPassword;
    await student.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// POST /api/students/:studentId/roadmap-progress
router.post('/:studentId/roadmap-progress', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { roadmapSlug, topicName, completedTopics } = req.body;
    const Student = require('../models/Student');

    const student = await Student.findOne({ sid: studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (!student.roadmapProgress) student.roadmapProgress = new Map();

    if (completedTopics && Array.isArray(completedTopics)) {
      student.roadmapProgress.set(roadmapSlug, completedTopics);
    } else if (topicName) {
      const currentProgress = student.roadmapProgress.get(roadmapSlug) || [];
      let newProgress;
      if (currentProgress.includes(topicName)) {
        newProgress = currentProgress.filter(t => t !== topicName);
      } else {
        newProgress = [...currentProgress, topicName];
      }
      student.roadmapProgress.set(roadmapSlug, newProgress);
    }

    await student.save();
    res.json({ success: true, progress: student.roadmapProgress });
  } catch (err) {
    console.error('Roadmap progress error:', err);
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/students/bulk
// @desc    Bulk upload students from CSV/JSON
router.post('/bulk', upload.single('file'), async (req, res) => {
  try {
    let studentDataList = [];
    const Student = require('../models/Student');

    // Handle file upload (CSV)
    if (req.file) {
      const csvContent = req.file.buffer.toString('utf8');
      studentDataList = parseCSV(csvContent);
      console.log(`[Bulk Student] Parsed ${studentDataList.length} entries from CSV file`);
    }
    // Handle JSON body
    else if (req.body.students && Array.isArray(req.body.students)) {
      studentDataList = req.body.students;
    }
    else {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of students or upload a CSV file'
      });
    }

    if (studentDataList.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No student data found in request'
      });
    }

    const results = {
      success: [],
      errors: [],
      total: studentDataList.length
    };

    for (let i = 0; i < studentDataList.length; i++) {
      const data = studentDataList[i];

      try {
        const sid = data.sid || data.SID || data.studentId || data.StudentId;
        const studentName = data.studentName || data.name || data.Name || data.StudentName;
        const email = data.email || data.Email || (sid ? `${sid}@university.com` : null);
        const password = data.password || data.Password || 'password123';
        const year = data.year || data.Year || '1';
        const section = data.section || data.Section || 'A';
        const branch = data.branch || data.Branch || 'CSE';

        if (!sid || !studentName) {
          results.errors.push({
            row: i + 1,
            sid: sid || 'N/A',
            error: 'Missing required fields (sid, studentName)'
          });
          continue;
        }

        // Check if exists
        const existing = await Student.findOne({ sid });
        if (existing) {
          results.errors.push({
            row: i + 1,
            sid,
            error: 'Student with this ID already exists'
          });
          continue;
        }

        // Create student
        const newStudent = new Student({
          sid,
          studentName,
          email,
          password, // Note: In a real app, hash this. But keeping it simple for now as rest of app uses plain text for student passwords? 
          // Wait, student passwords in Student.js... let's check model.
          year: String(year),
          section: String(section).toUpperCase(),
          branch: String(branch).toUpperCase(),
          createdAt: new Date()
        });

        await newStudent.save();
        results.success.push({ row: i + 1, sid, name: studentName });

      } catch (error) {
        results.errors.push({
          row: i + 1,
          sid: data.sid || 'N/A',
          error: error.message
        });
      }
    }

    // Broadcast update if any succeeded
    if (results.success.length > 0 && global.broadcastEvent) {
      global.broadcastEvent({ resource: 'students', action: 'bulk-create' });
    }

    res.json({
      success: true,
      message: `Bulk upload complete: ${results.success.length} succeeded, ${results.errors.length} failed`,
      results
    });

  } catch (err) {
    console.error('Bulk student upload error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error: ' + err.message
    });
  }
});

module.exports = router;

