const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Use environment variable or default
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

const Student = require('./models/Student');

async function updateStudents() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('\n✅ Connected to MongoDB\n');
        console.log('='.repeat(80));
        console.log('🔧 UPDATING STUDENTS WITH YEAR/SECTION');
        console.log('='.repeat(80));

        // Check total students
        const totalStudents = await Student.countDocuments();
        console.log(`\n📊 Total Students: ${totalStudents}\n`);

        if (totalStudents === 0) {
            console.log('⚠️  NO STUDENTS FOUND!');
            console.log('   Creating sample students for testing...\n');

            // Create sample students for Year 3, Sections A and B
            const sampleStudents = [];

            // Section A students (40 students)
            for (let i = 1; i <= 40; i++) {
                sampleStudents.push({
                    sid: `23104${String(i).padStart(3, '0')}`,
                    studentName: `Student ${i} (Section A)`,
                    email: `student${i}a@test.com`,
                    password: 'password123',
                    branch: 'CSE',
                    year: '3',
                    section: 'A',
                    phone: `98765${String(i).padStart(5, '0')}`,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            // Section B students (35 students)
            for (let i = 1; i <= 35; i++) {
                sampleStudents.push({
                    sid: `23105${String(i).padStart(3, '0')}`,
                    studentName: `Student ${i} (Section B)`,
                    email: `student${i}b@test.com`,
                    password: 'password123',
                    branch: 'CSE',
                    year: '3',
                    section: 'B',
                    phone: `98766${String(i).padStart(5, '0')}`,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            await Student.insertMany(sampleStudents);
            console.log(`✅ Created ${sampleStudents.length} sample students!`);
            console.log(`   - Year 3, Section A: 40 students`);
            console.log(`   - Year 3, Section B: 35 students\n`);

        } else {
            // Check for students missing year or section
            const studentsWithoutYear = await Student.find({
                $or: [
                    { year: null },
                    { year: '' },
                    { year: { $exists: false } }
                ]
            }).lean();

            const studentsWithoutSection = await Student.find({
                $or: [
                    { section: null },
                    { section: '' },
                    { section: { $exists: false } }
                ]
            }).lean();

            console.log(`Students missing 'year': ${studentsWithoutYear.length}`);
            console.log(`Students missing 'section': ${studentsWithoutSection.length}\n`);

            if (studentsWithoutYear.length > 0 || studentsWithoutSection.length > 0) {
                console.log('🔧 Fixing students missing year/section...\n');

                // Update all students without year - assign year 3
                if (studentsWithoutYear.length > 0) {
                    const result = await Student.updateMany(
                        {
                            $or: [
                                { year: null },
                                { year: '' },
                                { year: { $exists: false } }
                            ]
                        },
                        { $set: { year: '3' } }
                    );
                    console.log(`✅ Updated ${result.modifiedCount} students with year='3'`);
                }

                // Update all students without section - assign section A or B alternately
                if (studentsWithoutSection.length > 0) {
                    const studentsToFix = await Student.find({
                        $or: [
                            { section: null },
                            { section: '' },
                            { section: { $exists: false } }
                        ]
                    });

                    for (let i = 0; i < studentsToFix.length; i++) {
                        const section = i % 2 === 0 ? 'A' : 'B';
                        await Student.updateOne(
                            { _id: studentsToFix[i]._id },
                            { $set: { section } }
                        );
                    }
                    console.log(`✅ Updated ${studentsToFix.length} students with sections (A/B alternating)`);
                }

                console.log('\n✅ All students now have year and section!\n');
            } else {
                console.log('✅ All students already have year and section fields!\n');
            }
        }

        // Show final statistics
        const uniqueYears = await Student.distinct('year');
        const uniqueSections = await Student.distinct('section');

        console.log('='.repeat(80));
        console.log('📊 FINAL STUDENT STATISTICS:');
        console.log('='.repeat(80));
        console.log(`Total Students: ${await Student.countDocuments()}`);
        console.log(`Years: ${uniqueYears.join(', ')}`);
        console.log(`Sections: ${uniqueSections.join(', ')}`);

        // Show distribution
        console.log('\n📊 Distribution:');
        for (const year of uniqueYears) {
            for (const section of uniqueSections) {
                const count = await Student.countDocuments({ year, section });
                if (count > 0) {
                    console.log(`   Year ${year}, Section ${section}: ${count} students`);
                }
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('✅ UPDATE COMPLETE!');
        console.log('='.repeat(80) + '\n');

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.\n');
        process.exit(0);
    }
}

updateStudents();
