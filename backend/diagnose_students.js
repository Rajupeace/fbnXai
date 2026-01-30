const mongoose = require('mongoose');

// MongoDB Connection String
const mongoURI = 'mongodb+srv://rajeshbabu:RajeshBabu123@cluster0.ucfar.mongodb.net/AdminDashboardDB?retryWrites=true&w=majority';

mongoose.connect(mongoURI)
    .then(() => {
        console.log('\n✅ Connected to MongoDB Atlas!\n');
        return runDiagnostics();
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

async function runDiagnostics() {
    try {
        console.log('='.repeat(80));
        console.log('🔍 STUDENT DATA DIAGNOSTICS');
        console.log('='.repeat(80));

        // Check students collection
        const Student = mongoose.model('Student', new mongoose.Schema({}, { strict: false }), 'AdminDashboardDB_Sections_Students');

        const totalStudents = await Student.countDocuments();
        console.log(`\n📊 Total Students in Database: ${totalStudents}\n`);

        if (totalStudents === 0) {
            console.log('⚠️  NO STUDENTS FOUND IN DATABASE!');
            console.log('   You need to add students first.\n');
        } else {
            // Get sample students
            const sampleStudents = await Student.find({}).limit(5).lean();

            console.log('📋 Sample Students (first 5):');
            console.log('-'.repeat(80));

            sampleStudents.forEach((student, idx) => {
                console.log(`\n${idx + 1}. Student ID: ${student.sid || student._id}`);
                console.log(`   Name: ${student.studentName || student.name || 'N/A'}`);
                console.log(`   Year: ${student.year || 'NOT SET ❌'}`);
                console.log(`   Section: ${student.section || 'NOT SET ❌'}`);
                console.log(`   Branch: ${student.branch || student.department || 'NOT SET'}`);
                console.log(`   Email: ${student.email || 'N/A'}`);
            });

            // Check for students missing year/section
            const studentsWithoutYear = await Student.countDocuments({ $or: [{ year: null }, { year: '' }, { year: { $exists: false } }] });
            const studentsWithoutSection = await Student.countDocuments({ $or: [{ section: null }, { section: '' }, { section: { $exists: false } }] });

            console.log('\n' + '='.repeat(80));
            console.log('⚠️  MISSING FIELD ANALYSIS:');
            console.log('='.repeat(80));
            console.log(`Students missing 'year' field: ${studentsWithoutYear}`);
            console.log(`Students missing 'section' field: ${studentsWithoutSection}`);

            if (studentsWithoutYear > 0 || studentsWithoutSection > 0) {
                console.log('\n❌ PROBLEM FOUND: Some students are missing year/section fields!');
                console.log('   This is why they are not showing up in Faculty Marks section.\n');
            } else {
                console.log('\n✅ All students have year and section fields!\n');
            }

            // Get unique years and sections
            const uniqueYears = await Student.distinct('year');
            const uniqueSections = await Student.distinct('section');

            console.log('='.repeat(80));
            console.log('📊 UNIQUE VALUES:');
            console.log('='.repeat(80));
            console.log(`Years: ${uniqueYears.filter(y => y).join(', ') || 'NONE'}`);
            console.log(`Sections: ${uniqueSections.filter(s => s).join(', ') || 'NONE'}`);

            // Check faculty assignments
            console.log('\n' + '='.repeat(80));
            console.log('👨‍🏫 FACULTY ASSIGNMENTS CHECK:');
            console.log('='.repeat(80));

            const Faculty = mongoose.model('Faculty', new mongoose.Schema({}, { strict: false }), 'AdminDashboardDB_Faculty');
            const faculty = await Faculty.findOne({ facultyId: '23104470' }).lean();

            if (faculty) {
                console.log(`\nFaculty: ${faculty.name || faculty.facultyName}`);
                console.log(`Faculty ID: ${faculty.facultyId}`);
                console.log(`\nAssignments:`);

                if (faculty.assignments && faculty.assignments.length > 0) {
                    faculty.assignments.forEach((assign, idx) => {
                        console.log(`  ${idx + 1}. Subject: ${assign.subject || assign.name || 'N/A'}`);
                        console.log(`     Year: ${assign.year || 'NOT SET ❌'}`);
                        console.log(`     Section: ${assign.section || 'NOT SET ❌'}`);
                    });

                    // Check if any students match these assignments
                    console.log('\n📋 STUDENT MATCHING:');
                    for (const assign of faculty.assignments) {
                        if (assign.year && assign.section) {
                            const matchingStudents = await Student.countDocuments({
                                year: String(assign.year),
                                section: String(assign.section)
                            });
                            console.log(`  Year ${assign.year}, Section ${assign.section}: ${matchingStudents} students`);
                        }
                    }
                } else {
                    console.log('  ⚠️  No assignments found for this faculty!');
                }
            } else {
                console.log('\n⚠️  Faculty with ID 23104470 not found!');
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('✅ DIAGNOSTICS COMPLETE');
        console.log('='.repeat(80) + '\n');

    } catch (error) {
        console.error('\n❌ Error during diagnostics:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.\n');
        process.exit(0);
    }
}
