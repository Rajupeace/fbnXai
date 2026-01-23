#!/usr/bin/env node

/**
 * FBN XAI - SENTINEL VAULT RESTORE SYSTEM
 * Version: 1.0
 * Restores MongoDB collections and file-based data from the 'latest' backup.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));

const MONGO_URI = 'mongodb://127.0.0.1:27017/friendly_notebook';
const LATEST_BACKUP_DIR = path.join(__dirname, '../backups/latest');
const FILE_DATA_DIR = path.join(__dirname, '../backend/data');

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('🛡️  Sentinel Restore: Connected to Core Database');
        return true;
    } catch (error) {
        console.error('❌ Sentinel Restore: Connection Failure:', error.message);
        return false;
    }
}

async function restore() {
    if (!fs.existsSync(LATEST_BACKUP_DIR)) {
        console.error('❌ No latest backup found at ' + LATEST_BACKUP_DIR);
        return;
    }

    const dbDir = path.join(LATEST_BACKUP_DIR, 'database');
    const filesDir = path.join(LATEST_BACKUP_DIR, 'file_storage');
    const db = mongoose.connection.db;

    // 1. Restore Database
    console.log('📊 Importing Database Collections...');
    if (fs.existsSync(dbDir)) {
        const jsonFiles = fs.readdirSync(dbDir).filter(f => f.endsWith('.json'));
        for (const file of jsonFiles) {
            try {
                const collName = file.replace('.json', '');
                const data = JSON.parse(fs.readFileSync(path.join(dbDir, file), 'utf8'));

                if (data.length > 0) {
                    console.log(`   ⚙️  Restoring ${collName}...`);
                    await db.collection(collName).deleteMany({}); // Warning: Wipes current collection
                    await db.collection(collName).insertMany(data);
                    console.log(`   ✅ ${collName} [${data.length} records]`);
                }
            } catch (err) {
                console.warn(`   ⚠️  Failed to restore ${file}: ${err.message}`);
            }
        }
    }

    // 2. Restore File Storage
    console.log('\n📂 Restoring File Storage...');
    if (fs.existsSync(filesDir)) {
        if (!fs.existsSync(FILE_DATA_DIR)) {
            fs.mkdirSync(FILE_DATA_DIR, { recursive: true });
        }
        const files = fs.readdirSync(filesDir);
        for (const file of files) {
            const src = path.join(filesDir, file);
            const dest = path.join(FILE_DATA_DIR, file);
            fs.copyFileSync(src, dest);
            console.log(`   ✅ ${file}`);
        }
    }

    console.log('\n✨ Restore Complete! System state has been reset to the latest backup.');
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   FBN XAI - SENTINEL VAULT RESTORE SYSTEM              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('⚠️  WARNING: This will overwrite your current database with the latest backup data.');

    // Auto-run if argument --force is passed, otherwise maybe we should just provide the tool
    const connected = await connectDB();
    if (!connected) process.exit(1);

    try {
        await restore();
    } catch (err) {
        console.error('❌ Critical Restore Error:', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

main();
