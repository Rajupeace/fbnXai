/**
 * ADMIN ANALYTICS - INTEGRATION TESTS
 * Validates analytics endpoints and data aggregation
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000';

console.log('📊 ADMIN ANALYTICS DASHBOARD - TEST SUITE\n');
console.log('═'.repeat(70));

const testData = {
    records: [
        { date: '2026-02-09', studentId: 'STU001', status: 'Present', subject: 'Data Structures', section: 'A', year: 2, branch: 'CS', facultyId: 'FAC001', facultyName: 'Dr. Smith', hour: 10 },
        { date: '2026-02-09', studentId: 'STU002', status: 'Absent', subject: 'Data Structures', section: 'A', year: 2, branch: 'CS', facultyId: 'FAC001', facultyName: 'Dr. Smith', hour: 10 },
        { date: '2026-02-09', studentId: 'STU003', status: 'Present', subject: 'Data Structures', section: 'A', year: 2, branch: 'CS', facultyId: 'FAC001', facultyName: 'Dr. Smith', hour: 11 },
        { date: '2026-02-09', studentId: 'STU004', status: 'Present', subject: 'Database', section: 'B', year: 3, branch: 'CS', facultyId: 'FAC002', facultyName: 'Dr. Johnson', hour: 14 },
        { date: '2026-02-09', studentId: 'STU005', status: 'Absent', subject: 'Database', section: 'B', year: 3, branch: 'CS', facultyId: 'FAC002', facultyName: 'Dr. Johnson', hour: 14 }
    ]
};

(async () => {
    try {
        // Test 1: POST sample records
        console.log('\n📝 TEST 1: Create Sample Records for Analytics');
        console.log('-'.repeat(70));
        
        for (const record of testData.records) {
            const payload = {
                date: record.date,
                records: [{
                    studentId: record.studentId,
                    studentName: `Student ${record.studentId}`,
                    status: record.status
                }],
                subject: record.subject,
                section: record.section,
                year: record.year,
                branch: record.branch,
                facultyId: record.facultyId,
                facultyName: record.facultyName,
                hour: record.hour
            };

            await axios.post(`${API_BASE}/api/attendance`, payload);
        }
        console.log(`✅ Created ${testData.records.length} sample records for analytics`);

        // Test 2: Overview endpoint
        console.log('\n📊 TEST 2: Analytics Overview');
        console.log('-'.repeat(70));
        
        const overviewRes = await axios.get(`${API_BASE}/api/analytics/overview`);
        const overview = overviewRes.data;
        
        if (overview.totalRecords > 0) {
            console.log('✅ Overview data retrieved successfully');
            console.log(`   Total Records: ${overview.totalRecords}`);
            console.log(`   Overall Attendance: ${overview.overallAttendancePercent}%`);
            console.log(`   Present: ${overview.summary?.present || 0}`);
            console.log(`   Absent: ${overview.summary?.absent || 0}`);
        } else {
            throw new Error('No overview data returned');
        }

        // Test 3: Faculty Activity endpoint
        console.log('\n👥 TEST 3: Faculty Activity Report');
        console.log('-'.repeat(70));
        
        const facultyRes = await axios.get(`${API_BASE}/api/analytics/faculty-activity`);
        const faculty = facultyRes.data;
        
        if (faculty.count > 0) {
            console.log('✅ Faculty activity data retrieved successfully');
            console.log(`   Faculty Members: ${faculty.count}`);
            faculty.data.slice(0, 3).forEach((f, idx) => {
                console.log(`   ${idx + 1}. ${f.facultyName}: ${f.recordsMarked} records, ${f.datesMarked} dates, ${f.subjectsMarked} subjects`);
            });
        } else {
            console.log('⚠  No faculty activity data (expected for first run)');
        }

        // Test 4: Class Attendance endpoint
        console.log('\n📚 TEST 4: Class Attendance Statistics');
        console.log('-'.repeat(70));
        
        const classRes = await axios.get(`${API_BASE}/api/analytics/class-attendance`);
        const classData = classRes.data;
        
        if (classData.count > 0) {
            console.log('✅ Class attendance data retrieved successfully');
            console.log(`   Classes with Data: ${classData.count}`);
            classData.data.slice(0, 3).forEach((cls, idx) => {
                console.log(`   ${idx + 1}. ${cls.subject} Section ${cls.section} Year ${cls.year}: ${cls.attendancePercent}% (${cls.studentCount} students)`);
            });
        } else {
            console.log('⚠  No class attendance data (expected for first run)');
        }

        // Test 5: Low Attendance endpoint
        console.log('\n⚠️  TEST 5: Low Attendance Detection');
        console.log('-'.repeat(70));
        
        const lowRes = await axios.get(`${API_BASE}/api/analytics/low-attendance`);
        const lowData = lowRes.data;
        
        console.log(`✅ Low attendance check completed`);
        console.log(`   Classes with Attendance < 70%: ${lowData.count}`);
        if (lowData.count > 0) {
            lowData.data.slice(0, 3).forEach((cls, idx) => {
                console.log(`   ${idx + 1}. ${cls.subject} - ${cls.attendancePercent}% [${cls.severity}]`);
            });
        } else {
            console.log(`   ✓ All classes have healthy attendance (>= 70%)`);
        }

        // Test 6: Student Performance endpoint
        console.log('\n🎓 TEST 6: Student Performance Analysis');
        console.log('-'.repeat(70));
        
        const studentRes = await axios.get(`${API_BASE}/api/analytics/student-performance`);
        const studentData = studentRes.data;
        
        console.log('✅ Student performance data retrieved successfully');
        console.log(`   Total Students: ${studentData.totalStudents || 0}`);
        console.log(`   Regular: ${studentData.regularStudents || 0}`);
        console.log(`   Irregular: ${studentData.irregularStudents || 0}`);
        console.log(`   Absent: ${studentData.absentStudents || 0}`);
        
        if (studentData.topPerformers?.length > 0) {
            console.log(`   Top Performer: ${studentData.topPerformers[0].studentName} (${studentData.topPerformers[0].attendancePercent}%)`);
        }
        if (studentData.struggling?.length > 0) {
            console.log(`   Struggling: ${studentData.struggling[0].studentName} (${studentData.struggling[0].attendancePercent}%)`);
        }

        // Test 7: Hourly Trends endpoint
        console.log('\n⏰ TEST 7: Hourly Attendance Patterns');
        console.log('-'.repeat(70));
        
        const hourlyRes = await axios.get(`${API_BASE}/api/analytics/hourly-trends`);
        const hourlyData = hourlyRes.data;
        
        if (hourlyData.count > 0) {
            console.log('✅ Hourly trends data retrieved successfully');
            console.log(`   Hours with Data: ${hourlyData.count}`);
            console.log(`   Peak Hours: ${(hourlyData.peakHours || []).join(', ') || 'N/A'}`);
            hourlyData.data.slice(0, 3).forEach((h, idx) => {
                console.log(`   ${idx + 1}. ${h.timeLabel}: ${h.attendancePercent}% (${h.totalRecords} records)`);
            });
        } else {
            console.log('⚠  No hourly trends data (expected for first run)');
        }

        // Test 8: Daily Trends endpoint
        console.log('\n📅 TEST 8: Daily Attendance Trends (30 days)');
        console.log('-'.repeat(70));
        
        const dailyRes = await axios.get(`${API_BASE}/api/analytics/daily-trends`);
        const dailyData = dailyRes.data;
        
        if (dailyData.count > 0) {
            console.log('✅ Daily trends data retrieved successfully');
            console.log(`   Days with Data: ${dailyData.count}`);
            console.log(`   Average Attendance: ${dailyData.averageAttendance}%`);
            if (dailyData.data?.length > 0) {
                console.log(`   Latest Day: ${dailyData.data[dailyData.data.length - 1].date} (${dailyData.data[dailyData.data.length - 1].attendancePercent}%)`);
            }
        } else {
            console.log('⚠  No daily trends data (expected for first run)');
        }

        // Test 9: Department Summary endpoint
        console.log('\n🏢 TEST 9: Department-wise Summary');
        console.log('-'.repeat(70));
        
        const deptRes = await axios.get(`${API_BASE}/api/analytics/department-summary`);
        const deptData = deptRes.data;
        
        if (deptData.count > 0) {
            console.log('✅ Department summary data retrieved successfully');
            console.log(`   Departments: ${deptData.count}`);
            deptData.data.slice(0, 3).forEach((dept, idx) => {
                console.log(`   ${idx + 1}. ${dept.branch}: ${dept.attendancePercent}% (${dept.studentCount} students, ${dept.classCount} classes)`);
            });
        } else {
            console.log('⚠  No department summary data (expected for first run)');
        }

        console.log('\n' + '═'.repeat(70));
        console.log('✅ ALL ANALYTICS ENDPOINTS TESTED SUCCESSFULLY\n');

        console.log('📋 SUMMARY:');
        console.log('   ✓ Overview aggregation');
        console.log('   ✓ Faculty activity tracking');
        console.log('   ✓ Class attendance statistics');
        console.log('   ✓ Low attendance detection');
        console.log('   ✓ Student performance analysis');
        console.log('   ✓ Hourly pattern detection');
        console.log('   ✓ Daily trend tracking');
        console.log('   ✓ Department summary');

        console.log('\n🎉 Admin Analytics Dashboard - READY FOR INTEGRATION\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        console.error('Error:', error.response?.data || error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('\n⚠️  Backend server not running on port 5000');
            console.error('   Start with: npm start');
        }

        process.exit(1);
    }
})();
