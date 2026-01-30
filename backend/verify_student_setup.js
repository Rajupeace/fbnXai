const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

const Student = require('./models/Student');
const Faculty = require('./models/Faculty');

async function verifySetup() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('\n' + '='.repeat(80));
        console.log('🔍 STUDENT SETUP VERIFICATION');
        console.log('='.repeat(80) + '\n');

        // 1. Check Students
        console.log('📚 CHECKING STUDENTS:');
        console.log('-'.repeat(80));

        const totalStudents = await Student.countDocuments();
        console.log(`Total Students: ${totalStudents}`);

        if (totalStudents === 0) {
            console.log('❌ NO STUDENTS FOUND!');
            console.log('   Run: node backend/update_students.js\n');
            return;
        }

        // Check year/section distribution
        const year3SectionA = await Student.countDocuments({ year: '3', section: 'A' });
        const year3SectionB = await Student.countDocuments({ year: '3', section: 'B' });

        console.log(`\nYear 3, Section A: ${year3SectionA} students ${year3SectionA > 0 ? '✅' : '❌'}`);
        console.log(`Year 3, Section B: ${year3SectionB} students ${year3SectionB > 0 ? '✅' : '❌'}`);

        // Show sample students
        console.log('\nSample Students (first 3):');
        const samples = await Student.find({}).limit(3).select('sid studentName year section branch').lean();
        samples.forEach((s, i) => {
            console.log(`  ${i + 1}. ${s.studentName || 'N/A'} (${s.sid})`);
            console.log(`     Year: ${s.year}, Section: ${s.section}, Branch: ${s.branch}`);
        });

        // 2. Check Faculty
        console.log('\n' + '='.repeat(80));
        console.log('👨‍🏫 CHECKING FACULTY:');
        console.log('-'.repeat(80));

        const faculty = await Faculty.findOne({ facultyId: '23104470' }).lean();

        if (!faculty) {
            console.log('❌ Faculty with ID 23104470 NOT FOUND!');
            console.log('   Please ensure faculty exists in database.\n');
        } else {
            console.log(`✅ Faculty Found: ${faculty.name || faculty.facultyName}`);
            console.log(`   Faculty ID: ${faculty.facultyId}`);

            if (faculty.assignments && faculty.assignments.length > 0) {
                console.log(`\n   Assignments (${faculty.assignments.length}):`);
                faculty.assignments.forEach((a, i) => {
                    console.log(`     ${i + 1}. ${a.subject || 'N/A'}`);
                    console.log(`        Year: ${a.year || 'NOT SET ❌'}, Section: ${a.section || 'NOT SET ❌'}`);

                    // Check if students exist for this assignment
                    if (a.year && a.section) {
                        Student.countDocuments({
                            year: String(a.year),
                            section: String(a.section)
                        }).then(count => {
                            console.log(`        → ${count} students match this assignment ${count > 0 ? '✅' : '❌'}`);
                        });
                    }
                });
            } else {
                console.log('⚠️  No assignments found for this faculty!');
            }
        }

        // Wait for async student count checks to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Verify API Endpoint Data
        console.log('\n' + '='.repeat(80));
        console.log('🔌 API ENDPOINT SIMULATION:');
        console.log('-'.repeat(80));

        if (faculty) {
            // Simulate what the API would return
            const studentFacultyCollection = mongoose.connection.collection('studentFaculty');
            const relationships = await studentFacultyCollection.find({ facultyId: '23104470' }).toArray();

            console.log(`\nStudent-Faculty Relationships: ${relationships.length}`);

            if (relationships.length === 0) {
                console.log('⚠️  No relationships found in studentFaculty collection');
                console.log('   API will return empty array: []');
                console.log('   You may need to create relationships in Admin Dashboard.');
            } else {
                const studentIds = relationships.map(r => r.studentId);
                const relatedStudents = await Student.find({ sid: { $in: studentIds } })
                    .select('sid studentName year section branch')
                    .lean();

                console.log(`\n   Related Students: ${relatedStudents.length}`);
                relatedStudents.slice(0, 3).forEach((s, i) => {
                    console.log(`     ${i + 1}. ${s.studentName} - Year ${s.year}, Section ${s.section}`);
                });

                if (relatedStudents.length > 3) {
                    console.log(`     ... and ${relatedStudents.length - 3} more`);
                }
            }
        }

        // 4. Final Recommendations
        console.log('\n' + '='.repeat(80));
        console.log('✅ VERIFICATION COMPLETE');
        console.log('='.repeat(80));

        console.log('\n📋 CHECKLIST:');
        console.log(`  ${totalStudents > 0 ? '✅' : '❌'} Students exist in database`);
        console.log(`  ${year3SectionA > 0 || year3SectionB > 0 ? '✅' : '❌'} Students have year/section fields`);
        console.log(`  ${faculty ? '✅' : '❌'} Faculty exists`);
        console.log(`  ${faculty && faculty.assignments && faculty.assignments.length > 0 ? '✅' : '❌'} Faculty has assignments`);

        console.log('\n🚀 NEXT STEPS:');
        if (totalStudents === 0) {
            console.log('  1. Run: node backend/update_students.js');
        }
        if (!faculty || !faculty.assignments || faculty.assignments.length === 0) {
            console.log('  1. Add faculty assignments in Admin Dashboard');
            console.log('  2. Ensure assignments have year and section fields');
        }
        console.log('  3. Refresh browser (Ctrl + Shift + R)');
        console.log('  4. Go to Faculty Dashboard → Marks');
        console.log('  5. Click section filter button');
        console.log('  6. Students should appear!\n');

    } catch (error) {
        console.error('\n❌ Verification Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.\n');
        process.exit(0);
    }
}

verifySetup();
