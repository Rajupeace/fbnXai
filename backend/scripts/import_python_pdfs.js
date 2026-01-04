const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const sourceDir = path.join(__dirname, '../../python_notes_source');
const uploadsDir = path.join(__dirname, '../uploads');
const dataFile = path.join(__dirname, '../data/materials.json');

// Ensure source exists (for this script's purpose)
if (!fs.existsSync(sourceDir)) {
    console.error('Source directory python_notes_source not found!');
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
}

// Files to import
const filesToImport = [
    {
        filename: 'Python_Intro.pdf',
        title: 'Python Introduction - Variables & Types',
        description: 'Comprehensive guide to Python basics.',
        module: 'Basics'
    },
    {
        filename: 'Python_OOP.pdf',
        title: 'Python OOP - Classes & Objects',
        description: 'Advanced Object Oriented Programming in Python.',
        module: 'Advanced'
    }
];

filesToImport.forEach(file => {
    const sourcePath = path.join(sourceDir, file.filename);
    const destPath = path.join(uploadsDir, file.filename);

    if (fs.existsSync(sourcePath)) {
        // Copy file
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${file.filename} to uploads.`);

        // Create Database Entry
        // Check if already exists to avoid duplicates
        const exists = materials.find(m => m.filename === file.filename && m.subject === 'Python');

        if (!exists) {
            const newMaterial = {
                id: uuidv4(),
                title: file.title,
                description: file.description,
                year: 'All',
                section: 'All',
                subject: 'Python',
                type: 'notes',
                module: file.module,
                unit: '1',
                uploadedAt: new Date().toISOString(),
                filename: file.filename,
                url: `/uploads/${file.filename}`, // Relative URL for backend
                uploadedBy: 'System',
                uploaderName: 'Admin',
                fileType: 'application/pdf'
            };
            materials.push(newMaterial);
            console.log(`Added DB entry for ${file.title}`);
        } else {
            console.log(`Entry for ${file.title} already exists.`);
        }
    } else {
        console.warn(`Source file ${file.filename} not found in ${sourceDir}`);
    }
});

// Save updated materials
fs.writeFileSync(dataFile, JSON.stringify(materials, null, 2));
console.log('✅ Python PDF notes imported successfully.');
