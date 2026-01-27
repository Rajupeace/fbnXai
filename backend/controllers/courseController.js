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

        // Require MongoDB as single source-of-truth for courses used by dashboards
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'MongoDB not connected. Course creation unavailable.' });
        }

        try {
            const mongoCourse = new Course({
                ...newCourseData,
                code: finalCode,
            });
            await mongoCourse.save();
            newCourseData._id = mongoCourse._id;
            newCourseData.source = 'mongodb';

            // Notify front-end dashboards about new course
            try { global.broadcastEvent && global.broadcastEvent({ resource: 'courses', action: 'create', data: { id: mongoCourse._id.toString(), course: newCourseData } }); } catch (e) { }
        } catch (mongoErr) {
            console.error("Mongo Course Creation Failed:", mongoErr.message);
            return res.status(500).json({ message: 'Failed to create course in MongoDB' });
        }

        res.status(201).json(newCourseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourses = async (req, res) => {
    try {
        let allCourses = [];

        // Return MongoDB authoritative data only
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'MongoDB not connected. Courses unavailable.' });
        }

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
            console.error('Mongo Course Fetch Error:', mongoErr.message);
            return res.status(500).json({ message: 'Failed to fetch courses from MongoDB' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        // Require MongoDB for deletion to keep dashboards consistent
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'MongoDB not connected. Course deletion unavailable.' });
        }

        try {
            if (mongoose.Types.ObjectId.isValid(id)) {
                await Course.findByIdAndDelete(id);
            } else {
                await Course.findOneAndDelete({ code: id });
            }

            // Notify front-end dashboards about deleted course
            try { global.broadcastEvent && global.broadcastEvent({ resource: 'courses', action: 'delete', data: { id } }); } catch (e) {}

            res.json({ message: 'Course deleted' });
        } catch (error) {
            console.error('Course Delete Error:', error.message);
            res.status(500).json({ message: 'Failed to delete course' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
