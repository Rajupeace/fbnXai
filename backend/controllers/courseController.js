const Course = require('../models/Course');
const dbHelper = require('../dbHelper');
const mongoose = require('mongoose');

exports.createCourse = async (req, res) => {
    try {
        const { code, name, branch, year, semester, courseCode } = req.body;
        const finalCode = code || courseCode;

        const newCourseData = {
            id: require('uuid').v4(),
            courseCode: finalCode,
            code: finalCode,
            name,
            branch,
            year,
            semester,
            createdAt: new Date().toISOString()
        };

        // 1. Save to File DB
        const courses = dbHelper('courses').read() || [];
        courses.push(newCourseData);
        dbHelper('courses').write(courses);

        // 2. Save to MongoDB if connected
        if (mongoose.connection.readyState === 1) {
            try {
                const mongoCourse = new Course({
                    ...newCourseData,
                    code: finalCode,
                });
                await mongoCourse.save();
                newCourseData._id = mongoCourse._id;
            } catch (mongoErr) {
                console.error("Mongo Course Creation Failed:", mongoErr.message);
            }
        }

        res.status(201).json(newCourseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourses = async (req, res) => {
    try {
        let allCourses = [];

        // 1. Try MongoDB
        if (mongoose.connection.readyState === 1) {
            try {
                const mongoCourses = await Course.find({}).lean();
                allCourses = mongoCourses.map(c => ({
                    ...c,
                    id: c._id.toString(),
                    courseCode: c.code || c.courseCode,
                    source: 'mongodb'
                }));
            } catch (mongoErr) {
                console.warn('Mongo Course Fetch Error:', mongoErr.message);
            }
        }

        // 2. Fallback to File DB and merge
        const fileCourses = dbHelper('courses').read() || [];
        fileCourses.forEach(fc => {
            const exists = allCourses.find(mc => (mc.code === (fc.code || fc.courseCode)) || (mc.courseCode === (fc.code || fc.courseCode)));
            if (!exists) {
                allCourses.push({ ...fc, source: 'file' });
            }
        });

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
