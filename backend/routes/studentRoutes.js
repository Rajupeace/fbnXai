const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Material = require('../models/Material');
const Course = require('../models/Course');
const { getStudentOverview } = require('../controllers/studentController');

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
    // courseMaterials already populated from MongoDB above

    res.json({
      ...course,
      materials: courseMaterials
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ error: 'Failed to fetch course details', details: error.message });
  }
});

// POST /api/students/:id/roadmap-progress
// Updates the progress for a specific roadmap
router.post('/:id/roadmap-progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { roadmapSlug, completedTopics } = req.body; // Expects array of strings
    const Student = require('../models/Student');

    // Mongoose Map update syntax: `roadmapProgress.${roadmapSlug}`
    const update = {};
    update[`roadmapProgress.${roadmapSlug}`] = completedTopics;

    const student = await Student.findOneAndUpdate(
      { sid: id },
      { $set: update },
      { new: true, upsert: true }
    );

    if (!student) return res.status(404).json({ error: 'Student not found' });

    console.log(`✅ Saved roadmap progress for ${id}: ${roadmapSlug} -> ${completedTopics.length} topics`);
    res.json({ success: true, progress: student.roadmapProgress });
  } catch (err) {
    console.error('Error saving roadmap progress:', err);
    res.status(500).json({ error: 'Failed to save progress' });
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
      // Also update avatar field if it's a dicebear URL (optional, but good for consistency)
      if (typeof updates.profilePic === 'string' && updates.profilePic.includes('dicebear')) {
        // Extract seed if possible or just save url
        updates.avatar = updates.profilePic;
      }
    }

    // Ensure we don't accidentally overwrite critical fields with nulls if not sent
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
// Simple password change (Plaintext as per existing pattern, should be hashed in prod)
router.put('/change-password/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const { currentPassword, newPassword } = req.body;
    const Student = require('../models/Student');

    const student = await Student.findOne({ sid });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // In a real app, compare hashes. Here we assume plaintext based on provided context.
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

module.exports = router;
