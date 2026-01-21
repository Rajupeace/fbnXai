const TeachingAssignment = require('../models/TeachingAssignment');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Student = require('../models/Student');

// @desc    Create or update teaching assignment
// @route   POST /api/teaching-assignments
// @access  Private/Admin
exports.createOrUpdateAssignment = async (req, res) => {
  try {
    const { facultyId, courseId, year, sections, subject, academicYear } = req.body;

    // Validate input
    if (!facultyId || !courseId || !year || !sections || !sections.length || !subject || !academicYear) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if faculty and course exist
    const [faculty, course] = await Promise.all([
      Faculty.findById(facultyId),
      Course.findById(courseId)
    ]);

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check for existing assignment
    let assignment = await TeachingAssignment.findOne({
      faculty: facultyId,
      course: courseId,
      year,
      subject,
      academicYear
    });

    if (assignment) {
      // Update existing assignment
      assignment.sections = [...new Set([...assignment.sections, ...sections])];
    } else {
      // Create new assignment
      assignment = new TeachingAssignment({
        faculty: facultyId,
        course: courseId,
        year,
        sections: [...new Set(sections)],
        subject,
        academicYear
      });
    }

    await assignment.save();

    // Add assignment to faculty if not already present
    if (!faculty.teachingAssignments) {
      faculty.teachingAssignments = [];
    }
    
    if (!faculty.teachingAssignments.includes(assignment._id)) {
      faculty.teachingAssignments.push(assignment._id);
      await faculty.save();
    }

    // Populate the response
    await assignment.populate('faculty', 'name email');
    await assignment.populate('course', 'courseCode courseName');

    res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get faculty teaching assignments
// @route   GET /api/teaching-assignments/faculty/:facultyId
// @access  Private
exports.getFacultyAssignments = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const assignments = await TeachingAssignment.find({ faculty: facultyId })
      .populate('course', 'courseCode courseName')
      .sort({ academicYear: -1, year: 1, subject: 1 });

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get assignments by year and section
// @route   GET /api/teaching-assignments/year/:year/section/:section
// @access  Private
exports.getAssignmentsByYearAndSection = async (req, res) => {
  try {
    const { year, section } = req.params;

    const assignments = await TeachingAssignment.find({
      year,
      sections: section
    })
    .populate('faculty', 'name email')
    .populate('course', 'courseCode courseName')
    .sort({ subject: 1 });

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get students in a specific assignment
// @route   GET /api/teaching-assignments/:assignmentId/students
// @access  Private
exports.getStudentsInAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await TeachingAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const students = await Student.find({
      year: assignment.year,
      section: { $in: assignment.sections }
    }).select('-password');

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
