#!/usr/bin/env node

/**
 * Dashboard Data Verification Script
 * Tests all API endpoints used by Student and Faculty dashboards
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Course = require('./models/Course');
const Message = require('./models/Message');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fbn_xai_system';

async function testDashboardEndpoints() {
    console.log('\n🧪 DASHBOARD DATA VERIFICATION\n');
    console.log('='.repeat(60));

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });

        console.log('✅ MongoDB Connected\n');

        // Test Student Dashboard Data
        console.log('📱 STUDENT DASHBOARD DATA:\n');

        const studentCount = await Student.countDocuments();
        console.log(`   Students in DB: ${studentCount}`);

        if (studentCount > 0) {
            const sampleStudent = await Student.findOne().lean();
            console.log(`   Sample Student ID: ${sampleStudent.sid}`);
            console.log(`   Sample Student Name: ${sampleStudent.studentName}`);
            console.log(`   Year: ${sampleStudent.year}, Branch: ${sampleStudent.branch}, Section: ${sampleStudent.section}`);

            // Check if student has attendance
            const hasAttendance = sampleStudent.attendance && sampleStudent.attendance.length > 0;
            console.log(`   Has Attendance Data: ${hasAttendance ? '✅ Yes' : '⚠️  No'}`);

            // Check if student has marks
            const hasMarks = sampleStudent.marks && sampleStudent.marks.length > 0;
            console.log(`   Has Marks Data: ${hasMarks ? '✅ Yes' : '⚠️  No'}`);
        } else {
            console.log('   ⚠️  No students found - Student Dashboard will be empty');
        }

        console.log('\n' + '-'.repeat(60) + '\n');

        // Test Faculty Dashboard Data
        console.log('👨‍🏫 FACULTY DASHBOARD DATA:\n');

        const facultyCount = await Faculty.countDocuments();
        console.log(`   Faculty in DB: ${facultyCount}`);

        if (facultyCount > 0) {
            const sampleFaculty = await Faculty.findOne().lean();
            console.log(`   Sample Faculty ID: ${sampleFaculty.facultyId}`);
            console.log(`   Sample Faculty Name: ${sampleFaculty.name}`);
            console.log(`   Department: ${sampleFaculty.department || 'N/A'}`);

            // Check assignments
            const hasAssignments = sampleFaculty.assignments && sampleFaculty.assignments.length > 0;
            console.log(`   Has Teaching Assignments: ${hasAssignments ? '✅ Yes' : '⚠️  No'}`);

            if (hasAssignments) {
                console.log(`   Number of Assignments: ${sampleFaculty.assignments.length}`);
                console.log(`   Sample Assignment:`, sampleFaculty.assignments[0]);
            }
        } else {
            console.log('   ⚠️  No faculty found - Faculty Dashboard will be empty');
        }

        console.log('\n' + '-'.repeat(60) + '\n');

        // Test Shared Data
        console.log('📚 SHARED DATA (Used by both dashboards):\n');

        const courseCount = await Course.countDocuments();
        console.log(`   Courses in DB: ${courseCount}`);

        const messageCount = await Message.countDocuments();
        console.log(`   Messages in DB: ${messageCount}`);

        // Check materials collection
        const materialsCollection = mongoose.connection.db.collection('materials');
        const materialCount = await materialsCollection.countDocuments();
        console.log(`   Materials in DB: ${materialCount}`);

        console.log('\n' + '='.repeat(60));

        // Summary
        console.log('\n📊 DASHBOARD READINESS SUMMARY:\n');

        const studentReady = studentCount > 0;
        const facultyReady = facultyCount > 0;
        const dataReady = courseCount > 0 || materialCount > 0;

        console.log(`   Student Dashboard: ${studentReady ? '✅ Ready' : '⚠️  No Data'}`);
        console.log(`   Faculty Dashboard: ${facultyReady ? '✅ Ready' : '⚠️  No Data'}`);
        console.log(`   Shared Resources: ${dataReady ? '✅ Ready' : '⚠️  No Data'}`);

        if (studentReady && facultyReady && dataReady) {
            console.log('\n✅ ALL DASHBOARDS READY TO USE!\n');
            console.log('💡 Tips:');
            console.log('   • Login as student to see Student Dashboard');
            console.log('   • Login as faculty to see Faculty Dashboard');
            console.log('   • Check browser console (F12) for data fetch logs');
            console.log('   • Data updates every 5 seconds automatically\n');
        } else {
            console.log('\n⚠️  SOME DASHBOARDS NEED DATA\n');
            console.log('💡 To add data:');
            if (!studentReady) console.log('   • Add students via Admin Dashboard');
            if (!facultyReady) console.log('   • Add faculty via Admin Dashboard');
            if (!dataReady) console.log('   • Add courses/materials via Admin Dashboard');
            console.log('\n');
        }

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED!\n');
        console.error('Error:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 MongoDB is not running. Start it with:');
            console.error('   • Windows: net start MongoDB');
            console.error('   • Mac/Linux: sudo systemctl start mongod\n');
        }
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Connection closed.\n');
    }
}

testDashboardEndpoints();
