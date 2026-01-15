const Course = require('../models/Course');
const dbHelper = require('../dbHelper');

exports.createCourse = async (req, res) => {
    try {
        const { courseCode, name, branch, year, semester } = req.body;
        const newCourse = {
            id: require('uuid').v4(),
            courseCode,
            name,
            branch,
            year,
            semester,
            createdAt: new Date().toISOString()
        };
        const courses = dbHelper('courses').read() || [];
        courses.push(newCourse);
        dbHelper('courses').write(courses);
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourses = async (req, res) => {
    try {
        const courses = dbHelper('courses').read() || [];
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const courses = dbHelper('courses').read() || [];
        const filtered = courses.filter(c => c.id !== req.params.id);
        dbHelper('courses').write(filtered);
        res.json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
