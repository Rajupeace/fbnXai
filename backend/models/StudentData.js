const mongoose = require('mongoose');

const StudentDataSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        unique: true
    },
    
    // Student Profile
    name: String,
    email: String,
    rollNumber: String,
    branch: String,
    currentSemester: String,
    
    // Dashboard Sections Data
    sections: {
        // Section 1: Overview/Dashboard
        overview: {
            totalCourses: { type: Number, default: 0 },
            activeCoursesCount: { type: Number, default: 0 },
            totalClasses: { type: Number, default: 0 },
            totalPresent: { type: Number, default: 0 },
            totalAbsent: { type: Number, default: 0 },
            overallAttendance: { type: Number, default: 0 },
            currentCGPA: { type: Number, default: 0 },
            currentSGPA: { type: Number, default: 0 },
            lastUpdated: Date
        },
        
        // Section 2: Courses
        courses: {
            totalCourses: { type: Number, default: 0 },
            courseList: [{
                courseId: mongoose.Schema.Types.ObjectId,
                courseName: String,
                courseCode: String,
                faculty: String,
                credits: Number,
                enrollment: {
                    enrolledDate: Date,
                    status: { type: String, enum: ['active', 'completed', 'dropped'] }
                },
                performance: {
                    attendance: Number,
                    internalMarks: Number,
                    externalMarks: Number,
                    totalMarks: Number,
                    percentage: Number,
                    grade: String
                }
            }],
            lastUpdated: Date
        },
        
        // Section 3: Materials/Resources
        materials: {
            totalMaterials: { type: Number, default: 0 },
            downloadedCount: { type: Number, default: 0 },
            materialList: [{
                materialId: mongoose.Schema.Types.ObjectId,
                courseId: mongoose.Schema.Types.ObjectId,
                courseName: String,
                title: String,
                type: { type: String, enum: ['pdf', 'video', 'document', 'link'] },
                uploadedDate: Date,
                downloaded: Boolean,
                downloadDate: Date,
                fileSize: String
            }],
            lastUpdated: Date
        },
        
        // Section 4: Schedule
        schedule: {
            totalClasses: { type: Number, default: 0 },
            upcomingClasses: { type: Number, default: 0 },
            classSchedule: [{
                courseId: mongoose.Schema.Types.ObjectId,
                courseName: String,
                faculty: String,
                day: String,
                time: String,
                room: String,
                attended: Boolean,
                attendanceDate: Date
            }],
            weeklySchedule: [{
                day: String,
                classes: [{
                    courseId: mongoose.Schema.Types.ObjectId,
                    courseName: String,
                    time: String,
                    room: String
                }]
            }],
            lastUpdated: Date
        },
        
        // Section 5: Exams
        exams: {
            totalExams: { type: Number, default: 0 },
            completedExams: { type: Number, default: 0 },
            upcomingExams: { type: Number, default: 0 },
            examList: [{
                examId: mongoose.Schema.Types.ObjectId,
                courseId: mongoose.Schema.Types.ObjectId,
                courseName: String,
                examName: String,
                date: Date,
                totalMarks: Number,
                status: { type: String, enum: ['scheduled', 'completed'] },
                result: {
                    marksObtained: Number,
                    percentage: Number,
                    grade: String,
                    resultDate: Date
                }
            }],
            lastUpdated: Date
        },
        
        // Section 6: Faculty List & Assignments
        faculty: {
            totalFaculty: { type: Number, default: 0 },
            facultyList: [{
                facultyId: mongoose.Schema.Types.ObjectId,
                facultyName: String,
                department: String,
                coursesTaught: [String],
                email: String,
                officeHours: String,
                contactNumber: String
            }],
            lastUpdated: Date
        },
        
        // Section 7: Chat/Messaging with AI Agent
        chat: {
            totalChats: { type: Number, default: 0 },
            recentChats: [{
                chatId: mongoose.Schema.Types.ObjectId,
                messageCount: Number,
                topic: String,
                lastMessage: String,
                timestamp: Date,
                resolved: Boolean
            }],
            conversationHistory: [{
                messageId: mongoose.Schema.Types.ObjectId,
                role: { type: String, enum: ['user', 'agent'] },
                message: String,
                timestamp: Date,
                helpful: Boolean
            }],
            lastUpdated: Date
        },
        
        // Section 8: Attendance Records
        attendance: {
            totalClasses: { type: Number, default: 0 },
            totalPresent: { type: Number, default: 0 },
            totalAbsent: { type: Number, default: 0 },
            attendancePercentage: { type: Number, default: 0 },
            attendanceRecords: [{
                courseId: mongoose.Schema.Types.ObjectId,
                courseName: String,
                date: Date,
                status: { type: String, enum: ['Present', 'Absent'] },
                markedBy: String,
                markedTime: Date
            }],
            lastUpdated: Date
        }
    },
    
    // Learning Progress & Achievements
    progress: {
        overallProgress: { type: Number, default: 0 },
        coursesInProgress: { type: Number, default: 0 },
        coursesCompleted: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        aiUsageCount: { type: Number, default: 0 },
        tasksCompleted: { type: Number, default: 0 },
        advancedProgress: { type: Number, default: 0 },
        lastUpdated: Date
    },
    
    // Student Stats
    statistics: {
        totalAssignmentsSubmitted: { type: Number, default: 0 },
        totalAssignmentsReceived: { type: Number, default: 0 },
        totalProjectsCompleted: { type: Number, default: 0 },
        averageMarks: { type: Number, default: 0 },
        lastUpdated: Date
    },
    
    // Activity Log
    activityLog: [{
        action: String,
        description: String,
        courseId: mongoose.Schema.Types.ObjectId,
        timestamp: { type: Date, default: Date.now }
    }],
    
    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastLogin: Date,
    loginCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('StudentData', StudentDataSchema);
