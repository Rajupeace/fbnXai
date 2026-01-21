require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const chokidar = require('chokidar');
const { DASHBOARD_PATHS, RESOURCE_MAP } = require('./dashboardConfig');
// Import dbHelper but name it dbFile to maintain compatibility with existing code
const dbFile = require('./dbHelper');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const multer = require('multer');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');

// Import Mongoose Models
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Course = require('./models/Course');
const Message = require('./models/Message');
const materialController = require('./controllers/materialController');

const app = express();
app.use(cors());
app.use(express.json());



// Global request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} | originalUrl=${req.originalUrl} baseUrl=${req.baseUrl} path=${req.path}`);
  next();
});

app.get('/api/test', async (req, res) => {
  console.log('Test endpoint called');
  res.send('test');
});

app.get('/api/faculty/teaching', async (req, res) => {
  try {
    const { year, section, branch } = req.query;
    if (!year || !section || !branch) {
      return res.status(400).json({ error: 'Missing required query parameters: year, section, branch' });
    }

    // Require MongoDB as single source-of-truth for teaching assignments
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'MongoDB not connected. Teaching data unavailable.' });
    }

    try {
      const mongoFaculty = await Faculty.find({
        assignments: {
          $elemMatch: {
            year: year,
            section: section,
            branch: branch
          }
        }
      }).select('-password -facultyToken').lean();

      const filteredFaculty = mongoFaculty.map(f => ({
        ...f,
        id: f.facultyId || f._id?.toString(),
        _id: f._id?.toString(),
        source: 'mongodb'
      }));

      return res.json(filteredFaculty);
    } catch (err) {
      console.error('Mongo Faculty Teaching Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch teaching faculty' });
    }
  } catch (err) {
    console.error('Error fetching teaching faculty:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simple Server-Sent Events (SSE) broadcaster for live frontend updates
const sseClients = [];

function broadcastEvent(payload) {
  const str = JSON.stringify(payload);
  sseClients.forEach((res) => {
    try {
      res.write(`data: ${str}\n\n`);
    } catch (e) {
      // ignore broken pipes
    }
  });
}

// Expose broadcaster to other modules/routes
global.broadcastEvent = broadcastEvent;

app.get('/api/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders && res.flushHeaders();
  // Send initial ping
  res.write('retry: 2000\n\n');
  sseClients.push(res);
  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});
// Serve uploads statically
const staticUploads = DASHBOARD_PATHS.uploads;
app.use('/uploads', express.static(staticUploads));

// Health check route - Early registration
app.get('/api/health', (req, res) => {
  console.log('Health endpoint called');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

let server;

// Legacy variables for compatibility if needed, though mostly replaced by dashboardConfig
const uploadsDir = DASHBOARD_PATHS.uploads;

// Initialize Watcher for Real-time Updates from D: Drive
// Initialize Watcher for Real-time Updates from D: Drive
const watchPaths = [];
Object.values(DASHBOARD_PATHS).forEach(p => {
  if (typeof p === 'string') watchPaths.push(p);
  else if (p.root) watchPaths.push(p.root);
});

const watcher = chokidar.watch(watchPaths, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: true,
  depth: 10
});

watcher.on('all', (event, filePath) => {
  // debounce requests? For now, raw.
  // Identify resource
  let resource = null;
  // Normalize slashes for comparison
  const normPath = path.normalize(filePath);

  for (const [key, val] of Object.entries(RESOURCE_MAP)) {
    if (normPath === path.normalize(val)) {
      resource = key;
      break;
    }
  }

  // If not found directly, check if it's in a known folder (e.g. uploads or a new json)
  if (!resource) {
    if (normPath.includes('students')) resource = 'students';
    else if (normPath.includes('materials')) resource = 'materials';
    else if (normPath.includes('courses')) resource = 'courses';
  }

  if (resource) {
    console.log(`[File Watcher] Change detected in ${resource} (${event}), broadcasting update.`);
    // Broadcast to all connected clients
    broadcastEvent({ resource: resource, action: 'update', from: 'filesystem' });
  }
});

const studentsDB = dbFile('students', []);
const facultyDB = dbFile('faculty', []);
const materialsDB = dbFile('materials', []);
const messagesDB = dbFile('messages', []);
const adminDB = dbFile('admin', { adminId: process.env.ADMIN_ID || 'BobbyFNB@09=', password: process.env.ADMIN_PASSWORD || 'Martin@FNB09' });
const coursesDB = dbFile('courses', []);
const studentFacultyDB = dbFile('studentFaculty', []); // Store student-faculty relationships
const todosDB = dbFile('todos', []);

// --- MESSAGE ROUTES ---
app.get('/api/messages', (req, res) => {
  const all = messagesDB.read() || [];
  res.json(all);
});

app.post('/api/messages', (req, res) => {
  const all = messagesDB.read() || [];
  const msg = {
    id: Date.now(),
    date: new Date().toISOString(),
    ...req.body
  };
  all.push(msg);
  messagesDB.write(all);
  try { broadcastEvent({ resource: 'messages', action: 'create', data: msg }); } catch (e) { }
  res.status(201).json(msg);
});

app.delete('/api/messages/:id', (req, res) => {
  const all = messagesDB.read() || [];
  const next = all.filter(m => String(m.id) !== String(req.params.id));
  messagesDB.write(next);
  res.json({ ok: true });
});

// --- TODO ROUTES ---
app.get('/api/todos', (req, res) => {
  const { role } = req.query;
  let all = todosDB.read();
  if (role && role !== 'admin') {
    all = all.filter(t => t.target === 'all' || t.target === role);
  }
  res.json(all);
});

app.post('/api/todos', (req, res) => {
  const { text, target, dueDate } = req.body;
  const all = todosDB.read();
  const item = {
    id: uuidv4(),
    text,
    target: target || 'admin',
    dueDate,
    completed: false,
    createdAt: new Date().toISOString()
  };
  all.push(item);
  todosDB.write(all);
  // Notify clients
  try { broadcastEvent({ resource: 'todos', action: 'create', data: item }); } catch (e) { }
  res.status(201).json(item);
});

app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const all = todosDB.read();
  const idx = all.findIndex(t => t.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...req.body };
    todosDB.write(all);
    try { broadcastEvent({ resource: 'todos', action: 'update', data: all[idx] }); } catch (e) { }
    res.json(all[idx]);
  } else {
    res.status(404).json({ error: 'not found' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const all = todosDB.read();
  const next = all.filter(t => t.id !== id);
  todosDB.write(next);
  try { broadcastEvent({ resource: 'todos', action: 'delete', data: { id } }); } catch (e) { }
  res.json({ ok: true });
});

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const chatRoutes = require('./routes/chat');
const examRoutes = require('./routes/examRoutes');

const courseRoutes = require('./routes/courseRoutes');
app.use('/api/courses', courseRoutes);
// app.use('/api/teaching-assignments', teachingAssignmentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/chat', chatRoutes);
app.get('/api/labs/schedule', async (req, res) => {
  try {
    const { year, section, branch } = req.query;
    let schedules = [];

    // 1. Try MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        const Schedule = require('./models/Schedule');
        schedules = await Schedule.find({
          year,
          section,
          branch,
          type: { $regex: /lab|practical/i }
        }).sort({ day: 1, time: 1 });
      } catch (e) { }
    }

    // 2. Fallback to File
    if (schedules.length === 0) {
      const all = require('./dbHelper')('schedule').read() || [];
      schedules = all.filter(s =>
        s.year === year &&
        s.section === section &&
        s.branch === branch &&
        /lab|practical/i.test(s.type || '')
      );
    }

    // Transform to frontend format if needed (though frontend seems to match DB schema closely)
    // Mapping DB fields to Frontend fields if they differ
    const mapped = schedules.map(s => ({
      labName: s.subject,
      day: s.day,
      time: s.time,
      faculty: s.faculty,
      room: s.room,
      batch: s.batch || 'Batch A',
      tools: s.tools || [],
      description: s.description || 'Lab Session'
    }));

    res.json(mapped);
  } catch (err) {
    console.error('Lab schedule fetch error:', err);
    res.json([]);
  }
});

// Public GET endpoint for all exams (for dashboards)
app.get('/api/exams', async (req, res) => {
  try {
    const { year, section, branch, subject } = req.query;
    let query = {};

    if (year) query.year = year;
    if (section) query.section = section;
    if (branch) query.branch = branch;
    if (subject) query.subject = subject;

    if (mongoose.connection.readyState === 1) {
      const Exam = require('./models/Exam');
      const exams = await Exam.find(query).sort({ examDate: -1 }).lean();
      return res.json(exams);
    } else {
      // Fallback to file-based if MongoDB not connected
      return res.json([]);
    }
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams', details: error.message });
  }
});

app.use('/api/exams', examRoutes);

// Multer setup for file uploads (MongoDB) - Organized by role
// const storageMongo = multer.diskStorage({
//   destination: (req, file, cb) => {
//     try {
//       // Determine upload folder based on user role
//       let uploadFolder = uploadsDir;

//       // Check which token is present to determine role
//       const adminToken = req.headers['x-admin-token'];
//       const facultyToken = req.headers['x-faculty-token'];

//       if (adminToken) {
//         uploadFolder = path.join(uploadsDir, 'admin');
//       } else if (facultyToken) {
//         uploadFolder = path.join(uploadsDir, 'faculty');
//       }

//       // Create folder if it doesn't exist
//       if (!fs.existsSync(uploadFolder)) {
//         fs.mkdirSync(uploadFolder, { recursive: true });
//       }

//       cb(null, uploadFolder);
//     } catch (e) {
//       console.error('Upload destination error:', e);
//       cb(e, uploadsDir);
//     }
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
//     cb(null, uniqueSuffix + '-' + sanitizedName);
//   }
// });

// const uploadMongo = multer({
//   storage: storageMongo,
//   limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
//   fileFilter: (req, file, cb) => {
//     // Check Extension
//     const filetypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|text|jpg|jpeg|png|gif|mp4|avi|mov|zip|rar|csv|py|java|c|cpp|js|html|css|sql|json/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//     // Check MimeType
//     // We allow standard mime types that contain our allowed extensions
//     // e.g. text/plain (contains 'text'), video/mp4 (contains 'mp4'), application/pdf (contains 'pdf')
//     const mimetype = filetypes.test(file.mimetype);

//     // Explicitly allow text/plain if extension is safe
//     const isText = file.mimetype === 'text/plain';

//     if ((mimetype && extname) || (isText && extname)) {
//       return cb(null, true);
//     } else {
//       console.warn(`[Upload Blocked] File: ${file.originalname}, Mime: ${file.mimetype}`);
//       cb(new Error('Invalid file type. Only documents, images, videos, and archives are allowed.'));
//     }
//   }
// });

