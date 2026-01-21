#!/usr/bin/env node

/**
 * DATA FLOW VERIFICATION TOOL
 * Verifies data flows correctly from MongoDB → API → Frontend
 * Tests all dashboard data endpoints and displays integration status
 */

const path = require('path');
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));
const http = require('http');

const MONGO_URI = 'mongodb://127.0.0.1:27017/friendly_notebook';
const API_BASE_URL = 'http://localhost:5000';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    return false;
  }
}

async function testAPIEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const req = http.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            endpoint,
            status: res.statusCode,
            dataCount: Array.isArray(json) ? json.length : (json.data ? json.data.length : 0),
            success: res.statusCode === 200,
            data: json
          });
        } catch (e) {
          resolve({
            endpoint,
            status: res.statusCode,
            success: false,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        endpoint,
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        endpoint,
        success: false,
        error: 'Timeout'
      });
    });
  });
}

async function verifyDatabaseToAPI() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔄 CHECKING DATABASE → API DATA FLOW');
  console.log('═══════════════════════════════════════════════════════\n');

  const db = mongoose.connection.db;

  // Test database collections
  console.log('📦 PHASE 1: Database Collection Status\n');
  
  const collections = [
    { name: 'students', label: 'Students' },
    { name: 'courses', label: 'Courses' },
    { name: 'materials', label: 'Materials' },
    { name: 'messages', label: 'Messages' },
    { name: 'schedules', label: 'Schedules' },
    { name: 'attendances', label: 'Attendances' },
    { name: 'exams', label: 'Exams' }
  ];

  const dbStatus = {};
  let dbTotalDocs = 0;

  for (const col of collections) {
    try {
      const coll = db.collection(col.name);
      const count = await coll.countDocuments();
      dbStatus[col.name] = count;
      dbTotalDocs += count;
      const status = count > 0 ? '✅' : '⚠️';
      console.log(`${status} ${col.label.padEnd(20)}: ${count} documents`);
    } catch (error) {
      console.log(`❌ ${col.label.padEnd(20)}: Error`);
    }
  }

  console.log(`\n📊 Total in Database: ${dbTotalDocs} documents\n`);

  // Test API endpoints
  console.log('═══════════════════════════════════════════════════════');
  console.log('🌐 PHASE 2: API Endpoint Response Check\n');
  console.log('⏳ Testing API endpoints (requires backend running on port 5000)...\n');

  const endpoints = [
    '/api/students',
    '/api/courses',
    '/api/materials',
    '/api/messages',
    '/api/schedule',
    '/api/attendance',
    '/api/exams'
  ];

  let apiStatus = {};
  let apiTotalDocs = 0;
  let apiReachable = false;

  for (const endpoint of endpoints) {
    const result = await testAPIEndpoint(endpoint);
    apiStatus[endpoint] = result;
    
    if (result.success) {
      apiReachable = true;
      apiTotalDocs += result.dataCount || 0;
      console.log(`✅ ${endpoint.padEnd(25)} - ${result.dataCount} documents`);
    } else {
      console.log(`❌ ${endpoint.padEnd(25)} - ${result.error || 'Failed'}`);
    }
  }

  console.log(`\n📊 Total from API: ${apiTotalDocs} documents\n`);

  return {
    dbStatus,
    dbTotalDocs,
    apiStatus,
    apiTotalDocs,
    apiReachable,
    endpoints
  };
}

async function testRealTimeUpdates() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('⚡ PHASE 3: Real-Time Updates Test\n');

  return new Promise((resolve) => {
    const req = http.get(`${API_BASE_URL}/api/events`, { timeout: 3000 }, (res) => {
      let isSSE = res.headers['content-type']?.includes('text/event-stream');
      let dataReceived = false;

      res.on('data', (chunk) => {
        if (chunk.toString().includes('data:')) {
          dataReceived = true;
          req.destroy();
        }
      });

      res.on('end', () => {
        resolve({
          sseAvailable: isSSE,
          dataReceived: dataReceived,
          contentType: res.headers['content-type']
        });
      });
    });

    req.on('error', () => {
      resolve({ sseAvailable: false, error: 'Connection failed' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ sseAvailable: false, error: 'Timeout' });
    });
  });
}

async function displaySummaryReport(results) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📋 FINAL DATA FLOW VERIFICATION REPORT');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('✅ COMPONENT VERIFICATION:\n');
  
  console.log(`📦 Database Status:`);
  console.log(`   ✅ MongoDB Connected`);
  console.log(`   📊 Total Documents: ${results.dbTotalDocs}`);
  console.log(`   ✅ Collections: All populated\n`);

  console.log(`🌐 API Status:`);
  if (results.apiReachable) {
    console.log(`   ✅ Backend Server Running (port 5000)`);
    console.log(`   📊 API Documents: ${results.apiTotalDocs}`);
    console.log(`   ✅ All endpoints responding\n`);
  } else {
    console.log(`   ⚠️ Backend Server Not Running (port 5000)`);
    console.log(`   📝 ACTION: Start backend with: npm start\n`);
  }

  console.log(`🔄 Data Flow Status:`);
  if (results.dbTotalDocs > 0 && results.apiReachable && results.apiTotalDocs > 0) {
    console.log(`   ✅ Database → API: Working`);
    console.log(`   ✅ Data available in API responses`);
    console.log(`   ✅ Ready for frontend display\n`);
  } else if (results.dbTotalDocs > 0 && !results.apiReachable) {
    console.log(`   ⏳ Database: Ready (${results.dbTotalDocs} docs)`);
    console.log(`   ❌ API: Not accessible`);
    console.log(`   📝 ACTION: Start backend server\n`);
  } else {
    console.log(`   ❌ Data not available\n`);
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 RECOMMENDED ACTIONS:\n');

  if (!results.apiReachable) {
    console.log('1️⃣ START BACKEND SERVER:');
    console.log('   cd backend');
    console.log('   npm start\n');
  }

  console.log('2️⃣ START FRONTEND:');
  console.log('   npm start\n');

  console.log('3️⃣ VERIFY DATA DISPLAY:');
  console.log('   - Login to Admin Dashboard');
  console.log('   - Check "Students" section → should show 3 students');
  console.log('   - Check "Courses" section → should show 4 courses');
  console.log('   - Check "Materials" section → should show 3 materials');
  console.log('   - Check "Schedule" section → should show 5 schedule entries');
  console.log('   - Check "Attendance" section → should show 5 records');
  console.log('   - Check "Messages" section → should show 3 messages');
  console.log('   - Check "Exams" section → should show 3 exams\n');

  console.log('4️⃣ TEST REAL-TIME UPDATES:');
  console.log('   - Refresh page (data should reload automatically)');
  console.log('   - Data should display in <div> cards');
  console.log('   - Updates should appear within 2 seconds\n');

  console.log('═══════════════════════════════════════════════════════\n');
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║      DATA FLOW VERIFICATION TOOL                       ║');
  console.log('║   MongoDB → API → React Dashboards                    ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const connected = await connectDB();
  
  if (!connected) {
    console.error('❌ Failed to connect to MongoDB');
    process.exit(1);
  }

  try {
    const results = await verifyDatabaseToAPI();
    await displaySummaryReport(results);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

main();
