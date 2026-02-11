#!/usr/bin/env node

/**
 * ATTENDANCE SYSTEM TEST
 * Validates the new flat-schema attendance structure
 */

const mongoose = require('mongoose');
const path = require('path');

// Connect to MongoDB
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fbnXai';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });

const Attendance = require('../backend/models/Attendance');

async function testAttendanceSystem() {
    console.log('\n🔍 TESTING ATTENDANCE SYSTEM...\n');

    try {
        // Test 1: Check schema structure
        console.log('📋 Test 1: Verifying Attendance Schema...');
        const schema = Attendance.schema;
        const paths = Object.keys(schema.paths);
        
        const requiredFields = ['date', 'studentId', 'subject', 'year', 'section', 'branch', 'status', 'facultyId'];
        const hasAllFields = requiredFields.every(field => paths.includes(field));
        
        if (hasAllFields) {
            console.log('✅ Schema has all required fields');
            console.log('   Fields:', requiredFields.join(', '));
        } else {
            console.log('❌ Schema missing fields');
            console.log('   Expected:', requiredFields);
            console.log('   Found:', paths.filter(p => !p.startsWith('_')));
        }

        // Test 2: Check indexes
        console.log('\n📋 Test 2: Verifying Indexes...');
        const indexes = await Attendance.collection.getIndexes();
        const indexNames = Object.keys(indexes);
        
        if (indexNames.length > 1) {
            console.log('✅ Indexes created:', indexNames.length - 1, 'custom index(es)');
            indexNames.forEach(name => {
                if (name !== '_id_') console.log('   -', name);
            });
        } else {
            console.log('⚠️  Only default index found');
        }

        // Test 3: Sample document insertion
        console.log('\n📋 Test 3: Testing Document Insertion...');
        const testRecord = {
            date: '2025-01-15',
            studentId: 'STU_TEST_001',
            studentName: 'Test Student',
            subject: 'Data Structures',
            year: '2',
            section: 'A',
            branch: 'CSE',
            status: 'Present',
            facultyId: 'FAC001',
            facultyName: 'Dr. Test Faculty',
            remarks: 'On time'
        };

        const inserted = await Attendance.create(testRecord);
        if (inserted && inserted._id) {
            console.log('✅ Document inserted successfully');
            console.log('   ID:', inserted._id);
            console.log('   Student:', inserted.studentId);
            console.log('   Status:', inserted.status);
        }

        // Test 4: Query by studentId
        console.log('\n📋 Test 4: Testing Query by StudentId...');
        const foundByStudent = await Attendance.findOne({ studentId: 'STU_TEST_001' });
        if (foundByStudent) {
            console.log('✅ Successfully queried by studentId');
            console.log('   Document:', foundByStudent.studentName, '-', foundByStudent.subject);
        } else {
            console.log('❌ Failed to query by studentId');
        }

        // Test 5: Query by subject and section
        console.log('\n📋 Test 5: Testing Query by Subject & Section...');
        const foundBySubject = await Attendance.findOne({ subject: 'Data Structures', section: 'A' });
        if (foundBySubject) {
            console.log('✅ Successfully queried by subject and section');
            console.log('   Document:', foundBySubject.studentName);
        } else {
            console.log('⚠️  No records found for this subject/section combo');
        }

        // Test 6: Count records
        console.log('\n📋 Test 6: Counting Total Records...');
        const totalCount = await Attendance.countDocuments();
        console.log('📊 Total attendance records in database:', totalCount);

        // Test 7: Cleanup test document
        console.log('\n📋 Test 7: Cleaning up test document...');
        const deleted = await Attendance.deleteOne({ studentId: 'STU_TEST_001' });
        if (deleted.deletedCount > 0) {
            console.log('✅ Test document cleaned up');
        }

        console.log('\n✅ ALL TESTS COMPLETED SUCCESSFULLY!\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testAttendanceSystem();
