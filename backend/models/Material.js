const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true },

  // Categorization
  year: { type: String, default: '1' },
  branch: { type: String, default: 'Common' },
  section: { type: String, default: 'All' },
  semester: { type: String, default: '1' },
  subject: { type: String, required: true },

  module: { type: String, default: '1' },
  unit: { type: String, default: '1' },
  topic: { type: String, default: 'General Topics' },

  // Content
  type: { type: String, required: true }, // 'notes', 'videos', 'assignment', 'syllabus', 'modelPapers'
  url: { type: String, required: true },
  description: String,

  // Metadata
  uploadedBy: { type: String, default: 'admin' }, // 'admin' or facultyId
  facultyName: String,
  createdAt: { type: Date, default: Date.now },

  // Stats
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 }
});

module.exports = mongoose.model('Material', materialSchema, 'AdminDashboardDB_Sections_Materials');
