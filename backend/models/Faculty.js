const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  facultyId: { type: String, required: true, unique: true },
  email: { type: String, default: '' },
  password: { type: String, required: true },
  designation: { type: String, default: 'Lecturer' },
  department: { type: String, default: 'General' },
  phone: String,

  // Teaching assignments for easier lookup
  assignments: [{
    year: String,
    section: String,
    subject: String
  }],

  // Stats
  lastLogin: Date,
  totalClasses: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Faculty', facultySchema, 'AdminDashboardDB_Sections_Faculty');
