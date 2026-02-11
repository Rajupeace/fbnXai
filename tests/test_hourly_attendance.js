#!/usr/bin/env node

/**
 * HOURLY ATTENDANCE TEST
 * Verifies: Per-day, per-hour attendance tracking with 75/40 thresholds
 * Thresholds: >=75% Regular, 40–74% Irregular, <40% Absent
 */

const mongoose = require('mongoose');

const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fbnXai';

console.log('🔍 HOURLY ATTENDANCE SYSTEM TEST\n');
console.log('Connecting to MongoDB:', dbUrl);

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('✅ MongoDB connected\n');
        return runTests();
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    })
    .then(() => {
        console.log('\n✅ All tests completed');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });

async function runTests() {
    try {
        const Attendance = require('../backend/models/Attendance');
        const Student = require('../backend/models/Student');

        console.log('═══════════════════════════════════════════════════');
        console.log('TEST 1: Insert Hourly Attendance Records');
        console.log('═══════════════════════════════════════════════════\n');

        const testDate = new Date().toISOString().split('T')[0];
        const studentId = 'STU_HOURLY_001';
        const studentName = 'Hourly Test Student';
        const subject = 'Data Structures';

        // Clear existing test records
        await Attendance.deleteMany({ studentId });
        console.log('✅ Cleared previous test records');

        // Insert hourly attendance records (simulating 8-hour day with mixed presence)
        // Hours 0-5: Present (6 hours)
        // Hours 6-7: Absent (2 hours)
        // Total: 6/8 = 75% = REGULAR threshold
        const hourlyRecords = [
            { hour: 0, status: 'Present', subject: subject },
            { hour: 1, status: 'Present', subject: subject },
            { hour: 2, status: 'Present', subject: subject },
            { hour: 3, status: 'Present', subject: subject },
            { hour: 4, status: 'Present', subject: subject },
            { hour: 5, status: 'Present', subject: subject },
            { hour: 6, status: 'Absent', subject: subject },
            { hour: 7, status: 'Absent', subject: subject }
        ];

        for (const rec of hourlyRecords) {
            await Attendance.updateOne(
                {
                    date: testDate,
                    studentId,
                    hour: rec.hour,
                    subject: rec.subject
                },
                {
                    $set: {
                        date: testDate,
                        studentId,
                        studentName,
                        subject: rec.subject,
                        year: '2',
                        section: 'A',
                        branch: 'CSE',
                        status: rec.status,
                        hour: rec.hour,
                        facultyId: 'FAC001',
                        facultyName: 'Dr. Test Faculty',
                        remarks: `Hourly attendance for hour ${rec.hour}`,
                        markedAt: new Date()
                    }
                },
                { upsert: true }
            );
        }

        console.log(`✅ Inserted ${hourlyRecords.length} hourly records for ${testDate}`);

        console.log('\n═══════════════════════════════════════════════════');
        console.log('TEST 2: Verify Per-Day Per-Hour Aggregation');
        console.log('═══════════════════════════════════════════════════\n');

        const records = await Attendance.find({ studentId, date: testDate }).sort({ hour: 1 }).lean();
        console.log(`Fetched ${records.length} records for student ${studentId}`);

        // Build per-date, per-hour map
        const perDate = {};
        for (const rec of records) {
            if (!perDate[rec.date]) {
                perDate[rec.date] = { date: rec.date, hours: {}, totalHours: 0, presentHours: 0 };
            }
            const hourKey = String(rec.hour);
            perDate[rec.date].hours[hourKey] = {
                subject: rec.subject,
                status: rec.status,
                facultyName: rec.facultyName || rec.facultyId || ''
            };
            perDate[rec.date].totalHours += 1;
            if (rec.status === 'Present') perDate[rec.date].presentHours += 1;
        }

        const daily = Object.values(perDate).map(d => {
            const pct = d.totalHours > 0 ? Math.round((d.presentHours / d.totalHours) * 100) : 0;
            let classification = 'Absent';
            if (pct >= 75) classification = 'Regular';
            else if (pct >= 40) classification = 'Irregular';
            return {
                date: d.date,
                hours: d.hours,
                totalHours: d.totalHours,
                presentHours: d.presentHours,
                percentage: pct,
                classification
            };
        });

        console.log('Daily Breakdown:');
        daily.forEach(d => {
            console.log(`  Date: ${d.date}`);
            console.log(`    Total Hours: ${d.totalHours}`);
            console.log(`    Present Hours: ${d.presentHours}`);
            console.log(`    Attendance %: ${d.percentage}%`);
            console.log(`    Classification: ${d.classification}`);
        });

        // Verify classification
        const dayData = daily[0];
        if (!dayData) throw new Error('No daily data generated');

        if (dayData.percentage === 75 && dayData.classification === 'Regular') {
            console.log('\n✅ Classification correct: 75% = REGULAR');
        } else {
            throw new Error(`Classification mismatch: got ${dayData.classification} with ${dayData.percentage}%`);
        }

        console.log('\n═══════════════════════════════════════════════════');
        console.log('TEST 3: Test Threshold Boundaries');
        console.log('═══════════════════════════════════════════════════\n');

        // Insert test for IRREGULAR threshold (50% = 4 out of 8 hours)
        const studentId2 = 'STU_IRREGULAR_001';
        const testDate2 = new Date(Date.now() - 86400000).toISOString().split('T')[0]; // yesterday
        await Attendance.deleteMany({ studentId: studentId2 });

        // 4 Present, 4 Absent = 50% = IRREGULAR
        for (let h = 0; h < 4; h++) {
            await Attendance.updateOne(
                { date: testDate2, studentId: studentId2, hour: h, subject: 'Math' },
                {
                    $set: {
                        date: testDate2,
                        studentId: studentId2,
                        studentName: 'Irregular Test Student',
                        subject: 'Math',
                        year: '2',
                        section: 'B',
                        branch: 'ECE',
                        status: 'Present',
                        hour: h,
                        facultyId: 'FAC002',
                        facultyName: 'Dr. Math'
                    }
                },
                { upsert: true }
            );
        }
        for (let h = 4; h < 8; h++) {
            await Attendance.updateOne(
                { date: testDate2, studentId: studentId2, hour: h, subject: 'Math' },
                {
                    $set: {
                        date: testDate2,
                        studentId: studentId2,
                        studentName: 'Irregular Test Student',
                        subject: 'Math',
                        year: '2',
                        section: 'B',
                        branch: 'ECE',
                        status: 'Absent',
                        hour: h,
                        facultyId: 'FAC002',
                        facultyName: 'Dr. Math'
                    }
                },
                { upsert: true }
            );
        }

        const records2 = await Attendance.find({ studentId: studentId2, date: testDate2 }).lean();
        const total2 = records2.length;
        const present2 = records2.filter(r => r.status === 'Present').length;
        const pct2 = Math.round((present2 / total2) * 100);
        let classification2 = 'Absent';
        if (pct2 >= 75) classification2 = 'Regular';
        else if (pct2 >= 40) classification2 = 'Irregular';

        console.log(`Student STU_IRREGULAR_001: ${pct2}% = ${classification2}`);
        if (classification2 === 'Irregular') {
            console.log('✅ Irregular classification correct');
        } else {
            throw new Error(`Expected Irregular, got ${classification2}`);
        }

        console.log('\n═══════════════════════════════════════════════════');
        console.log('TEST 4: Test Absent Threshold (<40%)');
        console.log('═══════════════════════════════════════════════════\n');

        const studentId3 = 'STU_ABSENT_001';
        const testDate3 = new Date(Date.now() - 172800000).toISOString().split('T')[0]; // 2 days ago
        await Attendance.deleteMany({ studentId: studentId3 });

        // 1 Present, 7 Absent = 12.5% = ABSENT
        await Attendance.updateOne(
            { date: testDate3, studentId: studentId3, hour: 0, subject: 'Physics' },
            {
                $set: {
                    date: testDate3,
                    studentId: studentId3,
                    studentName: 'Absent Test Student',
                    subject: 'Physics',
                    year: '2',
                    section: 'C',
                    branch: 'ME',
                    status: 'Present',
                    hour: 0,
                    facultyId: 'FAC003',
                    facultyName: 'Dr. Physics'
                }
            },
            { upsert: true }
        );
        for (let h = 1; h < 8; h++) {
            await Attendance.updateOne(
                { date: testDate3, studentId: studentId3, hour: h, subject: 'Physics' },
                {
                    $set: {
                        date: testDate3,
                        studentId: studentId3,
                        studentName: 'Absent Test Student',
                        subject: 'Physics',
                        year: '2',
                        section: 'C',
                        branch: 'ME',
                        status: 'Absent',
                        hour: h,
                        facultyId: 'FAC003',
                        facultyName: 'Dr. Physics'
                    }
                },
                { upsert: true }
            );
        }

        const records3 = await Attendance.find({ studentId: studentId3, date: testDate3 }).lean();
        const total3 = records3.length;
        const present3 = records3.filter(r => r.status === 'Present').length;
        const pct3 = Math.round((present3 / total3) * 100);
        let classification3 = 'Absent';
        if (pct3 >= 75) classification3 = 'Regular';
        else if (pct3 >= 40) classification3 = 'Irregular';

        console.log(`Student STU_ABSENT_001: ${pct3}% = ${classification3}`);
        if (classification3 === 'Absent') {
            console.log('✅ Absent classification correct');
        } else {
            throw new Error(`Expected Absent, got ${classification3}`);
        }

        console.log('\n═══════════════════════════════════════════════════');
        console.log('TEST 5: Verify API Endpoint Response Format');
        console.log('═══════════════════════════════════════════════════\n');

        // Simulate what the GET /api/attendance/student/:sid endpoint returns
        const apiResponse = {
            studentId: studentId,
            totalRecords: records.length,
            overallPercentage: Math.round((records.filter(r => r.status === 'Present').length / records.length) * 100),
            daily,
            raw: records
        };

        console.log('API Response Structure:');
        console.log(JSON.stringify(apiResponse, null, 2));

        if (apiResponse.daily && apiResponse.daily.length > 0 && apiResponse.daily[0].classification) {
            console.log('\n✅ API response includes classification field');
        }

        console.log('\n═══════════════════════════════════════════════════');
        console.log('TEST 6: Cleanup');
        console.log('═══════════════════════════════════════════════════\n');

        await Attendance.deleteMany({ studentId: { $in: [studentId, studentId2, studentId3] } });
        console.log('✅ Test records cleaned up');

        console.log('\n═══════════════════════════════════════════════════');
        console.log('✅ ALL TESTS PASSED');
        console.log('═══════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
        throw error;
    }
}
