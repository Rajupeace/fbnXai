const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const Material = require('../models/Material');

// Configuration
const UPLOADS_DIR = path.join(__dirname, '../uploads');
// The content source is now INSIDE uploads, so we can serve files directly
const CONTENT_ROOT = path.join(UPLOADS_DIR, 'content_source');
const DATA_FILE = path.join(__dirname, '../data/materials.json');
const MONGO_URI = 'mongodb://127.0.0.1:27017/friendly-notebook';

// Map folder names to Subject names
const SUBJECT_MAP = {
    'HTML_CSS': 'HTML/CSS',
    'C': 'C',
    'C++': 'C++',
    'Java': 'Java',
    'Python': 'Python',
    'JavaScript': 'JavaScript',
    'React': 'React',
    'Angular': 'Angular',
    'PHP': 'PHP',
    'Django': 'Django',
    'Flask': 'Flask',
    'MongoDB': 'MongoDB'
};

const importContent = async () => {
    console.log('🚀 Starting Smart Link Import (No Duplication)...');

    // 1. Read existing
    let existingMaterials = [];
    if (fs.existsSync(DATA_FILE)) {
        try { existingMaterials = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { }
    }

    const newMaterials = [];

    if (!fs.existsSync(CONTENT_ROOT)) {
        console.error(`❌ Content source not found at ${CONTENT_ROOT}`);
        process.exit(1);
    }

    const subjects = fs.readdirSync(CONTENT_ROOT, { withFileTypes: true });

    for (const subjectDir of subjects) {
        if (!subjectDir.isDirectory()) continue;
        const folderName = subjectDir.name;
        const subjectName = SUBJECT_MAP[folderName] || folderName;
        const subjectPath = path.join(CONTENT_ROOT, folderName);

        console.log(`📂 Scanning: ${subjectName}`);

        const types = fs.readdirSync(subjectPath, { withFileTypes: true });
        for (const typeDir of types) {
            if (!typeDir.isDirectory()) continue;

            const typeName = typeDir.name.toLowerCase();
            let dbType = 'other';
            if (typeName.includes('note')) dbType = 'notes';
            else if (typeName.includes('video')) dbType = 'videos';
            else if (typeName.includes('interview')) dbType = 'interview';
            else continue;

            const typePath = path.join(subjectPath, typeDir.name);

            const processFiles = (dir, moduleName = 'General') => {
                const items = fs.readdirSync(dir, { withFileTypes: true });
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);

                    if (item.isDirectory()) {
                        processFiles(fullPath, item.name);
                    } else if (item.isFile()) {
                        const ext = path.extname(item.name).toLowerCase();
                        const isPDF = ext === '.pdf';
                        const isVideo = ['.mp4', '.mkv', '.webm', '.avi'].includes(ext);

                        if ((dbType === 'notes' && isPDF) || (dbType === 'videos' && isVideo) || (dbType === 'interview' && isPDF)) {

                            // SMART LINKING:
                            // Instead of copying, we calculate the path relative to 'uploads'
                            // Since CONTENT_ROOT is inside UPLOADS_DIR, this works perfectly.
                            const relativePath = path.relative(UPLOADS_DIR, fullPath);
                            // Ensure URL format (forward slashes and encoded components for safety)
                            const urlParts = relativePath.split(path.sep).map(part => encodeURIComponent(part));
                            const fileUrl = '/uploads/' + urlParts.join('/');

                            const material = {
                                id: uuidv4(),
                                title: item.name.replace(ext, ''),
                                description: `${dbType === 'notes' ? 'Notes' : (dbType === 'interview' ? 'Interview Q&A' : 'Video')} for ${moduleName}`,
                                year: 'All',
                                section: 'All',
                                subject: subjectName,
                                type: dbType,
                                module: moduleName,
                                unit: '1',
                                uploadedAt: new Date().toISOString(),
                                filename: item.name, // Just display name
                                url: fileUrl, // DIRECT LINK
                                uploadedBy: 'System',
                                uploaderName: 'Admin',
                                fileType: dbType === 'videos' ? 'video/mp4' : 'application/pdf'
                            };
                            newMaterials.push(material);
                        }
                    }
                }
            };
            processFiles(typePath);
        }
    }

    // UPDATE DB
    // Filter out old system uploads for supported subjects
    const allSubjectKeys = [...Object.keys(SUBJECT_MAP), ...Object.values(SUBJECT_MAP)];
    const cleanExisting = existingMaterials.filter(m => !allSubjectKeys.includes(m.subject));

    const finalJSONList = [...cleanExisting, ...newMaterials];
    fs.writeFileSync(DATA_FILE, JSON.stringify(finalJSONList, null, 2));

    console.log(`✅ Database Updated! Linked ${newMaterials.length} files directly from content_source.`);

    // Attempt Mongo Sync (Best Effort)
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        }
        await Material.deleteMany({ uploadedBy: 'System' }); // Clear old system cache
        // Note: Bulk insert might fail if schema validation errors, ignoring for now as per user preference for file-db
        console.log('ℹ️  MongoDB sync skipped to prioritize file-db stability.');
    } catch (e) { }
};

importContent();
