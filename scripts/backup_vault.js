#!/usr/bin/env node

/**
 * FBN XAI - SENTINEL VAULT BACKUP SYSTEM
 * Version: 1.0
 * Performs a comprehensive backup of MongoDB collections and file-based data stores.
 */

const fs = require('fs');
const path = require('path');
// Use the project's local mongoose
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));

const MONGO_URI = 'mongodb://127.0.0.1:27017/friendly_notebook';
const BACKUP_ROOT = path.join(__dirname, '../backups');
const FILE_DATA_DIR = path.join(__dirname, '../backend/data');

const COLLECTIONS_TO_BACKUP = [
    'AdminData',
    'FacultyData',
    'StudentData',
    'AdminMessage',
    'students',
    'faculties',
    'courses',
    'materials',
    'messages',
    'schedule',
    'attendances',
    'todos'
];

async function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('🛡️  Sentinel Vault: Connected to Core Database');
        return true;
    } catch (error) {
        console.error('❌ Sentinel Vault: Connection Failure:', error.message);
        return false;
    }
}

async function backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(BACKUP_ROOT, `backup_v7_${timestamp}`);
    const latestDir = path.join(BACKUP_ROOT, 'latest');

    console.log(`🚀 Starting System Backup: ${timestamp}`);
    console.log(`📂 Destination: ${backupDir}`);
    console.log(`📡 Syncing: ${latestDir}\n`);

    await ensureDir(backupDir);
    await ensureDir(latestDir);

    const dbDir = path.join(backupDir, 'database');
    const filesDir = path.join(backupDir, 'file_storage');
    const latestDbDir = path.join(latestDir, 'database');
    const latestFilesDir = path.join(latestDir, 'file_storage');

    await ensureDir(dbDir);
    await ensureDir(filesDir);
    await ensureDir(latestDbDir);
    await ensureDir(latestFilesDir);

    const db = mongoose.connection.db;

    // 1. Database Backup
    console.log('📊 Exporting Database Collections...');
    for (const collName of COLLECTIONS_TO_BACKUP) {
        try {
            const collection = db.collection(collName);
            const data = await collection.find({}).toArray();
            const jsonContent = JSON.stringify(data, null, 2);

            // Save to timestamped dir
            fs.writeFileSync(path.join(dbDir, `${collName}.json`), jsonContent);
            // Save to latest dir
            fs.writeFileSync(path.join(latestDbDir, `${collName}.json`), jsonContent);

            console.log(`   ✅ ${collName.padEnd(20)} [${data.length} records]`);
        } catch (err) {
            console.warn(`   ⚠️  Failed to backup collection: ${collName} - ${err.message}`);
        }
    }

    // 2. File Storage Backup
    console.log('\n📂 Syncing File Storage...');
    if (fs.existsSync(FILE_DATA_DIR)) {
        const files = fs.readdirSync(FILE_DATA_DIR);
        for (const file of files) {
            const src = path.join(FILE_DATA_DIR, file);
            if (fs.lstatSync(src).isFile()) {
                fs.copyFileSync(src, path.join(filesDir, file));
                fs.copyFileSync(src, path.join(latestFilesDir, file));
                console.log(`   ✅ ${file}`);
            }
        }
    } else {
        console.log('   ⚠️  File storage directory not found.');
    }

    console.log('\n✨ Backup Complete!');
    console.log(`📦 Final Vault: ${backupDir}`);
    console.log(`🔄 Latest Sync: ${latestDir}`);
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   FBN XAI - SENTINEL VAULT BACKUP SYSTEM               ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const connected = await connectDB();
    if (!connected) process.exit(1);

    try {
        await backup();
    } catch (err) {
        console.error('❌ Critical Backup Error:', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

main();
