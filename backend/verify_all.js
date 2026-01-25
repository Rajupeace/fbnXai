#!/usr/bin/env node

/**
 * COMPLETE DASHBOARD VERIFICATION SCRIPT
 * Tests all aspects of Student and Faculty dashboards
 */

const http = require('http');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:5000';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fbn_xai_system';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function testAPI(path) {
    return new Promise((resolve) => {
        http.get(`${API_URL}${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ success: res.statusCode === 200, status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ success: res.statusCode === 200, status: res.statusCode, data });
                }
            });
        }).on('error', (err) => {
            resolve({ success: false, error: err.message });
        });
    });
}

async function runCompleteVerification() {
    console.log('\n' + '='.repeat(70));
    log('🔍 COMPLETE DASHBOARD VERIFICATION', 'cyan');
    console.log('='.repeat(70) + '\n');

    let allPassed = true;

    // Test 1: MongoDB Connection
    log('📊 Test 1: MongoDB Connection', 'blue');
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        log('   ✅ MongoDB Connected: ' + mongoose.connection.name, 'green');

        const Student = require('./models/Student');
        const Faculty = require('./models/Faculty');
        const Material = require('./models/Material');

        const studentCount = await Student.countDocuments();
        const facultyCount = await Faculty.countDocuments();
        const materialCount = await Material.countDocuments();

        log(`   📈 Students: ${studentCount}`, studentCount > 0 ? 'green' : 'yellow');
        log(`   📈 Faculty: ${facultyCount}`, facultyCount > 0 ? 'green' : 'yellow');
        log(`   📈 Materials: ${materialCount}`, materialCount > 0 ? 'green' : 'yellow');

        if (studentCount === 0 || facultyCount === 0) {
            log('   ⚠️  Warning: Database has no students or faculty', 'yellow');
            log('   💡 Add data via Admin Dashboard', 'yellow');
        }

        await mongoose.connection.close();
    } catch (error) {
        log('   ❌ MongoDB Connection Failed: ' + error.message, 'red');
        allPassed = false;
    }

    console.log();

    // Test 2: Backend Server
    log('🚀 Test 2: Backend Server', 'blue');
    const healthCheck = await testAPI('/api/health');
    if (healthCheck.success) {
        log('   ✅ Backend server is running on port 5000', 'green');
    } else {
        log('   ❌ Backend server is NOT running', 'red');
        log('   💡 Start with: cd backend && node index.js', 'yellow');
        allPassed = false;
        return;
    }

    console.log();

    // Test 3: Student API Endpoints
    log('👨‍🎓 Test 3: Student API Endpoints', 'blue');

    const studentsTest = await testAPI('/api/students');
    if (studentsTest.success) {
        log('   ✅ GET /api/students - Working', 'green');
        const students = studentsTest.data;
        if (Array.isArray(students) && students.length > 0) {
            log(`   📊 Found ${students.length} students`, 'green');

            // Test student overview
            const firstStudent = students[0];
            const sid = firstStudent.sid || firstStudent.id;
            const overviewTest = await testAPI(`/api/students/${sid}/overview`);

            if (overviewTest.success) {
                log(`   ✅ GET /api/students/${sid}/overview - Working`, 'green');
                const overview = overviewTest.data;

                if (overview.student && overview.student.name !== 'Demo Student') {
                    log(`   ✅ Real student data: ${overview.student.name}`, 'green');
                } else if (overview.student && overview.student.name === 'Demo Student') {
                    log('   ❌ Still showing Demo Student!', 'red');
                    log('   💡 Restart backend server', 'yellow');
                    allPassed = false;
                }

                log(`   📊 Attendance: ${overview.attendance?.overall ?? 0}%`, 'cyan');
                log(`   📊 Marks: ${overview.academics?.overallPercentage ?? 'N/A'}`, 'cyan');
                log(`   📊 Streak: ${overview.activity?.streak ?? 0} days`, 'cyan');
            } else {
                log(`   ❌ GET /api/students/${sid}/overview - Failed`, 'red');
                allPassed = false;
            }

            // Test student courses
            const coursesTest = await testAPI(`/api/students/${sid}/courses`);
            if (coursesTest.success) {
                log(`   ✅ GET /api/students/${sid}/courses - Working`, 'green');
            } else {
                log(`   ❌ GET /api/students/${sid}/courses - Failed`, 'red');
                allPassed = false;
            }
        } else {
            log('   ⚠️  No students in database', 'yellow');
            log('   💡 Add students via Admin Dashboard', 'yellow');
        }
    } else {
        log('   ❌ GET /api/students - Failed', 'red');
        allPassed = false;
    }

    console.log();

    // Test 4: Faculty API Endpoints
    log('👨‍🏫 Test 4: Faculty API Endpoints', 'blue');

    const facultyTest = await testAPI('/api/faculty');
    if (facultyTest.success) {
        log('   ✅ GET /api/faculty - Working', 'green');
        const faculty = facultyTest.data;
        if (Array.isArray(faculty) && faculty.length > 0) {
            log(`   📊 Found ${faculty.length} faculty members`, 'green');

            // Test faculty stats
            const firstFaculty = faculty[0];
            const fid = firstFaculty.facultyId || firstFaculty.id;
            const statsTest = await testAPI(`/api/faculty-stats/${fid}/students`);

            if (statsTest.success) {
                log(`   ✅ GET /api/faculty-stats/${fid}/students - Working`, 'green');
            } else {
                log(`   ⚠️  GET /api/faculty-stats/${fid}/students - Failed`, 'yellow');
            }
        } else {
            log('   ⚠️  No faculty in database', 'yellow');
            log('   💡 Add faculty via Admin Dashboard', 'yellow');
        }
    } else {
        log('   ❌ GET /api/faculty - Failed', 'red');
        allPassed = false;
    }

    console.log();

    // Test 5: Materials API
    log('📚 Test 5: Materials API', 'blue');
    const materialsTest = await testAPI('/api/materials');
    if (materialsTest.success) {
        log('   ✅ GET /api/materials - Working', 'green');
        const materials = materialsTest.data;
        if (Array.isArray(materials)) {
            log(`   📊 Found ${materials.length} materials`, materials.length > 0 ? 'green' : 'yellow');
        }
    } else {
        log('   ❌ GET /api/materials - Failed', 'red');
        allPassed = false;
    }

    console.log();

    // Test 6: Messages API
    log('📧 Test 6: Messages API', 'blue');
    const messagesTest = await testAPI('/api/messages');
    if (messagesTest.success) {
        log('   ✅ GET /api/messages - Working', 'green');
        const messages = messagesTest.data;
        if (Array.isArray(messages)) {
            log(`   📊 Found ${messages.length} messages`, 'cyan');
        }
    } else {
        log('   ❌ GET /api/messages - Failed', 'red');
        allPassed = false;
    }

    console.log();

    // Test 7: Courses API
    log('📖 Test 7: Courses API', 'blue');
    const coursesTest = await testAPI('/api/courses');
    if (coursesTest.success) {
        log('   ✅ GET /api/courses - Working', 'green');
        const courses = coursesTest.data;
        if (Array.isArray(courses)) {
            log(`   📊 Found ${courses.length} courses`, courses.length > 0 ? 'green' : 'yellow');
        }
    } else {
        log('   ❌ GET /api/courses - Failed', 'red');
        allPassed = false;
    }

    console.log();

    // Final Summary
    console.log('='.repeat(70));
    if (allPassed) {
        log('✅ ALL TESTS PASSED! DASHBOARDS ARE READY!', 'green');
    } else {
        log('⚠️  SOME TESTS FAILED - CHECK ERRORS ABOVE', 'yellow');
    }
    console.log('='.repeat(70));

    console.log();
    log('📋 NEXT STEPS:', 'cyan');
    console.log();
    log('1. Make sure backend is running:', 'blue');
    console.log('   cd backend && node index.js');
    console.log();
    log('2. Make sure frontend is running:', 'blue');
    console.log('   npm start');
    console.log();
    log('3. Clear browser cache:', 'blue');
    console.log('   Press Ctrl+Shift+Delete');
    console.log();
    log('4. Login to test dashboards:', 'blue');
    console.log('   - Student Dashboard: Login as student');
    console.log('   - Faculty Dashboard: Login as faculty');
    console.log('   - Admin Dashboard: Login as admin');
    console.log();
    log('5. Check browser console (F12) for logs:', 'blue');
    console.log('   Should see: "All data loaded successfully"');
    console.log();

    if (allPassed) {
        log('🎉 CONGRATULATIONS! Everything is working!', 'green');
    } else {
        log('🔧 Fix the errors above and run this script again', 'yellow');
    }
    console.log();
}

// Run the verification
runCompleteVerification().catch(console.error);
