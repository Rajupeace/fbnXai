const Material = require('../models/Material');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
exports.getMaterials = async (req, res) => {
  try {
    const { year, section, subject, type, course } = req.query;

    // Build query object
    const query = {};
    if (year) query.year = year;
    if (section) query.section = section;
    if (subject) query.subject = subject;
    if (type) query.type = type;
    if (course) query.course = course;

    const materials = await Material.find(query)
      .populate('course', 'courseCode courseName')
      .populate('uploadedBy', 'name email')
      .sort('-createdAt');

    // Transform to match frontend expectations
    const transformedMaterials = materials.map(material => ({
      id: material._id,
      title: material.title,
      description: material.description,
      url: material.fileUrl,
      type: material.type,
      subject: material.subject,
      year: material.year,
      section: material.section,
      module: material.module,
      unit: material.unit,
      topic: material.topic,
      uploadedAt: material.createdAt,
      uploaderName: material.uploadedBy?.name || 'Unknown',
      uploaderRole: material.uploadedBy?.facultyId === 'admin' ? 'admin' : 'faculty'
    }));

    res.json(transformedMaterials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single material
// @route   GET /api/materials/:id
// @access  Private
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('course', 'courseCode courseName')
      .populate('uploadedBy', 'name email');

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Upload material
// @route   POST /api/materials
// @access  Private/Faculty
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, description, courseId, year, section, subject, type, module, unit, topic } = req.body;

    // DEBUG: Log received fields
    console.log('[MaterialController] Upload Request:', {
      file: req.file ? 'Present' : 'Missing',
      url: req.body.url,
      link: req.body.link,
      fileUrl: req.body.fileUrl,
      bodykeys: Object.keys(req.body)
    });

    const providedUrl = req.body.url || req.body.link || req.body.fileUrl;

    // Require either a file upload or a URL/link
    if (!req.file && !providedUrl) {
      console.log('[MaterialController] Validation Failed: No File or URL provided.');
      return res.status(400).json({ message: 'Please upload a file or provide a URL' });
    }

    // Check if course exists (Optional)
    let course = null;
    if (courseId) {
      course = await Course.findById(courseId);
    }
    // If no courseId sent, we proceed without linking to a formal Course object, using just subject string.

    let uploaderId = null;

    if (req.user.role === 'admin') {
      // Proceed as admin
      let adminFaculty = await Faculty.findOne({ facultyId: 'admin' });
      if (!adminFaculty) {
        try {
          adminFaculty = await Faculty.create({
            facultyId: 'admin',
            name: 'Administrator',
            email: 'admin@system.local',
            password: 'admin_managed_externally',
            department: 'Administration',
            designation: 'System Administrator',
            assignments: []
          });
        } catch (e) { console.error("Failed to create Admin faculty record", e); }
      }
      uploaderId = adminFaculty ? adminFaculty._id : null;

    } else {
      // Find faculty by facultyId, or create if not exists
      let faculty = await Faculty.findOne({ facultyId: req.user.id });
      if (!faculty) {
        console.log(`[Upload] Faculty ${req.user.id} not found in MongoDB. Creating shadow record...`);
        try {
          faculty = await Faculty.create({
            facultyId: req.user.id,
            name: req.user.name || 'Unknown Faculty',
            email: req.user.email || `${req.user.id}@example.com`,
            password: 'manage_externally',
            department: req.user.department || 'General',
            designation: req.user.designation || 'Lecturer',
            assignments: []
          });
        } catch (err) {
          console.error('Error creating shadow faculty:', err);
          return res.status(500).json({ message: 'Failed to create faculty record for upload linking.' });
        }
      }
      uploaderId = faculty._id;
    }

    // Create new material with role-based path
    const roleFolder = req.user.role === 'admin' ? 'admin' : 'faculty';
    let fileUrl;
    let fileType;
    let fileSize;

    if (req.file) {
      // Since we are using uploadLocal which stores in root uploads/
      // we should not append roleFolder to URL unless we change uploadLocal.
      // For now, index.js serves /uploads maps to backend/uploads.
      fileUrl = `/uploads/${req.file.filename}`;
      fileType = req.file.mimetype;
      fileSize = req.file.size;
    } else {
      fileUrl = providedUrl;
      fileType = req.body.type || 'link';
      fileSize = Number(req.body.fileSize) || 0;
    }

    const material = new Material({
      title,
      description,
      fileUrl,
      fileType,
      fileSize,
      course: course ? courseId : undefined,
      uploadedBy: uploaderId,
      year,
      section,
      subject,
      type,
      module,
      unit,
      topic
    });

    await material.save();

    // Populate the response
    await material.populate('course', 'courseCode courseName');
    await material.populate('uploadedBy', 'name email');

    // AUTO-NOTIFICATION: Create a message for students
    try {
      const Message = require('../models/Message');
      const notificationText = `New ${type} added: "${title}" in ${subject} (Year ${year})`;

      // Safely check if we can create a notification (MongoDB only here, JSON handled in index.js)
      if (mongoose.connection.readyState === 1) {
        await Message.create({
          message: notificationText,
          target: 'students-specific',
          targetYear: year,
          targetSections: section ? [section] : [],
          type: 'material-alert',
          sender: faculty.name || `Prof. ${faculty.facultyId}`,
          facultyId: faculty.facultyId,
          createdAt: new Date()
        });
        console.log('[Notification] Logic Dispatched to MongoDB Mesh');
      }
    } catch (e) {
      console.warn('Pedagogical Notification Deferred:', e.message);
    }

    res.status(201).json(material);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private/Faculty
exports.updateMaterial = async (req, res) => {
  try {
    const { title, description, year, section, subject, type } = req.body;

    let material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check if the user is the uploader or an admin
    console.log('[Update] Check:', {
      materialUploader: material.uploadedBy.toString(),
      requestUserId: req.user._id ? req.user._id.toString() : 'missing',
      role: req.user.role
    });

    const isUploader = req.user._id && material.uploadedBy.toString() === req.user._id.toString();
    if (!isUploader && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this material' });
    }

    // Update fields
    if (title) material.title = title;
    if (description) material.description = description;
    if (year) material.year = year;
    if (section) material.section = section;
    if (subject) material.subject = subject;
    if (type) material.type = type;

    // Handle file update if new file is uploaded
    if (req.file) {
      // Delete old file if it exists
      if (material.fileUrl && material.fileUrl.startsWith('/uploads')) {
        try {
          const fs = require('fs');
          const path = require('path');
          const uploadsDir = path.join(__dirname, '..', 'uploads');
          const oldFilePath = path.join(uploadsDir, material.fileUrl.replace('/uploads/', ''));
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log(`[Update] Deleted old file: ${oldFilePath}`);
          }
        } catch (err) {
          console.error('[Update] Failed to delete old file:', err.message);
        }
      }

      material.fileUrl = `/uploads/${req.file.filename}`;
      material.fileType = req.file.mimetype;
      material.fileSize = req.file.size;
    } else if (req.body.url || req.body.link) {
      material.fileUrl = req.body.url || req.body.link;
      material.fileType = req.body.type || 'link';
      material.fileSize = Number(req.body.fileSize) || 0;
    }

    await material.save();

    // Populate the response
    await material.populate('course', 'courseCode courseName');
    await material.populate('uploadedBy', 'name email');

    res.json(material);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private/Faculty & Admin
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check if the user is the uploader or an admin
    console.log('[Delete] Check:', {
      materialUploader: material.uploadedBy.toString(),
      requestUserId: req.user._id ? req.user._id.toString() : 'missing',
      role: req.user.role
    });

    const isUploader = req.user._id && material.uploadedBy.toString() === req.user._id.toString();
    if (!isUploader && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this material' });
    }

    // Delete the file from physical storage
    if (material.fileUrl && material.fileUrl.startsWith('/uploads')) {
      try {
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        // Get relative path by removing /uploads/ prefix
        const relativePath = material.fileUrl.replace('/uploads/', '');
        const filePath = path.join(uploadsDir, relativePath);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`[Delete] Physically removed file: ${filePath}`);
        } else {
          console.warn(`[Delete] File not found on disk: ${filePath}`);
        }
      } catch (err) {
        console.error(`[Delete] File removal error: ${err.message}`);
      }
    }

    await material.deleteOne();

    res.json({ message: 'Material removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};
