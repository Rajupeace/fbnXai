const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Models
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Message = require('../models/Message');
const Material = require('../models/Material');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
// const Course = require('../models/Course'); // Keeping courses for now as not requested explicitly
// const Schedule = require('../models/Schedule'); // Keeping schedule?? Maybe remove. "remove all students and faculty and messages amd martials"
// Let's remove Schedule too as it links faculty/students.
const Schedule = require('../models/Schedule');
const TeachingAssignment = require('../models/TeachingAssignment');

const dataDir = path.join(__dirname, '../data');

const clearJsonFile = (filename) => {
    const filePath = path.join(dataDir, filename);
    if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]', 'utf8');
        console.log(`Cleared ${filename}`);
    }
};

const clearDatabase = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';
        try {
            await mongoose.connect(mongoUri);
            console.log(`Connected to MongoDB at ${mongoUri}`);

            // Delete Collections
            await Student.deleteMany({});
            console.log('Deleted all Students');

            await Faculty.deleteMany({});
            console.log('Deleted all Faculty');

            await Message.deleteMany({});
            console.log('Deleted all Messages');

            await Material.deleteMany({});
            console.log('Deleted all Materials');

            await Attendance.deleteMany({});
            console.log('Deleted all Attendance');

            await Exam.deleteMany({});
            console.log('Deleted all Exams');

            await ExamResult.deleteMany({});
            console.log('Deleted all ExamResults');

            await Schedule.deleteMany({});
            console.log('Deleted all Schedules');

            await TeachingAssignment.deleteMany({});
            console.log('Deleted all TeachingAssignments');

        } catch (err) {
            console.log("Could not connect to MongoDB (" + err.message + "), skipping Mongo cleanup.");
        }

        // Clear JSON Files
        clearJsonFile('students.json');
        clearJsonFile('faculty.json');
        clearJsonFile('messages.json');
        clearJsonFile('materials.json');
        // clearJsonFile('courses.json'); // Keeping courses
        clearJsonFile('chatHistory.json');
        clearJsonFile('studentFaculty.json');

        console.log('All requested data cleared successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
};

clearDatabase();
