const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { DASHBOARD_PATHS } = require('../dashboardConfig');
const Material = require('../models/Material');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');

const uploadsDir = DASHBOARD_PATHS.uploads;

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
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
          .populate({ path: 'uploadedBy', model: 'Faculty', select: 'name email' })
          .sort('-createdAt')
          .lean();

        allMaterials = materials.map(material => ({
          id: material._id.toString(),
          _id: material._id.toString(),
          title: material.title,
          description: material.description,
          url: material.fileUrl,
          type: material.type,
          semester: material.semester,
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
      .populate({ path: 'uploadedBy', model: 'Faculty', select: 'name email' });

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
    const {
      title, description, courseId, year, section, subject, type,
      module, unit, topic, semester,
      duration, examYear, dueDate, message, link
    } = req.body;

    // DEBUG: Log received fields
    console.log('[MaterialController] Upload Request:', {
      file: req.file ? 'Present' : 'Missing',
      url: req.body.url,
      link: link || req.body.link,
      fileUrl: req.body.fileUrl,
      type
    });

    const providedUrl = req.body.url || link || req.body.link || req.body.fileUrl;

    // Require either a file upload or a URL/link
    if (!req.file && !providedUrl) {
      return res.status(400).json({ message: 'Please upload a file or provide a URL' });
    }

    // Identify Uploader
    let uploaderId = null;
    if (req.user.role === 'admin') {
      let adminFaculty = await Faculty.findOne({ facultyId: 'admin' });
      if (!adminFaculty) {
        adminFaculty = await Faculty.create({
          facultyId: 'admin',
          name: 'Administrator',
          email: 'admin@system.local',
          password: 'admin_managed_externally',
          department: 'Administration',
          designation: 'System Administrator'
        });
      }
      uploaderId = adminFaculty._id;
    } else {
      uploaderId = req.user._id;
    }

    let fileUrl;
    let fileType;
    let fileSize;
    let filename;
    let originalName;

    if (req.file) {
      // Robust Cloudinary/Local Path detection
      fileUrl = req.file.path || req.file.secure_url;

      // If not starting with http, assume local path relative to uploadsDir
      if (fileUrl && !fileUrl.startsWith('http')) {
        const relPath = path.relative(uploadsDir, fileUrl);
        fileUrl = `/uploads/${relPath}`.replace(/\\/g, '/');
      }

      fileType = req.file.mimetype;
      fileSize = req.file.size;
      filename = req.file.filename;
      originalName = req.file.originalname;
    } else {
      fileUrl = providedUrl;
      fileType = req.body.type || 'link';
      fileSize = Number(req.body.fileSize) || 0;
    }

    const material = new Material({
      title: title || originalName || 'Untitled',
      description,
      fileUrl,
      url: fileUrl, // Synchronize url field
      fileType,
      fileSize,
      course: courseId ? courseId : undefined,
      uploadedBy: uploaderId,
      year: year || '1',
      semester: semester || '1',
      section: section || 'All',
      subject: subject || 'General',
      type: type || 'notes',
      module: module || '1',
      unit: unit || '1',
      topic: topic || 'General Topics',
      // New metadata fields
      duration,
      examYear,
      dueDate,
      message
    });

    await material.save();

    // No file sync: materials persist in MongoDB only

    // Populate the response
    try {
      await material.populate('course', 'courseCode courseName');
      await material.populate({ path: 'uploadedBy', model: 'Faculty', select: 'name email' });
    } catch (popErr) {
      console.warn('Material populate failed (non-critical):', popErr.message);
    }

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
    try { global.broadcastEvent && global.broadcastEvent({ resource: 'materials', action: 'create', data: { id: material._id.toString(), title: material.title, course: material.course, year: material.year, section: material.section } }); } catch (e) { }

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
      materialUploader: material.uploadedBy ? material.uploadedBy.toString() : 'null',
      requestUserId: req.user._id ? req.user._id.toString() : 'missing',
      role: req.user.role
    });

    const isUploader = req.user._id && material.uploadedBy && material.uploadedBy.toString() === req.user._id.toString();
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
          // Use uploadsDir from config for deletion path resolution
          const relOld = material.fileUrl.replace('/uploads/', '').replace(/\//g, path.sep);
          const oldFilePath = path.join(uploadsDir, relOld);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log(`[Update] Deleted old file: ${oldFilePath}`);
          }
        } catch (err) {
          console.error('[Update] Failed to delete old file:', err.message);
        }
      }

      const relPath = path.relative(uploadsDir, req.file.path);
      material.fileUrl = `/uploads/${relPath}`.replace(/\\/g, '/');
      material.fileType = req.file.mimetype;
      material.fileSize = req.file.size;
    } else if (req.body.url || req.body.link) {
      material.fileUrl = req.body.url || req.body.link;
      material.fileType = req.body.type || 'link';
      material.fileSize = Number(req.body.fileSize) || 0;
    }

    await material.save();

    // Populate the response
    try {
      await material.populate('course', 'courseCode courseName');
      await material.populate({ path: 'uploadedBy', model: 'Faculty', select: 'name email' });
    } catch (popErr) {
      console.warn('Material populate failed (non-critical):', popErr.message);
    }

    // Notify dashboards that a material was updated
    try { global.broadcastEvent && global.broadcastEvent({ resource: 'materials', action: 'update', data: { id: material._id.toString(), title: material.title, year: material.year, section: material.section } }); } catch (e) { }

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
      materialUploader: material.uploadedBy ? material.uploadedBy.toString() : 'null',
      requestUserId: req.user._id ? req.user._id.toString() : 'missing',
      role: req.user.role
    });

    const isUploader = req.user._id && material.uploadedBy && material.uploadedBy.toString() === req.user._id.toString();
    if (!isUploader && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this material' });
    }

    // Delete the file from physical storage
    if (material.fileUrl && material.fileUrl.startsWith('/uploads')) {
      try {
        const relPath = material.fileUrl.replace('/uploads/', '').replace(/\//g, path.sep);
        const filePath = path.join(uploadsDir, relPath);

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
    try { global.broadcastEvent && global.broadcastEvent({ resource: 'materials', action: 'delete', data: { id: material._id.toString() } }); } catch (e) { }

    res.json({ message: 'Material removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.likeMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    material.likes = (material.likes || 0) + 1;
    await material.save();

    try { global.broadcastEvent && global.broadcastEvent({ resource: 'materials', action: 'update', data: material }); } catch (e) { }

    res.json({ success: true, likes: material.likes });
  } catch (error) {
    console.error('Error liking material:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
