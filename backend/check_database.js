#!/usr/bin/env node

/**
 * Database Connectivity & Data Verification Script
 * 
 * This script checks:
 * 1. MongoDB connection status
 * 2. Data counts in all collections
 * 3. Sample data from each collection
 * 4. Database health
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Course = require('./models/Course');
const Message = require('./models/Message');
const Admin = require('./models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fbn_xai_system';

async function checkDatabase() {
    console.log('🔍 DATABASE CONNECTIVITY CHECK\n');
    console.log('='.repeat(60));

    try {
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        console.log(`   URI: ${MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4
        });

        console.log('✅ MongoDB Connected Successfully!\n');
        console.log('='.repeat(60));

        // Check each collection
        console.log('\n📊 COLLECTION DATA COUNTS:\n');

        const studentCount = await Student.countDocuments();
        console.log(`   👨‍🎓 Students: ${studentCount}`);

        const facultyCount = await Faculty.countDocuments();
        console.log(`   👨‍🏫 Faculty: ${facultyCount}`);

        const courseCount = await Course.countDocuments();
        console.log(`   📚 Courses: ${courseCount}`);

        const messageCount = await Message.countDocuments();
        console.log(`   📧 Messages: ${messageCount}`);

        const adminCount = await Admin.countDocuments();
        console.log(`   🔐 Admins: ${adminCount}`);

        console.log('\n' + '='.repeat(60));

        // Show sample data
        console.log('\n📋 SAMPLE DATA:\n');

        if (studentCount > 0) {
            const sampleStudent = await Student.findOne().select('sid studentName year branch section').lean();
            console.log('   Sample Student:', JSON.stringify(sampleStudent, null, 2));
        } else {
            console.log('   ⚠️  No students found in database');
        }

        if (facultyCount > 0) {
            const sampleFaculty = await Faculty.findOne().select('facultyId name department assignments').lean();
            console.log('\n   Sample Faculty:', JSON.stringify(sampleFaculty, null, 2));
        } else {
            console.log('\n   ⚠️  No faculty found in database');
        }

        if (courseCount > 0) {
            const sampleCourse = await Course.findOne().select('code name branch year').lean();
            console.log('\n   Sample Course:', JSON.stringify(sampleCourse, null, 2));
        } else {
            console.log('\n   ⚠️  No courses found in database');
        }

        console.log('\n' + '='.repeat(60));

        // Database health check
        console.log('\n🏥 DATABASE HEALTH:\n');

        const dbStats = await mongoose.connection.db.stats();
        console.log(`   Database Name: ${mongoose.connection.name}`);
        console.log(`   Collections: ${dbStats.collections}`);
        console.log(`   Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Indexes: ${dbStats.indexes}`);

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ DATABASE CHECK COMPLETE!\n');

        // Recommendations
        console.log('💡 RECOMMENDATIONS:\n');

        if (studentCount === 0) {
            console.log('   ⚠️  No students in database. Add students via Admin Dashboard.');
        }

        if (facultyCount === 0) {
            console.log('   ⚠️  No faculty in database. Add faculty via Admin Dashboard.');
        }

        if (courseCount === 0) {
            console.log('   ⚠️  No courses in database. Add courses via Admin Dashboard.');
        }

        if (adminCount === 0) {
            console.log('   ⚠️  No admin accounts. Create one using the registration endpoint.');
        }

        if (studentCount > 0 && facultyCount > 0 && courseCount > 0) {
            console.log('   ✅ Database has data! Dashboards should display real data.');
        }

        console.log('\n');

    } catch (error) {
        console.error('\n❌ DATABASE CHECK FAILED!\n');
        console.error('Error:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 MongoDB is not running. Start MongoDB with:');
            console.error('   • Windows: net start MongoDB');
            console.error('   • Mac/Linux: sudo systemctl start mongod');
            console.error('   • Docker: docker start mongodb');
        } else if (error.message.includes('authentication failed')) {
            console.error('\n💡 Authentication failed. Check MONGO_URI credentials.');
        } else if (error.message.includes('ENOTFOUND')) {
            console.error('\n💡 Cannot resolve MongoDB host. Check network and MONGO_URI.');
        }

        console.error('\n');
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed.\n');
    }
}

// Run the check
checkDatabase().catch(console.error);
