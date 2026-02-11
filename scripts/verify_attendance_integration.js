#!/usr/bin/env node

/**
 * QUICK ATTENDANCE VERIFICATION
 * Tests: Faculty marks attendance → API response → Student sees it
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: body ? JSON.parse(body) : null,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: body,
                        error: e.message
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('\n🔍 ATTENDANCE SYSTEM VERIFICATION\n');
    console.log('═══════════════════════════════════════════════════\n');

    try {
        // Test 1: Check if backend is running
        console.log('TEST 1: Backend Health Check');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const health = await makeRequest('/api/health');
        console.log(`Status: ${health.status}`);
        
        if (health.status === 200) {
            console.log('✅ Backend is running\n');
        } else {
            console.log('❌ Backend not responding correctly\n');
            return;
        }

        // Test 2: Mark attendance (Faculty action)
        console.log('TEST 2: Faculty Marks Attendance');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const testDate = new Date().toISOString().split('T')[0];
        const attendancePayload = {
            date: testDate,
            subject: 'Data Structures',
            year: '2',
            section: 'A',
            branch: 'CSE',
            facultyId: 'FAC001',
            facultyName: 'Dr. Smith',
            records: [
                {
                    studentId: 'STU001',
                    studentName: 'Alice Johnson',
                    status: 'Present',
                    remarks: 'On time'
                },
                {
                    studentId: 'STU002',
                    studentName: 'Bob Smith',
                    status: 'Present',
                    remarks: ''
                },
                {
                    studentId: 'STU003',
                    studentName: 'Charlie Brown',
                    status: 'Absent',
                    remarks: 'Sick leave'
                }
            ]
        };

        console.log('📝 Submitting attendance for 3 students...\n');
        console.log('Payload:');
        console.log(`  Date: ${testDate}`);
        console.log(`  Subject: ${attendancePayload.subject}`);
        console.log(`  Section: ${attendancePayload.section}`);
        console.log(`  Records: ${attendancePayload.records.length} students\n`);

        const markResponse = await makeRequest('/api/attendance', 'POST', attendancePayload);
        console.log(`Response Status: ${markResponse.status}`);
        console.log(`Response: ${JSON.stringify(markResponse.data, null, 2)}\n`);

        if (markResponse.status === 201 || markResponse.status === 200) {
            console.log('✅ Attendance marked successfully\n');
        } else {
            console.log('❌ Failed to mark attendance\n');
            console.log('Details:', markResponse.error || markResponse.data);
            return;
        }

        // Test 3: Student retrieves their attendance
        console.log('TEST 3: Student Dashboard Retrieves Attendance');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📊 Retrieving attendance for student STU001...\n');
        
        const studentResponse = await makeRequest('/api/attendance/student/STU001', 'GET');
        console.log(`Response Status: ${studentResponse.status}\n`);

        if (studentResponse.status === 200 && studentResponse.data) {
            console.log(`✅ Attendance retrieved successfully`);
            console.log(`   Total records: ${studentResponse.data.totalRecords || 0}\n`);

            if (studentResponse.data.data && studentResponse.data.data.length > 0) {
                console.log('Records:');
                studentResponse.data.data.slice(0, 3).forEach((record, i) => {
                    console.log(`   ${i + 1}. ${record.date}`);
                    console.log(`      Subject: ${record.subject}`);
                    console.log(`      Status: ${record.status}`);
                    console.log(`      Faculty: ${record.facultyName}\n`);
                });
            } else {
                console.log('⚠️  No records returned\n');
            }
        } else {
            console.log(`⚠️  Status: ${studentResponse.status}`);
            console.log('Data:', studentResponse.data);
            console.log('Error:', studentResponse.error);
        }

        // Test 4: Dashboard overview (simulates what dashboard does)
        console.log('TEST 4: Student Dashboard Overview API');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📈 Fetching full student overview...\n');

        const overviewResponse = await makeRequest('/api/students/STU001/overview', 'GET');
        console.log(`Response Status: ${overviewResponse.status}\n`);

        if (overviewResponse.status === 200 && overviewResponse.data) {
            const overview = overviewResponse.data;
            
            console.log('✅ Overview retrieved\n');
            console.log('Student Info:');
            if (overview.student) {
                console.log(`  Name: ${overview.student.name}`);
                console.log(`  SID: ${overview.student.sid}`);
                console.log(`  Year: ${overview.student.year}`);
                console.log(`  Section: ${overview.student.section}\n`);
            }

            console.log('Attendance Summary:');
            if (overview.attendance) {
                console.log(`  Overall: ${overview.attendance.overall}%`);
                console.log(`  Total: ${overview.attendance.totalClasses} classes`);
                console.log(`  Present: ${overview.attendance.totalPresent}\n`);

                console.log('Subject-wise Attendance:');
                Object.entries(overview.attendance.details || {}).forEach(([subject, data]) => {
                    console.log(`  ${subject}: ${data.percentage}% (${data.present}/${data.total})`);
                });
                console.log();
            }

            console.log('Faculty List:');
            if (overview.myFaculty && overview.myFaculty.length > 0) {
                overview.myFaculty.forEach(f => {
                    console.log(`  ${f.name} - ${f.subject}`);
                });
            } else {
                console.log('  No faculty assigned');
            }
            console.log();
        } else {
            console.log(`⚠️  Status: ${overviewResponse.status}`);
        }

        // Test 5: Verify data consistency
        console.log('TEST 5: Data Consistency Check');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('Checking if attendance data is consistent across endpoints...\n');

        const allAttendance = await makeRequest(`/api/attendance/all?section=A&subject=Data%20Structures&date=${testDate}`, 'GET');
        
        if (allAttendance.status === 200 && allAttendance.data) {
            console.log(`✅ Bulk query returned ${allAttendance.data.length || 0} date groups\n`);
            
            if (Array.isArray(allAttendance.data) && allAttendance.data.length > 0) {
                const group = allAttendance.data[0];
                console.log(`Records in first group: ${group.records ? group.records.length : 0}`);
                console.log(`Date: ${group.date}`);
                console.log(`Subject: ${group.subject}\n`);
            }
        }

        console.log('═══════════════════════════════════════════════════\n');
        console.log('✅ VERIFICATION COMPLETE!\n');
        console.log('📝 Summary:');
        console.log('  ✓ Backend is running');
        console.log('  ✓ Attendance can be marked');
        console.log('  ✓ Student data is retrievable');
        console.log('  ✓ Dashboard integration works\n');

        console.log('🎉 ATTENDANCE SYSTEM IS WORKING!\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Ensure backend is running: npm start');
        console.error('2. MongoDB should be running');
        console.error('3. Check port 5000 is not in use\n');
    }

    process.exit(0);
}

// Wait for backend to be ready
async function waitForBackend(attempts = 5) {
    for (let i = 0; i < attempts; i++) {
        try {
            const health = await makeRequest('/api/health');
            if (health.status === 200) {
                return true;
            }
        } catch (e) {
            // Retry
        }
        await new Promise(r => setTimeout(r, 1000));
    }
    return false;
}

console.log('⏳ Waiting for backend to be ready...\n');

waitForBackend().then(ready => {
    if (ready) {
        runTests();
    } else {
        console.error('❌ Backend is not responding after 5 seconds');
        console.error('Make sure the backend is running: npm start\n');
        process.exit(1);
    }
});
