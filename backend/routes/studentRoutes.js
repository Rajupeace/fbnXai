const express = require('express');
const router = express.Router();
const dbFile = require('../dbHelper');
const mongoose = require('mongoose');
const Material = require('../models/Material');
const Course = require('../models/Course');
const { getStudentOverview } = require('../controllers/studentController');

// NEW: Student Overview (Mega Stats)
router.get('/:id/overview', getStudentOverview);

// Get all students
router.get('/', (req, res) => {
  try {
    const students = dbFile('students').read();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get courses for a specific student
router.get('/:studentId/courses', (req, res) => {
  try {
    const { studentId } = req.params;
    const students = dbFile('students').read();
    const student = students.find(s => s.sid === studentId || s.id === studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const courses = dbFile('courses').read() || [];

    // Filter courses based on student's year, branch, and section
    const studentCourses = courses.filter(course => {
      return course.year === student.year &&
        course.branch === student.branch &&
        (!course.sections ||
          course.sections.length === 0 ||
          (Array.isArray(course.sections) && course.sections.includes(student.section)) ||
          course.sections === student.section);
    });

    res.json(studentCourses);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course details with materials for a student
router.get('/:studentId/courses/:courseId', async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Verify student exists
    const students = dbFile('students').read();
    const student = students.find(s => s.sid === studentId || s.id === studentId);
    if (!student) {
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
    } else {
      const courses = dbFile('courses').read() || [];
      course = courses.find(c =>
        (c.id === courseId || c.courseCode === courseId) &&
        c.year === student.year &&
        c.branch === student.branch
      );
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
        const matchesYear = !m.year || m.year == student.year;
        const matchesSection = !m.section ||
          m.section === student.section ||
          (Array.isArray(m.section) && m.section.includes(student.section));
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
    } else {
      // Read from file-based
      const materials = dbFile('materials').read() || [];
      courseMaterials = materials.filter(m => {
        const matchesCourse = m.courseId === courseId || m.courseCode === courseId;
        const matchesYear = !m.year || m.year === student.year;
        const matchesBranch = !m.branch || m.branch === student.branch;
        const matchesSection = !m.section ||
          m.section === student.section ||
          (Array.isArray(m.section) && m.section.includes(student.section));

        return matchesCourse && matchesYear && matchesBranch && matchesSection;
      });
    }

    res.json({
      ...course,
      materials: courseMaterials
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

module.exports = router;
