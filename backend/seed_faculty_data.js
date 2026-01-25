const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

// Import Models
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');
const Material = require('./models/Material');
const Exam = require('./models/Exam');
const Message = require('./models/Message');

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB for Seeding');

        // 1. Create/Update Faculty
        console.log('👤 Seeding Faculty (FAC001)...');
        const facultyData = {
            name: 'Dr. Sarah Connor',
            facultyId: 'FAC001',
            email: 'sarah.connor@university.edu',
            password: 'password123',
            designation: 'Senior Professor',
            department: 'CSE',
            assignments: [
                { year: '4', section: 'A', branch: 'CSE', subject: 'Advanced AI', semester: '1' },
                { year: '3', section: 'B', branch: 'CSE', subject: 'Web Technologies', semester: '1' }
            ]
        };

        const faculty = await Faculty.findOneAndUpdate(
            { facultyId: 'FAC001' },
            facultyData,
            { upsert: true, new: true }
        );
        console.log('   -> Faculty Ready');

        // 2. Create Students for these classes
        console.log('🎓 Seeding Students...');
        const students = [
            {
                name: 'John Doe',
                sid: 'STU001',
                email: 'john@student.edu',
                branch: 'CSE',
                year: '4',
                section: 'A',
                password: 'password123'
            },
            {
                name: 'Jane Smith',
                sid: 'STU002',
                email: 'jane@student.edu',
                branch: 'CSE',
                year: '4',
                section: 'A',
                password: 'password123'
            },
            {
                name: 'Bob Wilson',
                sid: 'STU003',
                email: 'bob@student.edu',
                branch: 'CSE',
                year: '3',
                section: 'B',
                password: 'password123'
            }
        ];

        for (const s of students) {
            await Student.findOneAndUpdate(
                { sid: s.sid },
                s,
                { upsert: true }
            );
        }
        console.log('   -> Students Ready');

        // 3. Create Material
        console.log('📚 Seeding Materials...');
        await Material.deleteMany({ uploadedBy: faculty._id }); // Clear old sample data for this faculty

        const materials = [
            {
                title: 'AI Fundamentals - Lecture 1',
                description: 'Introduction to Neural Networks',
                subject: 'Advanced AI',
                year: '4',
                section: 'A',
                type: 'notes',
                fileUrl: '#', // Placeholder
                uploadedBy: faculty._id,
                isAdvanced: true // Advanced content
            },
            {
                title: 'React Hooks Deep Dive',
                description: 'Video tutorial on useEffect',
                subject: 'Web Technologies',
                year: '3',
                section: 'B',
                type: 'videos',
                fileUrl: '#',
                uploadedBy: faculty._id
            }
        ];

        for (const m of materials) {
            await Material.create(m);
        }
        console.log('   -> Materials Ready');

        // 4. Create Exam
        console.log('📝 Seeding Exams...');
        await Exam.deleteMany({ createdBy: faculty._id });

        await Exam.create({
            title: 'Mid-Term AI Assessment',
            subject: 'Advanced AI',
            topic: 'Neural Networks',
            week: 'Mid Term',
            branch: 'CSE',
            year: '4',
            section: 'A',
            durationMinutes: 45,
            totalMarks: 50,
            questions: [
                {
                    questionText: 'What is a Perceptron?',
                    options: ['A car', 'A neuron model', 'A star', 'A chemical'],
                    correctOptionIndex: 1,
                    marks: 2
                }
            ],
            createdBy: faculty._id
        });
        console.log('   -> Exam Ready');

        // 5. Create Message
        console.log('📢 Seeding Message...');
        await Message.create({
            message: 'Welcome to the new semester! Check your dashboard.',
            target: 'faculty',
            sender: 'Admin',
            createdAt: new Date()
        });
        console.log('   -> Message Ready');

        console.log('\n✅ SEEDING COMPLETE! Login with FAC001 / password123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding Failed:', err);
        process.exit(1);
    }
};

seedData();
