const Faculty = require('../models/Faculty');
const bcrypt = require('bcryptjs');

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private/Admin
exports.getFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find().select('-password').lean();
    // Normalize possible legacy field `hpd` -> `department` for frontend compatibility
    const normalized = faculty.map(f => ({
      ...f,
      department: f.department || f.hpd || 'General'
    }));
    res.json(normalized);
  } catch (error) {
    console.error('MongoDB Faculty fetch failed, trying file DB:', error.message);
    try {
      const dbFile = require('../dbHelper');
      const facultyData = dbFile('faculty').read();
      res.json(facultyData);
    } catch (fileErr) {
      console.error('File DB failed too:', fileErr);
      res.status(500).json({ message: 'Server Error' });
    }
  }
};

// @desc    Get single faculty
// @route   GET /api/faculty/:id
// @access  Private/Admin
exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).select('-password');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(faculty);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a faculty
// @route   POST /api/faculty
// @access  Private/Admin
exports.createFaculty = async (req, res) => {
  try {
    const { facultyId, name, email, password, department, designation, assignments = [] } = req.body;
    // Support legacy/typo field `hpd` that some clients send for department
    const dept = (department && department.trim()) || (req.body.hpd && req.body.hpd.trim()) || 'General';
    const desig = (designation && designation.trim()) || 'Lecturer';

    // Validate required fields - only facultyId, name, and password are truly required
    if (!facultyId || !name || !password) {
      const missingFields = [];
      if (!facultyId) missingFields.push('Faculty ID');
      if (!name) missingFields.push('Name');
      if (!password) missingFields.push('Password');

      return res.status(400).json({
        success: false,
        message: `Please provide all required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if faculty already exists
    const existingFaculty = await Faculty.findOne({
      $or: [
        { facultyId },
        { email: email?.toLowerCase()?.trim() }
      ]
    });

    if (existingFaculty) {
      const conflictField = existingFaculty.facultyId === facultyId ? 'Faculty ID' : 'Email';
      return res.status(409).json({
        success: false,
        message: `${conflictField} already exists`
      });
    }

    // Validate assignments
    const validatedAssignments = [];
    if (Array.isArray(assignments)) {
      for (const assignment of assignments) {
        if (assignment.year && assignment.subject && assignment.section) {
          validatedAssignments.push({
            year: assignment.year.toString(),
            subject: assignment.subject.trim(),
            section: assignment.section.toString().toUpperCase().trim()
          });
        }
      }
    }

    // Create new faculty
    const faculty = new Faculty({
      facultyId: facultyId.trim(),
      name: name.trim(),
      email: email?.toLowerCase()?.trim() || `${facultyId.trim().toLowerCase()}@example.com`,
      password: await bcrypt.hash(password, 10),
      department: dept,
      designation: desig,
      assignments: validatedAssignments
    });

    await faculty.save();

    // Remove password from the response and return the created faculty object
    const facultyObj = faculty.toObject();
    delete facultyObj.password;

    res.status(201).json(facultyObj);

  } catch (error) {
    console.error('Error creating faculty:', error);

    if (error.name === 'ValidationError') {
      const messages = [];
      for (let field in error.errors) {
        messages.push(error.errors[field].message);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Faculty with this ID or email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create faculty. Please try again later.'
    });
  }
};

// @desc    Update faculty
// @route   PUT /api/faculty/:id
// @access  Private/Admin
exports.updateFaculty = async (req, res) => {
  try {

    const { name, email, department, designation, phone, address, isAdmin } = req.body;
    // Accept legacy `hpd` field as department alias
    const deptUpdate = department || req.body.hpd;

    // Build faculty object
    const facultyFields = {};
    if (name) facultyFields.name = name;
    if (email) facultyFields.email = email;
    if (deptUpdate) facultyFields.department = deptUpdate;
    if (designation) facultyFields.designation = designation;
    if (phone) facultyFields.phone = phone;
    if (address) facultyFields.address = address;
    if (typeof isAdmin !== 'undefined') facultyFields.isAdmin = isAdmin;

    // Handle Password Update (Hash it)
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      facultyFields.password = await bcrypt.hash(req.body.password, salt);
    }

    // Handle Assignments Update
    if (req.body.assignments && Array.isArray(req.body.assignments)) {
      facultyFields.assignments = req.body.assignments.map(a => ({
        year: String(a.year),
        section: String(a.section).toUpperCase().trim(),
        subject: String(a.subject).trim(),
        branch: a.branch || 'CSE',
        semester: a.semester || ''
      }));
    }

    let faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Check if email is being updated to an existing email
    if (email && email !== faculty.email) {
      const existingFaculty = await Faculty.findOne({ email });
      if (existingFaculty) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { $set: facultyFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(faculty);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete faculty
// @route   DELETE /api/faculty/:id
// @access  Private/Admin
exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    await faculty.deleteOne();

    res.json({ message: 'Faculty removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};
