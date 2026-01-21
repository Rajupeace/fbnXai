const fs = require('fs');
const path = require('path');

const contentRoot = path.join(__dirname, '../uploads/content_source');

const courses = [
    'C', 'C++', 'Java', 'Python', 'JavaScript',
    'HTML_CSS', 'React', 'Angular', 'PHP',
    'Django', 'Flask', 'MongoDB'
];

const types = ['notes', 'videos', 'interview'];

// Helper to create a dummy PDF file content
const getPdfContent = (course, type, chapter) => {
    return `%PDF-1.4
%
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Kids[3 0 R]/Count 1>>
endobj
3 0 obj
<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>
endobj
4 0 obj
<</Length 100>>
stream
BT /F1 24 Tf 100 700 Td (${course} - ${type} - ${chapter}) Tj 100 650 Td (Placeholder content for this chapter.) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000117 00000 n
0000000222 00000 n
trailer
<</Size 5/Root 1 0 R>>
startxref
400
%%EOF`;
};

console.log("🚀 Starting Chapter Scaffolding...");

if (!fs.existsSync(contentRoot)) {
    fs.mkdirSync(contentRoot, { recursive: true });
}

courses.forEach(course => {
    console.log(`Processing Course: ${course}`);

    types.forEach(type => {
        const typePath = path.join(contentRoot, course, type);
        if (!fs.existsSync(typePath)) {
            fs.mkdirSync(typePath, { recursive: true });
        }

        // Create 10 Chapters
        for (let i = 1; i <= 10; i++) {
            const chapName = `Chapter ${i}`;
            const chapPath = path.join(typePath, chapName);

            if (!fs.existsSync(chapPath)) {
                fs.mkdirSync(chapPath, { recursive: true });
            }

            // Create a placeholder file so the import script sees the folder
            // Only creating for 'notes' and 'interview' as PDFs to keep it simple, 
            // 'videos' would need valid MP4s which are large. We'll skip video placeholders or use empty dummy.
            // User mostly asked for "notes and video and interview paper pdfs", so let's focus on PDFs.

            if (type === 'notes' || type === 'interview') {
                const fileName = `${course}_${type}_${chapName}_Placeholder.pdf`;
                const filePath = path.join(chapPath, fileName);

                // Only create if empty to avoid overwriting user data
                if (!fs.existsSync(filePath)) {
                    fs.writeFileSync(filePath, getPdfContent(course, type, chapName));
                }
            } else if (type === 'videos') {
                // For videos, maybe a text file explaining "Drop Video Here"
                // The import script checks for extensions, so txt won't import (which is good, keeps DB clean of fake videos)
                // But user wants to SEE the 'div box'. 
                // If no file is imported, no DB entry, no Div Box in UI.
                // We will skip creating fake video DB entries to avoid broken players.
                // But we create the FOLDER structure so user can drop files.
            }
        }
    });
});

console.log("✅ Scaffolding Complete! 10 Chapters created for all courses.");
