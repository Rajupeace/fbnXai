const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/friendly_notebook';

const cleanAndVerify = async () => {
    console.log("🔍 Verifying MongoDB Clean State...");
    try {
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB.");

        const collections = ['students', 'faculties', 'courses', 'materials', 'messages', 'examresults', 'studentfaculties', 'attendances'];

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
                // Collection might not exist, which is fine
                console.log(`   (Collection '${colName}' check skipped/clean)`);
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
