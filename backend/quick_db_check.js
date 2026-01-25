#!/usr/bin/env node

/**
 * Quick Database Status Check
 * Run this anytime to verify database connectivity and data
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fbn_xai_system';

async function quickCheck() {
    try {
        console.log('\n🔍 Quick Database Check...\n');

        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });

        console.log('✅ MongoDB: CONNECTED');
        console.log(`📊 Database: ${mongoose.connection.name}\n`);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Collections:');

        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            const icon = count > 0 ? '✅' : '⚠️ ';
            console.log(`   ${icon} ${col.name}: ${count} documents`);
        }

        console.log('\n✅ Database is healthy!\n');

    } catch (error) {
        console.error('\n❌ Database Error:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.error('💡 MongoDB is not running. Start it with:');
            console.error('   Windows: net start MongoDB');
            console.error('   Mac/Linux: sudo systemctl start mongod\n');
        }
    } finally {
        await mongoose.connection.close();
    }
}

quickCheck();
