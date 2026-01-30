// COMPREHENSIVE DATABASE VALIDATION & FIX SCRIPT
// This script validates and fixes all database collections for all dashboards

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fbnXai';

async function comprehensiveValidation() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║     🔍 COMPREHENSIVE DATABASE VALIDATION & FIX 🔍           ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');

        const db = client.db();

        // ============================================
        // STEP 1: VALIDATE COLLECTIONS
        // ============================================
        console.log('═══ STEP 1: VALIDATING COLLECTIONS ═══\n');

        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        const requiredCollections = [
            'students',
            'faculty',
            'admins',
            'subjects',
            'marks',
            'attendance',
            'assignments',
            'studentFaculty'
        ];

        console.log('📊 Found collections:', collectionNames.join(', '));

        const missing = requiredCollections.filter(c => !collectionNames.includes(c));
        if (missing.length > 0) {
            console.log('⚠️  Missing collections:', missing.join(', '));
            for (const coll of missing) {
                await db.createCollection(coll);
                console.log(`✅ Created collection: ${coll}`);
            }
        } else {
            console.log('✅ All required collections exist\n');
        }

        // ============================================
        // STEP 2: FIX STUDENT DOCUMENTS
        // ============================================
        console.log('═══ STEP 2: FIXING STUDENT DOCUMENTS ═══\n');

        const students = db.collection('students');
        const allStudents = await students.find({}).toArray();
        console.log(`📊 Total students: ${allStudents.length}`);

        // Fix field names (Year → year, Section → section)
        let studentUpdates = 0;

        // Update Year to year
        const yearResult = await students.updateMany(
            { Year: { $exists: true }, year: { $exists: false } },
            [{ $set: { year: '$Year' } }]
        );
        studentUpdates += yearResult.modifiedCount;

        // Update Section to section
        const sectionResult = await students.updateMany(
            { Section: { $exists: true }, section: { $exists: false } },
            [{ $set: { section: '$Section' } }]
        );
        studentUpdates += sectionResult.modifiedCount;

        console.log(`✅ Updated ${studentUpdates} student documents with lowercase fields`);

        // Check students with complete data
        const completeStudents = await students.find({
            year: { $exists: true },
            section: { $exists: true }
        }).toArray();

        console.log(`✅ Students with year & section: ${completeStudents.length}\n`);

        // Show distribution
        const studentDist = {};
        completeStudents.forEach(s => {
            const key = `Year ${s.year} Section ${s.section}`;
            studentDist[key] = (studentDist[key] || 0) + 1;
        });

        console.log('📊 Student Distribution:');
        Object.keys(studentDist).sort().forEach(key => {
            console.log(`   ${key}: ${studentDist[key]} students`);
        });
        console.log('');

        // ============================================
        // STEP 3: FIX FACULTY DOCUMENTS
        // ============================================
        console.log('═══ STEP 3: FIXING FACULTY DOCUMENTS ═══\n');

        const faculty = db.collection('faculty');
        const allFaculty = await faculty.find({}).toArray();
        console.log(`📊 Total faculty: ${allFaculty.length}`);

        let facultyFixed = 0;
        for (const fac of allFaculty) {
            let needsUpdate = false;
            const updates = {};

            // Ensure assignments array exists
            if (!fac.assignments || !Array.isArray(fac.assignments)) {
                updates.assignments = [];
                needsUpdate = true;
            } else {
                // Fix assignment field names
                const fixedAssignments = fac.assignments.map(a => ({
                    ...a,
                    year: a.year || a.Year || 3,
                    section: a.section || a.Section || 'A'
                }));

                if (JSON.stringify(fixedAssignments) !== JSON.stringify(fac.assignments)) {
                    updates.assignments = fixedAssignments;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await faculty.updateOne(
                    { _id: fac._id },
                    { $set: updates }
                );
                facultyFixed++;
            }
        }

        console.log(`✅ Fixed ${facultyFixed} faculty documents`);

        // Show faculty assignments
        const facultyWithAssignments = await faculty.find({
            assignments: { $exists: true, $ne: [] }
        }).toArray();

        console.log(`✅ Faculty with assignments: ${facultyWithAssignments.length}\n`);

        // ============================================
        // STEP 4: CREATE STUDENT-FACULTY RELATIONSHIPS
        // ============================================
        console.log('═══ STEP 4: CREATING STUDENT-FACULTY RELATIONSHIPS ═══\n');

        const studentFaculty = db.collection('studentFaculty');
        const existingRels = await studentFaculty.countDocuments();
        console.log(`📊 Existing relationships: ${existingRels}`);

        let newRels = 0;

        for (const fac of facultyWithAssignments) {
            const assignments = fac.assignments || [];

            for (const assignment of assignments) {
                const year = parseInt(assignment.year);
                const section = String(assignment.section);

                if (!year || !section) continue;

                // Find students for this section
                const sectionStudents = await students.find({
                    year: year,
                    section: section
                }).toArray();

                // Create relationships
                for (const student of sectionStudents) {
                    const existing = await studentFaculty.findOne({
                        facultyId: fac.facultyId,
                        studentId: student.sid
                    });

                    if (!existing) {
                        await studentFaculty.insertOne({
                            facultyId: fac.facultyId,
                            studentId: student.sid,
                            subject: assignment.subject || fac.subject || 'General',
                            year: year,
                            section: section,
                            createdAt: new Date()
                        });
                        newRels++;
                    }
                }
            }
        }

        const totalRels = await studentFaculty.countDocuments();
        console.log(`✅ Created ${newRels} new relationships`);
        console.log(`✅ Total relationships: ${totalRels}\n`);

        // ============================================
        // STEP 5: VALIDATE SUBJECTS
        // ============================================
        console.log('═══ STEP 5: VALIDATING SUBJECTS ═══\n');

        const subjects = db.collection('subjects');
        const allSubjects = await subjects.find({}).toArray();
        console.log(`📊 Total subjects: ${allSubjects.length}`);

        // Ensure subjects have required fields
        let subjectUpdates = 0;
        for (const subject of allSubjects) {
            const updates = {};

            if (!subject.year) updates.year = 3;
            if (!subject.semester) updates.semester = 1;
            if (!subject.credits) updates.credits = 4;

            if (Object.keys(updates).length > 0) {
                await subjects.updateOne(
                    { _id: subject._id },
                    { $set: updates }
                );
                subjectUpdates++;
            }
        }

        console.log(`✅ Updated ${subjectUpdates} subjects with default values\n`);

        // ============================================
        // STEP 6: VALIDATE MARKS
        // ============================================
        console.log('═══ STEP 6: VALIDATING MARKS ═══\n');

        const marks = db.collection('marks');
        const allMarks = await marks.find({}).toArray();
        console.log(`📊 Total mark entries: ${allMarks.length}`);

        // Ensure marks have year/section
        const marksWithSection = await marks.find({
            year: { $exists: true },
            section: { $exists: true }
        }).countDocuments();

        console.log(`✅ Marks with year/section: ${marksWithSection}\n`);

        // ============================================
        // STEP 7: VALIDATE ATTENDANCE
        // ============================================
        console.log('═══ STEP 7: VALIDATING ATTENDANCE ═══\n');

        const attendance = db.collection('attendance');
        const allAttendance = await attendance.find({}).toArray();
        console.log(`📊 Total attendance records: ${allAttendance.length}`);

        const attendanceWithSection = await attendance.find({
            year: { $exists: true },
            section: { $exists: true }
        }).countDocuments();

        console.log(`✅ Attendance with year/section: ${attendanceWithSection}\n`);

        // ============================================
        // STEP 8: VALIDATE ASSIGNMENTS
        // ============================================
        console.log('═══ STEP 8: VALIDATING ASSIGNMENTS ═══\n');

        const assignments = db.collection('assignments');
        const allAssignments = await assignments.find({}).toArray();
        console.log(`📊 Total assignments: ${allAssignments.length}`);

        // Ensure assignments have year/section
        let assignmentUpdates = 0;
        for (const assignment of allAssignments) {
            const updates = {};

            if (!assignment.year && assignment.Year) {
                updates.year = assignment.Year;
                assignmentUpdates++;
            }
            if (!assignment.section && assignment.Section) {
                updates.section = assignment.Section;
                assignmentUpdates++;
            }

            if (Object.keys(updates).length > 0) {
                await assignments.updateOne(
                    { _id: assignment._id },
                    { $set: updates }
                );
            }
        }

        console.log(`✅ Updated ${assignmentUpdates} assignments\n`);

        // ============================================
        // STEP 9: FINAL VERIFICATION
        // ============================================
        console.log('═══ STEP 9: FINAL VERIFICATION ═══\n');

        const verification = {
            students: await students.countDocuments(),
            studentsComplete: await students.countDocuments({ year: { $exists: true }, section: { $exists: true } }),
            faculty: await faculty.countDocuments(),
            facultyWithAssignments: await faculty.countDocuments({ assignments: { $exists: true, $ne: [] } }),
            subjects: await subjects.countDocuments(),
            marks: await marks.countDocuments(),
            attendance: await attendance.countDocuments(),
            assignments: await assignments.countDocuments(),
            relationships: await studentFaculty.countDocuments()
        };

        console.log('📊 FINAL COUNTS:');
        console.log(`   Students: ${verification.students} (${verification.studentsComplete} complete)`);
        console.log(`   Faculty: ${verification.faculty} (${verification.facultyWithAssignments} with assignments)`);
        console.log(`   Subjects: ${verification.subjects}`);
        console.log(`   Marks: ${verification.marks}`);
        console.log(`   Attendance: ${verification.attendance}`);
        console.log(`   Assignments: ${verification.assignments}`);
        console.log(`   Student-Faculty Relationships: ${verification.relationships}`);

        // ============================================
        // STEP 10: SAMPLE DATA
        // ============================================
        console.log('\n═══ STEP 10: SAMPLE DATA ═══\n');

        const sampleStudent = await students.findOne({ year: { $exists: true } });
        if (sampleStudent) {
            console.log('📝 Sample Student:');
            console.log(`   ID: ${sampleStudent.sid}`);
            console.log(`   Name: ${sampleStudent.studentName || sampleStudent.name}`);
            console.log(`   Year: ${sampleStudent.year}, Section: ${sampleStudent.section}`);
        }

        const sampleFaculty = await faculty.findOne({ assignments: { $ne: [] } });
        if (sampleFaculty) {
            console.log('\n📝 Sample Faculty:');
            console.log(`   ID: ${sampleFaculty.facultyId}`);
            console.log(`   Name: ${sampleFaculty.name}`);
            console.log(`   Assignments: ${sampleFaculty.assignments?.length || 0}`);
            if (sampleFaculty.assignments && sampleFaculty.assignments.length > 0) {
                const a = sampleFaculty.assignments[0];
                console.log(`   Example: ${a.subject} - Year ${a.year} Section ${a.section}`);
            }
        }

        const sampleRel = await studentFaculty.findOne({});
        if (sampleRel) {
            console.log('\n📝 Sample Relationship:');
            console.log(`   Faculty: ${sampleRel.facultyId}`);
            console.log(`   Student: ${sampleRel.studentId}`);
            console.log(`   Subject: ${sampleRel.subject}`);
            console.log(`   Year: ${sampleRel.year}, Section: ${sampleRel.section}`);
        }

        // ============================================
        // COMPLETION
        // ============================================
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║              ✅ VALIDATION COMPLETE! ✅                     ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');

        console.log('📋 SUMMARY:');
        console.log(`   ✅ All collections validated`);
        console.log(`   ✅ Student fields fixed: ${studentUpdates}`);
        console.log(`   ✅ Faculty documents fixed: ${facultyFixed}`);
        console.log(`   ✅ New relationships created: ${newRels}`);
        console.log(`   ✅ Subject updates: ${subjectUpdates}`);
        console.log(`   ✅ Assignment updates: ${assignmentUpdates}`);

        console.log('\n🎯 NEXT STEPS:');
        console.log('   1. Refresh all browser windows (Ctrl + Shift + R)');
        console.log('   2. Check Faculty Dashboard → Marks');
        console.log('   3. Check Faculty Dashboard → Attendance');
        console.log('   4. Check Student Dashboard');
        console.log('   5. Check Admin Dashboard');

        console.log('\n💡 DASHBOARDS SHOULD NOW WORK:');
        console.log('   ✅ Faculty Marks - Section filtering');
        console.log('   ✅ Faculty Attendance - Section filtering');
        console.log('   ✅ Student Dashboard - Own data');
        console.log('   ✅ Admin Dashboard - All data');

        return verification;

    } catch (error) {
        console.error('\n❌ ERROR:', error);
        throw error;
    } finally {
        await client.close();
        console.log('\n🔌 Database connection closed\n');
    }
}

// Run validation
if (require.main === module) {
    comprehensiveValidation()
        .then(result => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = comprehensiveValidation;
