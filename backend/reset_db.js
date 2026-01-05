require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Course = require('./models/Course');
const Material = require('./models/Material');
const Message = require('./models/Message');
const ExamResult = require('./models/ExamResult');
// const Attendance = require('./models/Attendance'); // If model exists

const dataDir = path.join(__dirname, 'data');

const resetData = async () => {
    console.log("🚀 Starting System Reset...");

    // 1. Clear JSON Files (EXCEPT admin.json)
    console.log("📂 Cleaning JSON Data Stores...");
    const files = fs.readdirSync(dataDir);
    files.forEach(file => {
        if (file === 'admin.json') {
            console.log("   - Skipping admin.json (Preserving Credentials)");
            return;
        }
        if (file.endsWith('.json')) {
            // Reset to empty array
            fs.writeFileSync(path.join(dataDir, file), JSON.stringify([], null, 2));
            console.log(`   - Cleared ${file}`);
        }
    });

    // 2. Clear MongoDB
    // Fallback URI logic from config/db.js
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

    if (mongoUri) {
        console.log(`🍃 Connecting to MongoDB... (${mongoUri})`);
        try {
            await mongoose.connect(mongoUri);
            console.log("   Connected!");

            // Clear Collections
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
            // Add other models if needed

            // Optional: Drop studentFaculty collection if accessible direct
            try {
                await mongoose.connection.collection('studentFaculty').deleteMany({});
                console.log("   - Cleared studentFaculty collection");
            } catch (e) { }

            try {
                await mongoose.connection.collection('attendances').deleteMany({});
                console.log("   - Cleared attendances collection");
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

    console.log("🎉 System Reset Complete. All student/faculty data removed.");
    console.log("ℹ️  Admin credentials in 'backend/data/admin.json' are preserved.");
    process.exit(0);
};

resetData();
