const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Faculty = require('../models/Faculty');

// Specific requirement: Year 2 CSE sec 1, 13 AND Year 2 ECE sec 2, 4
const complexFaculty = {
    name: "Dr. Multiverse Strange",
    facultyId: "FAC-MULTI-01",
    email: "strange@nexus.edu",
    department: "Cross-Disciplinary",
    designation: "Dean of Academics",
    qualification: "PhD (MIT)",
    experience: "25 Years",
    specialization: "Quantum Computing",
    assignments: [
        { year: "2", section: "1", branch: "CSE", subject: "Advanced Algorithms" },
        { year: "2", section: "13", branch: "CSE", subject: "Advanced Algorithms" },
        { year: "2", section: "2", branch: "ECE", subject: "Digital Signal Processing" },
        { year: "2", section: "4", branch: "ECE", subject: "Digital Signal Processing" }
    ]
};

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/fbnXai");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        await seedSpecific();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const seedSpecific = async () => {
    try {
        console.log('Applying Complex Faculty Assignments...');

        const passwordHash = await bcrypt.hash('password123', 10);

        const facultyData = {
            ...complexFaculty,
            password: passwordHash,
            updatedAt: new Date()
        };

        // Upsert: Update if exists, Insert if new
        await Faculty.findOneAndUpdate(
            { facultyId: complexFaculty.facultyId },
            { $set: facultyData },
            { upsert: true, new: true }
        );

        console.log('✅ COMPLEX ASSIGNMENT FIXED: Dr. Strange assigned to [Year 2 CSE 1 & 13] and [Year 2 ECE 2 & 4]');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

connectDB();
