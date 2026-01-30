// QUICK FIX: Create Student-Faculty Relationships and Update Fields
// Run this in MongoDB shell or MongoDB Compass

use fbnXai;

// ============================================
// STEP 1: Update student field names
// ============================================
print("Step 1: Updating student field names...");

// Add lowercase year field if only Year exists
var yearUpdated = db.students.updateMany(
    { Year: { $exists: true }, year: { $exists: false } },
    [{ $set: { year: "$Year" } }]
);
print(`  ✅ Added 'year' field to ${yearUpdated.modifiedCount} students`);

// Add lowercase section field if only Section exists
var sectionUpdated = db.students.updateMany(
    { Section: { $exists: true }, section: { $exists: false } },
    [{ $set: { section: "$Section" } }]
);
print(`  ✅ Added 'section' field to ${sectionUpdated.modifiedCount} students`);

// ============================================
// STEP 2: Check students with year/section
// ============================================
print("\nStep 2: Checking students...");

var totalStudents = db.students.count();
var studentsWithBoth = db.students.find({
    year: { $exists: true },
    section: { $exists: true }
}).count();

print(`  📊 Total students: ${totalStudents}`);
print(`  ✅ Students with year & section: ${studentsWithBoth}`);
print(`  ⚠️  Students missing fields: ${totalStudents - studentsWithBoth}`);

// Show distribution
print("\n  Distribution by year/section:");
db.students.aggregate([
    {
        $match: {
            year: { $exists: true },
            section: { $exists: true }
        }
    },
    {
        $group: {
            _id: { year: "$year", section: "$section" },
            count: { $sum: 1 }
        }
    },
    { $sort: { "_id.year": 1, "_id.section": 1 } }
]).forEach(function (doc) {
    print(`    Year ${doc._id.year} Section ${doc._id.section}: ${doc.count} students`);
});

// ============================================
// STEP 3: Create student-faculty relationships
// ============================================
print("\nStep 3: Creating student-faculty relationships...");

// Get all faculty
var faculties = db.faculty.find({}).toArray();
print(`  Found ${faculties.length} faculty members`);

var totalRelationships = 0;
var newRelationships = 0;

faculties.forEach(function (faculty) {
    var facultyId = faculty.facultyId;
    var assignments = faculty.assignments || [];

    if (assignments.length === 0) {
        print(`  ⚠️  Faculty ${facultyId} (${faculty.name}) has no assignments`);
        return;
    }

    print(`\n  Processing faculty ${facultyId} (${faculty.name}):`);

    assignments.forEach(function (assignment) {
        var year = assignment.year || assignment.Year;
        var section = assignment.section || assignment.Section;
        var subject = assignment.subject;

        if (!year || !section) {
            print(`    ⚠️  Assignment missing year/section: ${JSON.stringify(assignment)}`);
            return;
        }

        // Find students for this section
        var students = db.students.find({
            year: parseInt(year),
            section: String(section)
        }).toArray();

        print(`    Found ${students.length} students for Year ${year} Section ${section}`);

        // Create relationships
        var created = 0;
        students.forEach(function (student) {
            // Check if relationship exists
            var existing = db.studentFaculty.findOne({
                facultyId: facultyId,
                studentId: student.sid
            });

            if (!existing) {
                db.studentFaculty.insertOne({
                    facultyId: facultyId,
                    studentId: student.sid,
                    subject: subject,
                    year: parseInt(year),
                    section: String(section),
                    createdAt: new Date()
                });
                created++;
                newRelationships++;
            }
        });

        totalRelationships += students.length;
        print(`    ✅ Created ${created} new relationships for ${subject}`);
    });
});

print(`\n✅ Step 3 complete:`);
print(`  Total relationships: ${totalRelationships}`);
print(`  New relationships created: ${newRelationships}`);

// ============================================
// STEP 4: Verify
// ============================================
print("\nStep 4: Verification...");

var totalRels = db.studentFaculty.count();
print(`  Total relationships in database: ${totalRels}`);

// Show sample
print("\n  Sample faculty-student mapping:");
var sampleFaculty = db.faculty.findOne({});
if (sampleFaculty) {
    var rels = db.studentFaculty.find({ facultyId: sampleFaculty.facultyId }).limit(3).toArray();
    print(`  Faculty: ${sampleFaculty.name} (${sampleFaculty.facultyId})`);
    rels.forEach(function (rel) {
        var student = db.students.findOne({ sid: rel.studentId });
        print(`    → Student: ${student ? student.studentName || student.name : rel.studentId} | ${rel.subject} | Year ${rel.year} Section ${rel.section}`);
    });
}

print("\n═══════════════════════════════════════════");
print("✅ DATABASE FIX COMPLETE!");
print("═══════════════════════════════════════════");
print("\nNext steps:");
print("1. Refresh browser (Ctrl + Shift + R)");
print("2. Open console (F12)");
print("3. Check logs for student fetching");
print("4. Students should now appear!");
