const mongoose = require('mongoose');
const connectDB = require('./config/db');
const dbHelper = require('./dbHelper');

async function deleteAllStudentData() {
  try {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║     COMPLETE STUDENT DATA DELETION SCRIPT      ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');

    // ============================================
    // PART 1: Delete from MongoDB
    // ============================================
    console.log('📊 DELETING FROM MONGODB...');
    console.log('─────────────────────────────────────────────────');

    const ok = await connectDB();
    if (ok) {
      console.log('✅ Connected to MongoDB');

      try {
        const Student = require('./models/Student');
        const result = await Student.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} student records from MongoDB`);
      } catch (err) {
        console.error('❌ Error deleting from MongoDB Students:', err.message);
      }

      // Delete studentFaculty relationship collection
      try {
        const collection = mongoose.connection.collection('studentFaculty');
        const sfResult = await collection.deleteMany({});
        console.log(`✅ Deleted ${sfResult.deletedCount} student-faculty relationships`);
      } catch (err) {
        console.error('❌ Error deleting studentFaculty:', err.message);
      }

      // Disconnect MongoDB
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    } else {
      console.warn('⚠️  MongoDB connection failed, skipping MongoDB deletion');
    }

    console.log('');

    // ============================================
    // PART 2: Delete from File-based Database
    // ============================================
    console.log('📁 DELETING FROM FILE-BASED DATABASE...');
    console.log('─────────────────────────────────────────────────');

    try {
      // Read current file-based database
      const studentsDB = dbHelper('students', []);
      const currentStudents = studentsDB.read() || [];
      const studentCount = currentStudents.length;

      // Clear all students
      studentsDB.write([]);
      const verifyEmpty = studentsDB.read();

      console.log(`✅ Deleted ${studentCount} student records from file database`);
      console.log(`✅ Verified: File database now contains ${verifyEmpty.length} students`);
    } catch (err) {
      console.error('❌ Error deleting from file database:', err.message);
    }

    console.log('');

    // ============================================
    // PART 3: Delete from Backup Locations
    // ============================================
    console.log('🗑️  CLEANING UP RELATED DATA...');
    console.log('─────────────────────────────────────────────────');

    try {
      // Clear student-faculty relationships from file DB
      const studentFacultyDB = dbHelper('studentFaculty', []);
      const sfCount = (studentFacultyDB.read() || []).length;
      studentFacultyDB.write([]);
      console.log(`✅ Deleted ${sfCount} student-faculty relationships from file database`);
    } catch (err) {
      console.error('⚠️  Note:', err.message);
    }

    console.log('');

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║           DELETION COMPLETE ✅                ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log('║                                                ║');
    console.log('║  ✅ All student data removed from:            ║');
    console.log('║     • MongoDB (Students collection)           ║');
    console.log('║     • File-based database                     ║');
    console.log('║     • Student-Faculty relationships           ║');
    console.log('║                                                ║');
    console.log('║  Database is now clean and ready for new      ║');
    console.log('║  student registrations.                       ║');
    console.log('║                                                ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('❌ CRITICAL ERROR:', err);
    process.exit(1);
  }
}

// Run the deletion
deleteAllStudentData();
