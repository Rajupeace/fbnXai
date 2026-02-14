const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Student = require('../backend/models/Student');
const Course = require('../backend/models/Course');
const Mark = require('../backend/models/Mark');
const Attendance = require('../backend/models/Attendance');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/friendly_notebook';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Failed to connect:', err.message);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        const students = await Student.find({}).lean();
        console.log(`Found ${students.length} students.`);

        const allCourses = await Course.find({}).lean();
        console.log(`Found ${allCourses.length} total courses.`);

        let updates = 0;

        for (const student of students) {
            // Find enrolled courses based on year/branch/section
            // Simplified logic matching studentController
            const enrolled = allCourses.filter(c => {
                const yearMatch = String(c.year) === String(student.year);
                if (!yearMatch) return false;

                const sBranch = (student.branch || '').toLowerCase();
                const cBranch = (c.branch || '').toLowerCase();
                const branchMatch = cBranch === 'all' || cBranch === 'common' || cBranch === sBranch;
                if (!branchMatch) return false;

                const sSec = (student.section || '').toUpperCase();
                const cSec = (c.section || 'All').toUpperCase();

                // Handle overrides specifically
                if (c.code === 'EMPTY__OVERRIDE') {
                    return cSec === 'ALL' || cSec === sSec;
                }

                return cSec === 'ALL' || cSec === sSec;
            });

            // Filter out overrides from the list itself (we just used them to check active state)
            const activeCourses = enrolled.filter(c => c.code !== 'EMPTY__OVERRIDE');

            console.log(`Processing Student ${student.studentName} (${student.sid}): Found ${activeCourses.length} active courses.`);

            for (const course of activeCourses) {
                const subjectName = course.name || course.courseName;
                if (!subjectName) continue;

                // Check Marks
                const existingMarks = await Mark.findOne({ studentId: student.sid, subject: subjectName });
                if (!existingMarks) {
                    console.log(`  -> Seeding Marks for ${subjectName}...`);

                    // Create Dummy Marks
                    await Mark.create([
                        { studentId: student.sid, subject: subjectName, assessmentType: 'cla1', marks: 18, maxMarks: 20 },
                        { studentId: student.sid, subject: subjectName, assessmentType: 'cla2', marks: 17, maxMarks: 20 },
                        { studentId: student.sid, subject: subjectName, assessmentType: 'm1_t1', marks: 9, maxMarks: 10 },
                        { studentId: student.sid, subject: subjectName, assessmentType: 'm1_t2', marks: 8, maxMarks: 10 }
                    ]);
                    updates++;
                }

                // Check Attendance
                const existingAtt = await Attendance.countDocuments({ studentId: String(student.sid), subject: subjectName });
                if (existingAtt === 0) {
                    console.log(`  -> Seeding Attendance for ${subjectName}...`);

                    // Add 10 random classes
                    const attRecords = [];
                    for (let i = 0; i < 10; i++) {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        const status = Math.random() > 0.2 ? 'Present' : 'Absent';
                        attRecords.push({
                            studentId: String(student.sid),
                            subject: subjectName,
                            date: date.toISOString().split('T')[0],
                            hour: 1,
                            status: status,
                            facultyName: 'System Auto-Seed',
                            year: student.year,
                            section: student.section,
                            branch: student.branch
                        });
                    }
                    await Attendance.insertMany(attRecords);
                    updates++;
                }
            }
        }

        console.log(`Seeding Complete. Updated ${updates} resource sets.`);
        process.exit(0);

    } catch (err) {
        console.error('Error seeding:', err);
        process.exit(1);
    }
};

seedData();
