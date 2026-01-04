const Faculty = require('../models/Faculty');

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private/Admin
exports.getFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find().select('-password');
    res.json(faculty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
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

    // Validate required fields
    if (!facultyId || !name || !password || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Faculty ID, Name, Password, Department, and Designation'
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
      email: email?.toLowerCase()?.trim(),
      password, // In production, make sure to hash the password before saving
      department: department.trim(),
      designation: designation.trim(),
      assignments: validatedAssignments
    });

    await faculty.save();

    // Remove password from the response
    const facultyObj = faculty.toObject();
    delete facultyObj.password;

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: facultyObj
    });

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

    // Build faculty object
    const facultyFields = {};
    if (name) facultyFields.name = name;
    if (email) facultyFields.email = email;
    if (department) facultyFields.department = department;
    if (designation) facultyFields.designation = designation;
    if (phone) facultyFields.phone = phone;
    if (address) facultyFields.address = address;
    if (typeof isAdmin !== 'undefined') facultyFields.isAdmin = isAdmin;

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

    await faculty.remove();

    res.json({ message: 'Faculty removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};
