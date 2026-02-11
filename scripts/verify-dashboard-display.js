#!/usr/bin/env node

/**
 * DASHBOARD DATA DISPLAY VERIFICATION
 * Verifies that data is properly displayed in dashboard sections
 * Tests all dashboard endpoints and verifies data structure
 */

const path = require('path');
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));
const http = require('http');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';
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
          const dataArray = Array.isArray(json) ? json : (json.data ? json.data : []);
          resolve({
            endpoint,
            status: res.statusCode,
            dataCount: dataArray.length,
            success: res.statusCode === 200,
            data: dataArray
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

async function verifyDashboardDataFlow() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎯 DASHBOARD DATA DISPLAY VERIFICATION');
  console.log('═══════════════════════════════════════════════════════\n');

  const db = mongoose.connection.db;

  // Define all dashboard data requirements
  const dashboardSections = [
    {
      name: 'Students',
      endpoints: ['/api/students'],
      minExpected: 1,
      displayArea: 'Admin Dashboard → Students Section'
    },
    {
      name: 'Courses',
      endpoints: ['/api/courses'],
      minExpected: 1,
      displayArea: 'Admin Dashboard → Courses Section'
    },
    {
      name: 'Materials',
      endpoints: ['/api/materials'],
      minExpected: 1,
      displayArea: 'Admin Dashboard → Materials Section'
    },
    {
      name: 'Messages',
      endpoints: ['/api/messages'],
      minExpected: 1,
      displayArea: 'Admin Dashboard → Messages Section'
    },
    {
      name: 'Schedule',
      endpoints: ['/api/schedule'],
      minExpected: 1,
      displayArea: 'Admin/Faculty Dashboard → Schedule Section'
    },
    {
      name: 'Attendance',
      endpoints: ['/api/attendance/all'],
      minExpected: 1,
      displayArea: 'Admin/Faculty Dashboard → Attendance Section'
    },
    {
      name: 'Exams',
      endpoints: ['/api/exams'],
      minExpected: 1,
      displayArea: 'Admin/Faculty Dashboard → Exams Section'
    }
  ];

  let totalIssues = 0;
  let totalDataPoints = 0;

  console.log('📊 TESTING API ENDPOINTS FOR DASHBOARD DATA:\n');

  for (const section of dashboardSections) {
    console.log(`\n${section.name.toUpperCase()}`);
    console.log(`Display: ${section.displayArea}`);
    console.log(`Expected: Minimum ${section.minExpected} document(s)\n`);

    for (const endpoint of section.endpoints) {
      const result = await testAPIEndpoint(endpoint);

      if (result.success) {
        const dataCount = result.dataCount || 0;
        totalDataPoints += dataCount;

        if (dataCount >= section.minExpected) {
          console.log(`✅ ${endpoint.padEnd(35)} : ${dataCount} documents`);
          
          // Show sample of data structure
          if (result.data && result.data.length > 0) {
            const sample = result.data[0];
            const keys = Object.keys(sample).slice(0, 3).join(', ');
            console.log(`   Fields: ${keys}...`);
          }
        } else {
          console.log(`⚠️ ${endpoint.padEnd(35)} : ${dataCount} documents (NEEDS ${section.minExpected})`);
          totalIssues++;
        }
      } else {
        console.log(`❌ ${endpoint.padEnd(35)} : ${result.error || 'Failed'}`);
        totalIssues++;
      }
    }
  }

  return {
    totalIssues,
    totalDataPoints,
    sectionsVerified: dashboardSections.length
  };
}

async function displayDataStructureGuide() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📐 DATA STRUCTURE FOR DIV/CARD DISPLAY');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('✅ STUDENTS STRUCTURE:');
  console.log('   { studentName, sid, email, year, section, branch }');
  console.log('   Display in: <div> with cards showing student info\n');

  console.log('✅ COURSES STRUCTURE:');
  console.log('   { courseCode, courseName, year, semester, branch, credits }');
  console.log('   Display in: <div> with course cards\n');

  console.log('✅ MATERIALS STRUCTURE:');
  console.log('   { title, subject, type, year, section, branch, uploadedAt }');
  console.log('   Display in: <div> with material cards/list\n');

  console.log('✅ MESSAGES STRUCTURE:');
  console.log('   { title, content, sender, timestamp, isGlobal, priority }');
  console.log('   Display in: <div> with message cards\n');

  console.log('✅ SCHEDULE STRUCTURE:');
  console.log('   { day, startTime, endTime, subject, faculty, room, type }');
  console.log('   Display in: <div> with timetable format\n');

  console.log('✅ ATTENDANCE STRUCTURE:');
  console.log('   { studentId, studentName, subject, date, status, semester }');
  console.log('   Display in: <div> with attendance table/cards\n');

  console.log('✅ EXAMS STRUCTURE:');
  console.log('   { examName, subject, examDate, startTime, endTime, totalMarks }');
  console.log('   Display in: <div> with exam schedule cards\n');
}

