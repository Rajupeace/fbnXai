const mongoose = require('mongoose');

const FacultyDataSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true,
        unique: true
    },
    
    // Faculty Profile
    name: String,
    email: String,
    department: String,
    designation: String,
    qualification: String,
    
    // Dashboard Sections Data
    sections: {
        // Section 1: Schedule & Classes
        schedule: {
            totalClasses: { type: Number, default: 0 },
            classesScheduled: { type: Number, default: 0 },
            classesCompleted: { type: Number, default: 0 },
            nextClass: {
                courseId: mongoose.Schema.Types.ObjectId,
                courseName: String,
                time: Date,
                room: String
            },
            weeklySchedule: [{
                day: String,
                time: String,
                courseId: mongoose.Schema.Types.ObjectId,
                courseName: String,
                room: String,
                students: { type: Number, default: 0 }
            }],
            lastUpdated: Date
        },
        
        // Section 2: Student Management
        students: {
            totalStudents: { type: Number, default: 0 },
            assignedCourses: { type: Number, default: 0 },
            studentList: [{
                studentId: mongoose.Schema.Types.ObjectId,
                studentName: String,
                rollNumber: String,
                enrolledCourses: [String],
                attendance: Number,
                performance: String
            }],
            lastUpdated: Date
        },
        
        // Section 3: Attendance Management
        attendance: {
            totalPresent: { type: Number, default: 0 },
            totalAbsent: { type: Number, default: 0 },
            totalClasses: { type: Number, default: 0 },
            attendanceRecords: [{
                courseId: mongoose.Schema.Types.ObjectId,
                courseName: String,
                date: Date,
                presentCount: Number,
                absentCount: Number,
                totalEnrolled: Number,
                attendancePercentage: Number,
                details: [{
                    studentId: mongoose.Schema.Types.ObjectId,
                    status: { type: String, enum: ['Present', 'Absent'] }
                }]
            }],
            lastUpdated: Date
        },
        
        // Section 4: Exam Management
        exams: {
            totalExams: { type: Number, default: 0 },
            completedExams: { type: Number, default: 0 },
            upcomingExams: { type: Number, default: 0 },
            examList: [{
                examId: mongoose.Schema.Types.ObjectId,
                examName: String,
                courseId: mongoose.Schema.Types.ObjectId,
                courseName: String,
                date: Date,
                totalQuestions: Number,
                totalMarks: Number,
                status: { type: String, enum: ['scheduled', 'ongoing', 'completed'] },
                resultPublished: Boolean,
                attempts: [{
                    studentId: mongoose.Schema.Types.ObjectId,
                    studentName: String,
                    marksObtained: Number,
                    percentage: Number,
                    grade: String
                }]
            }],
            lastUpdated: Date
        },
        
        // Section 5: Messages/Communications
        messages: {
            totalMessages: { type: Number, default: 0 },
            unreadMessages: { type: Number, default: 0 },
            conversationList: [{
                conversationId: mongoose.Schema.Types.ObjectId,
                participantName: String,
                participantRole: String,
                participantId: mongoose.Schema.Types.ObjectId,
                lastMessage: String,
                timestamp: Date,
                unread: Boolean,
                messageHistory: [{
                    senderId: mongoose.Schema.Types.ObjectId,
                    senderName: String,
                    message: String,
                    timestamp: Date,
                    read: Boolean
                }]
            }],
            lastUpdated: Date
        }
    },
    
    // Statistics
    statistics: {
        totalStudentsLearning: { type: Number, default: 0 },
        averageClassAttendance: { type: Number, default: 0 },
        studentPerformanceAverage: { type: Number, default: 0 },
        materialAssignments: { type: Number, default: 0 },
        examsCreated: { type: Number, default: 0 },
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

module.exports = mongoose.model('FacultyData', FacultyDataSchema);
