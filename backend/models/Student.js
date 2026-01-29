const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  sid: {
    type: String,
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  phone: String,
  address: String,
  profileImage: String,
  avatar: String,
  studentToken: String,
  tokenIssuedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // New Stats Fields for Dashboards
  stats: {
    streak: { type: Number, default: 0 },
    lastLogin: { type: Date },
    aiUsageCount: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    advancedProgress: { type: Number, default: 0 }, // % completed
    careerReadyScore: { type: Number, default: 0 }, // Combined metric
    totalClasses: { type: Number, default: 0 },
    totalPresent: { type: Number, default: 0 },
    weeklyActivity: [
      { day: { type: String, default: 'Mon' }, hours: { type: Number, default: 0 } },
      { day: { type: String, default: 'Tue' }, hours: { type: Number, default: 0 } },
      { day: { type: String, default: 'Wed' }, hours: { type: Number, default: 0 } },
      { day: { type: String, default: 'Thu' }, hours: { type: Number, default: 0 } },
      { day: { type: String, default: 'Fri' }, hours: { type: Number, default: 0 } },
      { day: { type: String, default: 'Sat' }, hours: { type: Number, default: 0 } },
      { day: { type: String, default: 'Sun' }, hours: { type: Number, default: 0 } }
    ]
  },
  // Progress Tracking
  roadmapProgress: {
    type: Map,
    of: [String], // Map<RoadmapSlug, Array<TopicName>>
    default: {}
  }
});

// Update the updatedAt field before saving
studentSchema.pre('save', function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Student', studentSchema, 'AdminDashboardDB_Sections_Students');
