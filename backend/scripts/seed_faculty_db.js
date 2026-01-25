const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Faculty = require('../models/Faculty');

const sampleFaculty = [
    {
        name: "Dr. Anisha Gupta",
        facultyId: "FAC101",
        email: "anisha.g@vignan.edu",
        department: "CSE",
        designation: "Professor",
        qualification: "PhD (IIT Delhi)",
        experience: "15 Years",
        specialization: "Artificial Intelligence",
        assignments: [
            { year: "1", section: "A", branch: "CSE", subject: "Python Programming" },
            { year: "3", section: "B", branch: "CSE", subject: "Deep Learning" }
        ]
    },
    {
        name: "Prof. Rajesh Kumar",
        facultyId: "FAC102",
        email: "rajesh.k@vignan.edu",
        department: "CSE",
        designation: "Associate Professor",
        qualification: "M.Tech (NIT Warangal)",
        experience: "10 Years",
        specialization: "Data Structures",
        assignments: [
            { year: "2", section: "A", branch: "CSE", subject: "Data Structures" },
            { year: "2", section: "B", branch: "CSE", subject: "Algorithms" }
        ]
    },
    {
        name: "Dr. Sarah Thompson",
        facultyId: "FAC103",
        email: "sarah.t@vignan.edu",
        department: "ECE",
        designation: "Assistant Professor",
        qualification: "PhD (Stanford)",
        experience: "5 Years",
        specialization: "Signal Processing",
        assignments: [
            { year: "1", section: "A", branch: "ECE", subject: "Basic Electronics" }
        ]
    },
    {
        name: "Mirza Ali",
        facultyId: "FAC104",
        email: "mirza.ali@vignan.edu",
        department: "IT",
        designation: "Lecturer",
        qualification: "M.Tech",
        experience: "3 Years",
        specialization: "Web Technologies",
        assignments: [
            { year: "3", section: "A", branch: "IT", subject: "Full Stack Dev" }
        ]
    }
];

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/fbnXai");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        await seedFaculty();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const seedFaculty = async () => {
    try {
        const count = await Faculty.countDocuments();
        if (count > 0) {
            console.log(`Faculty collection already has ${count} records. Skipping seed.`);
            process.exit(0);
        }

        console.log('Seeding Faculty Data...');
        const passwordHash = await bcrypt.hash('password123', 10);

        const facultyWithPass = sampleFaculty.map(f => ({
            ...f,
            password: passwordHash
        }));

        await Faculty.insertMany(facultyWithPass);
        console.log('✅ Faculty Data Seeded Successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

connectDB();
