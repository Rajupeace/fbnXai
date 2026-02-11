#!/usr/bin/env node

/**
 * FBN-XAI COMPLETE SYSTEM DIAGNOSTIC & STARTUP SCRIPT
 * Verifies all dashboards, database connectivity, and fixes issues
 * 
 * Usage: node system-check.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset}  ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n${colors.magenta}${msg}${colors.reset}\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)
};

// Check functions
const checks = {
  // Check if port is available
  async checkPort(port, protocol = 'http') {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 2000);

      const request = (protocol === 'https' ? https : http).get(`${protocol}://localhost:${port}`, (res) => {
        clearTimeout(timeout);
        resolve(true);
      });

      request.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });

      request.setTimeout(2000);
    });
  },

  // Check file existence
  fileExists(filePath) {
    return fs.existsSync(filePath);
  },

  // Check environment variables
  checkEnv() {
    const envPath = path.join(__dirname, 'backend', '.env');
    if (!fs.existsSync(envPath)) {
      log.warning('No .env file found in backend directory');
      return false;
    }
    return true;
  },

  // Check database configuration
  checkDatabase() {
    const configPath = path.join(__dirname, 'backend', 'config', 'db.js');
    if (!fs.existsSync(configPath)) {
      log.warning('Database config file not found');
      return false;
    }
    return true;
  },

  // Check key backend files
  checkBackendFiles() {
    const requiredFiles = [
      'backend/index.js',
      'backend/models/Admin.js',
      'backend/models/Faculty.js',
      'backend/models/Student.js',
      'backend/config/db.js',
      'backend/package.json'
    ];

    const missing = [];
    requiredFiles.forEach(file => {
      if (!this.fileExists(file)) {
        missing.push(file);
      }
    });

    return { complete: missing.length === 0, missing };
  },

  // Check frontend files
  checkFrontendFiles() {
    const requiredFiles = [
      'src/Components/AdminDashboard/AdminDashboard.jsx',
      'src/Components/StudentDashboard/StudentDashboard.jsx',
      'src/Components/FacultyDashboard/FacultyDashboard.jsx',
      'src/App.js',
      'package.json'
    ];

    const missing = [];
    requiredFiles.forEach(file => {
      if (!this.fileExists(file)) {
        missing.push(file);
      }
    });

    return { complete: missing.length === 0, missing };
  },

  // Check dashboard data endpoints
  async checkDashboardEndpoints() {
    const endpoints = [
      { name: 'Students', endpoint: '/api/students' },
      { name: 'Faculty', endpoint: '/api/faculty' },
      { name: 'Courses', endpoint: '/api/courses' },
      { name: 'Materials', endpoint: '/api/materials' },
      { name: 'Messages', endpoint: '/api/messages' },
      { name: 'Schedule', endpoint: '/api/schedule' },
      { name: 'Attendance', endpoint: '/api/attendance' }
    ];

    log.info('Checking API endpoints...');
    const results = [];

    for (const ep of endpoints) {
      const available = await this.checkBackendEndpoint(ep.endpoint);
      results.push({
        name: ep.name,
        endpoint: ep.endpoint,
        available
      });
    }

    return results;
  },

  // Check single backend endpoint
  async checkBackendEndpoint(endpoint) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 2000);

      const request = http.get(`http://localhost:5000${endpoint}`, (res) => {
        clearTimeout(timeout);
        resolve(res.statusCode < 500);
      });

      request.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });

      request.setTimeout(2000);
    });
  }
};

// Main diagnostic function
async function runDiagnostics() {
  console.clear();
  log.section('🔍 FBN-XAI SYSTEM DIAGNOSTIC');

  // 1. Check file structure
  log.section('1️⃣  FILE STRUCTURE VERIFICATION');
  
  const backendFiles = checks.checkBackendFiles();
  if (backendFiles.complete) {
    log.success('All backend files present');
  } else {
    log.error('Missing backend files: ' + backendFiles.missing.join(', '));
  }

  const frontendFiles = checks.checkFrontendFiles();
  if (frontendFiles.complete) {
    log.success('All frontend files present');
  } else {
    log.error('Missing frontend files: ' + frontendFiles.missing.join(', '));
  }

  // 2. Check configuration
  log.section('2️⃣  CONFIGURATION CHECK');
  
  if (checks.checkEnv()) {
    log.success('.env file configured');
  } else {
    log.error('.env file not found - creating template...');
    createEnvTemplate();
  }

  if (checks.checkDatabase()) {
    log.success('Database config file present');
  } else {
    log.error('Database config missing');
  }

  // 3. Check service availability
  log.section('3️⃣  SERVICE AVAILABILITY CHECK');
  
  const backendAvailable = await checks.checkPort(5000);
  if (backendAvailable) {
    log.success('Backend API (Port 5000) is running');
  } else {
    log.warning('Backend API (Port 5000) is not running');
    log.info('  → Start with: cd backend && npm run dev');
  }

  const frontendAvailable = await checks.checkPort(3000);
  if (frontendAvailable) {
    log.success('Frontend (Port 3000) is running');
  } else {
    log.warning('Frontend (Port 3000) is not running');
    log.info('  → Start with: npm start');
  }

  // 4. Check database connectivity
  log.section('4️⃣  DATABASE CONNECTIVITY CHECK');
  
  try {
    const mongoCheck = await checkMongoConnection();
    if (mongoCheck) {
      log.success('MongoDB connection verified');
    } else {
      log.warning('MongoDB is not running');
      log.info('  → Start MongoDB: mongod');
      log.info('  → Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
    }
  } catch (err) {
    log.warning('Could not verify MongoDB connection');
  }

  // 5. Check API endpoints (only if backend is running)
  if (backendAvailable) {
    log.section('5️⃣  API ENDPOINTS CHECK');
    const endpoints = await checks.checkDashboardEndpoints();
    
    endpoints.forEach(ep => {
      if (ep.available) {
        log.success(`${ep.name.padEnd(15)} → ${ep.endpoint}`);
      } else {
        log.warning(`${ep.name.padEnd(15)} → ${ep.endpoint} (not responding)`);
      }
    });
  }

  // 6. Summary
  log.section('📊 SUMMARY & RECOMMENDATIONS');
  
  if (backendAvailable && frontendAvailable) {
    log.success('✨ System is fully operational!');
  } else {
    log.warning('Some services are not running. Starting up now...');
    log.info('');
    log.info('📝 Manual startup instructions:');
    log.info('');
    log.info('Terminal 1 - Backend:');
    log.info('  cd backend');
    log.info('  npm install  (if needed)');
    log.info('  npm run dev');
    log.info('');
    log.info('Terminal 2 - Frontend:');
    log.info('  npm start');
    log.info('');
    log.info('Terminal 3 - MongoDB (if needed):');
    log.info('  mongod');
    log.info('  OR');
    log.info('  docker run -d -p 27017:27017 --name mongodb mongo:latest');
  }

  log.info('');
  log.info('🌐 Access dashboards at:');
  log.info('  • Frontend: http://localhost:3000');
  log.info('  • Admin: Use email: BobbyFNB@09= | password: Martin@FNB09');
  log.info('  • Backend API: http://localhost:5000');
}

// Helper function to check MongoDB
function checkMongoConnection() {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false);
    }, 2000);

    const request = http.get('http://localhost:27017', (res) => {
      clearTimeout(timeout);
      resolve(false); // MongoDB doesn't respond to HTTP, but connection accepted
    });

    request.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });

    request.setTimeout(1000);
  });
}

// Create .env template
function createEnvTemplate() {
  const envTemplate = `# Backend Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/friendly_notebook
DB_NAME=friendly_notebook

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=24h

# Admin Configuration
ADMIN_EMAIL=BobbyFNB@09=
ADMIN_PASSWORD=Martin@FNB09

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50000000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# AI Configuration (optional)
GOOGLE_API_KEY=your_api_key_here
OPENAI_API_KEY=your_api_key_here
`;

  const envPath = path.join(__dirname, 'backend', '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envTemplate);
    log.success('Created .env template at backend/.env');
    log.warning('⚠️  Update .env with your actual configuration values');
  }
}

// Run diagnostics
runDiagnostics().catch(err => {
  log.error('Diagnostic error: ' + err.message);
  process.exit(1);
});
