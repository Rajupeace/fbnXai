// require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

// Import routes - COMMENTED OUT FOR TESTING
// const teachingAssignmentRoutes = require('./routes/teachingAssignmentRoutes');
// const materialController = require('./controllers/materialController');
// const { protect } = require('./middleware/authMiddleware');

// Connect to MongoDB with better error handling - COMMENTED OUT FOR TESTING
// const connectDB = require('./config/db');
// const Course = require('./models/Course');
// const Faculty = require('./models/Faculty');
// const Student = require('./models/Student');
// const Admin = require('./models/Admin');

// Global server variable to ensure access in error handlers
let server;

app.use(cors());
app.use(express.json());

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Initialize database connection and start server
const initializeApp = async () => {
  // Start the server IMMEDIATELY to prevent frontend proxy errors
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`🌍 Access the API at http://localhost:${PORT}`);
  });

  // Database connection commented out for testing
  // connectDB().then(async (useMongoDB) => {
  //   if (!useMongoDB) {
  //     console.error('❌ CRITICAL: Failed to connect to MongoDB.');
  //     console.error('🛑 usage of local file storage is disabled. Please check MONGO_URI in .env');
  //     process.exit(1); // Force exit
  //   } else {
  //     console.log('✅ Database connected successfully');
  //   }
  // }).catch((err) => {
  //   console.error('Database connection callback error:', err);
  //   process.exit(1);
  // });

  // Handle server errors
  server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
};

// Start the application
initializeApp().catch((err) => {
  console.error('Failed to initialize app:', err);
  process.exit(1);
});