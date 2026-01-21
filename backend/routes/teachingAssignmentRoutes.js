const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createOrUpdateAssignment,
  getFacultyAssignments,
  getAssignmentsByYearAndSection,
  getStudentsInAssignment
} = require('../controllers/teachingAssignmentController');

// Admin routes
router.route('/')
  .post(protect, admin, createOrUpdateAssignment);

router.route('/faculty/:facultyId')
  .get(protect, getFacultyAssignments);

router.route('/year/:year/section/:section')
  .get(protect, getAssignmentsByYearAndSection);

router.route('/:assignmentId/students')
  .get(protect, getStudentsInAssignment);

module.exports = router;
