const connectDB = require('../config/db');
const mongoose = require('mongoose');

/**
 * Script to create enrollment records linking students to faculty and subjects
 * This establishes the normalized student-faculty-subject relationships
 */

async function createEnrollments() {
  const ok = await connectDB();
  if (!ok) {
    console.error('MongoDB connection failed. Aborting enrollment creation.');
    process.exit(1);
  }

  try {
    const Student = require('../models/Student');
    const Faculty = require('../models/Faculty');
    const Enrollment = require('../models/Enrollment');

    console.log('\n📋 Starting enrollment creation process...\n');

    // Clear existing enrollments
    console.log('🗑️  Clearing existing enrollments...');
    await Enrollment.deleteMany({});

    // Get all students and faculty
    const students = await Student.find({}).lean();
    const faculty = await Faculty.find({}).lean();

    console.log(`✅ Found ${students.length} students and ${faculty.length} faculty members\n`);

    if (students.length === 0 || faculty.length === 0) {
      console.warn('⚠️  No students or faculty found. Please run seed-mongo.js first.');
      process.exit(0);
    }

    // Create enrollments based on faculty assignments
    const enrollments = [];
    let enrollmentCount = 0;

    for (const fac of faculty) {
      if (!fac.assignments || fac.assignments.length === 0) {
        console.log(`⏭️  Skipping ${fac.name} (no assignments)`);
        continue;
      }

      console.log(`📚 Processing ${fac.name} (${fac.facultyId}):`);

      for (const assignment of fac.assignments) {
        const { year, section, branch, subject } = assignment;

        // Find all students matching this class
        const classStudents = students.filter(s =>
          s.year === year && s.section === section && s.branch === branch
        );

        console.log(`   └─ ${subject} (${year}/${section}/${branch}): ${classStudents.length} students`);

        // Create enrollment for each student in this class
        for (const student of classStudents) {
          enrollments.push({
            studentId: student._id,
            facultyId: fac._id,
            facultyName: fac.name,
            subject: subject,
            year: year,
            section: section,
            branch: branch,
            academicYear: '2024-2025',
            status: 'active',
            enrolledAt: new Date(),
            attendance: {
              total: 0,
              present: 0,
              percentage: 0
            },
            marks: {
              internals: 0,
              externals: 0,
              total: 0
            }
          });

          enrollmentCount++;
        }
      }
    }

    // Bulk insert enrollments
    if (enrollments.length > 0) {
      console.log(`\n✏️  Creating ${enrollments.length} enrollment records...`);
      await Enrollment.insertMany(enrollments, { ordered: false });
      console.log(`✅ Successfully created ${enrollments.length} enrollments\n`);
    }

    // Display statistics
    console.log('📊 Enrollment Statistics:');
    const stats = await Enrollment.aggregate([
      {
        $group: {
          _id: '$facultyId',
          facultyName: { $first: '$facultyName' },
          studentCount: { $sum: 1 },
          subjectCount: { $addToSet: '$subject' }
        }
      },
      { $sort: { studentCount: -1 } }
    ]);

    for (const stat of stats) {
      console.log(`   ${stat.facultyName}: ${stat.studentCount} students × ${stat.subjectCount.length} subject(s)`);
    }

    // Class-wise breakdown
    console.log('\n📋 Class-wise Enrollment:');
    const classStats = await Enrollment.aggregate([
      {
        $group: {
          _id: { year: '$year', section: '$section', branch: '$branch' },
          enrollmentCount: { $sum: 1 },
          facultyCount: { $addToSet: '$facultyId' }
        }
      },
      { $sort: { '_id.year': 1, '_id.section': 1 } }
    ]);

    for (const cls of classStats) {
      console.log(`   ${cls._id.year}/${cls._id.section}/${cls._id.branch}: ${cls.enrollmentCount} enrollments (${cls.facultyCount.length} faculty)`);
    }

    console.log('\n✅ Enrollment creation completed successfully!\n');

    // Test a query to verify enrollments are working
    console.log('🧪 Testing query functionality...');
    if (students.length > 0) {
      const testStudent = students[0];
      const testEnrollments = await Enrollment.find({ studentId: testStudent._id })
        .select('facultyName subject year section')
        .lean();

      console.log(`   Student ${testStudent.name} is enrolled in ${testEnrollments.length} course(s):`);
      for (const enrollment of testEnrollments) {
        console.log(`      - ${enrollment.subject} (taught by ${enrollment.facultyName})`);
      }
    }

    console.log('\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating enrollments:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
createEnrollments();
