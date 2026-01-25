const Course = require('../models/Course');
const dbHelper = require('../dbHelper');
const mongoose = require('mongoose');

exports.createCourse = async (req, res) => {
    try {
        const { code, name, branch, year, semester, courseCode, section } = req.body;
        const finalCode = code || courseCode;

        const newCourseData = {
            id: require('uuid').v4(),
            courseCode: finalCode,
            code: finalCode,
            name,
            branch,
            year,
            semester,
            section: section || 'All',
            createdAt: new Date().toISOString()
        };

        // Prefer MongoDB persistence. If DB connected, write only to MongoDB.
        if (mongoose.connection.readyState === 1) {
            try {
                const mongoCourse = new Course({
                    ...newCourseData,
                    code: finalCode,
                });
                await mongoCourse.save();
                newCourseData._id = mongoCourse._id;
                newCourseData.source = 'mongodb';
            } catch (mongoErr) {
                console.error("Mongo Course Creation Failed:", mongoErr.message);
                // Fallback: write to file DB only if Mongo failed
                const courses = dbHelper('courses').read() || [];
                courses.push(newCourseData);
                dbHelper('courses').write(courses);
                newCourseData.source = 'file-fallback';
            }
        } else {
            // Mongo not connected: write to file DB (legacy fallback)
            const courses = dbHelper('courses').read() || [];
            courses.push(newCourseData);
            dbHelper('courses').write(courses);
            newCourseData.source = 'file';
        }

        res.status(201).json(newCourseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourses = async (req, res) => {
    try {
        let allCourses = [];

        // If MongoDB connected, return Mongo-only authoritative data.
        if (mongoose.connection.readyState === 1) {
            try {
                const mongoCourses = await Course.find({}).lean();
                allCourses = mongoCourses.map(c => ({
                    ...c,
                    id: c._id.toString(),
                    courseCode: c.code || c.courseCode,
                    source: 'mongodb'
                }));
                return res.json(allCourses);
            } catch (mongoErr) {
                console.warn('Mongo Course Fetch Error:', mongoErr.message);
                // Fall through to file fallback below
            }
        }

        // Fallback to File DB when Mongo is not available
        const fileCourses = dbHelper('courses').read() || [];
        allCourses = fileCourses.map(fc => ({ ...fc, source: 'file' }));

        res.json(allCourses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Delete from MongoDB if connected
        if (mongoose.connection.readyState === 1) {
            try {
                if (mongoose.Types.ObjectId.isValid(id)) {
                    await Course.findByIdAndDelete(id);
                } else {
                    await Course.findOneAndDelete({ code: id });
                }
            } catch (mongoErr) {
                console.warn('Mongo Course Delete Error:', mongoErr.message);
            }
        }

        // 2. Delete from File DB
        const courses = dbHelper('courses').read() || [];
        const filtered = courses.filter(c => c.id !== id && c.courseCode !== id && c.code !== id);
        dbHelper('courses').write(filtered);

        res.json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
