#!/usr/bin/env node

/**
 * QUICK START GUIDE
 * One-command verification and setup
 */

const path = require('path');
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));
const http = require('http');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5000${endpoint}`, { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(Array.isArray(json) ? json.length : (json.data?.length || 0));
        } catch (e) {
          resolve(0);
        }
      });
    }).on('error', () => resolve(0));
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║          QUICK START SETUP VERIFICATION                ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Check MongoDB
  console.log('Checking MongoDB...');
  const dbConnected = await connectDB();
  if (dbConnected) {
    const db = mongoose.connection.db;
    const studentCount = await db.collection('students').countDocuments();
    const courseCount = await db.collection('courses').countDocuments();
    const materialCount = await db.collection('AdminDashboardDB_Sections_Materials').countDocuments();
    const messageCount = await db.collection('messages').countDocuments();
    
    console.log(`✅ MongoDB: Connected`);
    console.log(`✅ Students: ${studentCount} documents`);
    console.log(`✅ Courses: ${courseCount} documents`);
    console.log(`✅ Materials: ${materialCount} documents`);
    console.log(`✅ Messages: ${messageCount} documents\n`);
    
    await mongoose.connection.close();
  } else {
    console.log('❌ MongoDB: Connection failed\n');
    process.exit(1);
  }

  // Check API
  console.log('Checking Backend API (port 5000)...');
  const studentData = await testEndpoint('/api/students');
  const courseData = await testEndpoint('/api/courses');
  const materialData = await testEndpoint('/api/materials');
  const scheduleData = await testEndpoint('/api/schedule');

  if (studentData > 0 || courseData > 0) {
    console.log(`✅ Backend API: Running on port 5000`);
    console.log(`✅ Students endpoint: ${studentData} documents`);
    console.log(`✅ Courses endpoint: ${courseData} documents`);
    console.log(`✅ Materials endpoint: ${materialData} documents`);
    console.log(`✅ Schedule endpoint: ${scheduleData} documents\n`);
  } else {
    console.log(`✅ Backend API: Port 5000 not accessible\n`);
    console.log('   (This is normal if backend is not running yet)\n');
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 NEXT STEPS');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('1️⃣ RESTART BACKEND:\n');
  console.log('   PowerShell: cd backend; npm start\n');

  console.log('2️⃣ START FRONTEND (in another terminal):\n');
  console.log('   PowerShell: npm start\n');

  console.log('3️⃣ OPEN BROWSER:\n');
  console.log('   http://localhost:3000\n');

  console.log('4️⃣ LOGIN:\n');
  console.log('   Use your admin/faculty/student account\n');

  console.log('5️⃣ VERIFY DATA APPEARS:\n');
  console.log('   ✓ Students section shows student list');
  console.log('   ✓ Courses section shows courses');
  console.log('   ✓ Materials section shows materials');
  console.log('   ✓ Schedule section shows timetable');
  console.log('   ✓ Attendance section shows records');
  console.log('   ✓ Messages section shows messages');
  console.log('   ✓ Exams section shows exam schedule\n');

  console.log('═══════════════════════════════════════════════════════');
  console.log('📄 DOCUMENTATION');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('Read: ALL_MARKDOWN_COMBINED.md');
  console.log('      for complete setup and troubleshooting guide\n');

  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(console.error).finally(() => process.exit(0));