// Middleware for Auth (Admin OR Faculty) - DB Agnostic - COMMENTED OUT FOR DEBUGGING
// requireAuthMongo function removed to isolate server stability issues

// Courses API
app.get('/api/courses', async (req, res) => {
  try {
    let allCourses = [];
    if (mongoose.connection.readyState === 1 && Course) {
      try {
        const mongoCourses = await Course.find({}).lean();
        allCourses = mongoCourses.map(c => ({
          ...c,
          id: c._id.toString(),
          _id: c._id.toString(),
          source: 'mongodb'
        }));
      } catch (mongoErr) {
        console.warn('[GET /api/courses] Mongo fetch error:', mongoErr.message);
      }
    }

    const fileCourses = coursesDB.read() || [];
    const transformedFile = fileCourses.map(c => ({
      ...c,
      id: c.id || c.courseCode,
      source: 'file'
    }));

    const final = [...allCourses];
    transformedFile.forEach(fc => {
      if (!final.find(mc => (mc.courseCode && mc.courseCode === fc.courseCode) || mc.id === fc.id)) {
        final.push(fc);
      }
    });

    res.json(final);
  } catch (err) {
    console.error('[GET /api/courses] Error:', err);
    res.status(500).json({ error: 'Failed to fetch courses', details: err.message });
  }
});

app.get('/api/materials', async (req, res, next) => {
  try {
    const { year, section, subject, type, course, branch } = req.query;
    let allMaterials = [];

    // 1. Get from MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const Material = require('./models/Material');
        const query = {};

        // Tiered Filtering: (Specific Match) OR (Broadcast Match)
        if (year && year !== 'All') {
          query.year = year;
        }

        if (section && section !== 'All') {
          // If a section is provided, we want (section matched OR section is 'All')
          query.$or = [{ section: section }, { section: 'All' }, { section: '' }];
        }

        if (branch && branch !== 'All') {
          // branch specific or all-branch
          query.$or = (query.$or || []).concat([{ branch: branch }, { branch: 'All' }, { branch: '' }]);
        }

        if (subject) query.subject = subject;
        if (type) query.type = type;
        if (course) query.course = course;
        if (req.query.isAdvanced !== undefined) query.isAdvanced = req.query.isAdvanced === 'true';

        const mongoMaterials = await Material.find(query)
          .populate('course', 'courseCode courseName')
          .populate('uploadedBy', 'name email')
          .sort('-createdAt');

        const transformed = mongoMaterials.map(m => ({
          id: m._id.toString(),
          _id: m._id.toString(),
          title: m.title,
          description: m.description,
          url: m.fileUrl,
          fileUrl: m.fileUrl,
          type: m.type,
          subject: m.subject,
          year: m.year,
          section: m.section,
          branch: m.branch,
          semester: m.semester,
          module: m.module,
          unit: m.unit,
          topic: m.topic,
          uploadedAt: m.createdAt,
          createdAt: m.createdAt,
          uploaderName: m.uploadedBy?.name || 'Administrator',
          uploaderRole: m.uploadedBy?.facultyId === 'admin' ? 'admin' : 'faculty',
          source: 'mongodb'
        }));
        allMaterials.push(...transformed);
      } catch (mongoErr) {
        console.warn('[GET /api/materials] MongoDB error:', mongoErr.message);
      }
    }

    // 2. Also get from file-based storage
    try {
      const fileMaterials = materialsDB.read() || [];
      let filtered = fileMaterials;

      if (year && year !== 'All') {
        filtered = filtered.filter(m => String(m.year) === String(year));
      }

      if (section && section !== 'All') {
        filtered = filtered.filter(m => !m.section || m.section === 'All' || String(m.section) === String(section));
      }

      if (branch && branch !== 'All') {
        filtered = filtered.filter(m => !m.branch || m.branch === 'All' || m.branch === branch);
      }

      if (subject) filtered = filtered.filter(m => String(m.subject) === String(subject));
      if (type) filtered = filtered.filter(m => String(m.type) === String(type));
      if (course) filtered = filtered.filter(m => String(m.course) === String(course));
      if (req.query.isAdvanced !== undefined) filtered = filtered.filter(m => m.isAdvanced === (req.query.isAdvanced === 'true'));

      const fileWithSource = filtered.map(m => ({ ...m, source: 'file' }));
      const existingIds = new Set(allMaterials.map(m => String(m.id)));
      const uniqueFileMaterials = fileWithSource.filter(m => !existingIds.has(String(m.id)) && !existingIds.has(String(m._id)));
      allMaterials.push(...uniqueFileMaterials);
    } catch (fileErr) {
      console.warn('[GET /api/materials] File read error:', fileErr.message);
    }

    // Sort by createdAt/uploadedAt descending
    allMaterials.sort((a, b) => new Date(b.createdAt || b.uploadedAt || 0) - new Date(a.createdAt || a.uploadedAt || 0));

    return res.json(allMaterials);
  } catch (err) {
    console.error('[GET /api/materials] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch materials', details: err.message });
  }
});
// app.get('/api/materials/:id', materialController.getMaterialById);

// Simple local multer upload middleware (stores files under backend/uploads)
const storageLocal = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (e) {
      cb(e, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});
const uploadLocal = multer({ storage: storageLocal, limits: { fileSize: 200 * 1024 * 1024 } });

// Helper to Handle File-Based Material Upload
const handleFileBasedUpload = async (req, res) => {
  try {
    const { title, year, section, subject, type, course, branch, module, unit, topic, link, message, dueDate, semester, isAdvanced } = req.body;

    // Basic Validation
    if (!title && !req.file && !link) {
      console.error('Upload Validation Failed: Missing Title/File/Link', req.body);
      return res.status(400).json({ message: 'Title, File, or Link is required' });
    }
    if (!subject || !type) {
      console.error('Upload Validation Failed: Missing Subject/Type', req.body);
      return res.status(400).json({ message: 'Subject and Type are required' });
    }

    const all = materialsDB.read();
    const id = uuidv4();

    // File info from uploadMongo middleware
    let fileUrl = null;
    let filename = null;
    let fileType = null;
    let fileSize = null;

    if (req.file && req.file.path) {
      // req.file.path is absolute, we need relative to uploads dir for URL
      // Uploads are in backend/uploads/admin or backend/uploads/faculty
      // We want URL to be /uploads/admin/filename
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const relPath = path.relative(uploadsDir, req.file.path);
      fileUrl = `${baseUrl}/uploads/${relPath}`.replace(/\\/g, '/');
      filename = req.file.filename;
      fileType = req.file.mimetype;
      fileSize = req.file.size;
    } else if (link) {
      fileUrl = link;
    }

    const user = req.user || await authFromHeaders(req);

    const item = {
      id,
      _id: id, // maintain interface
      title: title || (req.file ? req.file.originalname : 'Untitled'),
      description: req.body.description || '',
      year: year || 'All',
      section: section || 'All',
      semester: semester ? String(semester) : null,
      subject,
      type,
      course: course || null,
      branch: branch || null,
      module: module ? String(module) : null,
      unit: unit ? String(unit) : null,
      topic: topic || null,
      isAdvanced: isAdvanced === 'true' || isAdvanced === true,
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
      filename,
      fileUrl: fileUrl,
      url: fileUrl, // legacy support
      fileType,
      fileSize,
      originalName: req.file ? req.file.originalname : null,
      uploadedBy: user ? { name: user.name, role: user.role, id: user.id } : null,
      uploaderId: user ? user.id : null
    };

    // Type specific fields
    if (type === 'videos' && message) item.duration = message;
    if ((type === 'modelPapers' || type === 'previousQuestions') && dueDate) item.examYear = dueDate;

    all.push(item);
    materialsDB.write(all);
    try { broadcastEvent({ resource: 'materials', action: 'create', data: item }); } catch (e) { }
    res.status(201).json(item);
  } catch (err) {
    console.error('File-based upload error:', err);
    console.error(err.stack); // Log full stack trace
    res.status(500).json({ message: 'Failed to save material (File Mode)', error: err.message });
  }
};

app.post('/api/materials', uploadLocal.single('file'), async (req, res) => {
  try {
    req.user = req.user || await authFromHeaders(req);
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication failed. Please log in again.' });
    }

    console.log('[POST /api/materials] Upload request from:', req.user.role, req.user.id);

    // 1. Try MongoDB (Cloud Mesh) if connected
    if (mongoose.connection.readyState === 1 && typeof materialController !== 'undefined' && materialController.uploadMaterial) {
      try {
        // We use the controller which will handle its own res.status().json()
        return await materialController.uploadMaterial(req, res);
      } catch (mongoUploadErr) {
        console.warn('[POST /api/materials] MongoDB upload failed, falling back:', mongoUploadErr.message);
        // Fall through to file-based
      }
    }

    // 2. Fallback: File-based upload (Local Mesh)
    return await handleFileBasedUpload(req, res);
  } catch (err) {
    console.error('Upload route error:', err);
    return res.status(500).json({ message: 'Upload failed', details: err.message });
  }
});

