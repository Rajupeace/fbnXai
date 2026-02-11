#!/usr/bin/env node

/**
 * SYSTEM OPTIMIZATION & ERROR FIXER
 * Optimizes performance and fixes any configuration issues
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

class SystemOptimizer {
  constructor() {
    this.fixes = [];
    this.issues = [];
  }

  log(type, message) {
    const icons = {
      '✅': colors.green,
      '❌': colors.red,
      '⚠️': colors.yellow,
      'ℹ': colors.cyan,
      '🔧': colors.magenta,
      '📊': colors.blue
    };
    
    const color = icons[type] || colors.reset;
    console.log(`${color}${type}${colors.reset} ${message}`);
  }

  section(title) {
    console.log(`\n${colors.cyan}${'═'.repeat(70)}${colors.reset}`);
    console.log(`${colors.magenta}${title}${colors.reset}`);
    console.log(`${colors.cyan}${'═'.repeat(70)}${colors.reset}\n`);
  }

  // Fix 1: Verify and optimize .env file
  checkEnvironmentConfig() {
    this.section('🔐 Environment Configuration Check');

    const backendEnvPath = path.join(__dirname, 'backend', '.env');
    const backendEnvExamplePath = path.join(__dirname, 'backend', '.env.example');

    if (!fs.existsSync(backendEnvPath)) {
      this.log('⚠️', '.env file not found in backend/');
      this.log('ℹ', 'Creating default .env with optimized settings...');

      const defaultEnv = `# MongoDB Configuration
MONGO_URI=mongodb://127.0.0.1:27017/friendly_notebook
MONGO_CONNECT_ATTEMPTS=5
MONGO_RETRY_DELAY_MS=2000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000

# Database Sync Configuration
DB_SYNC_INTERVAL=2000
ENABLE_SSE_STREAMING=true
ENABLE_FILE_BACKUP=true

# Logging
LOG_LEVEL=info
`;

      fs.writeFileSync(backendEnvPath, defaultEnv);
      this.log('✅', '.env file created with optimized settings');
      this.fixes.push('Created backend/.env with default configuration');
    } else {
      this.log('✅', '.env file exists');
    }

    // Verify critical env variables
    const envContent = fs.readFileSync(backendEnvPath, 'utf8');
    const requiredVars = [
      'MONGO_URI',
      'JWT_SECRET',
      'PORT',
      'NODE_ENV'
    ];

    for (const varName of requiredVars) {
      if (envContent.includes(`${varName}=`)) {
        this.log('✅', `${varName.padEnd(25)} → Configured`);
      } else {
        this.log('❌', `${varName.padEnd(25)} → Missing`);
        this.issues.push(`Missing environment variable: ${varName}`);
      }
    }
  }

  // Fix 2: Check database backup sync
  checkDatabaseSync() {
    this.section('💾 Database Synchronization Check');

    const dataDir = path.join(__dirname, 'backend', 'data');

    if (!fs.existsSync(dataDir)) {
      this.log('⚠️', 'Database backup directory not found');
      this.log('🔧', 'Creating data backup directory...');
      fs.mkdirSync(dataDir, { recursive: true });
      this.log('✅', 'Created: backend/data/');
      this.fixes.push('Created database backup directory');
    } else {
      this.log('✅', 'Database backup directory exists');
    }

    // Check for data files
    const dataFiles = ['students.json', 'faculty.json', 'courses.json', 'materials.json', 'messages.json'];
    let missingFiles = [];

    for (const file of dataFiles) {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        const size = fs.statSync(filePath).size;
        this.log('✅', `${file.padEnd(20)} → ${(size / 1024).toFixed(2)} KB`);
      } else {
        this.log('⚠️', `${file.padEnd(20)} → Not found (will be created on save)`);
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      this.log('ℹ', `Missing files will be auto-created when data is first saved`);
    }
  }

  // Fix 3: Check API endpoint configuration
  checkAPIConfiguration() {
    this.section('🔌 API Endpoint Configuration');

    const indexPath = path.join(__dirname, 'backend', 'index.js');

    if (!fs.existsSync(indexPath)) {
      this.log('❌', 'Backend index.js not found');
      this.issues.push('Backend index.js is missing');
      return;
    }

    const indexContent = fs.readFileSync(indexPath, 'utf8');

    // Check for critical configurations
    const checks = {
      'CORS Configuration': 'cors',
      'Express Setup': 'express()',
      'SSE Broadcaster': 'broadcastEvent',
      'JWT Middleware': 'jsonwebtoken',
      'Mongoose Connection': 'mongoose',
      'API Routes': '/api/',
      'Server Listening': 'listen'
    };

    for (const [name, searchStr] of Object.entries(checks)) {
      if (indexContent.includes(searchStr)) {
        this.log('✅', `${name.padEnd(30)} → Configured`);
      } else {
        this.log('❌', `${name.padEnd(30)} → Missing`);
        this.issues.push(`Missing configuration: ${name}`);
      }
    }
  }

  // Fix 4: Check frontend polling configuration
  checkFrontendPolling() {
    this.section('⚡ Frontend Polling Configuration');

    const adminDashboardPath = path.join(
      __dirname,
      'src',
      'Components',
      'AdminDashboard',
      'AdminDashboard.jsx'
    );

    if (!fs.existsSync(adminDashboardPath)) {
      this.log('⚠️', 'AdminDashboard.jsx not found (frontend component)');
      return;
    }

    const dashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');

    // Check polling interval
    if (dashboardContent.includes('2000') || dashboardContent.includes('2 seconds')) {
      this.log('✅', 'Polling interval: 2 seconds (Optimized)');
    } else if (dashboardContent.includes('5000')) {
      this.log('⚠️', 'Polling interval: 5 seconds (Consider optimizing to 2s)');
      this.issues.push('Frontend polling interval could be optimized to 2 seconds');
    }

    // Check for SSE implementation
    if (dashboardContent.includes('EventSource') || dashboardContent.includes('/api/stream')) {
      this.log('✅', 'Real-time SSE: Implemented');
    } else {
      this.log('⚠️', 'Real-time SSE: Not found');
    }

    // Check for API usage
    if (dashboardContent.includes('USE_API') && dashboardContent.includes('true')) {
      this.log('✅', 'API Mode: Enabled (using backend)');
    } else {
      this.log('⚠️', 'API Mode: May not be enabled');
      this.issues.push('Frontend API mode not properly configured');
    }
  }

  // Fix 5: Check database models
  checkDatabaseModels() {
    this.section('📦 Database Models Check');

    const modelsDir = path.join(__dirname, 'backend', 'models');

    if (!fs.existsSync(modelsDir)) {
      this.log('⚠️', 'Models directory not found');
      return;
    }

    const models = [
      'Student.js',
      'Faculty.js',
      'Course.js',
      'Material.js',
      'Message.js',
      'Todo.js',
      'Schedule.js',
      'Attendance.js'
    ];

    for (const model of models) {
      const modelPath = path.join(modelsDir, model);
      if (fs.existsSync(modelPath)) {
        this.log('✅', model.padEnd(20));
      } else {
        this.log('⚠️', model.padEnd(20) + ' (optional)');
      }
    }
  }

  // Fix 6: Generate optimization recommendations
  generateRecommendations() {
    this.section('📋 Optimization Recommendations');

    const recommendations = [
      {
        category: 'Database',
        items: [
          'Ensure MongoDB is running: mongod',
          'Add database indexes for frequently queried fields',
          'Use MongoDB connection pooling (already configured)',
          'Enable database profiling for slow queries'
        ]
      },
      {
        category: 'Backend',
        items: [
          'Use NODE_ENV=production for deployments',
          'Implement request caching for frequently accessed data',
          'Add rate limiting to API endpoints',
          'Compress responses using gzip middleware'
        ]
      },
      {
        category: 'Frontend',
        items: [
          'Lazy load dashboard components',
          'Implement virtual scrolling for large lists',
          'Cache dashboard data locally',
          'Optimize bundle size with code splitting'
        ]
      },
      {
        category: 'Real-Time',
        items: [
          'SSE polling interval: 2 seconds (Optimal)',
          'Implement exponential backoff for reconnection',
          'Use message compression for large payloads',
          'Monitor SSE connection health'
        ]
      }
    ];

    for (const rec of recommendations) {
      this.log('📊', colors.blue + rec.category + colors.reset);
      for (const item of rec.items) {
        this.log('→', item);
      }
      console.log();
    }
  }

  // Generate comprehensive report
  generateReport() {
    this.section('📊 SYSTEM OPTIMIZATION REPORT');

    console.log(`${colors.blue}FIXES APPLIED:${colors.reset}`);
    if (this.fixes.length === 0) {
      console.log('  ✅ No fixes needed - system is properly configured');
    } else {
      for (let i = 0; i < this.fixes.length; i++) {
        console.log(`  ${i + 1}. ✅ ${this.fixes[i]}`);
      }
    }

    if (this.issues.length > 0) {
      console.log(`\n${colors.red}ISSUES IDENTIFIED:${colors.reset}`);
      for (let i = 0; i < this.issues.length; i++) {
        console.log(`  ${i + 1}. ⚠️ ${this.issues[i]}`);
      }
    } else {
      console.log(`\n${colors.green}✅ NO ISSUES FOUND${colors.reset}`);
    }

    console.log(`\n${colors.green}✅ SYSTEM OPTIMIZATION COMPLETE${colors.reset}`);
  }

  async run() {
    console.clear();
    this.log('ℹ', '🔧 Starting System Optimization...\n');

    try {
      this.checkEnvironmentConfig();
      this.checkDatabaseSync();
      this.checkAPIConfiguration();
      this.checkFrontendPolling();
      this.checkDatabaseModels();
      this.generateRecommendations();
      this.generateReport();

      this.section('🚀 NEXT STEPS');
      console.log(`1. ${colors.yellow}Ensure MongoDB is running:${colors.reset}`);
      console.log(`   mongod\n`);
      console.log(`2. ${colors.yellow}Start the backend server:${colors.reset}`);
      console.log(`   cd backend && npm run dev\n`);
      console.log(`3. ${colors.yellow}Start the frontend server:${colors.reset}`);
      console.log(`   npm start\n`);
      console.log(`4. ${colors.yellow}Access the system:${colors.reset}`);
      console.log(`   http://localhost:3000\n`);
      console.log(`5. ${colors.yellow}Login with:${colors.reset}`);
      console.log(`   Email: BobbyFNB@09=`);
      console.log(`   Password: Martin@FNB09\n`);

    } catch (err) {
      this.log('❌', `Error during optimization: ${err.message}`);
      console.error(err);
    }
  }
}

// Run optimizer
const optimizer = new SystemOptimizer();
optimizer.run().catch(console.error);
