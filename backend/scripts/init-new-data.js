/**
 * Initialize new data collections for AdminData, FacultyData, StudentData
 * Run with: node init-new-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AdminData = require('../models/AdminData');
const FacultyData = require('../models/FacultyData');
const StudentData = require('../models/StudentData');
const Admin = require('../models/Admin');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

const connectDB = require('../config/db');

async function initializeData() {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await connectDB();
        console.log('✅ MongoDB connected');

        // Initialize AdminData
        console.log('\n📊 Initializing AdminData...');
        const admins = await Admin.find().limit(1);
        if (admins.length > 0) {
            const admin = admins[0];
            const adminDataExists = await AdminData.findOne({ adminId: admin._id });
            
            if (!adminDataExists) {
                const adminData = new AdminData({
                    adminId: admin._id,
                    sections: {
                        attendancePanel: {
                            totalStudents: 500,
                            presentToday: 450,
                            absentToday: 50,
                            attendanceRate: 90
                        },
                        statistics: {
                            totalCourses: 20,
                            totalFaculty: 15,
                            totalStudents: 500,
                            totalClasses: 100,
                            averageAttendance: 85,
                            performanceMetrics: {
                                excellentPerformers: 150,
                                goodPerformers: 250,
                                needsImprovement: 100
                            }
                        },
                        courseManagement: {
                            activeCourses: 18,
                            inactiveCourses: 2,
                            totalCredits: 120,
                            courses: []
                        },
                        userManagement: {
                            activeStudents: 500,
                            inactiveFaculty: 2,
                            recentRegistrations: []
                        }
                    }
                });
                await adminData.save();
                console.log('✅ AdminData initialized');
            } else {
                console.log('✅ AdminData already exists');
            }
        }

        // Initialize FacultyData
        console.log('\n👨‍🏫 Initializing FacultyData...');
        const faculties = await Faculty.find().limit(3);
        for (const faculty of faculties) {
            const facultyDataExists = await FacultyData.findOne({ facultyId: faculty._id });
            
            if (!facultyDataExists) {
                const facultyData = new FacultyData({
                    facultyId: faculty._id,
                    sections: {
                        schedule: {
                            totalClasses: 30,
                            classesScheduled: 28,
                            classesCompleted: 20,
                            weeklySchedule: []
                        },
                        students: {
                            totalStudents: 40,
                            assignedCourses: 2,
                            studentList: []
                        },
                        attendance: {
                            totalPresent: 750,
                            totalAbsent: 50,
                            totalClasses: 800,
                            attendanceRecords: []
                        },
                        exams: {
                            totalExams: 3,
                            completedExams: 2,
                            upcomingExams: 1,
                            examList: []
                        },
                        messages: {
                            totalMessages: 0,
                            unreadMessages: 0,
                            conversationList: []
                        }
                    },
                    statistics: {
                        totalStudentsLearning: 40,
                        averageClassAttendance: 93,
                        studentPerformanceAverage: 78,
                        materialAssignments: 5,
                        examsCreated: 3
                    }
                });
                await facultyData.save();
                console.log(`✅ FacultyData initialized for ${faculty.name || 'faculty'}`);
            }
        }

        // Initialize StudentData
        console.log('\n📚 Initializing StudentData...');
        const students = await Student.find().limit(5);
        for (const student of students) {
            const studentDataExists = await StudentData.findOne({ studentId: student._id });
            
            if (!studentDataExists) {
                const studentData = new StudentData({
                    studentId: student._id,
                    sections: {
                        overview: {
                            totalCourses: 5,
                            activeCoursesCount: 5,
                            totalClasses: 40,
                            totalPresent: 38,
                            totalAbsent: 2,
                            overallAttendance: 95,
                            currentCGPA: 3.8,
                            currentSGPA: 3.9
                        },
                        courses: {
                            totalCourses: 5,
                            courseList: []
                        },
                        materials: {
                            totalMaterials: 25,
                            downloadedCount: 18,
                            materialList: []
                        },
                        schedule: {
                            totalClasses: 40,
                            upcomingClasses: 5,
                            classSchedule: [],
                            weeklySchedule: []
                        },
                        exams: {
                            totalExams: 8,
                            completedExams: 6,
                            upcomingExams: 2,
                            examList: []
                        },
                        faculty: {
                            totalFaculty: 5,
                            facultyList: []
                        },
                        chat: {
                            totalChats: 12,
                            recentChats: [],
                            conversationHistory: []
                        },
                        attendance: {
                            totalClasses: 40,
                            totalPresent: 38,
                            totalAbsent: 2,
                            attendancePercentage: 95,
                            attendanceRecords: []
                        }
                    },
                    progress: {
                        overallProgress: 75,
                        coursesInProgress: 5,
                        coursesCompleted: 15,
                        streak: 5,
                        aiUsageCount: 12,
                        tasksCompleted: 8,
                        advancedProgress: 2
                    },
                    statistics: {
                        totalAssignmentsSubmitted: 25,
                        totalAssignmentsReceived: 30,
                        totalProjectsCompleted: 3,
                        averageMarks: 82
                    }
                });
                await studentData.save();
                console.log(`✅ StudentData initialized for ${student.studentName || 'student'}`);
            }
        }

        console.log('\n✅ Initialization complete!');
        console.log('📊 Summary:');
        console.log('  - AdminData: 1 initialized');
        console.log(`  - FacultyData: ${faculties.length} initialized`);
        console.log(`  - StudentData: ${students.length} initialized`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run initialization
initializeData();
