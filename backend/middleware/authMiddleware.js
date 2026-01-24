const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
// Project uses `Student.js` as the user model; require it here
const User = require('../models/Student');
const Faculty = require('../models/Faculty');
const Admin = require('../models/Admin');


// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    // Check for custom headers
    token = req.headers['x-student-token'] || req.headers['x-faculty-token'] || req.headers['x-admin-token'];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const id = decoded.id; // User ID from token

    // 1. Try MongoDB
    // 1. Try MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        // A. Student Check
        // Try finding by _id (if valid ObjectId) OR sid/email
        if (mongoose.Types.ObjectId.isValid(id)) {
          req.user = await User.findById(id).select('-password');
        }
        if (!req.user) {
          req.user = await User.findOne({ sid: id }).select('-password');
        }
        if (req.user) req.user.role = 'student';

        // B. Faculty Check
        if (!req.user) {
          if (mongoose.Types.ObjectId.isValid(id)) {
            req.user = await Faculty.findById(id).select('-password');
          }
          if (!req.user) {
            req.user = await Faculty.findOne({ facultyId: id }).select('-password');
          }
          if (req.user) req.user.role = 'faculty';
        }

        // C. Admin Check
        if (!req.user) {
          if (mongoose.Types.ObjectId.isValid(id)) {
            req.user = await Admin.findById(id).select('-password');
          }
          if (!req.user) {
            req.user = await Admin.findOne({ adminId: id }).select('-password');
          }
          if (req.user) req.user.role = 'admin';
        }
      } catch (mongoErr) {
        console.warn('Mongo Auth Lookup Failed:', mongoErr.message);
      }
    }

    // No file-based fallback: if not found in MongoDB, deny access

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized: User not found' });
    }

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// Middleware to check if user is faculty
const faculty = (req, res, next) => {
  if (req.user && (req.user.role === 'faculty' || req.user.isAdmin)) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as faculty' });
  }
};

module.exports = { protect, admin, faculty };