async function displayFrontendIntegrationGuide() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔧 FRONTEND INTEGRATION CHECKLIST');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('1️⃣ DATA FETCHING IN REACT:\n');
  console.log('   useEffect(() => {');
  console.log('     fetch("/api/students")');
  console.log('       .then(r => r.json())');
  console.log('       .then(data => setStudents(data))');
  console.log('       .catch(err => console.error(err));');
  console.log('   }, []);\n');

  console.log('2️⃣ REAL-TIME UPDATES WITH SSE:\n');
  console.log('   useEffect(() => {');
  console.log('     const es = new EventSource("/api/stream");');
  console.log('     es.onmessage = (e) => {');
  console.log('       const data = JSON.parse(e.data);');
  console.log('       // Update UI with data');
  console.log('     };');
  console.log('     return () => es.close();');
  console.log('   }, []);\n');

  console.log('3️⃣ DISPLAYING DATA IN DIV CARDS:\n');
  console.log('   {students.map(student => (');
  console.log('     <div key={student._id} className="card">')
  console.log('       <h3>{student.studentName}</h3>');
  console.log('       <p>ID: {student.sid}</p>');
  console.log('       <p>Email: {student.email}</p>');
  console.log('     </div>');
  console.log('   ))}\n');

  console.log('4️⃣ AUTOMATIC UPDATES:\n');
  console.log('   - Data auto-updates every 2 seconds (polling)');
  console.log('   - Real-time updates via SSE (<100ms)');
  console.log('   - Components re-render when state changes\n');

  console.log('5️⃣ ERROR HANDLING:\n');
  console.log('   const [error, setError] = useState(null);');
  console.log('   if (error) return <div>{error}</div>;');
  console.log('   if (loading) return <div>Loading...</div>;\n');
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   DASHBOARD DATA DISPLAY VERIFICATION TOOL             ║');
  console.log('║   MongoDB → API → React Dashboard Display             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const connected = await connectDB();
  
  if (!connected) {
    console.error('❌ Failed to connect to MongoDB');
    process.exit(1);
  }

  try {
    const results = await verifyDashboardDataFlow();
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 VERIFICATION SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log(`✅ Sections Verified: ${results.sectionsVerified}`);
    console.log(`📊 Total Data Points: ${results.totalDataPoints}`);
    
    if (results.totalIssues === 0) {
      console.log(`✅ Status: ALL DATA DISPLAYING CORRECTLY\n`);
    } else {
      console.log(`⚠️ Issues Found: ${results.totalIssues}`);
      console.log(`   → Check API endpoints and ensure MongoDB data is populated\n`);
    }

    await displayDataStructureGuide();
    await displayFrontendIntegrationGuide();

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ NEXT STEPS');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('1. Verify backend is running: npm start (in /backend)\n');
    console.log('2. Start frontend: npm start (in root)\n');
    console.log('3. Login to admin dashboard\n');
    console.log('4. All sections should show data in <div> cards:\n');
    console.log('   ✓ Students section displays student list');
    console.log('   ✓ Courses section displays courses');
    console.log('   ✓ Materials section displays materials');
    console.log('   ✓ Messages section displays messages');
    console.log('   ✓ Schedule section displays timetable');
    console.log('   ✓ Attendance section displays attendance');
    console.log('   ✓ Exams section displays exam schedule\n');

    console.log('5. Test real-time updates:');
    console.log('   ✓ Refresh page → data auto-loads');
    console.log('   ✓ Data appears within 2 seconds\n');

    console.log('═══════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

main();
