const jwt = require('jsonwebtoken');
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
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');
    
    // If not a student, check if it's a faculty
    if (!req.user) {
      req.user = await Faculty.findById(decoded.id).select('-password');
      if (req.user) req.user.role = 'faculty';
    } else {
      req.user.role = 'student';
    }

    // Check if admin
    if (!req.user) {
      req.user = await Admin.findById(decoded.id).select('-password');
      if (req.user) req.user.role = 'admin';
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    next();
  } catch (error) {
    console.error(error);
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
