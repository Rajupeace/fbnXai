const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function speedUpMongoDB() {
    console.log('🚀 Optimizing MongoDB for VuAiAgent...');

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');

        const collections = ['students', 'faculties', 'materials', 'attendances', 'schedules', 'messages'];

        for (const colName of collections) {
            console.log(`📦 Creating indexes for ${colName}...`);
            const col = mongoose.connection.collection(colName);

            // Create common indexes for fast search
            if (colName === 'students') {
                await col.createIndex({ sid: 1 }, { unique: true });
                await col.createIndex({ userId: 1 });
            } else if (colName === 'faculties') {
                await col.createIndex({ facultyId: 1 }, { unique: true });
            } else if (colName === 'materials') {
                await col.createIndex({ title: 'text', subject: 'text' });
                await col.createIndex({ branch: 1, year: 1 });
            } else if (colName === 'attendances') {
                await col.createIndex({ studentId: 1, date: -1 });
            }
        }

        console.log('🎯 VuAiAgent MongoDB Optimization COMPLETE!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Optimization failed:', err.message);
        process.exit(1);
    }
}

speedUpMongoDB();
