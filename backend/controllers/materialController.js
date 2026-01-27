const mongoose = require('mongoose');
const Material = require('../models/Material');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
exports.getMaterials = async (req, res) => {
  try {
    const { year, section, subject, type, course, isAdvanced } = req.query;
    let allMaterials = [];

    // Require MongoDB
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    // 1. MongoDB Fetch
    if (mongoose.connection.readyState === 1) {
      try {
        // Build query object
        const query = {};
        if (year) query.year = year;
        if (section) query.section = section;
        if (subject) query.subject = subject;
        if (type) query.type = type;
        if (course) query.course = course;
        if (isAdvanced) query.isAdvanced = isAdvanced === 'true';

        const materials = await Material.find(query)
          .populate('course', 'courseCode courseName')
          .populate('uploadedBy', 'name email')
          .sort('-createdAt')
          .lean();

        allMaterials = materials.map(material => ({
          id: material._id.toString(),
          _id: material._id.toString(),
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
          uploaderRole: material.uploadedBy?.facultyId === 'admin' ? 'admin' : 'faculty',
          source: 'mongodb'
        }));
      } catch (mongoErr) {
        console.warn('Mongo Material Fetch Error:', mongoErr.message);
      }
    }

    // No file DB merge: already returned results from MongoDB

    res.json(allMaterials);
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

    // Identify Uploader
    let uploaderId = null;

    if (req.user.role === 'admin') {
      try {
        let adminFaculty = await Faculty.findOne({ facultyId: 'admin' });
        if (!adminFaculty) {
          adminFaculty = await Faculty.create({
            facultyId: 'admin',
            name: 'Administrator',
            email: 'admin@system.local',
            password: 'admin_managed_externally',
            department: 'Administration',
            designation: 'System Administrator',
            assignments: []
          });
        }
        uploaderId = adminFaculty._id;
      } catch (e) {
        console.error("Admin uploader resolution failed:", e);
        // Fallback or error? Let's try to proceed without specific uploader ID if admin
        // But schema might require it. Let's rely on the created admin.
      }
    } else {
      // For faculty
      uploaderId = req.user._id;
      // Ensure this user exists in Faculty collection (double check)
      if (!uploaderId) {
        const f = await Faculty.findOne({ facultyId: req.user.id });
        if (f) uploaderId = f._id;
      }
    }

    if (!uploaderId && req.user.role !== 'admin') {
      return res.status(500).json({ message: 'Uploader identity could not be verified.' });
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

    // No file sync: materials persist in MongoDB only

    // Populate the response
    await material.populate('course', 'courseCode courseName');
    await material.populate('uploadedBy', 'name email');

    // AUTO-NOTIFICATION: Create a message for students in MongoDB
    try {
      const Message = require('../models/Message');
      const uploaderDoc = uploaderId ? await Faculty.findById(uploaderId).lean() : null;
      const notificationText = `New ${type} added: "${title}" in ${subject} (Year ${year})`;

      if (mongoose.connection.readyState === 1) {
        await Message.create({
          message: notificationText,
          target: 'students-specific',
          targetYear: year,
          targetSections: section ? [section] : [],
          type: 'material-alert',
          sender: uploaderDoc?.name || (req.user && req.user.name) || 'System',
          senderRole: req.user?.role || 'faculty',
          facultyId: uploaderDoc?.facultyId || null,
          createdAt: new Date()
        });
        console.log('[Notification] Message created in MongoDB');
      }
    } catch (e) {
      console.warn('Pedagogical Notification Deferred:', e.message);
    }

    // Notify dashboards that materials changed
    try { global.broadcastEvent && global.broadcastEvent({ resource: 'materials', action: 'create', data: { id: material._id.toString(), title: material.title, course: material.course, year: material.year, section: material.section } }); } catch (e) {}

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
          const uploadsDir = process.platform === 'win32'
            ? 'D:\\fbn_database\\uploads'
            : path.join(__dirname, '..', 'uploads');
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

    // Notify dashboards that a material was updated
    try { global.broadcastEvent && global.broadcastEvent({ resource: 'materials', action: 'update', data: { id: material._id.toString(), title: material.title, year: material.year, section: material.section } }); } catch (e) {}

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
        const uploadsDir = process.platform === 'win32'
          ? 'D:\\fbn_database\\uploads'
          : path.join(__dirname, '..', 'uploads');
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

    // No local file sync: deletion persisted in MongoDB only

    // Notify dashboards that a material was deleted
    try { global.broadcastEvent && global.broadcastEvent({ resource: 'materials', action: 'delete', data: { id: material._id.toString() } }); } catch (e) {}

    res.json({ message: 'Material removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};
