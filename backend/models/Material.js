const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,

  // Categorization
  year: { type: String, default: '1' },
  branch: { type: String, default: 'All' },
  semester: { type: String, default: '1' },
  section: { type: mongoose.Schema.Types.Mixed, default: 'All' }, // String 'All' or Array ['A', 'B']
  subject: { type: String, required: true },

  // Link to Course model (Optional)
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },

  // Organizational Hierarchy
  module: { type: String, default: '1' },
  unit: { type: String, default: '1' },
  topic: { type: String, default: 'General Topics' },

  // Content Information
  type: { type: String, required: true }, // 'notes', 'videos', 'assignment', 'syllabus', 'modelPapers', 'interviewQnA'
  isAdvanced: { type: Boolean, default: false },

  // URLs (unifying fileUrl and url)
  fileUrl: { type: String, required: true },
  url: String, // Mirror or external link

  fileType: String,
  fileSize: Number,

  // Metadata
  uploadedBy: { type: mongoose.Schema.Types.Mixed }, // Can be ObjectId or String 'admin'
  facultyName: String,
  createdAt: { type: Date, default: Date.now },

  // Interaction Stats
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 }
});

// Middleware to sync url and fileUrl
materialSchema.pre('save', function (next) {
  if (!this.url) this.url = this.fileUrl;
  if (!this.fileUrl) this.fileUrl = this.url;
  next();
});

module.exports = mongoose.model('Material', materialSchema, 'AdminDashboardDB_Sections_Materials');
