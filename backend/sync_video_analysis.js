require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

console.log('🔄 Syncing Video Analysis Data to MongoDB\n');
console.log('═'.repeat(70));

async function syncVideoAnalysis() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const Material = require('./models/Material');

        // Read materials.json
        const materialsPath = path.join(__dirname, 'data', 'materials.json');
        const materialsData = JSON.parse(fs.readFileSync(materialsPath, 'utf8'));

        console.log(`📄 Loaded ${materialsData.length} materials from JSON file`);

        // Filter materials with video analysis
        const materialsWithAnalysis = materialsData.filter(m =>
            m.videoAnalysis && m.videoAnalysis.trim() !== ''
        );

        console.log(`🎥 Found ${materialsWithAnalysis.length} materials with video analysis`);

        // Update MongoDB
        let updated = 0;
        let created = 0;

        for (const material of materialsWithAnalysis) {
            try {
                // Try to find existing material by title and metadata
                const existing = await Material.findOne({
                    title: material.title,
                    year: String(material.year),
                    subject: material.subject,
                    type: material.type
                });

                if (existing) {
                    // Update existing
                    existing.videoAnalysis = material.videoAnalysis;
                    await existing.save();
                    updated++;
                    console.log(`   ✅ Updated: ${material.title}`);
                } else {
                    // Create new (don't set _id, let MongoDB generate it)
                    const newMaterial = new Material({
                        title: material.title,
                        year: String(material.year),
                        section: material.section,
                        subject: material.subject,
                        type: material.type,
                        module: material.module,
                        unit: material.unit,
                        branch: material.branch,
                        fileUrl: material.url || material.fileUrl,
                        videoAnalysis: material.videoAnalysis,
                        uploadedBy: material.uploadedBy || 'system',
                        uploaderName: material.uploaderName || 'SENTINEL CORE',
                        isAdvanced: material.isAdvanced || false
                    });
                    await newMaterial.save();
                    created++;
                    console.log(`   ✨ Created: ${material.title}`);
                }
            } catch (err) {
                console.error(`   ❌ Error processing ${material.title}:`, err.message);
            }
        }

        console.log('\n' + '═'.repeat(70));
        console.log('📊 SYNC SUMMARY');
        console.log('═'.repeat(70));
        console.log(`✅ Updated: ${updated} materials`);
        console.log(`✨ Created: ${created} materials`);
        console.log(`📝 Total processed: ${updated + created} materials`);

        // Verify sync
        const totalWithAnalysis = await Material.countDocuments({
            videoAnalysis: { $exists: true, $ne: null, $ne: '' }
        });
        console.log(`\n🎯 Total materials with video analysis in DB: ${totalWithAnalysis}`);

        console.log('\n🎉 SYNC COMPLETE!\n');

    } catch (error) {
        console.error('\n❌ SYNC FAILED:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

syncVideoAnalysis();
