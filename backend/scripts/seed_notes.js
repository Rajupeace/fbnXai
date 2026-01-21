const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const Material = require('../models/Material');
const Faculty = require('../models/Faculty');

const seedNotes = async () => {
    const isConnected = await connectDB();
    if (!isConnected) {
        console.error('Failed to connect to MongoDB');
        process.exit(1);
    }

    try {
        // Find or create a dummy faculty uploader
        let uploader = await Faculty.findOne({ facultyId: 'admin_uploader' });
        if (!uploader) {
            uploader = await Faculty.create({
                facultyId: 'admin_uploader',
                name: 'Admin Uploader',
                email: 'admin@example.com',
                password: 'password123', // In a real app, hash this
                assignments: []
            });
            console.log('Created dummy faculty uploader');
        }

        const commonData = {
            uploadedBy: uploader._id,
            year: 'All',
            section: 'All',
            subject: 'Python', // KEY: This matches the "Python" subject in frontend
            course: null // Optional
        };

        const notes = [
            {
                title: 'Python Basics - Variables & Types',
                description: 'Introduction to Python data types and variables',
                fileUrl: '/uploads/sample_python_notes.txt',
                fileType: 'text/plain',
                fileSize: 1024,
                type: 'notes',
                module: 'Basics',
                unit: '1',
                topic: 'Variables'
            },
            {
                title: 'Python Control Flow',
                description: 'If-else, Loops (for, while)',
                fileUrl: '/uploads/sample_python_notes.txt',
                fileType: 'text/plain',
                fileSize: 1024,
                type: 'notes',
                module: 'Control Flow',
                unit: '2',
                topic: 'Loops'
            },
            {
                title: 'Python Video Tutorial - Functions',
                description: 'Video explaining Python functions',
                fileUrl: 'https://www.youtube.com/watch?v=NSHGjW1VmBk', // External link example
                fileType: 'video/mp4',
                fileSize: 0,
                type: 'videos',
                module: 'Functions',
                unit: '3',
                topic: 'Functions'
            },
            {
                title: 'Python Interview Questions',
                description: 'Top 50 Python Interview Questions',
                fileUrl: '/uploads/sample_python_notes.txt',
                fileType: 'text/plain',
                fileSize: 1024,
                type: 'interview',
                module: 'Interview',
                unit: 'All',
                topic: 'Q&A'
            }
        ];

        // Clear existing Python materials to avoid duplicates
        await Material.deleteMany({ subject: 'Python' });
        console.log('Cleared existing Python materials');

        for (const note of notes) {
            await Material.create({
                ...commonData,
                ...note
            });
            console.log(`Created material: ${note.title} (${note.type})`);
        }

        console.log('Seed completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedNotes();
