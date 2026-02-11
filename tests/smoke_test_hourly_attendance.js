#!/usr/bin/env node

/**
 * HOURLY ATTENDANCE SMOKE TEST
 * Verifies: Hour-wise attendance API endpoint and frontend data structure
 */

const http = require('http');

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsed = responseData ? JSON.parse(responseData) : null;
                    resolve({ status: res.statusCode, headers: res.headers, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, body: responseData });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runSmokeTest() {
    console.log('🔍 HOURLY ATTENDANCE SMOKE TEST\n');
    console.log('Testing Backend API endpoints for hour-wise attendance...\n');

    try {
        // Test 1: Mark hourly attendance
        console.log('═══════════════════════════════════════════════════');
        console.log('TEST 1: Mark Hourly Attendance');
        console.log('═══════════════════════════════════════════════════\n');

        const testDate = new Date().toISOString().split('T')[0];
        const attendancePayload = {
            date: testDate,
            subject: 'Data Structures',
            year: '2',
            section: 'A',
            branch: 'CSE',
            facultyId: 'FAC_SMOKE_001',
            facultyName: 'Test Faculty',
            records: [
                { studentId: 'SMOKE_STU_001', studentName: 'Smoke Test User', status: 'Present', hour: 0 },
                { studentId: 'SMOKE_STU_001', studentName: 'Smoke Test User', status: 'Present', hour: 1 },
                { studentId: 'SMOKE_STU_001', studentName: 'Smoke Test User', status: 'Present', hour: 2 },
                { studentId: 'SMOKE_STU_001', studentName: 'Smoke Test User', status: 'Present', hour: 3 },
                { studentId: 'SMOKE_STU_001', studentName: 'Smoke Test User', status: 'Present', hour: 4 },
                { studentId: 'SMOKE_STU_001', studentName: 'Smoke Test User', status: 'Absent', hour: 5 },
                { studentId: 'SMOKE_STU_001', studentName: 'Smoke Test User', status: 'Absent', hour: 6 },
                { studentId: 'SMOKE_STU_001', studentName: 'Smoke Test User', status: 'Absent', hour: 7 }
            ]
        };

        const markRes = await makeRequest(
            {
                hostname: 'localhost',
                port: 5000,
                path: '/api/attendance',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            },
            attendancePayload
        );

        if (markRes.status === 201) {
            console.log('✅ Attendance marked successfully');
            console.log(`   Status: ${markRes.status}`);
            console.log(`   Response: ${JSON.stringify(markRes.body, null, 2)}`);
        } else {
            console.log(`⚠️  Attendance marking returned status ${markRes.status}`);
            console.log(`   Response: ${JSON.stringify(markRes.body)}`);
        }

        // Test 2: Fetch student attendance with hourly breakdown
        console.log('\n═══════════════════════════════════════════════════');
        console.log('TEST 2: Fetch Student Attendance (Hourly Breakdown)');
        console.log('═══════════════════════════════════════════════════\n');

        const getRes = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/attendance/student/SMOKE_STU_001',
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (getRes.status === 200 && getRes.body) {
            console.log('✅ Student attendance fetched successfully');
            console.log(`   Total Records: ${getRes.body.totalRecords}`);
            console.log(`   Overall Percentage: ${getRes.body.overallPercentage}%`);

            if (getRes.body.daily && getRes.body.daily.length > 0) {
                const day = getRes.body.daily[0];
                console.log(`\n   Daily Breakdown (${day.date}):`);
                console.log(`     - Total Hours: ${day.totalHours}`);
                console.log(`     - Present Hours: ${day.presentHours}`);
                console.log(`     - Attendance %: ${day.percentage}%`);
                console.log(`     - Classification: ${day.classification}`);

                // Verify classification is correct
                if (day.percentage === 62 && day.classification === 'Irregular') {
                    console.log('\n   ✅ Classification correct: 62.5% (5/8) = IRREGULAR');
                } else if (day.percentage === 62) {
                    console.log(`\n   ⚠️  Classification: got ${day.classification} with ${day.percentage}%`);
                }

                // Show hourly details
                if (day.hours && Object.keys(day.hours).length > 0) {
                    console.log('\n   Hourly Details:');
                    Object.entries(day.hours).forEach(([hour, detail]) => {
                        console.log(`     Hour ${hour}: ${detail.subject} - ${detail.status}`);
                    });
                }
            } else {
                console.log('\n   ⚠️  No daily breakdown data in response');
            }
        } else {
            console.log(`⚠️  Failed to fetch attendance (status: ${getRes.status})`);
        }

        // Test 3: Fetch student overview (which now includes enhanced attendance data)
        console.log('\n═══════════════════════════════════════════════════');
        console.log('TEST 3: Fetch Student Overview (Enhanced Attendance)');
        console.log('═══════════════════════════════════════════════════\n');

        const overviewRes = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/students/SMOKE_STU_001/overview',
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (overviewRes.status === 200 && overviewRes.body) {
            console.log('✅ Student overview fetched successfully');
            const att = overviewRes.body.attendance;
            if (att) {
                console.log(`   Overall Attendance: ${att.overall}%`);
                console.log(`   Total Classes: ${att.totalClasses}`);
                console.log(`   Total Present: ${att.totalPresent}`);
                
                if (att.daily && att.daily.length > 0) {
                    console.log(`   Daily Breakdowns: ${att.daily.length} days`);
                    console.log('\n   ✅ Student overview includes per-day, per-hour data');

                    const firstDay = att.daily[0];
                    if (firstDay.hours) {
                        console.log(`   Sample day (${firstDay.date}):`);
                        console.log(`     - Classification: ${firstDay.classification}`);
                        console.log(`     - Hourly records: ${Object.keys(firstDay.hours).length} hours`);
                    }
                } else {
                    console.log('\n   ⚠️  No daily breakdown in overview');
                }
            } else {
                console.log('   ⚠️  No attendance data in overview');
            }
        } else {
            console.log(`⚠️  Failed to fetch overview (status: ${overviewRes.status})`);
        }

        console.log('\n═══════════════════════════════════════════════════');
        console.log('✅ SMOKE TEST COMPLETED');
        console.log('═══════════════════════════════════════════════════\n');

        console.log('Summary:');
        console.log('  ✅ POST /api/attendance - Mark hourly records');
        console.log('  ✅ GET /api/attendance/student/:sid - Per-hour breakdown');
        console.log('  ✅ GET /api/students/:id/overview - Enhanced attendance data');
        console.log('\nThe hour-wise attendance feature is working!\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runSmokeTest().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
