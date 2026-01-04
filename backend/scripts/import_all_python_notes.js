const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const sourceRoot = 'c:\\Users\\rajub\\OneDrive\\Desktop\\aiXfn\\PythonNotes';
const uploadsDir = path.join(__dirname, '../uploads');
const dataFile = path.join(__dirname, '../data/materials.json');

// Ensure source exists
if (!fs.existsSync(sourceRoot)) {
    console.error(`Source directory ${sourceRoot} not found!`);
    process.exit(1);
}

// Ensure uploads dir exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Read existing materials
let materials = [];
if (fs.existsSync(dataFile)) {
    materials = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    // Remove existing "System" uploaded Python notes to avoid duplicates/stale data during re-run
    // But keep "manual" uploads if any (though here we mostly assume we are refreshing the official notes)
    console.log('Cleaning up old system-uploaded Python notes...');
    materials = materials.filter(m => !(m.subject === 'Python' && m.uploadedBy === 'System'));
}

function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    items.forEach(item => {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
            // Recursive for subdirectories (which represent chapters in this case)
            // But we treat the top-level folder name as the "Module/Chapter" name for grouping
            processDirectory(fullPath);
        } else if (item.isFile() && item.name.toLowerCase().endsWith('.pdf')) {
            // It's a PDF
            // Determine Module Name from parent directory
            const parentDirName = path.basename(dirPath);

            // Generate a unique filename for upload to avoid collisions
            // e.g., "1_Chapter_1_Chapter_1_Python.pdf"
            const safeName = item.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const uniqueFileName = `${parentDirName.replace(/[^a-zA-Z0-9]/g, '')}_${safeName}`;
            const destPath = path.join(uploadsDir, uniqueFileName);

            // Copy file
            fs.copyFileSync(fullPath, destPath);
            console.log(`Copied: ${item.name} -> ${uniqueFileName}`);

            // Create DB Entry
            const newMaterial = {
                id: uuidv4(),
                title: item.name.replace('.pdf', ''), // Title is filename without extension
                description: `Notes from ${parentDirName}`,
                year: 'All',
                section: 'All',
                subject: 'Python',
                type: 'notes',
                module: parentDirName, // This will be used for Grouping (e.g., "1. Chapter 1")
                unit: '1',
                uploadedAt: new Date().toISOString(),
                filename: uniqueFileName,
                url: `/uploads/${uniqueFileName}`,
                uploadedBy: 'System',
                uploaderName: 'Admin',
                fileType: 'application/pdf'
            };

            materials.push(newMaterial);
        }
    });
}

console.log('Starting import...');
processDirectory(sourceRoot);

// Sort materials: We want them sorted by their module (Chapter 0, 1, 2...)
// Since module names are "0. Introduction", "1. Chapter 1", natural sort should work relatively well or we can refine later.
// For now, simple push is fine, frontend can sort or we relies on iteration order (though recursing directories might vary).

fs.writeFileSync(dataFile, JSON.stringify(materials, null, 2));
console.log('✅ All Python notes imported and database updated.');
