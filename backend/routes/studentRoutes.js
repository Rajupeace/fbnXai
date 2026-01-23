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
router.get('/', async (req, res) => {
  try {
    let allStudents = [];

    // 1. Try MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        const Student = require('../models/Student');
        const mongoStudents = await Student.find({}).lean();
        allStudents = mongoStudents.map(s => ({
          ...s,
          id: s.sid, // Ensure ID is mapped correctly for frontend
          _id: s._id.toString(),
          source: 'mongodb'
        }));
      } catch (mongoErr) {
        console.warn('Mongo fetch error in GET /api/students:', mongoErr.message);
      }
    }

    // 2. Get from File DB (Fallback & Merge)
    try {
      const fileStudents = dbFile('students').read() || [];
      // Merge: Add if not present in Mongo results (by sid)
      fileStudents.forEach(fs => {
        if (!allStudents.find(ms => ms.sid === fs.sid)) {
          allStudents.push({ ...fs, source: 'file' });
        }
      });
    } catch (fileErr) {
      console.warn('File fetch error in GET /api/students:', fileErr.message);
    }

    // If both failed (empty array), and we had file error, re-read raw just in case
    if (allStudents.length === 0) {
      // Optional: last ditch effort or just return empty
    }

    res.json(allStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students', details: error.message });
  }
});

// Get courses for a specific student
router.get('/:studentId/courses', (req, res) => {
  try {
    const { studentId } = req.params;
    (async () => {
      // Try MongoDB first for authoritative student + course data
      if (mongoose.connection.readyState === 1) {
        try {
          const Student = require('../models/Student');
          const Course = require('../models/Course');

          const student = await Student.findOne({
            $or: [
              { sid: String(studentId) },
              { _id: mongoose.Types.ObjectId.isValid(studentId) ? new mongoose.Types.ObjectId(studentId) : null }
            ].filter(condition => condition !== null)
          }).lean();
          console.log('Looking for studentId:', studentId);
          console.log('Found student:', student);
          if (!student) return res.status(404).json({ error: 'Student not found' });

          const query = { year: String(student.year) };
          // Don't filter by branch initially to see all courses, then filter manually

          console.log('Student query:', query);
          const mongoCourses = await Course.find(query).lean();
          console.log('Found courses:', mongoCourses.length);

          // Filter courses based on student's year, branch, and section
          const studentCourses = mongoCourses.filter(course => {
            console.log('Checking course:', course.courseCode, 'branch:', course.branch, 'year:', course.year);

            // Check year match
            if (course.year && String(course.year) !== String(student.year)) {
              console.log('Filtered out - year mismatch');
              return false;
            }

            // Check branch match - include if course branch matches student branch or is 'All'
            // Handle variations like 'CSE' vs 'Computer Science Engineering'
            const studentBranch = student.branch.toLowerCase();
            const courseBranch = course.branch ? course.branch.toLowerCase() : '';
            const branchMatches = courseBranch === 'all' ||
              courseBranch === studentBranch ||
              courseBranch.includes(studentBranch) ||
              studentBranch.includes(courseBranch);

            if (!branchMatches) {
              console.log('Filtered out - branch mismatch:', studentBranch, 'vs', courseBranch);
              return false;
            }

            // Include course if student is explicitly enrolled OR if it matches their year/branch
            if (course.students && Array.isArray(course.students)) {
              const isEnrolled = course.students.some(studentId =>
                String(studentId) === String(student._id) || String(studentId) === String(student.sid)
              );
              console.log('Student enrolled:', isEnrolled);
              return isEnrolled;
            }

            // If no explicit enrollment, include if year and branch match
            console.log('Including course - year/branch match');
            return true;
          }).map(c => ({ ...c, id: c._id || c.courseCode }));

          console.log('Final student courses:', studentCourses.length);

          return res.json(studentCourses);
        } catch (mongoErr) {
          console.warn('Mongo error in GET /:studentId/courses, falling back to file:', mongoErr.message);
          // fall through to file-based below
        }
      }

      // File-based fallback (legacy)
      const students = dbFile('students').read();
      const student = students.find(s => s.sid === studentId || s.id === studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const courses = dbFile('courses').read() || [];
      const studentCourses = courses.filter(course => {
        const studentBranch = String(student.branch || '').toLowerCase();
        const courseBranch = String(course.branch || 'All').toLowerCase();
        const branchMatches = courseBranch === 'all' ||
          courseBranch === studentBranch ||
          courseBranch.includes(studentBranch) ||
          studentBranch.includes(courseBranch);

        const yearMatches = String(course.year) === String(student.year);

        const sectionMatches = !course.sections ||
          course.sections.length === 0 ||
          (Array.isArray(course.sections) && course.sections.includes(student.section)) ||
          course.sections === student.section ||
          course.sections === 'All';

        return yearMatches && branchMatches && sectionMatches;
      });

      res.json(studentCourses);
    })();
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
      const students = dbFile('students').read();
      student = students.find(s => s.sid === studentId || s.id === studentId);
    }
    if (!student) return res.status(404).json({ error: 'Student not found' });

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
    res.status(500).json({ error: 'Failed to fetch course details', details: error.message });
  }
});

module.exports = router;
