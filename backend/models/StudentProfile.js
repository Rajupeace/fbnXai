const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        unique: true
    },
    // Personal Information
    profilePhoto: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: ''
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },
    // Academic Information
    enrollmentDate: {
        type: Date,
        required: true
    },
    currentSemester: {
        type: String,
        enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'],
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    // Skills and Interests
    skills: [{
        skillName: String,
        proficiency: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert']
        }
    }],
    interests: [String],
    certifications: [{
        certificationName: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialURL: String
    }],
    // Achievements
    achievements: [{
        title: String,
        description: String,
        awardDate: Date,
        category: String
    }],
    // Social Links
    socialLinks: {
        github: String,
        linkedin: String,
        portfolio: String,
        twitter: String
    },
    // Study Preferences
    preferredLearningStyle: {
        type: String,
        enum: ['visual', 'auditory', 'reading-writing', 'kinesthetic', 'mixed'],
        default: 'mixed'
    },
    studyHoursPerDay: {
        type: Number,
        default: 0
    },
    preferredStudyTime: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night'],
        default: 'morning'
    },
    // Progress Tracking
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    profileCompletionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
