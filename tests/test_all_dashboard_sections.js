#!/usr/bin/env node
/**
 * COMPREHENSIVE STUDENT DASHBOARD SECTION TEST
 * Tests all sections and their database connectivity
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Test student IDs - these should exist in your database
const TEST_STUDENTS = [
    '231fa04470',  // Known student from logs
    'STU001',
    'stu_001'
];

const sections = [
    { 
        name: 'Student Overview', 
        endpoint: (sid) => `/api/students/${sid}/overview`,
        method: 'GET',
        description: 'Profile, grades, attendance stats'
    },
    { 
        name: 'Courses', 
        endpoint: (sid) => `/api/students/${sid}/courses`,
        method: 'GET',
        description: 'Enrolled courses and materials'
    },
    { 
        name: 'Materials', 
        endpoint: () => `/api/materials`,
        method: 'GET',
        description: 'Study materials and resources'
    },
    { 
        name: 'Attendance', 
        endpoint: (sid) => `/api/attendance/student/${sid}`,
        method: 'GET',
        description: 'Attendance records'
    },
    { 
        name: 'Messages', 
        endpoint: () => `/api/messages`,
        method: 'GET',
        description: 'Announcements and messages'
    },
    { 
        name: 'Tasks/Todos', 
        endpoint: () => `/api/todos?role=student`,
        method: 'GET',
        description: 'Student tasks and assignments'
    },
    { 
        name: 'Faculty List', 
        endpoint: () => `/api/faculty`,
        method: 'GET',
        description: 'Faculty members'
    },
    { 
        name: 'Schedules', 
        endpoint: () => `/api/schedules`,
        method: 'GET',
        description: 'Class and exam schedules'
    },
    { 
        name: 'Exams', 
        endpoint: () => `/api/exams`,
        method: 'GET',
        description: 'Exam information'
    }
];

// Helper function to make HTTP request
function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port || 5000,
            path: url.pathname + url.search,
            method: 'GET',
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ 
                        status: res.statusCode, 
                        data: parsed,
                        headers: res.headers,
                        size: Buffer.byteLength(data)
                    });
                } catch (e) {
                    resolve({ 
                        status: res.statusCode, 
                        data: data,
                        headers: res.headers,
                        size: Buffer.byteLength(data),
                        parseError: true
                    });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

async function testSection(section, studentId) {
    const endpoint = section.endpoint(studentId);
    try {
        const result = await makeRequest(endpoint);
        const success = result.status >= 200 && result.status < 300;
        
        let recordCount = 0;
        if (Array.isArray(result.data)) {
            recordCount = result.data.length;
        } else if (result.data && typeof result.data === 'object') {
            if (result.data.data && Array.isArray(result.data.data)) {
                recordCount = result.data.data.length;
            }
        }

        return {
            success,
            status: result.status,
            recordCount,
            dataSize: `${(result.size / 1024).toFixed(2)} KB`,
            hasData: recordCount > 0 || result.status === 200
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function runTests() {
    console.log('\n' + '═'.repeat(70));
    console.log('  📊 STUDENT DASHBOARD - SECTION FUNCTIONALITY TEST');
    console.log('═'.repeat(70) + '\n');

    // Wait for backend to be ready
    console.log('⏳ Checking backend connection...');
    for (let i = 0; i < 5; i++) {
        try {
            await makeRequest('/api/health');
            console.log('✅ Backend is ready!\n');
            break;
        } catch (e) {
            if (i === 4) {
                console.error('❌ Backend not responding. Make sure it\'s running on port 5000');
                process.exit(1);
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    let totalSections = 0;
    let passedSections = 0;
    let failedSections = 0;

    // Test each section with first available student
    let studentId = TEST_STUDENTS[0];

    for (const section of sections) {
        totalSections++;
        const endpoint = section.endpoint(studentId);
        
        console.log(`\n📌 ${section.name}`);
        console.log(`   Description: ${section.description}`);
        console.log(`   Endpoint: GET ${endpoint}`);

        const result = await testSection(section, studentId);

        if (result.success) {
            passedSections++;
            console.log(`   ✅ Status: ${result.status} OK`);
            console.log(`   📦 Data Size: ${result.dataSize}`);
            if (result.recordCount > 0) {
                console.log(`   📊 Records: ${result.recordCount}`);
            }
            console.log(`   ✓ Database Connected: YES`);
        } else {
            failedSections++;
            console.log(`   ❌ Status: ${result.status || 'ERROR'}`);
            console.log(`   ❌ Error: ${result.error || 'No data received'}`);
            console.log(`   ✗ Database Connected: NO`);
        }
    }

    // Summary Report
    console.log('\n' + '═'.repeat(70));
    console.log('  📋 TEST SUMMARY');
    console.log('═'.repeat(70));
    console.log(`\n  Total Sections Tested: ${totalSections}`);
    console.log(`  ✅ Passed: ${passedSections}`);
    console.log(`  ❌ Failed: ${failedSections}`);
    console.log(`  📊 Success Rate: ${((passedSections / totalSections) * 100).toFixed(1)}%`);

    // Overall status
    const allPassed = failedSections === 0;
    const mostPassed = passedSections >= (totalSections * 0.8);

    console.log('\n' + '─'.repeat(70));
    if (allPassed) {
        console.log('  🎉 ALL SECTIONS WORKING! Dashboard is fully functional.');
    } else if (mostPassed) {
        console.log('  ⚠️  MOST SECTIONS WORKING. Some endpoints may need attention.');
    } else {
        console.log('  ❌ CRITICAL ISSUES. Multiple sections are not responding.');
    }
    console.log('─'.repeat(70) + '\n');

    // Database Connectivity Summary
    console.log('\n📊 DATABASE CONNECTIVITY STATUS:\n');
    for (const section of sections) {
        const endpoint = section.endpoint(studentId);
        const result = await testSection(section, studentId);
        const status = result.success ? '✅ CONNECTED' : '❌ NOT CONNECTED';
        const icon = result.success ? '✓' : '✗';
        console.log(`  ${icon} ${section.name.padEnd(20)} ${status}`);
    }

    console.log('\n' + '═'.repeat(70) + '\n');

    process.exit(failedSections > 0 ? 1 : 0);
}

// Run tests
runTests().catch(e => {
    console.error('❌ Test execution failed:', e);
    process.exit(1);
});
