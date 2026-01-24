/**
 * DATABASE SYNCHRONIZATION UTILITY
 * Keeps all student-faculty-subject relationships in sync
 * Runs on admin request or scheduled
 */

const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');

/**
 * Main sync function
 * Updates all relationships and statistics
 */
async function syncDatabaseRelationships() {
  try {
    console.log('🔄 Starting database synchronization...');
    const startTime = Date.now();
    let stats = {
      studentsUpdated: 0,
      facultyUpdated: 0,
      enrollmentsProcessed: 0,
      attendanceSynced: 0,
      errors: []
    };
    
    // STEP 1: Get all active enrollments
    console.log('📋 Fetching all active enrollments...');
    const enrollments = await Enrollment.find({ status: 'active' }).lean();
    stats.enrollmentsProcessed = enrollments.length;
    
    // STEP 2: Update Student.myFaculty array
    console.log('👨‍🎓 Updating student faculty lists...');
    const studentFacultyMap = {};
    
    for (const enrollment of enrollments) {
      if (!studentFacultyMap[enrollment.studentId]) {
        studentFacultyMap[enrollment.studentId] = [];
      }
      
      studentFacultyMap[enrollment.studentId].push({
        facultyId: enrollment.facultyId,
        facultyName: enrollment.facultyName,
        subject: enrollment.subject,
        email: enrollment.facultyEmail,
        phone: enrollment.facultyPhone
      });
    }
    
    // Bulk update students
    for (const [studentId, facultyList] of Object.entries(studentFacultyMap)) {
      try {
        await Student.updateOne(
          { sid: studentId },
          { 
            myFaculty: facultyList,
            updatedAt: new Date()
          }
        );
        stats.studentsUpdated++;
      } catch (err) {
        stats.errors.push(`Student ${studentId}: ${err.message}`);
      }
    }
    
    // STEP 3: Update Faculty.studentRoster array
    console.log('👨‍🏫 Updating faculty student rosters...');
    const facultyStudentMap = {};
    
    for (const enrollment of enrollments) {
      if (!facultyStudentMap[enrollment.facultyId]) {
        facultyStudentMap[enrollment.facultyId] = [];
      }
      
      facultyStudentMap[enrollment.facultyId].push({
        studentId: enrollment.studentId,
        studentName: enrollment.studentName,
        year: enrollment.year,
        section: enrollment.section,
        branch: enrollment.branch,
        subject: enrollment.subject,
        email: enrollment.studentEmail,
        phone: enrollment.studentPhone
      });
    }
    
    // Bulk update faculty
    for (const [facultyId, studentList] of Object.entries(facultyStudentMap)) {
      try {
        const totalStudents = studentList.length;
        await Faculty.updateOne(
          { facultyId },
          { 
            studentRoster: studentList,
            totalStudents,
            updatedAt: new Date()
          }
        );
        stats.facultyUpdated++;
      } catch (err) {
        stats.errors.push(`Faculty ${facultyId}: ${err.message}`);
      }
    }
    
    // STEP 4: Sync attendance statistics
    console.log('📊 Syncing attendance statistics...');
    for (const enrollment of enrollments) {
      try {
        const attendanceRecords = await Attendance.find({
          studentId: enrollment.studentId,
          subject: enrollment.subject,
          facultyId: enrollment.facultyId
        }).lean();
        
        const totalClasses = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
        const attendancePercentage = totalClasses > 0 
          ? Math.round((presentCount / totalClasses) * 100)
          : 0;
        
        // Update enrollment with attendance stats
        await Enrollment.updateOne(
          { _id: enrollment._id },
          {
            attendancePercentage,
            lastActivityAt: new Date()
          }
        );
        
        stats.attendanceSynced++;
      } catch (err) {
        stats.errors.push(`Attendance sync for ${enrollment.studentId}: ${err.message}`);
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Synchronization complete!');
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   👨‍🎓 Students updated: ${stats.studentsUpdated}`);
    console.log(`   👨‍🏫 Faculty updated: ${stats.facultyUpdated}`);
    console.log(`   📋 Enrollments processed: ${stats.enrollmentsProcessed}`);
    console.log(`   📊 Attendance records synced: ${stats.attendanceSynced}`);
    
    if (stats.errors.length > 0) {
      console.warn(`   ⚠️  Errors encountered: ${stats.errors.length}`);
      stats.errors.forEach(err => console.warn(`      - ${err}`));
    }
    
    return {
      success: true,
      timestamp: new Date(),
      duration,
      stats
    };
  } catch (err) {
    console.error('❌ Synchronization failed:', err);
    return {
      success: false,
      error: err.message,
      timestamp: new Date()
    };
  }
}

/**
 * Validate all student-faculty relationships
 * Check for inconsistencies
 */
async function validateDatabaseRelationships() {
  try {
    console.log('🔍 Validating database relationships...');
    const issues = [];
    
    // Check 1: Enrollments for non-existent students
    const enrollments = await Enrollment.find().lean();
    const studentIds = enrollments.map(e => e.studentId);
    const uniqueStudentIds = [...new Set(studentIds)];
    
    const existingStudents = await Student.find({
      sid: { $in: uniqueStudentIds }
    }).select('sid').lean();
    const existingStudentIds = new Set(existingStudents.map(s => s.sid));
    
    for (const sid of uniqueStudentIds) {
      if (!existingStudentIds.has(sid)) {
        issues.push(`Enrollment references non-existent student: ${sid}`);
      }
    }
    
    // Check 2: Enrollments for non-existent faculty
    const facultyIds = enrollments.map(e => e.facultyId);
    const uniqueFacultyIds = [...new Set(facultyIds)];
    
    const existingFaculty = await Faculty.find({
      facultyId: { $in: uniqueFacultyIds }
    }).select('facultyId').lean();
    const existingFacultyIds = new Set(existingFaculty.map(f => f.facultyId));
    
    for (const fid of uniqueFacultyIds) {
      if (!existingFacultyIds.has(fid)) {
        issues.push(`Enrollment references non-existent faculty: ${fid}`);
      }
    }
    
    // Check 3: Attendance records with invalid faculty-subject combinations
    const attendanceRecords = await Attendance.find().lean();
    let invalidAttendanceCount = 0;
    
    for (const record of attendanceRecords) {
      const validEnrollment = await Enrollment.findOne({
        facultyId: record.facultyId,
        subject: record.subject,
        studentId: record.studentId
      }).lean();
      
      if (!validEnrollment) {
        invalidAttendanceCount++;
      }
    }
    
    if (invalidAttendanceCount > 0) {
      issues.push(`${invalidAttendanceCount} attendance records with invalid faculty-subject combinations`);
    }
    
    return {
      timestamp: new Date(),
      isValid: issues.length === 0,
      issuesFound: issues.length,
      issues,
      enrollmentCount: enrollments.length,
      attendanceRecordCount: attendanceRecords.length
    };
  } catch (err) {
    console.error('Validation failed:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Auto-create enrollments from Faculty.assignments
 * For legacy data migration
 */
async function migrateAssignmentsToEnrollments() {
  try {
    console.log('🔄 Migrating faculty assignments to enrollments...');
    let created = 0;
    
    // Get all faculty with assignments
    const faculties = await Faculty.find({
      'assignments.0': { $exists: true }
    }).lean();
    
    for (const faculty of faculties) {
      for (const assignment of faculty.assignments) {
        // Get all students matching this assignment
        const students = await Student.find({
          year: assignment.year,
          section: assignment.section,
          branch: assignment.branch
        }).lean();
        
        // Create enrollments
        for (const student of students) {
          const existing = await Enrollment.findOne({
            studentId: student.sid,
            facultyId: faculty.facultyId,
            subject: assignment.subject
          });
          
          if (!existing) {
            await Enrollment.create({
              studentId: student.sid,
              studentName: student.studentName,
              facultyId: faculty.facultyId,
              facultyName: faculty.name,
              subject: assignment.subject,
              branch: assignment.branch,
              year: assignment.year,
              section: assignment.section,
              semester: assignment.semester,
              academicYear: new Date().getFullYear().toString(),
              status: 'active',
              studentEmail: student.email,
              studentPhone: student.phone,
              facultyEmail: faculty.email,
              facultyPhone: faculty.phone
            });
            created++;
          }
        }
      }
    }
    
    console.log(`✅ Migration complete. Created ${created} enrollments.`);
    return { success: true, created };
  } catch (err) {
    console.error('❌ Migration failed:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  syncDatabaseRelationships,
  validateDatabaseRelationships,
  migrateAssignmentsToEnrollments
};
