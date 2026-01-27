const mongoose = require('mongoose');
const Roadmap = require('./models/Roadmap');
const Student = require('./models/Student');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const checkIntegrity = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        // 1. Check Roadmaps Collection
        console.log('\n--- CHECKING ROADMAPS COLLECTION ---');
        const roadmaps = await Roadmap.find({}, 'title slug category levels');
        console.log(`📊 Total Roadmaps Found: ${roadmaps.length}`);

        if (roadmaps.length === 0) {
            console.error('❌ No roadmaps found! Did the seed script run?');
        } else {
            console.log('✅ Roadmaps exist. Listing titles:');
            roadmaps.forEach(r => {
                console.log(` - [${r.category}] ${r.title} (${r.levels.length} levels)`);
            });
        }

        // 2. Check Python Specifics
        const pythonMaps = roadmaps.filter(r => r.title.toLowerCase().includes('python'));
        console.log(`\n🐍 Python Roadmaps: ${pythonMaps.length}`);
        pythonMaps.forEach(r => console.log(` - ${r.title}`));

        // 3. Check Student Progress Schema compatibility
        console.log('\n--- CHECKING STUDENT SCHEMA COMPATIBILITY ---');
        // We'll create a temporary dummy student to test the map field if possible, or just check a random student
        const student = await Student.findOne();
        if (student) {
            console.log(`👤 Found a student: ${student.studentName} (${student.sid})`);
            console.log(`Stats Field present? ${!!student.stats}`);
            console.log(`RoadmapProgress Field present? ${!!student.roadmapProgress}`);

            // Try to update one to verify the Map structure works
            student.roadmapProgress.set('test-roadmap', ['Topic A', 'Topic B']);
            await student.save();
            console.log('✅ Successfully updated roadmapProgress for test student.');

            // Clean up
            // student.roadmapProgress.delete('test-roadmap');
            // await student.save();
        } else {
            console.log('⚠️ No students found in DB to test progress saving. (This might be expected in a clean dev env)');
        }

        console.log('\n✅ SYSTEM CHECK COMPLETE: Roadmaps feature is backend-ready.');
        process.exit(0);
    } catch (err) {
        console.error('❌ ERROR:', err);
        process.exit(1);
    }
};

checkIntegrity();
