const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: String,
  code: String,
  branch: String, // 'CSE', 'ECE', 'Common', 'All'
  semester: String, // '1', '2', ...
  year: String, // '1', '2', '3', '4'
  credits: Number,
  type: String, // 'core', 'lab', 'elective'

  // Structure
  modules: [{
    id: String,
    name: String,
    units: [{
      id: String,
      name: String,
      topics: [{
        id: String,
        name: String
      }]
    }]
  }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema, 'AdminDashboardDB_Sections_Courses');
