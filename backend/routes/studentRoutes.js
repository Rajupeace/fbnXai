const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Material = require('../models/Material');
const Course = require('../models/Course');
const { getStudentOverview } = require('../controllers/studentController');

// NEW: Student Overview (Mega Stats)
router.get('/:id/overview', getStudentOverview);

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
    if (!course) {
      return res.status(404).json({ error: 'Course not found or access denied' });
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

module.exports = router;
