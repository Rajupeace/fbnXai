const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// Default to local if not set
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

// Import Models
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');
const Material = require('./models/Material');
const Exam = require('./models/Exam');
const Message = require('./models/Message');
const Admin = require('./models/Admin');

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB for Comprehensive Seeding');

        // --- 1. SETUP USERS ---

        // ADMIN
        const adminData = {
            adminId: 'admin',
            password: 'admin', // Simple for testing
            name: 'System Admin',
            role: 'admin'
        };
        // Admins might be in a different collection or just hardcoded, but if we have an Admin model:
        try {
            await Admin.findOneAndUpdate({ adminId: 'admin' }, adminData, { upsert: true });
            console.log('👤 Admin Ready (admin/admin)');
        } catch (e) { console.log('   (Skipping Admin model if not used)'); }

        // FACULTY
        const facultyData = {
            name: 'Dr. Sarah Connor',
            facultyId: 'FAC001',
            email: 'sarah@univ.edu',
            password: 'password123',
            designation: 'Department Head',
            department: 'CSE',
            assignments: [
                { year: '1', section: 'A', branch: 'CSE', subject: 'Programming with C', semester: '1' },
                { year: '4', section: 'A', branch: 'CSE', subject: 'Advanced AI', semester: '1' }
            ]
        };
        const faculty = await Faculty.findOneAndUpdate(
            { facultyId: 'FAC001' },
            facultyData,
            { upsert: true, new: true }
        );
        console.log('👤 Faculty Ready (FAC001/password123)');

        // STUDENTS
        const students = [
            { name: 'John Doe', sid: 'STU001', branch: 'CSE', year: '4', section: 'A' },
            { name: 'Alice Wonder', sid: 'STU002', branch: 'CSE', year: '1', section: 'A' }
        ];
        for (const s of students) {
            await Student.findOneAndUpdate(
                { sid: s.sid },
                { ...s, password: 'password123', email: `${s.name.split(' ')[0]}@test.com` },
                { upsert: true }
            );
        }
        console.log('👤 Students Ready (STU001, STU002 / password123)');


        // --- 2. SEED MATERIALS (NOTES, VIDEOS, PAPERS) ---

        console.log('📚 Seeding Comprehensive Materials...');

        // Clear existing materials for this faculty/admin to avoid duplicates
        await Material.deleteMany({ uploadedBy: faculty._id });
        await Material.deleteMany({ uploadedBy: 'admin' }); // If ID is string 'admin'

        const materialsPayload = [
            // FACULTY UPLOADS (Advanced AI - Year 4)
            {
                title: 'Neural Networks Architecture',
                description: 'Deep dive into perceptrons and hidden layers.',
                subject: 'Advanced AI',
                year: '4',
                section: 'A',
                branch: 'CSE',
                type: 'notes',
                fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                uploadedBy: faculty._id,
                isAdvanced: true,
                module: '1',
                unit: '1'
            },
            {
                title: 'Backpropagation Algorithm Explained',
                description: 'Visual guide to gradient descent.',
                subject: 'Advanced AI',
                year: '4',
                section: 'A',
                branch: 'CSE',
                type: 'videos',
                fileUrl: 'https://www.youtube.com/watch?v=Ilg3gGewQ5U',
                uploadedBy: faculty._id,
                isAdvanced: true,
                module: '1',
                unit: '2'
            },
            {
                title: 'AI Model Paper 2024',
                description: 'Previous year semester question paper.',
                subject: 'Advanced AI',
                year: '4',
                section: 'A',
                branch: 'CSE',
                type: 'modelPapers',
                fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                uploadedBy: faculty._id,
                module: '1'
            },

            // ADMIN UPLOADS (General - Year 1)
            {
                title: 'Introduction to C Programming',
                description: 'Basic syntax and flow control.',
                subject: 'Programming with C',
                year: '1', // String or Number handled by flexible queries
                section: 'A',
                branch: 'CSE',
                type: 'notes',
                fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                uploadedBy: faculty._id, // Assigning to faculty for now to ensure visibility
                module: '1',
                unit: '1'
            },
            {
                title: 'Pointers & Memory Management',
                description: 'Critical concept video.',
                subject: 'Programming with C',
                year: '1',
                section: 'A',
                branch: 'CSE',
                type: 'videos',
                fileUrl: 'https://www.youtube.com/watch?v=zuegQmMdy8M',
                uploadedBy: faculty._id,
                module: '2'
            },
            {
                title: 'Engineering Physics Model Paper',
                description: 'Standard model paper for sem 1.',
                subject: 'Engineering Physics',
                year: '1',
                section: 'A',
                branch: 'CSE',
                type: 'modelPapers',
                fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                uploadedBy: faculty._id
            }
        ];

        for (const m of materialsPayload) {
            await Material.create({ ...m, createdAt: new Date() });
        }
        console.log(`   -> Seeded ${materialsPayload.length} Materials`);


        // --- 3. SEED EXAMS ---

        console.log('📝 Seeding Exams...');
        await Exam.deleteMany({ createdBy: faculty._id });

        const examsPayload = [
            {
                title: 'AI Mid-Term Challenge',
                subject: 'Advanced AI',
                topic: 'Neural Networks & Optimization',
                week: 'Week 8',
                branch: 'CSE',
                year: '4',
                section: 'A',
                durationMinutes: 30,
                totalMarks: 20,
                questions: [
                    {
                        questionText: 'What is the primary purpose of an activation function?',
                        options: ['To heat up the GPU', 'To introduce non-linearity', 'To increase data size', 'To sort the array'],
                        correctOptionIndex: 1,
                        marks: 2
                    },
                    {
                        questionText: 'Which algorithm is commonly used for training neural networks?',
                        options: ['Quick Sort', 'Backpropagation', 'Dijkstra', 'Binary Search'],
                        correctOptionIndex: 1,
                        marks: 2
                    },
                    {
                        questionText: 'Overfitting can be reduced by:',
                        options: ['Adding more layers', 'Dropout', 'Increasing learning rate', 'None of these'],
                        correctOptionIndex: 1,
                        marks: 2
                    }
                ],
                createdBy: faculty._id,
                isActive: true
            },
            {
                title: 'C Programming Syntax Quiz',
                subject: 'Programming with C',
                topic: 'Loops & Conditionals',
                week: 'Week 4',
                branch: 'CSE',
                year: '1',
                section: 'A',
                durationMinutes: 15,
                totalMarks: 10,
                questions: [
                    {
                        questionText: 'Which symbol is used for logical AND?',
                        options: ['&', '&&', '|', '||'],
                        correctOptionIndex: 1,
                        marks: 2
                    },
                    {
                        questionText: 'What is the correct way to declare an integer variable?',
                        options: ['int x;', 'integer x;', 'num x;', 'x = int;'],
                        correctOptionIndex: 0,
                        marks: 2
                    }
                ],
                createdBy: faculty._id,
                isActive: true
            }
        ];

        for (const e of examsPayload) {
            await Exam.create(e);
        }
        console.log(`   -> Seeded ${examsPayload.length} Exams`);


        // --- 4. SEED MARKS (For Admin Dashboard Visualization) ---
        console.log('📊 Seeding Marks...');
        const Mark = require('./models/Mark');
        await Mark.deleteMany({}); // Reset marks

        const subjects = ['Programming with C', 'Advanced AI', 'Engineering Physics'];
        const assessments = [
            { id: 'cla1', max: 20 }, { id: 'cla2', max: 20 },
            { id: 'm1t1', max: 10 }, { id: 'm1t2', max: 10 }
        ];

        for (const s of students) {
            // Give each student marks in relevant subjects based on their year?
            // For simplicity, give them marks in all subjects
            for (const sub of subjects) {
                // Determine if subject is relevant (simple filter)
                if (s.year === '1' && sub === 'Advanced AI') continue; // First year doesn't take AI
                if (s.year === '4' && sub === 'Programming with C') continue; // Final year done with C

                for (const assess of assessments) {
                    await Mark.create({
                        studentId: s.sid,
                        subject: sub,
                        assessmentType: assess.id,
                        marks: Math.floor(Math.random() * (assess.max - 5) + 5), // Random decent marks
                        maxMarks: assess.max,
                        updatedBy: 'system'
                    });
                }
            }
        }
        console.log(`   -> Seeded Marks for ${students.length} students`);


        // --- UPDATE STUDENTS WITH RICH STATS ---
        console.log('📈 Updating Students with Rich Stats...');
        for (const s of students) {
            await Student.findOneAndUpdate(
                { sid: s.sid },
                {
                    $set: {
                        stats: {
                            streak: Math.floor(Math.random() * 20),
                            lastLogin: new Date(),
                            aiUsageCount: Math.floor(Math.random() * 50),
                            tasksCompleted: Math.floor(Math.random() * 15),
                            advancedProgress: Math.floor(Math.random() * 100),
                            careerReadyScore: Math.floor(Math.random() * 100),
                            totalClasses: 120,
                            totalPresent: 100 + Math.floor(Math.random() * 20),
                            weeklyActivity: [
                                { day: 'Mon', hours: Math.floor(Math.random() * 5) },
                                { day: 'Tue', hours: Math.floor(Math.random() * 5) },
                                { day: 'Wed', hours: Math.floor(Math.random() * 5) },
                                { day: 'Thu', hours: Math.floor(Math.random() * 5) },
                                { day: 'Fri', hours: Math.floor(Math.random() * 5) },
                                { day: 'Sat', hours: Math.floor(Math.random() * 2) },
                                { day: 'Sun', hours: 0 }
                            ]
                        }
                    }
                }
            );
        }

        console.log('\n✨ COMPREHENSIVE SEEDING COMPLETE! Login to Admin/Faculty/Student dashboards to verify.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seeding Failed:', err);
        process.exit(1);
    }
};

seedData();
