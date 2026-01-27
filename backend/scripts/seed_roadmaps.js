const mongoose = require('mongoose');
const Roadmap = require('../models/Roadmap');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const roadmaps = [
    {
        title: 'Full Stack Web (MERN)',
        slug: 'mern-stack',
        description: 'Master the MongoDB, Express, React, and Node.js stack from Zero to Hero.',
        icon: 'FaLaptopCode',
        color: '#6366f1', // Indigo
        levels: [
            {
                title: 'Foundations',
                subtitle: 'Weeks 1-4',
                description: 'Build your bedrock with core web technologies.',
                topics: [
                    { topic: 'HTML5 Semantic Structure & SEO' },
                    { topic: 'CSS3 Flexbox, Grid, & Media Queries' },
                    { topic: 'JavaScript ES6+ Syntax (Let, Const, Arrow Funcs)' },
                    { topic: 'DOM Manipulation & Events' },
                    { topic: 'Git & GitHub Basics' }
                ]
            },
            {
                title: 'React Frontend',
                subtitle: 'Weeks 5-8',
                description: 'Component-based UI development.',
                topics: [
                    { topic: 'React Components & Props' },
                    { topic: 'Hooks: useState, useEffect' },
                    { topic: 'Context API for State Management' },
                    { topic: 'React Router v6' },
                    { topic: 'Performance Optimization (useMemo, useCallback)' }
                ]
            },
            {
                title: 'Backend Mastery',
                subtitle: 'Weeks 9-12',
                description: 'Server-side logic with Node.js & Express.',
                topics: [
                    { topic: 'Node.js Runtime & Event Loop' },
                    { topic: 'Express Middleware & Routing' },
                    { topic: 'RESTful API Design' },
                    { topic: 'JWT Authentication & Security' },
                    { topic: 'API Error Handling' }
                ]
            },
            {
                title: 'Database & Deployment',
                subtitle: 'Weeks 13-16',
                description: 'Data persistence and going live.',
                topics: [
                    { topic: 'MongoDB Schema Design (Mongoose)' },
                    { topic: 'Aggregation Framework' },
                    { topic: 'Connecting Frontend to Backend' },
                    { topic: 'Deploying to Vercel (Front) & Render (Back)' }
                ]
            }
        ]
    },
    {
        title: 'Python Mastery',
        slug: 'python-master',
        description: 'From simple scripts to AI/ML capable applications.',
        icon: 'FaPython',
        color: '#fbbf24', // Amber
        levels: [
            {
                title: 'Syntax & Core',
                subtitle: 'Level 1',
                description: 'Understand the language fundamentals.',
                topics: [
                    { topic: 'Variables, Loops, Conditionals' },
                    { topic: 'Functions & Modules' },
                    { topic: 'File Handling (Read/Write)' },
                    { topic: 'List Comprehensions & Dictionaries' }
                ]
            },
            {
                title: 'Advanced Python',
                subtitle: 'Level 2',
                description: 'OOP and pythonic coding.',
                topics: [
                    { topic: 'Object Oriented Programming (OOP)' },
                    { topic: 'Decorators, Generators, Iterators' },
                    { topic: 'Exception Handling' },
                    { topic: 'Virtual Environments (venv, poetry)' }
                ]
            },
            {
                title: 'Data Science Basics',
                subtitle: 'Level 3',
                description: 'Data manipulation and analysis.',
                topics: [
                    { topic: 'NumPy Arrays & Math' },
                    { topic: 'Pandas DataFrames' },
                    { topic: 'Matplotlib/Seaborn Visualization' },
                    { topic: 'Scikit-Learn Basics' }
                ]
            }
        ]
    },
    {
        title: 'Java Enterprise',
        slug: 'java-enterprise',
        description: 'Build robust, scalable enterprise applications.',
        icon: 'FaJava',
        color: '#dc2626', // Red
        levels: [
            {
                title: 'Core Java',
                subtitle: 'Phase 1',
                description: 'Strong typing and OOP principles.',
                topics: [
                    { topic: 'Class, Object, Inheritance, Polymorphism' },
                    { topic: 'Interfaces & Abstract Classes' },
                    { topic: 'Collections Framework (List, Set, Map)' },
                    { topic: 'Exception Handling' }
                ]
            },
            {
                title: 'Advanced Java',
                subtitle: 'Phase 2',
                description: 'Modern Java features.',
                topics: [
                    { topic: 'Java 8 Features (Streams, Lambdas)' },
                    { topic: 'Multithreading & Concurrency' },
                    { topic: 'JDBC Database Connectivity' }
                ]
            },
            {
                title: 'Spring Framework',
                subtitle: 'Phase 3',
                description: 'Industry standard framework.',
                topics: [
                    { topic: 'Spring Boot Basics (Starters)' },
                    { topic: 'Dependency Injection (IOC)' },
                    { topic: 'Spring Data JPA (Hibernate)' },
                    { topic: 'Building REST APIs with Spring' }
                ]
            }
        ]
    },
    {
        title: 'DevOps Lifecycle',
        slug: 'devops',
        description: 'Bridge the gap between development and operations.',
        icon: 'FaServer',
        color: '#2563eb', // Blue
        levels: [
            {
                title: 'OS & Scripting',
                subtitle: 'Stage 1',
                description: 'Master the terminal.',
                topics: [
                    { topic: 'Linux Basics (Bash, Permissions)' },
                    { topic: 'Shell Scripting Automation' },
                    { topic: 'Networking Concepts (DNS, TCP/IP)' }
                ]
            },
            {
                title: 'Containerization',
                subtitle: 'Stage 2',
                description: 'Package applications.',
                topics: [
                    { topic: 'Docker Images & Containers' },
                    { topic: 'Docker Compose' },
                    { topic: 'Container Registries' }
                ]
            },
            {
                title: 'Orchestration & CI/CD',
                subtitle: 'Stage 3',
                description: 'Scale and automate.',
                topics: [
                    { topic: 'Kubernetes Pods & Services' },
                    { topic: 'Jenkins / GitHub Actions Pipelines' },
                    { topic: 'Cloud Basics (AWS EC2, S3)' }
                ]
            }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await Roadmap.deleteMany({});
        console.log('Cleared existing roadmaps');

        await Roadmap.insertMany(roadmaps);
        console.log(`Seeded ${roadmaps.length} comprehensive learning roadmaps`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding roadmaps:', err);
        process.exit(1);
    }
};

seedDB();
