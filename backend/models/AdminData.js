const mongoose = require('mongoose');

const AdminDataSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
        unique: true
    },
    // Admin Profile
    name: String,
    email: String,
    department: String,
    role: {
        type: String,
        enum: ['super-admin', 'admin', 'moderator'],
        default: 'admin'
    },
    
    // Dashboard Sections Data
    sections: {
        // Section 1: Attendance Management
        attendancePanel: {
            totalStudents: { type: Number, default: 0 },
            presentToday: { type: Number, default: 0 },
            absentToday: { type: Number, default: 0 },
            attendanceRate: { type: Number, default: 0 },
            lastUpdated: Date,
            data: []
        },
        
        // Section 2: Statistics & Analytics
        statistics: {
            totalCourses: { type: Number, default: 0 },
            totalFaculty: { type: Number, default: 0 },
            totalStudents: { type: Number, default: 0 },
            totalClasses: { type: Number, default: 0 },
            averageAttendance: { type: Number, default: 0 },
            performanceMetrics: {
                excellentPerformers: { type: Number, default: 0 },
                goodPerformers: { type: Number, default: 0 },
                needsImprovement: { type: Number, default: 0 }
            },
            lastUpdated: Date
        },
        
        // Section 3: Course Management
        courseManagement: {
            activeCourses: { type: Number, default: 0 },
            inactiveCourses: { type: Number, default: 0 },
            totalCredits: { type: Number, default: 0 },
            courses: [{
                courseId: mongoose.Schema.Types.ObjectId,
                courseName: String,
                faculty: String,
                status: String,
                students: { type: Number, default: 0 }
            }],
            lastUpdated: Date
        },
        
        // Section 4: User Management
        userManagement: {
            activeStudents: { type: Number, default: 0 },
            inactiveStudents: { type: Number, default: 0 },
            activeFaculty: { type: Number, default: 0 },
            inactiveFaculty: { type: Number, default: 0 },
            recentRegistrations: [{
                userId: mongoose.Schema.Types.ObjectId,
                userName: String,
                userType: String,
                registeredDate: Date
            }],
            lastUpdated: Date
        }
    },
    
    // Messages/Communications
    messages: {
        totalMessages: { type: Number, default: 0 },
        unreadMessages: { type: Number, default: 0 },
        conversationList: [{
            conversationId: mongoose.Schema.Types.ObjectId,
            participantName: String,
            participantRole: String,
            lastMessage: String,
            timestamp: Date,
            unread: Boolean,
            messageHistory: [{
                senderId: mongoose.Schema.Types.ObjectId,
                message: String,
                timestamp: Date,
                read: Boolean
            }]
        }],
        lastUpdated: Date
    },
    
    // Activity Log
    activityLog: [{
        action: String,
        description: String,
        targetType: String,
        targetId: mongoose.Schema.Types.ObjectId,
        timestamp: { type: Date, default: Date.now },
        ipAddress: String
    }],
    
    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastLogin: Date,
    loginCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('AdminData', AdminDataSchema);
