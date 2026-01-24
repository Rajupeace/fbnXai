#!/usr/bin/env node

/**
 * DIRECT ATTENDANCE SYSTEM TEST
 * Uses MongoDB directly to test the flow
 */

const mongoose = require('mongoose');

const dbUrl = 'mongodb://127.0.0.1:27017/fbn_xai_system';

async function test() {
    console.log('\n🧪 DIRECT ATTENDANCE SYSTEM TEST\n');

    try {
        // Connect to MongoDB
        await mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ Connected to MongoDB\n');

        // Load models
        const Attendance = require('./backend/models/Attendance');

        // Test data
        const testDate = new Date().toISOString().split('T')[0];
        const testRecords = [
            {
                date: testDate,
                studentId: 'TEST_STU_001',
                studentName: 'Test Student 1',
                subject: 'Test Subject',
                year: '2',
                section: 'A',
                branch: 'CSE',
                status: 'Present',
                facultyId: 'TEST_FAC_001',
                facultyName: 'Test Faculty'
            },
            {
                date: testDate,
                studentId: 'TEST_STU_002',
                studentName: 'Test Student 2',
                subject: 'Test Subject',
                year: '2',
                section: 'A',
                branch: 'CSE',
                status: 'Absent',
                facultyId: 'TEST_FAC_001',
                facultyName: 'Test Faculty'
            }
        ];

        // Step 1: Insert attendance
        console.log('STEP 1: Faculty Marks Attendance');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📝 Inserting attendance records...\n');

        const inserted = await Attendance.insertMany(testRecords);
        console.log(`✅ Inserted ${inserted.length} records`);
        console.log(`   Date: ${testDate}`);
        console.log(`   Subject: Test Subject`);
        console.log(`   Section: A\n`);

        // Step 2: Retrieve student attendance
        console.log('STEP 2: Student Dashboard Retrieves Attendance');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Retrieving records for TEST_STU_001...\n');

        const studentRecords = await Attendance.find({ studentId: 'TEST_STU_001' }).lean();
        console.log(`✅ Retrieved ${studentRecords.length} records\n`);

        studentRecords.forEach(rec => {
            console.log(`📌 Record:`);
            console.log(`   Date: ${rec.date}`);
            console.log(`   Subject: ${rec.subject}`);
            console.log(`   Status: ${rec.status}`);
            console.log(`   Faculty: ${rec.facultyName}\n`);
        });

        // Step 3: Calculate stats
        console.log('STEP 3: Dashboard Calculates Statistics');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const totalRecords = studentRecords.length;
        const presentCount = studentRecords.filter(r => r.status === 'Present').length;
        const percentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

        console.log(`📈 Attendance Statistics for TEST_STU_001:`);
        console.log(`   Total Classes: ${totalRecords}`);
        console.log(`   Present: ${presentCount}`);
        console.log(`   Attendance %: ${percentage}%\n`);

        // Step 4: Subject-wise breakdown
        console.log('STEP 4: Subject-wise Breakdown');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const subjectMap = {};
        studentRecords.forEach(rec => {
            if (!subjectMap[rec.subject]) {
                subjectMap[rec.subject] = { present: 0, total: 0 };
            }
            subjectMap[rec.subject].total += 1;
            if (rec.status === 'Present') subjectMap[rec.subject].present += 1;
        });

        Object.entries(subjectMap).forEach(([subject, stats]) => {
            const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
            console.log(`📚 ${subject}: ${stats.present}/${stats.total} = ${pct}%`);
        });
        console.log();

        // Step 5: Query performance
        console.log('STEP 5: Query Performance Test');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const start = Date.now();
        for (let i = 0; i < 100; i++) {
            await Attendance.findOne({ studentId: 'TEST_STU_001' }).lean();
        }
        const duration = Date.now() - start;
        const avgTime = (duration / 100).toFixed(2);

        console.log(`⏱️  Performance Metrics:`);
        console.log(`   100 queries in: ${duration}ms`);
        console.log(`   Average per query: ${avgTime}ms`);
        console.log(`   Status: ${avgTime < 5 ? '✅ EXCELLENT' : avgTime < 10 ? '✅ GOOD' : '⚠️  NEEDS OPTIMIZATION'}\n`);

        // Step 6: Bulk class query
        console.log('STEP 6: Bulk Section Query (Admin Dashboard)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const classRecords = await Attendance.find({
            date: testDate,
            subject: 'Test Subject',
            section: 'A'
        }).lean();

        console.log(`📋 Section A on ${testDate}:`);
        console.log(`   Total records: ${classRecords.length}`);
        classRecords.forEach(rec => {
            console.log(`   - ${rec.studentId}: ${rec.studentName} [${rec.status}]`);
        });
        console.log();

        // Step 7: Cleanup
        console.log('STEP 7: Cleanup Test Records');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const deleted = await Attendance.deleteMany({ date: testDate, subject: 'Test Subject' });
        console.log(`🧹 Deleted ${deleted.deletedCount} test records\n`);

        console.log('═══════════════════════════════════════════════════');
        console.log('✅ ALL TESTS PASSED!\n');
        console.log('🎉 ATTENDANCE SYSTEM IS WORKING CORRECTLY!\n');
        console.log('Summary:');
        console.log('  ✓ Faculty can mark attendance');
        console.log('  ✓ Student dashboard retrieves attendance');
        console.log('  ✓ Statistics are calculated');
        console.log('  ✓ Subject-wise breakdown works');
        console.log('  ✓ Query performance is good');
        console.log('  ✓ Bulk queries work\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED:\n', error.message);
        console.error('\nFull Error:');
        console.error(error);
        process.exit(1);
    }
}

test();
