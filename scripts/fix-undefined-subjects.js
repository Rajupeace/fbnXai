#!/usr/bin/env node

/**
 * FIX UNDEFINED SUBJECTS SCRIPT
 * Identifies and removes courses/schedules with undefined subjects
 */

const path = require('path');
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/friendly_notebook', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('connected', async () => {
    console.log('✅ MongoDB Connected\n');
    
    try {
        // Check courses collection
        const coursesCollection = db.collection('courses');
        const undefinedCourses = await coursesCollection.find({
            $or: [
                { name: { $exists: false } },
                { name: null },
                { name: '' }
            ]
        }).toArray();

        console.log('=== COURSES WITH UNDEFINED NAMES ===');
        if (undefinedCourses.length > 0) {
            console.log(`Found ${undefinedCourses.length} courses with undefined names:`);
            undefinedCourses.forEach(c => {
                console.log(`  - ID: ${c._id}, Subject: ${c.subject || 'N/A'}, Code: ${c.code || 'N/A'}`);
            });
            
            // Delete them
            const deleteResult = await coursesCollection.deleteMany({
                $or: [
                    { name: { $exists: false } },
                    { name: null },
                    { name: '' }
                ]
            });
            console.log(`✅ Deleted ${deleteResult.deletedCount} courses with undefined names\n`);
        } else {
            console.log('✅ No courses with undefined names found\n');
        }

        // Check schedules collection
        const schedulesCollection = db.collection('schedule');
        const undefinedSchedules = await schedulesCollection.find({
            $or: [
                { subject: { $exists: false } },
                { subject: null },
                { subject: '' }
            ]
        }).toArray();

        console.log('=== SCHEDULES WITH UNDEFINED SUBJECTS ===');
        if (undefinedSchedules.length > 0) {
            console.log(`Found ${undefinedSchedules.length} schedules with undefined subjects:`);
            undefinedSchedules.forEach(s => {
                console.log(`  - ID: ${s._id}, Time: ${s.time || 'N/A'}, Day: ${s.day || 'N/A'}`);
            });
            
            // Delete them
            const deleteResult = await schedulesCollection.deleteMany({
                $or: [
                    { subject: { $exists: false } },
                    { subject: null },
                    { subject: '' }
                ]
            });
            console.log(`✅ Deleted ${deleteResult.deletedCount} schedules with undefined subjects\n`);
        } else {
            console.log('✅ No schedules with undefined subjects found\n');
        }

        // Summary
        console.log('=== COLLECTION SUMMARY ===');
        const courseCount = await coursesCollection.countDocuments();
        const scheduleCount = await schedulesCollection.countDocuments();
        console.log(`Total Courses: ${courseCount}`);
        console.log(`Total Schedules: ${scheduleCount}`);
        console.log('\n✅ Database cleaned successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
});

db.on('error', (error) => {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
});
