require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { RESOURCE_MAP } = require('./dashboardConfig');

// Models
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Course = require('./models/Course');
const Material = require('./models/Material');
const Message = require('./models/Message');
const ExamResult = require('./models/ExamResult');

const resetData = async () => {
    console.log("🚀 Starting System Reset (New Structure Compatible)...");

    // 1. Clear JSON Files (EXCEPT admin)
    console.log("📂 Cleaning JSON Data Stores...");
    Object.entries(RESOURCE_MAP).forEach(([key, filePath]) => {
        if (key === 'admin') {
            console.log("   - Skipping admin (Preserving Credentials)");
            return;
        }

        // Only clear if exists
        if (fs.existsSync(filePath)) {
            try {
                // If it's a file, empty array
                fs.writeFileSync(filePath, JSON.stringify([], null, 2));
                console.log(`   - Cleared ${key} -> ${filePath}`);
            } catch (e) {
                console.error(`   ! Failed to clear ${key}:`, e.message);
            }
        }
    });

    // 2. Clear MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

    if (mongoUri) {
        console.log(`🍃 Connecting to MongoDB...`);
        try {
            await mongoose.connect(mongoUri);
            console.log("   Connected!");

            console.log("   - Deleting Students...");
            await Student.deleteMany({});

            console.log("   - Deleting Faculty...");
            await Faculty.deleteMany({});

            console.log("   - Deleting Courses...");
            await Course.deleteMany({});

            console.log("   - Deleting Materials...");
            await Material.deleteMany({});

            console.log("   - Deleting Messages...");
            await Message.deleteMany({});

            if (mongoose.models.ExamResult) {
                console.log("   - Deleting ExamResults...");
                await ExamResult.deleteMany({});
            }

            try {
                await mongoose.connection.collection('studentFaculty').deleteMany({});
                console.log("   - Cleared studentFaculty collection");
            } catch (e) { }

            try {
                await mongoose.connection.collection('attendances').deleteMany({});
                console.log("   - Cleared attendances collection");
            } catch (e) { }

            try {
                await mongoose.connection.collection('teachingassignments').deleteMany({});
                console.log("   - Cleared teachingassignments collection");
            } catch (e) { }

            console.log("✅ MongoDB Cleared Successfully.");
        } catch (err) {
            console.error("❌ MongoDB Clean failed:", err);
        } finally {
            await mongoose.disconnect();
        }
    } else {
        console.log("⚠️ No MONGO_URI found. Skipping MongoDB clean.");
    }

    console.log("🎉 System Reset Complete.");
    process.exit(0);
};

resetData();
