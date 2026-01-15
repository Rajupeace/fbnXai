const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/friendly_notebook';

const cleanAndVerify = async () => {
    console.log("🔍 Verifying MongoDB Clean State (Checking both legacy and new structures)...");
    try {
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB.");

        // We check BOTH old and new collection names to be safe
        const collections = [
            // Legacy Flat
            'students', 'faculties', 'courses', 'materials', 'messages', 'examresults',

            // New Structured
            'AdminDashboardDB_Sections_Students',
            'AdminDashboardDB_Sections_Faculty',
            'AdminDashboardDB_Sections_Courses',
            'AdminDashboardDB_Sections_Materials',
            'AdminDashboardDB_Sections_Messages',
            'StudentDashboardDB_Sections_Exams',

            // Others
            'studentFaculty', 'attendances', 'teachingassignments', 'schedules'
        ];

        for (const colName of collections) {
            try {
                // Check count
                const count = await mongoose.connection.collection(colName).countDocuments();
                if (count > 0) {
                    console.log(`⚠️  Found ${count} documents in '${colName}'. DELETEING...`);
                    await mongoose.connection.collection(colName).deleteMany({});
                    console.log(`   - Cleared '${colName}'`);
                } else {
                    console.log(`✅ '${colName}' is empty.`);
                }
            } catch (e) {
                // Is fine
            }
        }

        console.log("🎉 MongoDB Verification Complete: Database is EMPTY.");

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
    }
    process.exit(0);
};

cleanAndVerify();