// Update existing material (file-based or Mongo fallback)
app.put('/api/materials/:id', /* requireAuthMongo, */ uploadLocal.single('file'), async (req, res) => {
  try {
    req.user = req.user || await authFromHeaders(req);
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    // Try MongoDB first IF connected
    if (mongoose.connection.readyState === 1) {
      try {
        const Material = require('./models/Material');
        const material = await Material.findById(req.params.id);
        if (material) {
          // Found in MongoDB, use controller
          return materialController.updateMaterial(req, res);
        }
        // Material not in MongoDB, fall through to file-based
      } catch (mongoErr) {
        console.warn('[PUT /api/materials] MongoDB lookup failed, trying file-based:', mongoErr.message);
      }
    }

    // Fallback: File-based storage
    return await handleFileBasedUpdate(req, res);
  } catch (err) {
    console.error('PUT /api/materials error:', err);
    return res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

// Debug upload endpoint to inspect multipart parsing
app.post('/api/debug-upload', uploadLocal.single('file'), (req, res) => {
  try {
    const log = {
      timestamp: new Date().toISOString(),
      body: req.body || null,
      file: req.file || null
    };
    // append to debug log
    try { fs.appendFileSync(path.join(dataDir, 'upload_debug.log'), JSON.stringify(log) + '\n'); } catch (e) { }
    res.json({ ok: true, received: log });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// app.put('/api/materials/:id', requireAuthMongo, uploadMongo.single('file'), async (req, res, next) => {
//   if (mongoose.connection.readyState === 1) {
//     // Check if material exists in MongoDB
//     const Material = require('./models/Material');
//     const mongoMaterial = await Material.findById(req.params.id);
//     if (mongoMaterial) {
//       return materialController.updateMaterial(req, res, next);
//     } else {
//       // Fallback to file-based update
//       console.log('Material not found in MongoDB, trying file-based update');
//       return handleFileBasedUpdate(req, res);
//     }
//   } else {
//     return handleFileBasedUpdate(req, res);
//   }
// });

const handleFileBasedUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const all = materialsDB.read();
    // Normalize ID comparison to handle string/ObjectId mismatches
    const idx = all.findIndex(m =>
      String(m.id) === String(id) ||
      String(m._id) === String(id) ||
      (m.id && String(m.id).includes(id)) ||
      (m._id && String(m._id).includes(id))
    );

    if (idx === -1) return res.status(404).json({ message: 'Material not found in local database' });

    // Resolve user (support header-based auth in file-mode)
    const user = req.user || await authFromHeaders(req);
    const material = all[idx];
    if (!(user && (user.role === 'admin' || String(material.uploaderId) === String(user.id)))) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    const updatedItem = { ...material, ...updates };

    if (req.file) {
      // Remove previous file if it was stored under /uploads
      try {
        if (material && material.fileUrl && String(material.fileUrl).startsWith('/uploads')) {
          const relPrev = String(material.fileUrl).replace(/^\/uploads\//, '').replace(/\//g, path.sep);
          const pPrev = path.join(uploadsDir, relPrev);
          if (fs.existsSync(pPrev)) {
            try { fs.unlinkSync(pPrev); } catch (e) { console.warn('Failed to unlink previous file', pPrev, e); }
          }
        } else if (material && material.filename) {
          const p2 = path.join(uploadsDir, material.filename);
          if (fs.existsSync(p2)) {
            try { fs.unlinkSync(p2); } catch (e) { console.warn('Failed to unlink previous file', p2, e); }
          }
        }
      } catch (e) { console.warn('Error while cleaning previous file:', e); }

      // Update file info
      const relPath = path.relative(uploadsDir, req.file.path);
      updatedItem.fileUrl = `/uploads/${relPath}`.replace(/\\/g, '/');
      updatedItem.url = updatedItem.fileUrl;
      updatedItem.filename = req.file.filename;
      updatedItem.fileType = req.file.mimetype;
      updatedItem.fileSize = req.file.size;
    }

    all[idx] = updatedItem;
    materialsDB.write(all);
    res.json(updatedItem);
  } catch (err) {
    console.error('File-based update error:', err);
    res.status(500).json({ message: 'Failed to update material' });
  }
};

app.delete('/api/materials/:id', async (req, res, next) => {
  try {
    req.user = req.user || await authFromHeaders(req);
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });


    // Try MongoDB first IF connected
    if (mongoose.connection.readyState === 1) {
      try {
        const Material = require('./models/Material');
        const material = await Material.findById(req.params.id);
        if (material) {
          // Found in MongoDB, use controller
          return materialController.deleteMaterial(req, res, next);
        }
        // Material not in MongoDB, fall through to file-based
      } catch (mongoErr) {
        console.warn('[DELETE /api/materials] MongoDB lookup failed, trying file-based:', mongoErr.message);
      }
    }

    // File-based delete
    try {
      const { id } = req.params;
      const all = materialsDB.read();
      // Normalize ID comparison
      const idx = all.findIndex(m =>
        String(m.id) === String(id) ||
        String(m._id) === String(id) ||
        (m.id && String(m.id).includes(id)) ||
        (m._id && String(m._id).includes(id))
      );

      if (idx === -1) return res.status(404).json({ message: 'Material not found' });

      const material = all[idx];
      // Allow admin or owner
      if (String(material.uploaderId) !== String(req.user.id) && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const newAll = all.filter((_, i) => i !== idx);
      materialsDB.write(newAll);
      res.json({ message: 'Material removed' });
    } catch (err) {
      console.error('File-based delete error:', err);
      res.status(500).json({ message: 'Failed to delete material' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// API endpoint to list content_source files
app.get('/api/content-source', /* requireAuthMongo, */(req, res) => {
  try {
    const contentRoot = path.join(uploadsDir, 'content_source');
    if (!fs.existsSync(contentRoot)) {
      return res.json([]);
    }

    const subjects = fs.readdirSync(contentRoot, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        const subjectPath = path.join(contentRoot, dirent.name);
        const types = fs.readdirSync(subjectPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(typeDirent => {
            const typePath = path.join(subjectPath, typeDirent.name);
            const chapters = fs.readdirSync(typePath, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory())
              .map(chapterDirent => {
                const chapterPath = path.join(typePath, chapterDirent.name);
                const files = fs.readdirSync(chapterPath, { withFileTypes: true })
                  .filter(dirent => dirent.isFile())
                  .map(fileDirent => ({
                    name: fileDirent.name,
                    url: `/uploads/content_source/${dirent.name}/${typeDirent.name}/${chapterDirent.name}/${fileDirent.name}`,
                    size: fs.statSync(path.join(chapterPath, fileDirent.name)).size
                  }));
                return {
                  chapter: chapterDirent.name,
                  files: files
                };
              });
            return {
              type: typeDirent.name,
              chapters: chapters
            };
          });
        return {
          subject: dirent.name,
          types: types
        };
      });

    res.json(subjects);
  } catch (error) {
    console.error('Error listing content source:', error);
    res.status(500).json({ error: 'Failed to list content source files', details: error.message });
  }
});

// simple admin-check middleware
// simple admin-check middleware
const requireAdmin = async (req, res, next) => {
  // Support both custom headers and standard Bearer token
  const bearer = req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
  const token = req.headers['x-admin-token'] || bearer;

  if (!token) {
    console.warn(`[Auth] Admin token missing.`);
    return res.status(401).json({ error: 'Authentication required', details: 'Admin token is missing.' });
  }

  // Helper: Verify JWT Payload
  const verifyJWT = (t) => {
    try {
      const key = process.env.JWT_SECRET || 'your_jwt_secret';
      return jwt.verify(t, key);
    } catch (e) { return null; }
  };

  // 1. Stateful: Check MongoDB
  if (mongoose.connection.readyState === 1 && Admin) {
    try {
      const adminDoc = await Admin.findOne({ adminToken: token });
      if (adminDoc) {
        req.user = { id: adminDoc.adminId, _id: adminDoc._id, role: 'admin', name: adminDoc.name };
        return next();
      }
    } catch (err) {
      console.error('Admin DB findOne error:', err);
    }
  }

  // 2. Stateless: Verify Valid Signature (Fallback if DB cleared or restarted)
  const decoded = verifyJWT(token);
  if (decoded && (decoded.id === process.env.ADMIN_ID || decoded.id === 'ReddyFBN@1228' || decoded.role === 'admin')) {
    console.log('[Auth] Stateless Admin JWT accepted (DB mismatch ignored).');
    req.user = { id: decoded.id, role: 'admin', name: 'Administrator' };
    return next();
  }

  // 3. File-Based Fallback
  const adminFile = adminDB.read() || {};
  if (adminFile.adminToken === token) {
    req.user = { id: adminFile.adminId || 'admin', role: 'admin', name: 'Administrator' };
    return next();
  }

  console.warn(`[Auth] Admin authentication failed. Token invalid or expired.`);
  return res.status(401).json({ error: 'Session expired', message: 'Please log out and log in again' });
};

function requireFaculty(req, res, next) {
  const bearer = req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
  const token = req.headers['x-faculty-token'] || bearer;

  if (!token) return res.status(401).json({ error: 'faculty token required' });

  if (mongoose.connection.readyState !== 1 || !Faculty) {
    console.warn('[Auth] MongoDB not connected - faculty auth unavailable');
    return res.status(503).json({ error: 'MongoDB not connected. Faculty auth unavailable.' });
  }

  Faculty.findOne({ facultyToken: token })
    .then(facultyDoc => {
      if (facultyDoc) {
        req.facultyData = facultyDoc;
        req.user = {
          id: facultyDoc.facultyId,
          _id: facultyDoc._id,
          role: 'faculty',
          name: facultyDoc.name
        };
        return next();
      }
      return res.status(401).json({ error: 'invalid faculty token' });
    })
    .catch(err => {
      console.error('Faculty DB findOne error:', err);
      return res.status(500).json({ error: 'Faculty auth error', details: err.message });
    });
}

function requireStudent(req, res, next) {
  const bearer = req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
  const token = req.headers['x-student-token'] || bearer;

  if (!token) return res.status(401).json({ error: 'student token required' });

  const checkFileDB = () => {
    const students = studentsDB.read() || [];
    const student = students.find(s => s.studentToken === token);
    if (student) {
      req.user = { ...student, id: student.sid || student.id, _id: student._id || student.id, role: 'student' };
      return next();
    }
    return res.status(401).json({ error: 'invalid student token' });
  };
  if (mongoose.connection.readyState !== 1 || !Student) {
    console.warn('[Auth] MongoDB not connected - student auth unavailable');
    return res.status(503).json({ error: 'MongoDB not connected. Student auth unavailable.' });
  }

  Student.findOne({ studentToken: token })
    .then(studentDoc => {
      if (studentDoc) {
        req.user = studentDoc.toObject();
        req.user.id = studentDoc.sid;
        req.user.role = 'student';
        return next();
      }
      return res.status(401).json({ error: 'invalid student token' });
    })
    .catch(err => {
      console.error('Student DB findOne error:', err);
      return res.status(500).json({ error: 'Student auth error', details: err.message });
    });
}

// Helper: derive user from headers for file-based fallback (admin or faculty)
async function authFromHeaders(req) {
  try {
    // Support both custom headers and standard Bearer token
    const bearer = req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;

    const adminToken = req.headers['x-admin-token'] || bearer;
    if (adminToken) {
      if (mongoose.connection.readyState === 1 && Admin) {
        try {
          const AdminModel = require('./models/Admin');
          const adminDoc = await AdminModel.findOne({ adminToken });
          if (adminDoc) return { id: adminDoc.adminId, _id: adminDoc._id, role: 'admin', name: adminDoc.name };
        } catch (e) { console.error('Admin MongoDB auth error:', e); }
      }
      return null;
    }

    const facultyToken = req.headers['x-faculty-token'] || bearer;
    if (facultyToken) {
      if (mongoose.connection.readyState === 1 && Faculty) {
        try {
          const FacultyModel = require('./models/Faculty');
          const facultyDoc = await FacultyModel.findOne({ facultyToken });
          if (facultyDoc) return { id: facultyDoc.facultyId, _id: facultyDoc._id, role: 'faculty', name: facultyDoc.name };
        } catch (e) { console.error('Faculty MongoDB auth error:', e); }
      }
      return null;
    }

    const studentToken = req.headers['x-student-token'] || bearer;
    if (studentToken) {
      if (mongoose.connection.readyState === 1 && Student) {
        try {
          const studentDoc = await Student.findOne({ studentToken });
          if (studentDoc) return { id: studentDoc.sid, _id: studentDoc._id, role: 'student', name: studentDoc.studentName };
        } catch (e) { console.error('Student MongoDB auth error:', e); }
      }
      return null;
    }
  } catch (e) {
    console.error('authFromHeaders error', e);
  }
  return null;
}

// admin auth endpoints
app.post('/api/admin/login', async (req, res) => {
  try {
    const { adminId, password } = req.body || {};
    if (!adminId || !password) return res.status(400).json({ error: 'missing credentials' });

    console.log(`[Admin Login Attempt] User: ${adminId}`);

    // MongoDB Check
    if (mongoose.connection.readyState === 1 && Admin) {
      try {
        let admin = await Admin.findOne({ adminId });
        if (!admin) {
          // Auto-create admin if missing in MongoDB but attempting default
          if (adminId === 'BobbyFNB@09=' && password === 'Martin@FNB09') {
            console.log('Creating default admin in MongoDB...');
            admin = new Admin({
              adminId: 'BobbyFNB@09=',
              password: 'Martin@FNB09',
              name: 'Administrator'
            });
            await admin.save();
          }
        }

        if (admin && admin.password === password) {
          const token = jwt.sign(
            { id: admin.adminId, role: 'admin' },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
          );

          // Save token
          admin.adminToken = token;
          admin.tokenIssuedAt = new Date();
          await admin.save();

          console.log('✅ Admin login success (MongoDB)');
          return res.json({
            ok: true,
            token,
            adminData: { adminId: admin.adminId, name: admin.name }
          });
        }
      } catch (err) {
        console.error("MongoDB Admin Login Error:", err);
      }
    }

    // Fallback: File-based (Legacy) if MongoDB fails or not found
    const adminFile = adminDB.read() || {};
    // Check against file DB or hardcoded default
    const fileId = adminFile.adminId || 'BobbyFNB@09=';
    const filePass = adminFile.password || 'Martin@FNB09';

    if (adminId === fileId && password === filePass) {
      const token = jwt.sign(
        { id: fileId, role: 'admin' },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '24h' }
      );

      // Update file with token
      adminFile.adminId = fileId; // Ensure exists
      adminFile.password = filePass; // Ensure exists
      adminFile.adminToken = token;
      adminFile.tokenIssuedAt = new Date().toISOString();
      adminDB.write(adminFile);

      console.log('✅ Admin login success (File/Default)');
      return res.json({
        ok: true,
        token,
        adminData: { adminId: fileId, name: 'Administrator' }
      });
    }

    console.warn('❌ Invalid admin credentials');
    return res.status(401).json({ error: 'invalid admin credentials' });
  } catch (err) {
    console.error('[ADMIN LOGIN CRASH]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Logout route
app.post('/api/admin/logout', requireAdmin, async (req, res) => {
  try {
    const user = req.user;
    if (mongoose.connection.readyState === 1 && Admin) {
      await Admin.findOneAndUpdate({ adminId: user.id }, { adminToken: null });
    }
    const adminFile = adminDB.read() || {};
    if (adminFile.adminId === user.id) {
      adminFile.adminToken = null;
      adminDB.write(adminFile);
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Logout failed' });
  }
});
app.post('/api/admin/refresh', requireAdmin, async (req, res) => {
  try {
    const user = req.user;
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    // Update token in storage
    if (mongoose.connection.readyState === 1 && Admin) {
      await Admin.findOneAndUpdate(
        { adminId: user.id },
        { adminToken: token, tokenIssuedAt: new Date() }
      );
    } else {
      const adminFile = adminDB.read() || {};
      if (adminFile.adminId === user.id) {
        adminFile.adminToken = token;
        adminFile.tokenIssuedAt = new Date().toISOString();
        adminDB.write(adminFile);
      }
    }

    res.json({
      ok: true,
      token,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// routes: students
// Student routes
app.use('/api/students', studentRoutes);

// Keep the existing /api/students endpoint for admin access
// app.get('/api/students', (req, res) => {
//   res.json(studentsDB.read());
// });

// Bulk upload route removed for now to avoid top-level awaits and simplify debugging.

app.post('/api/students', async (req, res) => {
  const { studentName, sid, email, year, section, branch, password } = req.body;
  if (!sid || !studentName) return res.status(400).json({ error: 'missing required fields' });
  // Require MongoDB as single source-of-truth
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'MongoDB not connected. Cannot create student.' });

  try {
    // Provide sensible defaults for optional fields to avoid schema validation errors
    const safeEmail = email || `${sid}@example.com`;
    const safeBranch = branch || 'CSE';
    const safeYear = year !== undefined && year !== null ? String(year) : '1';
    const safeSection = section || 'A';
    const safePassword = password || sid || 'changeme';

    const existing = await Student.findOne({ $or: [{ sid }, { email: safeEmail }] });
    if (existing) {
      if (existing.sid === sid) return res.status(409).json({ error: 'sid exists' });
      if (existing.email === safeEmail) return res.status(409).json({ error: 'Email already exists' });
    }
    const newStudent = await Student.create({
      studentName,
      sid,
      email: safeEmail,
      year: safeYear,
      section: safeSection,
      branch: safeBranch,
      password: safePassword
    });

    // HYBRID SYNC: Automatically update File DB for consistency/backup
    try {
      const fileStudents = studentsDB.read() || [];
      // Only add if not exists
      if (!fileStudents.find(s => s.sid === sid)) {
        fileStudents.push({
          ...newStudent.toObject(),
          _id: newStudent._id.toString(),
          id: sid, // Maintain legacy ID
          source: 'file-sync'
        });
        studentsDB.write(fileStudents);
        console.log(`[Hybrid Sync] Synced new student ${sid} to local file DB`);
      }
    } catch (syncErr) {
      console.warn('[Hybrid Sync Warning] Failed to sync to file DB:', syncErr.message);
    }

    try { global.broadcastEvent && global.broadcastEvent({ resource: 'students', action: 'create', data: newStudent }); } catch (e) { }
    return res.status(201).json(newStudent);
  } catch (err) {
    console.error('Mongo Student Create Error:', err);
    // Return basic details to help debugging in dev (avoid leaking stack in production)
    return res.status(500).json({ error: 'Database error', details: err.message });
  }
});
app.put('/api/students/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // MongoDB Support
    if (mongoose.connection.readyState === 1) {
      // Try finding by _id first, then sid
      let updatedStudent = await Student.findByIdAndUpdate(id, updates, { new: true });
      if (!updatedStudent) {
        updatedStudent = await Student.findOneAndUpdate({ sid: id }, updates, { new: true });
      }

      if (updatedStudent) {
        // HYBRID SYNC: Update File DB
        try {
          const fileStudents = studentsDB.read() || [];
          const idx = fileStudents.findIndex(s => s.sid === updatedStudent.sid || s.id === updatedStudent.sid);
          if (idx !== -1) {
            fileStudents[idx] = { ...fileStudents[idx], ...updates };
            studentsDB.write(fileStudents);
            console.log(`[Hybrid Sync] Synced update for ${updatedStudent.sid} to local file DB`);
          }
        } catch (e) { console.warn('Hybrid sync update failed', e); }

        try { broadcastEvent({ resource: 'students', action: 'update', data: updatedStudent }); } catch (e) { }
        return res.json({ success: true, message: 'Student updated successfully', data: updatedStudent });
      }
      // If not found in Mongo, fall through to file DB check (hybrid mode)
    }

    const students = studentsDB.read();

    // Find student by id or sid
    const studentIndex = students.findIndex(s => s.id === id || s.sid === id);

    if (studentIndex === -1) {
      return res.status(404).json({
        error: 'Student not found',
        message: `No student found with ID/SID: ${id}`
      });
    }

    // Preserve important fields that shouldn't be updated
    const updatedStudent = {
      ...students[studentIndex],
      ...updates,
      // Ensure these fields are not accidentally overwritten
      id: students[studentIndex].id,
      sid: students[studentIndex].sid,
      updatedAt: new Date().toISOString()
    };

    // Update the student in the array
    students[studentIndex] = updatedStudent;

    // Save to database
    studentsDB.write(students);
    try { broadcastEvent({ resource: 'students', action: 'update', data: updatedStudent }); } catch (e) { }
    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });

  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update student. Please try again later.'
    });
  }
});
app.delete('/api/students/:sid', requireAdmin, async (req, res) => {
  const sid = req.params.sid;
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'MongoDB not connected. Cannot delete student.' });
  }

  try {
    await Student.deleteOne({ sid });

    // Clean up student-faculty relationships
    try {
      const coll = mongoose.connection.collection('studentFaculty');
      await coll.deleteMany({ studentId: sid });
    } catch (e) { /* ignore cleanup errors */ }

    // Sync removal from File DB (Hybrid Persistence)
    try {
      const students = studentsDB.read() || [];
      const newStudents = students.filter(s => s.sid !== sid);
      if (students.length !== newStudents.length) {
        studentsDB.write(newStudents);
      }
    } catch (e) { console.warn('File sync warning:', e.message); }

    try { broadcastEvent({ resource: 'students', action: 'delete', data: { sid } }); } catch (e) { }
    return res.json({ ok: true });
  } catch (err) {
    console.error('Mongo Student Delete Error:', err);
    return res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Student Self-Service Routes (No Admin Token Required for these specific user actions)
app.put('/api/students/profile/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const updates = req.body;

    // MongoDB Update
    if (mongoose.connection.readyState === 1) {
      const student = await Student.findOneAndUpdate({ sid }, updates, { new: true });
      if (student) return res.json(student);
      // If not found in Mongo but DB is connected, it might only exist in file. Continue to fallback.
    }

    // Fallback: File-based
    const arr = studentsDB.read();
    const idx = arr.findIndex(s => s.sid === sid);
    if (idx === -1) return res.status(404).json({ error: 'student not found' });

    // Update fields
    arr[idx] = { ...arr[idx], ...updates };
    studentsDB.write(arr);
    res.json(arr[idx]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/students/change-password/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const { currentPassword, newPassword } = req.body;

    // MongoDB Update
    if (mongoose.connection.readyState === 1) {
      const student = await Student.findOne({ sid });
      if (student) {
        if (currentPassword && student.password !== currentPassword) {
          return res.status(401).json({ error: 'Incorrect current password' });
        }
        student.password = newPassword;
        await student.save();
        return res.json({ success: true });
      }
    }

    // Fallback: File-based
    const arr = studentsDB.read();
    const idx = arr.findIndex(s => s.sid === sid);
    if (idx === -1) return res.status(404).json({ error: 'student not found' });

    // Verify current password (if not empty check provided)
    if (currentPassword && arr[idx].password !== currentPassword) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    arr[idx].password = newPassword;
    studentsDB.write(arr);
    res.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const students = studentsDB.read();
  const exists = students.find(s => s.email === email);
  if (exists) {
    // Mock email sending
    console.log(`[Mock Email] Password reset link sent to ${email}`);
    res.json({ success: true, message: 'Reset link sent to your email.' });
  } else {
    res.status(404).json({ error: 'Email address not found.' });
  }
});

// Student-Faculty Relationship Management
app.post('/api/relationships', requireAdmin, (req, res) => {
  const { studentId, facultyId } = req.body;
  if (!studentId || !facultyId) {
    return res.status(400).json({ error: 'studentId and facultyId are required' });
  }
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'MongoDB not connected. Relationships unavailable.' });

  (async () => {
    try {
      const student = await Student.findOne({ sid: studentId });
      const faculty = await Faculty.findOne({ facultyId: facultyId });
      if (!student) return res.status(404).json({ error: 'Student not found' });
      if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

      const coll = mongoose.connection.collection('studentFaculty');
      const existing = await coll.findOne({ studentId, facultyId });
      if (existing) return res.status(409).json({ error: 'Relationship already exists' });

      const now = new Date().toISOString();
      const result = await coll.insertOne({ studentId, facultyId, createdAt: now, createdBy: 'admin' });
      const created = { id: result.insertedId.toString(), studentId, facultyId, createdAt: now };
      return res.status(201).json(created);
    } catch (err) {
      console.error('Create relationship error:', err);
      return res.status(500).json({ error: 'Failed to create relationship' });
    }
  })();
});

app.get('/api/students/:studentId/faculties', (req, res) => {
  const { studentId } = req.params;
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'MongoDB not connected. Relationships unavailable.' });
  (async () => {
    try {
      const coll = mongoose.connection.collection('studentFaculty');
      const rels = await coll.find({ studentId }).toArray();
      const facultyIds = rels.map(r => r.facultyId);
      const faculties = await Faculty.find({ facultyId: { $in: facultyIds } }).select('-password -facultyToken').lean();
      const out = faculties.map(f => ({ ...f, relationshipId: rels.find(r => r.facultyId === f.facultyId)?._id?.toString() || null }));
      res.json(out);
    } catch (err) {
      console.error('Get student faculties error:', err);
      res.status(500).json({ error: 'Failed to retrieve faculties' });
    }
  })();
});

app.get('/api/faculty/:facultyId/students', (req, res) => {
  const { facultyId } = req.params;
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'MongoDB not connected. Relationships unavailable.' });
  (async () => {
    try {
      const coll = mongoose.connection.collection('studentFaculty');
      const rels = await coll.find({ facultyId }).toArray();
      const studentIds = rels.map(r => r.studentId);
      const students = await Student.find({ sid: { $in: studentIds } }).select('-password').lean();
      const out = students.map(s => ({ ...s, relationshipId: rels.find(r => r.studentId === (s.sid || s._id))?._id?.toString() || null }));
      res.json(out);
    } catch (err) {
      console.error('Get faculty students error:', err);
      res.status(500).json({ error: 'Failed to retrieve students' });
    }
  })();
});

app.delete('/api/relationships/:relationshipId', requireAdmin, (req, res) => {
  const { relationshipId } = req.params;
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'MongoDB not connected. Relationships unavailable.' });
  (async () => {
    try {
      const coll = mongoose.connection.collection('studentFaculty');
      const { ObjectId } = require('mongodb');
      let q = { _id: relationshipId };
      try { q = { _id: new ObjectId(relationshipId) }; } catch (e) { q = { _id: relationshipId }; }
      const result = await coll.deleteOne(q);
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Relationship not found' });
      res.json({ ok: true });
    } catch (err) {
      console.error('Delete relationship error:', err);
      res.status(500).json({ error: 'Failed to delete relationship' });
    }
  })();
});

// faculty routes
app.get('/api/faculty', requireAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'MongoDB not connected. Faculty data unavailable.' });
    }

    try {
      const mongoFaculty = await Faculty.find().select('-password -facultyToken').lean();
      const allFaculty = mongoFaculty.map(f => ({
        ...f,
        id: f.facultyId || f._id?.toString(),
        _id: f._id?.toString(),
        source: 'mongodb'
      }));
      return res.json(allFaculty);
    } catch (err) {
      console.error('Error fetching faculty from MongoDB:', err);
      return res.status(500).json({ error: 'Failed to fetch faculty' });
    }
  } catch (err) {
    console.error('Error in /api/faculty:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/faculty', requireAdmin, async (req, res) => {
  try {
    const { name, facultyId, email, password, assignments, department, designation } = req.body;
    if (!facultyId || !name || !password) return res.status(400).json({ error: 'missing required fields: facultyId, name, password' });

    // Ensure assignments is an array
    const assignmentsArray = Array.isArray(assignments) ? assignments : [];

    // Require MongoDB for faculty creation
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'MongoDB not connected. Cannot create faculty.' });
    }

    try {
      const existing = await Faculty.findOne({ facultyId });
      if (existing) return res.status(409).json({ error: 'facultyId already exists' });

      const newFaculty = await Faculty.create({
        name,
        facultyId,
        email: email || '',
        password,
        assignments: assignmentsArray,
        department: department || 'General',
        designation: designation || 'Lecturer'
      });

      console.log('✅ Faculty created in MongoDB:', facultyId);
      // Notify SSE clients
      try { broadcastEvent({ resource: 'faculty', action: 'create', data: { id: newFaculty._id.toString(), facultyId, name } }); } catch (e) { }

      return res.status(201).json(newFaculty);
    } catch (err) {
      console.error('Mongo Faculty Create Error:', err);
      return res.status(500).json({ error: 'Failed to create faculty' });
    }
  } catch (err) {
    console.error('Faculty creation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET Single Faculty (Public/Protected mixed use)
app.get('/api/faculty/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        const Faculty = require('./models/Faculty');
        // Try finding by facultyId (string) or _id (ObjectId)
        let faculty = await Faculty.findOne({ facultyId: id }).select('-password -facultyToken').lean();
        if (!faculty && mongoose.isValidObjectId(id)) {
          faculty = await Faculty.findById(id).select('-password -facultyToken').lean();
        }

        if (faculty) {
          return res.json({
            ...faculty,
            id: faculty.facultyId,
            _id: faculty._id.toString(),
            source: 'mongodb'
          });
        }
      } catch (e) {
        console.warn('Mongo faculty fetch error:', e);
      }
    }

    // 2. File Fallback
    const all = dbFile('faculty').read() || [];
    const faculty = all.find(f => f.facultyId === id || f.id === id);
    if (faculty) {
      // remove sensitivity
      const { password, facultyToken, ...rest } = faculty;
      return res.json({ ...rest, source: 'file' });
    }

    res.status(404).json({ error: 'Faculty not found' });
  } catch (err) {
    console.error('Get Faculty Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/faculty/:fid', requireAdmin, async (req, res) => {
  try {
    const fid = req.params.fid;
    const updates = req.body;

    // Require MongoDB for updates
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'MongoDB not connected. Cannot update faculty.' });
    }

    try {
      let updatedFaculty = await Faculty.findOneAndUpdate({ facultyId: fid }, updates, { new: true });
      if (!updatedFaculty) {
        updatedFaculty = await Faculty.findByIdAndUpdate(fid, updates, { new: true });
      }

      if (!updatedFaculty) return res.status(404).json({ error: 'faculty not found' });

      console.log('✅ Faculty updated in MongoDB:', fid);
      try { broadcastEvent({ resource: 'faculty', action: 'update', data: { id: updatedFaculty._id.toString(), facultyId: updatedFaculty.facultyId } }); } catch (e) { }
      return res.json(updatedFaculty);
    } catch (err) {
      console.error('Mongo Faculty Update Error:', err);
      return res.status(500).json({ error: 'Failed to update faculty' });
    }
  } catch (err) {
    console.error('Faculty update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/faculty/:fid', requireAdmin, async (req, res) => {
  try {
    const fid = req.params.fid;

    // Require MongoDB for delete
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'MongoDB not connected. Cannot delete faculty.' });
    }

    try {
      const FacultyModel = require('./models/Faculty');
      let faculty = await FacultyModel.findOne({ facultyId: fid });
      if (!faculty) faculty = await FacultyModel.findById(fid);
      if (!faculty) return res.status(404).json({ error: 'faculty not found' });

      await FacultyModel.deleteOne({ _id: faculty._id });
      console.log('✅ Faculty deleted from MongoDB:', fid);
      try { broadcastEvent({ resource: 'faculty', action: 'delete', data: { id: faculty._id.toString(), facultyId: fid } }); } catch (e) { }

      // Optionally clean up related collections (materials/messages) asynchronously
      try {
        const Material = require('./models/Material');
        await Material.deleteMany({ uploaderId: fid }).catch(() => { });
      } catch (e) { }

      try {
        const MessageModel = require('./models/Message');
        await MessageModel.deleteMany({ facultyId: fid }).catch(() => { });
      } catch (e) { }

      // Sync removal from File DB (Hybrid Persistence)
      try {
        const FacultyModel = require('./models/Faculty'); // redundant if up top but safe
        const fList = facultyDB.read() || [];
        const newFList = fList.filter(f => f.facultyId !== fid);
        if (fList.length !== newFList.length) {
          facultyDB.write(newFList);
        }
      } catch (e) { console.warn('File sync warning:', e.message); }

      return res.json({ message: 'Faculty removed' });
    } catch (err) {
      console.error('Faculty delete error:', err);
      return res.status(500).json({ error: 'Failed to delete faculty' });
    }
  } catch (err) {
    console.error('Faculty delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/faculty-stats/:facultyId/students', async (req, res) => {
  try {
    const { facultyId } = req.params;
    let assignments = [];

    // 1. Try MongoDB
    if (mongoose.connection.readyState === 1) {
      const faculty = await Faculty.findOne({ facultyId });
      if (faculty && faculty.assignments) assignments = faculty.assignments;
    }
    // 2. Fallback to File
    if (assignments.length === 0) {
      const fList = facultyDB.read();
      const f = fList.find(i => i.facultyId === facultyId);
      if (f && f.assignments) assignments = f.assignments;
    }

    if (assignments.length === 0) return res.json([]);

    // Get Students (Mongo + File)
    let allStudents = [];
    if (mongoose.connection.readyState === 1) {
      const queries = assignments.map(a => ({ year: String(a.year), section: String(a.section).toUpperCase() }));
      // Use $or for Mongo
      if (queries.length > 0) {
        const mongoStudents = await Student.find({ $or: queries }).select('-password').lean();
        allStudents = mongoStudents.map(s => ({ ...s, source: 'mongo' }));
      }
    }

    // Merge with File Students
    const fileStudents = studentsDB.read();
    const studentsFromFile = fileStudents.filter(s => {
      return assignments.some(a => String(s.year) === String(a.year) && String(s.section).toUpperCase() === String(a.section).toUpperCase());
    }).map(s => ({ ...s, source: 'file' }));

    // Dedup by SID
    const merged = [...allStudents, ...studentsFromFile];
    const unique = [];
    const seen = new Set();
    merged.forEach(s => {
      if (!seen.has(s.sid)) {
        seen.add(s.sid);
        unique.push(s);
      }
    });

    res.json(unique);
  } catch (err) { console.error('Faculty stats error:', err); res.status(500).json({ error: 'Stats error' }); }
});

app.get('/api/faculty-stats/:facultyId/materials-downloads', async (req, res) => {
  try {
    const { facultyId } = req.params;
    let materials = [];

    // 1. Try MongoDB
    if (mongoose.connection.readyState === 1 && Material) {
      try {
        const f = await Faculty.findOne({ facultyId });
        // Search by Mongo Object ID or Custom facultyId
        const query = f ? { $or: [{ uploadedBy: f._id }, { uploaderId: facultyId }] } : { uploaderId: facultyId };
        const mongoMats = await Material.find(query).lean();
        materials = mongoMats.map(m => ({ ...m, source: 'mongo' }));
      } catch (e) { console.warn("Mongo stats fetch failed", e); }
    }

    // 2. File Fallback (Merge)
    const fileMats = materialsDB.read() || [];
    const myFileMats = fileMats.filter(m => String(m.uploaderId) === String(facultyId)).map(m => ({ ...m, source: 'file' }));

    // Merge & Dedup
    const merged = [...materials, ...myFileMats];
    const unique = [];
    const seen = new Set();
    merged.forEach(m => {
      const id = m.id || m._id;
      if (!seen.has(String(id))) {
        seen.add(String(id));
        unique.push(m);
      }
    });

    res.json(unique);
  } catch (err) { res.status(500).json({ error: 'Stats error' }); }
});


// Admin Auth Endpoints
// admin auth endpoints
// [Admin Auth Routes removed (duplicates)]

// student auth endpoints
app.post('/api/students/login', async (req, res) => {
  try {
    const { sid, email, password } = req.body || {};
    const identifier = sid || email;
    if (!identifier || !password) return res.status(400).json({ error: 'missing credentials' });

    // 1. MongoDB Support
    if (mongoose.connection.readyState === 1 && Student) {
      try {
        const student = await Student.findOne({
          $or: [{ sid: identifier }, { email: identifier }]
        });
        if (student && student.password === password) {
          const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || 'your_jwt_secret');
          // Update student tokens and lastLogin
          student.studentToken = token;
          student.tokenIssuedAt = new Date();
          student.stats = student.stats || {};
          student.stats.lastLogin = new Date();
          await student.save();

          const studentWithRole = student.toObject();
          studentWithRole.role = 'student';

          try { global.broadcastEvent && global.broadcastEvent({ resource: 'students', action: 'update', data: studentWithRole }); } catch (e) { }

          return res.json({ ok: true, token, studentData: studentWithRole });
        }
      } catch (err) {
        console.error('Mongo Student Login Error:', err);
      }
    }
    return res.status(401).json({ error: 'invalid student credentials' });
  } catch (err) {
    console.error('Student login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/students/register', async (req, res) => {
  try {
    const { studentName, sid, email, year, section, branch, password, avatar } = req.body;
    if (!sid || !studentName || !password) return res.status(400).json({ error: 'missing required fields' });

    // 1. MongoDB Support
    if (mongoose.connection.readyState === 1 && Student) {
      try {
        const existing = await Student.findOne({ $or: [{ sid }, { email }] });
        if (existing) {
          if (existing.sid === sid) return res.status(409).json({ error: 'Student ID already exists' });
          if (existing.email === email) return res.status(409).json({ error: 'Email address already exists' });
        }

        const newStudent = await Student.create({
          studentName, sid, email, year, section, branch, password, avatar
        });

        // No file sync: MongoDB is the source of truth

        // AUTO-ANNOUNCEMENT: Notify Admin
        try {
          const notificationMsg = `New Student Joined: ${studentName} (${branch}-${year})`;
          const msgItem = {
            id: uuidv4(),
            message: notificationMsg,
            target: 'admin', // Internal target for admin
            type: 'system-alert',
            sender: 'SYSTEM',
            createdAt: new Date().toISOString()
          };
          // Write Msg to File
          const allMsgs = messagesDB.read() || [];
          allMsgs.unshift(msgItem);
          messagesDB.write(allMsgs);

          // Write Msg to Mongo
          try {
            const Message = require('./models/Message');
            await Message.create({ ...msgItem, createdAt: new Date() });
          } catch (e) { }
        } catch (e) { console.warn('Announcement trigger failed:', e); }

        const token = jwt.sign({ id: newStudent._id }, process.env.JWT_SECRET || 'your_jwt_secret');

        const studentWithRole = newStudent.toObject();
        studentWithRole.role = 'student';
        try { broadcastEvent({ resource: 'students', action: 'create', data: studentWithRole }); } catch (e) { }
        return res.status(201).json({
          ok: true,
          token,
          studentData: studentWithRole
        });
      } catch (err) {
        console.error('Mongo Student Register Error:', err);
      }
    }

    // 2. Fallback: File-based
    const arr = studentsDB.read();
    if (arr.find(s => s.sid === sid)) return res.status(409).json({ error: 'Student ID already exists' });

    const item = {
      id: uuidv4(),
      studentName,
      sid,
      email,
      year,
      section,
      branch,
      password,
      avatar,
      createdAt: new Date().toISOString()
    };
    arr.push(item);
    studentsDB.write(arr);
    try { broadcastEvent({ resource: 'students', action: 'create', data: item }); } catch (e) { }

    const token = jwt.sign({ id: item.sid }, process.env.JWT_SECRET || 'your_jwt_secret');
    const itemWithRole = { ...item, role: 'student' };

    res.status(201).json({
      ok: true,
      token,
      studentData: itemWithRole
    });
  } catch (err) {
    console.error('Student registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// faculty auth endpoints
app.post('/api/faculty/login', async (req, res) => {
  try {
    const { facultyId, password } = req.body || {};
    if (!facultyId || !password) return res.status(400).json({ error: 'missing credentials' });

    // 1. MongoDB Support
    if (mongoose.connection.readyState === 1 && Faculty) {
      try {
        const faculty = await Faculty.findOne({ facultyId });
        if (faculty && faculty.password === password) {
          const token = jwt.sign({ id: faculty._id }, process.env.JWT_SECRET || 'your_jwt_secret');
          faculty.facultyToken = token;
          faculty.tokenIssuedAt = new Date();
          await faculty.save();
          console.log('✅ Faculty logged in (MongoDB):', facultyId);

          return res.json({
            ok: true,
            token,
            facultyData: faculty
          });
        }
      } catch (err) {
        console.error('Mongo Faculty Login Error:', err);
      }
    }

    // If we reached here and MongoDB was connected but no faculty found, return invalid credentials
    return res.status(401).json({ error: 'invalid faculty credentials' });
  } catch (err) {
    console.error('Faculty login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/faculty/logout', requireFaculty, async (req, res) => {
  try {
    const token = req.headers['x-faculty-token'];
    if (mongoose.connection.readyState !== 1 || !Faculty) return res.status(503).json({ error: 'MongoDB not connected. Logout unavailable.' });
    await Faculty.findOneAndUpdate({ facultyToken: token }, { facultyToken: null, tokenIssuedAt: null });
    res.json({ ok: true });
  } catch (err) {
    console.error('Logout error:', err);
    res.json({ ok: true });
  }
});

// File-based material routes (commented out to use MongoDB)
/*
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Build safe folder path based on provided metadata: subject/module/unit/topic
      const subject = (req.body.subject || 'misc').toString().replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '_');
      const module = (req.body.module || '').toString().replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '_');
      const unit = (req.body.unit || '').toString().replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '_');
      const topic = (req.body.topic || '').toString().replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '_');
 
      // Compose relative path under uploadsDir
      let relPath = subject || 'misc';
      if (module) relPath = path.join(relPath, module);
      if (unit) relPath = path.join(relPath, unit);
      if (topic) relPath = path.join(relPath, topic);
 
      const dest = path.join(uploadsDir, relPath);
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    } catch (e) {
      cb(e, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });
*/

/*
app.get('/api/materials', (req, res) => {
  const { year, section, subject, type, course, branch } = req.query;
  const all = materialsDB.read();
  let filtered = all;
  if (year && year !== 'All') filtered = filtered.filter(m => String(m.year) === String(year));
  if (section && section !== 'All') filtered = filtered.filter(m => String(m.section) === String(section));
  if (branch && branch !== 'All') filtered = filtered.filter(m => m.branch === branch || !m.branch);
  if (subject) filtered = filtered.filter(m => String(m.subject) === String(subject));
  if (type) filtered = filtered.filter(m => String(m.type) === String(type));
  if (course) filtered = filtered.filter(m => String(m.course) === String(course));
  res.json(filtered);
});
 
app.post('/api/materials', upload.single('file'), (req, res) => {
  // ... existing code ...
});
*/

/*
app.get('/api/materials', (req, res) => {
  const { year, section, subject, type, course, branch } = req.query;
  const all = materialsDB.read();
  let filtered = all;
  if (year && year !== 'All') filtered = filtered.filter(m => String(m.year) === String(year));
  if (section && section !== 'All') filtered = filtered.filter(m => String(m.section) === String(section));
  if (branch && branch !== 'All') filtered = filtered.filter(m => m.branch === branch || !m.branch);
  if (subject) filtered = filtered.filter(m => String(m.subject) === String(subject));
  if (type) filtered = filtered.filter(m => String(m.type) === String(type));
  if (course) filtered = filtered.filter(m => String(m.course) === String(course));
  res.json(filtered);
});
 
app.post('/api/materials', upload.single('file'), (req, res) => {
  const { year, section, subject, type, title, link, dueDate, message, module, unit, course, branch } = req.body;
  if (!subject || !type) return res.status(400).json({ error: 'missing required fields: subject, type' });
  if (subject !== 'Advance Courses' && (!year || !section)) return res.status(400).json({ error: 'missing year or section for non-advance courses' });
 
  // Check if request is from admin or faculty
  const admin = adminDB.read() || {};
  const faculty = facultyDB.read() || [];
  const adminToken = req.headers['x-admin-token'];
  const facultyToken = req.headers['x-faculty-token'];
 
  let authorized = false;
  let uploaderType = null;
  let uploaderData = null;
 
  if (adminToken && admin.adminToken === adminToken) {
    authorized = true;
    uploaderType = 'admin';
  } else if (facultyToken) {
    const facultyMember = faculty.find(f => f.facultyToken === facultyToken);
    if (facultyMember) {
      // Check if faculty is assigned to this subject
      const isAssigned = facultyMember.assignments?.some(assignment =>
        assignment.subject === subject &&
        String(assignment.year) === String(year) &&
        (assignment.sections || []).includes(section)
      );
 
      if (isAssigned) {
        authorized = true;
        uploaderType = 'faculty';
        uploaderData = facultyMember;
      } else {
        // Log assignment check for debugging
        console.log('Faculty authorization check:', {
          facultyId: facultyMember.facultyId,
          requested: { subject, year, section },
          assignments: facultyMember.assignments
        });
        return res.status(403).json({
          error: 'Faculty not authorized for this subject/section combination',
          details: {
            facultyId: facultyMember.facultyId,
            requestedSubject: subject,
            requestedYear: year,
            requestedSection: section,
            facultyAssignments: facultyMember.assignments
          }
        });
      }
    }
  }
 
  if (!authorized) {
    return res.status(403).json({ error: 'unauthorized to upload for this subject/section' });
  }
 
  const all = materialsDB.read();
  const id = uuidv4();
  // Determine url path relative to /uploads
  let fileUrl = null;
  let filename = null;
  if (req.file) {
    // Use the file destination (relative to uploadsDir) to build the public URL
    filename = req.file.filename;
    const destRel = path.relative(uploadsDir, req.file.destination || uploadsDir).replace(/\\/g, '/');
    fileUrl = `/uploads/${destRel}/${req.file.filename}`.replace(/\/+/g, '/');
  } else if (link) {
    fileUrl = link;
  }
 
  const item = {
    id,
    title: title || (req.file ? req.file.originalname : ''),
    year: year || 'All',
    section: section || 'All',
    subject,
    type,
    course: course || null,
    branch: branch || null,
    module: module ? String(module) : null,
    unit: unit ? String(unit) : null,
    topic: req.body.topic || null,
    uploadedAt: new Date().toISOString(),
    filename: filename,
    url: fileUrl,
    originalName: req.file ? req.file.originalname : null,
    uploadedBy: uploaderType,
    uploaderId: uploaderData ? uploaderData.facultyId : null,
    uploaderName: uploaderData ? uploaderData.name : 'Admin'
  };
 
  // Add type-specific fields
  if (type === 'videos') {
    if (message) item.duration = message; // Store duration in message field
  } else if (type === 'modelPapers' || type === 'previousQuestions') {
    if (dueDate) item.examYear = dueDate; // Store exam year in dueDate field
    if (message) item.examType = message; // Store exam type in message field
  }
 
  all.push(item);
  materialsDB.write(all);
  res.status(201).json(item);
});
 
// faculty upload history (for faculty themselves)
app.get('/api/faculty/uploads', requireFaculty, (req, res) => {
  const all = materialsDB.read();
  const mine = all.filter(m => m.uploaderId === req.facultyData.facultyId);
  res.json(mine);
});
 
// admin view of a faculty's uploads
app.get('/api/faculty/:fid/uploads', requireAdmin, (req, res) => {
  const fid = req.params.fid;
  const all = materialsDB.read();
  const userUploads = all.filter(m => m.uploaderId === fid);
  res.json(userUploads);
});
 
// DELETE material (file-mode fallback). Admins can delete any; faculty can delete own uploads.
app.delete('/api/materials/:id', (req, res) => {
  try {
    console.log('[DELETE] headers:', { admin: req.headers['x-admin-token'] ? 'present' : 'missing', faculty: req.headers['x-faculty-token'] ? 'present' : 'missing' });
    console.log('[DELETE] params:', req.params);
    // If Mongo is connected and controller exists, defer to it
    if (mongoose.connection.readyState === 1 && typeof materialController !== 'undefined' && materialController.deleteMaterial) {
      return materialController.deleteMaterial(req, res);
    }
 
    const id = req.params.id;
    const all = materialsDB.read();
    const idx = all.findIndex(m => m.id === id || m._id === id);
    if (idx === -1) return res.status(404).json({ error: 'Material not found' });
 
    const material = all[idx];
 
    // Resolve user from request (support header tokens in file-mode)
    const user = req.user || authFromHeaders(req);
    if (!(user && (user.role === 'admin' || String(material.uploaderId) === String(user.id)))) {
      return res.status(401).json({ message: 'Not authorized' });
    }
 
    // Remove file if present under uploads
    try {
      if (material && material.fileUrl && String(material.fileUrl).startsWith('/uploads')) {
        const rel = String(material.fileUrl).replace(/^\/uploads\//, '').replace(/\//g, path.sep);
        const p = path.join(uploadsDir, rel);
        if (fs.existsSync(p)) {
          try { fs.unlinkSync(p); } catch (e) { console.warn('Failed to unlink file', p, e); }
        }
      } else if (material && material.filename) {
        const p2 = path.join(uploadsDir, material.filename);
        if (fs.existsSync(p2)) {
          try { fs.unlinkSync(p2); } catch (e) { console.warn('Failed to unlink file', p2, e); }
        }
      }
    } catch (e) { console.warn('Error while deleting material file:', e); }
 
    const next = all.filter((_, i) => i !== idx);
    materialsDB.write(next);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Delete material error:', err);
    return res.status(500).json({ error: 'Failed to delete material' });
  }
});
*/

// messages
// --- SYSTEM COMMUNICATIONS (Unified Transmission Mesh) ---

// Public/Combined Message Feed
app.get('/api/messages', async (req, res) => {
  try {
    let all = [];
    if (mongoose.connection.readyState === 1) {
      all = await Message.find().sort({ createdAt: -1 });
    } else {
      all = messagesDB.read();
    }
    res.json(all);
  } catch (err) {
    res.json(messagesDB.read());
  }
});

// Admin Strategic Message (Global/Students/Faculty)
app.post('/api/messages', requireAdmin, async (req, res) => {
  const { message, target, targetYear, targetSections, type } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  const item = {
    id: uuidv4(),
    message,
    target: target || 'all',
    targetYear: targetYear || null,
    targetSections: targetSections || [],
    type: type || 'announcement',
    sender: 'ADMIN CENTER',
    createdAt: new Date().toISOString()
  };

  // 1. JSON Persistence
  const all = messagesDB.read();
  all.unshift(item);
  messagesDB.write(all);

  // 2. MongoDB Persistence
  if (mongoose.connection.readyState === 1) {
    try { await Message.create(item); } catch (e) { console.warn('Mongo Message save failed'); }
  }

  res.status(201).json(item);
});

// Admin Global Announcement (Alternative)
app.post('/api/announcements', requireAdmin, async (req, res) => {
  const { message, target, year, section, subject, type } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  const item = {
    id: uuidv4(),
    message,
    target: target || 'all',
    type: type || 'announcements',
    targetYear: year || null,
    targetSections: section ? [section] : [],
    subject: subject || null,
    sender: 'ADMIN CENTER',
    createdAt: new Date().toISOString()
  };

  const all = messagesDB.read();
  all.unshift(item);
  messagesDB.write(all);

  if (mongoose.connection.readyState === 1) {
    try { await Message.create(item); } catch (e) { }
  }

  res.status(201).json(item);
});

// Faculty Section-wide Broadcast
app.post('/api/faculty/messages', requireFaculty, async (req, res) => {
  console.log('[MESH] Faculty Broadcast Attempted:', req.body.subject, 'from', req.user?.id);
  try {
    const { message, type, year, sections, subject } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    const faculty = req.user;

    // Determine target based on content or type
    // If it's an "urgent" alert from faculty, we ensure it's logged for Admin too
    const item = {
      id: uuidv4(),
      message,
      sender: faculty.name || `Prof. ${faculty.id}`,
      facultyId: faculty.id,
      target: 'students-specific', // Faculty targeting specific year/sections
      type: type || 'announcement',
      targetYear: year,
      targetSections: Array.isArray(sections) ? sections : [sections].filter(Boolean),
      subject: subject,
      createdAt: new Date().toISOString()
    };

    // 1. JSON Persistence
    const all = messagesDB.read();
    all.unshift(item);
    messagesDB.write(all);

    // 2. MongoDB Persistence
    if (mongoose.connection.readyState === 1) {
      try { await Message.create(item); } catch (e) { console.warn('Mongo Faculty Message save failed'); }
    }

    res.status(201).json({ ok: true, item });
  } catch (err) {
    console.error('Faculty broadcast error:', err);
    res.status(500).json({ error: 'Transmission failed' });
  }
});

app.delete('/api/messages/:id', requireAdmin, async (req, res) => {
  const id = req.params.id;
  const all = messagesDB.read();
  messagesDB.write(all.filter(m => m.id !== id));

  if (mongoose.connection.readyState === 1) {
    try { await Message.deleteOne({ id: id }); } catch (e) { }
  }
  res.json({ ok: true });
});




// courses/subjects routes
// courses/subjects routes (MongoDB)
app.get('/test', (req, res) => res.json({ ok: true }));
app.get('/api/courses', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const courses = await Course.find().sort({ createdAt: -1 });
      // Map to frontend expected format
      const mapped = courses.map(c => ({
        id: c._id,
        name: c.courseName,
        code: c.courseCode,
        year: c.year,
        semester: c.semester,
        branch: c.department,
        description: c.description
      }));
      return res.json(mapped);
    } else {
      res.json(coursesDB.read());
    }
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Content Source Helper
const contentSourceDir = path.join(uploadsDir, 'content_source');

// Recursive function to scan content source
const scanContentSource = (dir) => {
  if (!fs.existsSync(dir)) return [];

  const subjects = fs.readdirSync(dir).filter(f => {
    try { return fs.statSync(path.join(dir, f)).isDirectory(); } catch (e) { return false; }
  });

  return subjects.map(subject => {
    const subjectPath = path.join(dir, subject);
    let types = [];
    try {
      types = fs.readdirSync(subjectPath).filter(f => {
        try { return fs.statSync(path.join(subjectPath, f)).isDirectory(); } catch (e) { return false; }
      });
    } catch (e) { return { subject, types: [] }; }

    const mappedTypes = types.map(type => {
      const typePath = path.join(subjectPath, type);
      let chapters = [];
      try {
        chapters = fs.readdirSync(typePath).filter(f => {
          try { return fs.statSync(path.join(typePath, f)).isDirectory(); } catch (e) { return false; }
        });
      } catch (e) { return { type, chapters: [] }; }

      const mappedChapters = chapters.map(chapter => {
        const chapterPath = path.join(typePath, chapter);
        let files = [];
        try {
          files = fs.readdirSync(chapterPath).filter(f => {
            try { return !fs.statSync(path.join(chapterPath, f)).isDirectory(); } catch (e) { return false; }
          });
        } catch (e) { return { chapter, files: [] }; }

        // Sort files naturally (Chapter 1, Chapter 2, etc.) if possible, or just alpha
        return {
          chapter: chapter,
          files: files.map(f => {
            const fPath = path.join(chapterPath, f);
            const size = fs.existsSync(fPath) ? fs.statSync(fPath).size : 0;
            // Construct URL relative to server root
            // We need to encodeURI components to handle spaces/special chars
            const url = `/uploads/content_source/${encodeURIComponent(subject)}/${encodeURIComponent(type)}/${encodeURIComponent(chapter)}/${encodeURIComponent(f)}`;
            return { name: f, size, url };
          })
        };
      });

      // Also check for files directly in the Type folder (not in chapters) - though structure says chapters
      // But user might put files directly.

      return {
        type: type,
        chapters: mappedChapters.sort((a, b) => a.chapter.localeCompare(b.chapter, undefined, { numeric: true }))
      };
    });

    return {
      subject: subject,
      types: mappedTypes
    };
  });
};

app.get('/api/content-source', (req, res) => {
  try {
    const data = scanContentSource(contentSourceDir);
    res.json(data);
  } catch (err) {
    console.error('Error scanning content source:', err);
    res.status(500).json({ error: 'Failed to scan content source' });
  }
});

app.post('/api/courses', requireAdmin, async (req, res) => {
  try {
    const { name, code, year, semester, branch, description, credits } = req.body;

    console.log('[POST /api/courses] Request body:', req.body);

    // Validate required fields
    if (!name || !code || !year) {
      console.log('Failed to create course: Missing fields', req.body);
      return res.status(400).json({ error: 'Missing required fields: name, code, and year are required' });
    }

    if (mongoose.connection.readyState === 1) {
      // Check for existing course
      const existing = await Course.findOne({ courseCode: code });
      if (existing) {
        console.warn(`[POST /api/courses] Course code already exists: ${code}`);
        return res.status(409).json({ error: 'Course code already exists' });
      }

      const newCourse = new Course({
        courseName: name,
        courseCode: code,
        year: String(year),
        semester: String(semester || '1'),
        department: branch || 'Common',
        credits: Number(credits) || 3, // Ensure number
        description: description || ''
      });

      await newCourse.save();
      console.log('✅ Course created successfully in MongoDB:', code);

      return res.status(201).json({
        id: newCourse._id,
        name: newCourse.courseName,
        code: newCourse.courseCode,
        year: newCourse.year,
        semester: newCourse.semester,
        branch: newCourse.department,
        description: newCourse.description,
        credits: newCourse.credits
      });
    } else {
      // File-based fallback
      const arr = coursesDB.read();
      if (arr.find(c => c.code === code)) {
        console.warn(`[POST /api/courses] Course code already exists (FileDB): ${code}`);
        return res.status(409).json({ error: 'Course code already exists' });
      }
      const item = {
        id: uuidv4(),
        name,
        code,
        year,
        semester: semester || '1',
        branch: branch || 'Common',
        description: description || '',
        credits: Number(credits) || 3,
        createdAt: new Date().toISOString()
      };
      arr.push(item);
      coursesDB.write(arr);
      console.log('✅ Course created successfully in File DB:', code);
      res.status(201).json(item);
    }
  } catch (err) {
    console.error('❌ Error creating course:', err);
    if (err.name === 'ValidationError') {
      const validationMsgs = Object.keys(err.errors).map(k => err.errors[k].message);
      console.error('Mongoose Validation Details:', validationMsgs);
      return res.status(400).json({
        error: `Validation failed: ${validationMsgs.join(', ')}`,
        details: validationMsgs
      });
    }
    res.status(500).json({
      error: `Failed to create course: ${err.message || 'Unknown server error'}`,
      details: err.message || 'Unknown server error'
    });
  }
});

app.put('/api/courses/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, year, semester, branch, description } = req.body;

    if (mongoose.connection.readyState === 1) {
      const updateData = {};
      if (name) updateData.courseName = name;
      if (code) updateData.courseCode = code;
      if (year) updateData.year = String(year);
      if (semester) updateData.semester = String(semester);
      if (branch) updateData.department = branch;
      if (description) updateData.description = description;

      const updated = await Course.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) return res.status(404).json({ error: 'Course not found' });

      return res.json({
        id: updated._id,
        name: updated.courseName,
        code: updated.courseCode,
        year: updated.year,
        semester: updated.semester,
        branch: updated.department,
        description: updated.description
      });
    } else {
      const arr = coursesDB.read();
      const idx = arr.findIndex(c => c.id === id);
      if (idx === -1) return res.status(404).json({ error: 'course not found' });
      arr[idx] = { ...arr[idx], ...req.body };
      coursesDB.write(arr);
      res.json(arr[idx]);
    }
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

app.delete('/api/courses/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      await Course.findByIdAndDelete(id);
    }

    // Always sync file
    const arr = coursesDB.read();
    coursesDB.write(arr.filter(c => c.id !== id));
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// subjects routes (alias for courses)
// subjects routes (alias for courses)
app.get('/api/subjects', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const courses = await Course.find().sort({ createdAt: -1 });
      const mapped = courses.map(c => ({
        id: c._id,
        name: c.courseName,
        code: c.courseCode,
        year: c.year,
        semester: c.semester,
        branch: c.department,
        sections: [],
        description: c.description
      }));
      return res.json(mapped);
    }
    res.json(coursesDB.read());
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

app.post('/api/subjects', requireAdmin, async (req, res) => {
  try {
    const { name, code, year, semester, branch, sections, description, credits } = req.body;
    if (!name || !code || !year) return res.status(400).json({ error: 'missing required fields' });

    // 1. Try MongoDB
    if (mongoose.connection.readyState === 1) {
      const existing = await Course.findOne({ courseCode: code });
      if (existing) return res.status(409).json({ error: 'Subject code already exists' });

      const newCourse = await Course.create({
        courseName: name,
        courseCode: code,
        year: String(year),
        semester: String(semester || '1'),
        department: branch || 'Common',
        description: description || '',
        credits: Number(credits) || 3 // Default credits to 3 if missing
      });
      return res.status(201).json({ ...newCourse.toObject(), id: newCourse._id });
    }

    // 2. Fallback File
    const arr = coursesDB.read();
    if (arr.find(s => s.code === code)) return res.status(409).json({ error: 'subject code exists' });
    const item = { id: uuidv4(), name, code, year, semester, branch, sections: sections || [], description, credits: Number(credits) || 3, createdAt: new Date().toISOString() };
    arr.push(item);
    coursesDB.write(arr);
    res.status(201).json(item);
  } catch (e) {
    console.error("Subject create error:", e);
    // Return detailed error if it's a validation error
    if (e.name === 'ValidationError') {
      return res.status(400).json({ error: e.message });
    }
    res.status(500).json({ error: "Failed to save subject" });
  }
});

app.put('/api/subjects/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    // 1. Mongo
    if (mongoose.connection.readyState === 1) {
      const updated = await Course.findByIdAndUpdate(id, {
        courseName: req.body.name,
        courseCode: req.body.code,
        year: req.body.year,
        semester: req.body.semester,
        department: req.body.branch,
        description: req.body.description,
        credits: Number(req.body.credits) || 3
      }, { new: true });
      if (updated) return res.json(updated);
    }

    // 2. File
    const arr = coursesDB.read();
    const idx = arr.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'subject not found' });
    arr[idx] = { ...arr[idx], ...req.body };
    coursesDB.write(arr);
    res.json(arr[idx]);
  } catch (e) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete('/api/subjects/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    // 1. Mongo
    if (mongoose.connection.readyState === 1) {
      await Course.findByIdAndDelete(id);
      // Fall through to file sync
    }
    // 2. File
    const arr = coursesDB.read();
    coursesDB.write(arr.filter(s => s.id !== id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// 404 Catch-all for API
app.use('/api/*', (req, res) => {
  console.warn(`[NOT_FOUND] Handled API Request for: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'API route not found', method: req.method, path: req.url });
});

// root route
app.get('/', (req, res) => {
  res.json({
    message: 'Friendly College Management System API',
    version: '1.0.0',
    endpoints: {
      students: '/api/students',
      faculty: '/api/faculty',
      materials: '/api/materials',
      messages: '/api/messages',
      announcements: '/api/announcements',
      courses: '/api/courses',
      subjects: '/api/subjects',
      admin: '/api/admin',
      chat: '/api/chat'
    },
    documentation: 'This is the API server. Frontend is served separately on port 3000.'
  });
});

// Initialize and start server
const initializeApp = async () => {
  try {
    console.log('Starting initializeApp...');
    // Connect to MongoDB early so routes depending on DB are available
    try {
      const dbConnected = await connectDB();
      if (!dbConnected) {
        console.warn('⚠️ MongoDB connection failed. Server will start but some routes will be read-only or return 503.');
      } else {
        console.log('✅ MongoDB is connected. Full functionality enabled.');
      }
    } catch (e) {
      console.error('Unexpected error while connecting to MongoDB:', e);
    }

    const PORT = process.env.PORT || 5000;
    console.log(`Attempting to listen on port ${PORT}...`);
    server = app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log(`🌍 Access the API at http://localhost:${PORT}`);
      console.log('Server started successfully, testing...');
      console.log('Server listening callback executed');
    });
    console.log('server.listen called, server object created:', !!server);

    server.on('error', (err) => {
      console.error('Server listen error:', err.message);
      console.error('Error code:', err.code);
      if (err.code === 'EADDRINUSE') console.error(`Port ${PORT} already in use`);
      // Don't exit the process here to allow debugging and recovery
      // process.exit(1);
    });

    console.log('initializeApp completed without errors');
  } catch (error) {
    console.error('Error in initializeApp:', error);
  }
};

if (require.main === module) {
  initializeApp().catch((err) => {
    console.error('Failed to initialize app:', err);
    // Keep process alive for debugging
  });
}

module.exports = app; // For testing


// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  console.error('Stack:', err.stack);
  // Do not exit to allow inspection; in production consider restarting the process manager
  // process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
  console.error('Stack:', err.stack);
  // Close server & exit process
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
