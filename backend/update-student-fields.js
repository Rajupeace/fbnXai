// DATABASE UPDATE SCRIPT - Add Year/Section to Students
// This script ensures all students have year and section fields

const { MongoClient } = require('mongodb');

// MongoDB Connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fbnXai';

async function updateStudentFields() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db();
        const studentsCollection = db.collection('students');

        // Get all students
        const students = await studentsCollection.find({}).toArray();
        console.log(`\n📊 Found ${students.length} students in database`);

        // Check what fields they have
        if (students.length > 0) {
            console.log('\n🔍 Sample student fields:', Object.keys(students[0]));
            console.log('Sample student:', students[0]);
        }

        // Count students missing year or section
        const missingFields = students.filter(s => !s.year || !s.section);
        console.log(`\n⚠️  ${missingFields.length} students missing year or section fields`);

        if (missingFields.length > 0) {
            console.log('\n📝 Students missing fields:');
            missingFields.slice(0, 5).forEach(s => {
                console.log(`  - ${s.studentId || s.sid || s._id}: year=${s.year || 'MISSING'}, section=${s.section || 'MISSING'}`);
            });
        }

        // Check for alternative field names
        const alternatives = students.filter(s =>
            (s.Year || s.currentYear || s.academicYear) &&
            (s.Section || s.class || s.classSection)
        );

        if (alternatives.length > 0) {
            console.log(`\n✅ ${alternatives.length} students have alternative field names`);
            console.log('Sample alternative fields:', {
                Year: alternatives[0].Year,
                Section: alternatives[0].Section,
                currentYear: alternatives[0].currentYear,
                class: alternatives[0].class
            });

            // Update students to add lowercase year/section fields
            console.log('\n🔧 Updating students with alternative fields...');
            let updated = 0;

            for (const student of alternatives) {
                const update = {};

                if (!student.year) {
                    update.year = student.Year || student.currentYear || student.academicYear;
                }

                if (!student.section) {
                    update.section = student.Section || student.class || student.classSection;
                }

                if (Object.keys(update).length > 0) {
                    await studentsCollection.updateOne(
                        { _id: student._id },
                        { $set: update }
                    );
                    updated++;
                }
            }

            console.log(`✅ Updated ${updated} students with year/section fields`);
        }

        // Final verification
        const finalCheck = await studentsCollection.find({
            year: { $exists: true },
            section: { $exists: true }
        }).toArray();

        console.log(`\n✅ Final count: ${finalCheck.length} students have year AND section fields`);

        // Show year/section distribution
        const distribution = {};
        finalCheck.forEach(s => {
            const key = `Year ${s.year} - Section ${s.section}`;
            distribution[key] = (distribution[key] || 0) + 1;
        });

        console.log('\n📊 Student distribution by year/section:');
        Object.keys(distribution).sort().forEach(key => {
            console.log(`  ${key}: ${distribution[key]} students`);
        });

        console.log('\n✅ Database update complete!');
        console.log('\n💡 Next steps:');
        console.log('  1. Refresh browser (Ctrl + Shift + R)');
        console.log('  2. Open browser console (F12)');
        console.log('  3. Check logs for student fetching');
        console.log('  4. Students should now appear in Marks section');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the update
updateStudentFields().catch(console.error);
