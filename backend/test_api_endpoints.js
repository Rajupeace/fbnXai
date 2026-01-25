#!/usr/bin/env node

/**
 * API Endpoint Tester for Student & Faculty Dashboards
 * Tests all critical endpoints to verify they're working
 */

const http = require('http');

const API_URL = 'http://localhost:5000';

function testEndpoint(path, description) {
    return new Promise((resolve) => {
        console.log(`\n🧪 Testing: ${description}`);
        console.log(`   Endpoint: ${path}`);

        http.get(`${API_URL}${path}`, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        console.log(`   ✅ Status: ${res.statusCode} OK`);

                        if (Array.isArray(json)) {
                            console.log(`   📊 Response: Array with ${json.length} items`);
                            if (json.length > 0) {
                                console.log(`   📋 Sample:`, JSON.stringify(json[0]).substring(0, 100) + '...');
                            }
                        } else {
                            console.log(`   📊 Response: Object with keys:`, Object.keys(json).join(', '));
                        }
                        resolve({ success: true, status: res.statusCode, data: json });
                    } catch (e) {
                        console.log(`   ⚠️  Response not JSON:`, data.substring(0, 100));
                        resolve({ success: true, status: res.statusCode, data });
                    }
                } else {
                    console.log(`   ❌ Status: ${res.statusCode}`);
                    console.log(`   Error:`, data.substring(0, 200));
                    resolve({ success: false, status: res.statusCode, error: data });
                }
            });
        }).on('error', (err) => {
            console.log(`   ❌ Connection Error: ${err.message}`);
            resolve({ success: false, error: err.message });
        });
    });
}

async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 API ENDPOINT VERIFICATION');
    console.log('='.repeat(60));

    console.log(`\n📡 Testing API at: ${API_URL}`);

    // Test 1: Health Check
    await testEndpoint('/api/health', 'Health Check');

    // Test 2: Students List
    const studentsResult = await testEndpoint('/api/students', 'Get All Students');

    // Test 3: Student Overview (if we have students)
    if (studentsResult.success && Array.isArray(studentsResult.data) && studentsResult.data.length > 0) {
        const firstStudent = studentsResult.data[0];
        const studentId = firstStudent.sid || firstStudent.id;
        await testEndpoint(`/api/students/${studentId}/overview`, `Get Student Overview (${studentId})`);
        await testEndpoint(`/api/students/${studentId}/courses`, `Get Student Courses (${studentId})`);
    } else {
        console.log('\n⚠️  No students found - skipping student-specific tests');
    }

    // Test 4: Faculty List
    const facultyResult = await testEndpoint('/api/faculty', 'Get All Faculty');

    // Test 5: Faculty Stats (if we have faculty)
    if (facultyResult.success && Array.isArray(facultyResult.data) && facultyResult.data.length > 0) {
        const firstFaculty = facultyResult.data[0];
        const facultyId = firstFaculty.facultyId || firstFaculty.id;
        await testEndpoint(`/api/faculty-stats/${facultyId}/students`, `Get Faculty Students (${facultyId})`);
    } else {
        console.log('\n⚠️  No faculty found - skipping faculty-specific tests');
    }

    // Test 6: Materials
    await testEndpoint('/api/materials', 'Get All Materials');

    // Test 7: Messages
    await testEndpoint('/api/messages', 'Get All Messages');

    // Test 8: Todos
    await testEndpoint('/api/todos', 'Get All Todos');

    // Test 9: Courses
    await testEndpoint('/api/courses', 'Get All Courses');

    console.log('\n' + '='.repeat(60));
    console.log('✅ API ENDPOINT TESTS COMPLETE');
    console.log('='.repeat(60));

    console.log('\n💡 NEXT STEPS:');
    console.log('   1. If all tests passed ✅ - Dashboards should work!');
    console.log('   2. If tests failed ❌ - Check backend is running on port 5000');
    console.log('   3. Check browser console (F12) for frontend errors');
    console.log('   4. Restart backend: cd backend && node index.js\n');
}

// Check if server is running first
http.get(`${API_URL}/api/health`, (res) => {
    console.log('✅ Backend server is running!');
    runTests();
}).on('error', (err) => {
    console.error('\n❌ ERROR: Backend server is not running!');
    console.error(`   Cannot connect to ${API_URL}`);
    console.error(`   Error: ${err.message}\n`);
    console.error('💡 Start the backend server:');
    console.error('   cd backend');
    console.error('   node index.js\n');
    process.exit(1);
});
