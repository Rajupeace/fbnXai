const mongoose = require('mongoose');
const Roadmap = require('../models/Roadmap');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Mega detailed roadmaps for comprehensive coverage
const detailedRoadmaps = [
    // --- WEB DEVELOPMENT (Frontend) ---
    {
        title: 'React Developer',
        slug: 'react-dev',
        category: 'Web Development',
        description: 'Master the most popular frontend library and its ecosystem.',
        icon: 'FaReact',
        color: '#61dafb',
        levels: [
            { title: 'Foundations', subtitle: 'HTML/CSS/JS', description: 'Core web technologies.', topics: ['HTML5 Semantic', 'CSS Flexbox/Grid', 'ES6+ Syntax', 'DOM Manipulation'] },
            { title: 'React Core', subtitle: 'Hooks & Components', description: 'Building the UI.', topics: ['Components & JSX', 'Props vs State', 'Hooks (useState, useEffect)', 'Ref & Context'] },
            { title: 'Ecosystem', subtitle: 'State & Routing', description: 'Scalable apps.', topics: ['React Router v6', 'Redux Toolkit / Zustand', 'React Query / SWR', 'Form Handling (React Hook Form)'] }
        ]
    },
    {
        title: 'Full Stack MERN',
        slug: 'mern-stack',
        category: 'Web Development',
        description: 'Complete guide to becoming a MERN Stack Developer.',
        icon: 'FaLaptopCode',
        color: '#6366f1',
        levels: [
            { title: 'Frontend Basics', description: 'Foundation.', topics: ['HTML5', 'CSS3', 'JavaScript', 'Git'] },
            { title: 'React Frontend', description: 'Modern UI.', topics: ['Components', 'Hooks', 'Context API', 'React Router'] },
            { title: 'Backend Node.js', description: 'Server logic.', topics: ['Node Runtime', 'Express Framework', 'REST API Design', 'Middleware'] },
            { title: 'Database', description: 'Data persistence.', topics: ['MongoDB Atlas', 'Mongoose ODM', 'Aggregation Pipeline', 'Indexes'] }
        ]
    },
    {
        title: 'Vue.js Developer',
        slug: 'vue-dev',
        category: 'Web Development',
        description: 'The progressive JavaScript framework.',
        icon: 'FaVuejs',
        color: '#42b883',
        levels: [
            { title: 'Vue Basics', topics: ['Declarative Rendering', 'Directives (v-if, v-for)', 'Event Handling', 'Computed Properties'] },
            { title: 'Components', topics: ['Props & Events', 'Slots', 'Composition API', 'Provide/Inject'] },
            { title: 'Eco-system', topics: ['Vue Router', 'Pinia (State Management)', 'Nuxt.js Basics'] }
        ]
    },
    {
        title: 'Angular Developer',
        slug: 'angular-dev',
        category: 'Web Development',
        description: 'Platform for building mobile and desktop web applications.',
        icon: 'FaAngular',
        color: '#dd0031',
        levels: [
            { title: 'TypeScript Core', topics: ['Types & Interfaces', 'Classes', 'Decorators', 'Generics'] },
            { title: 'Angular Basics', topics: ['Components', 'Templates', 'Dependency Injection', 'Services'] },
            { title: 'Advanced Angular', topics: ['RxJS Fundamentals', 'Routing & Guards', 'Modules vs Standalone', 'Forms (Reactive)'] }
        ]
    },

    // --- WEB DEVELOPMENT (Backend) ---
    {
        title: 'Java Enterprise',
        slug: 'java-enterprise',
        category: 'Web Development',
        description: 'Enterprise-grade backend development.',
        icon: 'FaJava',
        color: '#ef4444',
        levels: [
            { title: 'Core Java', topics: ['OOP Concepts', 'Collections Framework', 'Exception Handling', 'Java 8+ Features'] },
            { title: 'Spring Framework', topics: ['Spring Boot', 'Dependency Injection', 'Spring Data JPA', 'Spring Security'] },
            { title: 'Microservices', topics: ['Service Discovery', 'API Gateway', 'Config Server', 'Dockerization'] }
        ]
    },
    {
        title: '.NET (C#) Developer',
        slug: 'csharp-dotnet',
        category: 'Web Development',
        description: 'Build enterprise apps with Microsoft stack.',
        icon: 'FaWindows',
        color: '#9333ea',
        levels: [
            { title: 'C# Syntax', topics: ['Variables & Types', 'Control Flow', 'Classes', 'LINQ'] },
            { title: 'ASP.NET Core', topics: ['Web API', 'MVC Pattern', 'Entity Framework Core', 'Identity'] },
            { title: 'Advanced', topics: ['Microservices', 'SignalR Real-time', 'Azure Basics', 'Unit Testing'] }
        ]
    },
    {
        title: 'PHP Developer',
        slug: 'php-laravel',
        category: 'Web Development',
        description: 'Server-side scripting and Laravel framework.',
        icon: 'FaPhp',
        color: '#777bb4',
        levels: [
            { title: 'PHP Basics', topics: ['Syntax & Types', 'Forms', 'Sessions & Cookies', 'OOP in PHP'] },
            { title: 'Laravel Framework', topics: ['Routing', 'Blade Templates', 'Eloquent ORM', 'Migrations'] },
            { title: 'Advanced', topics: ['API Resources', 'Job Queues', 'Caching with Redis', 'Testing'] }
        ]
    },

    // --- APP DEVELOPMENT (General) ---
    {
        title: 'Python Developer',
        slug: 'python-dev',
        category: 'App Development',
        description: 'Master Python for Web, Automation, and Data.',
        icon: 'FaPython',
        color: '#fbbf24',
        levels: [
            { title: 'The Basics', topics: ['Syntax & Variables', 'Control Flow', 'Loops', 'Data Structures'] },
            { title: 'Modular Coding', topics: ['Functions', 'Modules & PIP', 'File Handling', 'Error Handling'] },
            { title: 'Advanced Python', topics: ['OOP', 'Decorators', 'Generators', 'Virtual Envs'] },
            { title: 'Web Frameworks', topics: ['Flask Basics', 'Django Architecture', 'FastAPI Intro', 'ORM Basics'] }
        ]
    },

    // --- SYSTEMS ---
    {
        title: 'C++ Systems',
        slug: 'cpp-systems',
        category: 'Systems',
        description: 'High performance computing.',
        icon: 'FaCogs',
        color: '#ea580c',
        levels: [
            { title: 'C++ Fundamentals', topics: ['Syntax', 'Pointers & Refs', 'Memory Allocation', 'OOP'] },
            { title: 'STL Library', topics: ['Vectors', 'Maps/Sets', 'Algorithms', 'Iterators'] },
            { title: 'Advanced', topics: ['Templates', 'Move Semantics', 'Concurrency', 'Smart Pointers'] }
        ]
    },
    {
        title: 'Golang (Go)',
        slug: 'golang-dev',
        category: 'Systems',
        description: 'Build fast, efficient software at scale.',
        icon: 'FaGoogle',
        color: '#0ea5e9',
        levels: [
            { title: 'Go Basics', topics: ['Syntax', 'Packages', 'Functions', 'Slices & Maps'] },
            { title: 'Methods & Interfaces', topics: ['Structs', 'Interface impl', 'Composition', 'Error Handling'] },
            { title: 'Concurrency', topics: ['Goroutines', 'Channels', 'Select', 'Mutexes'] }
        ]
    },
    {
        title: 'Rust Programming',
        slug: 'rust-dev',
        category: 'Systems',
        description: 'Memory safety without garbage collection.',
        icon: 'FaShieldAlt',
        color: '#f97316',
        levels: [
            { title: 'Ownership', topics: ['Ownership Rules', 'Borrowing', 'Slices'] },
            { title: 'Structures', topics: ['Structs', 'Enums', 'Pattern Matching', 'Collections'] },
            { title: 'Traits & Lifetimes', topics: ['Generics', 'Trait Bounds', 'Lifetime Syntax', 'Error Types'] }
        ]
    },

    // --- MOBILE ---
    {
        title: 'iOS Developer (Swift)',
        slug: 'ios-swift',
        category: 'Mobile',
        description: 'Build apps for iPhone & iPad.',
        icon: 'FaSwift',
        color: '#f05138',
        levels: [
            { title: 'Swift Language', topics: ['Variables', 'Optionalse', 'Closures', 'Structs vs Classes'] },
            { title: 'SwiftUI', topics: ['Views & Modifiers', 'State Management', 'Navigation', 'Lists'] },
            { title: 'iOS API', topics: ['Core Data', 'Networking (URLSession)', 'Notifications', 'App Store Deploy'] }
        ]
    },
    {
        title: 'Android (Kotlin)',
        slug: 'android-kotlin',
        category: 'Mobile',
        description: 'Native Android development.',
        icon: 'FaAndroid',
        color: '#3ddc84',
        levels: [
            { title: 'Kotlin Basics', topics: ['Syntax', 'Null Safety', 'Lambdas', 'Coroutines Intro'] },
            { title: 'Android UI', topics: ['Jetpack Compose', 'Material Design', 'Layouts', 'Themes'] },
            { title: 'Architecture', topics: ['MVVM', 'LifecycleScope', 'Room DB', 'Retrofit'] }
        ]
    },
    {
        title: 'Flutter (Dart)',
        slug: 'flutter-dev',
        category: 'Mobile',
        description: 'Cross-platform apps from a single codebase.',
        icon: 'FaGoogle',
        color: '#42a5f5',
        levels: [
            { title: 'Dart Language', topics: ['Variables', 'OOP', 'Async/Await', 'Streams'] },
            { title: 'Flutter Widgets', topics: ['Stateless vs Stateful', 'Layout Widgets', 'Forms', 'Navigation'] },
            { title: 'App Features', topics: ['State Management (Provider/Bloc)', 'API Integration', 'Local Storage', 'Firebase'] }
        ]
    },

    // --- AI & DATA ---
    {
        title: 'Python Data Science',
        slug: 'python-data',
        category: 'AI & Data',
        description: 'Analyze data and build ML models.',
        icon: 'FaPython',
        color: '#fbbf24',
        levels: [
            { title: 'Analysis Stack', topics: ['NumPy', 'Pandas', 'Matplotlib', 'Jupyter Notebooks'] },
            { title: 'Machine Learning', topics: ['Scikit-Learn', 'Regression', 'Classification', 'Clustering'] },
            { title: 'Deep Learning', topics: ['TensorFlow/PyTorch', 'Neural Networks', 'CNN/RNN', 'Deployment'] }
        ]
    },
    {
        title: 'MongoDB Database',
        slug: 'mongodb-path',
        category: 'AI & Data',
        description: 'Master the document-oriented NoSQL database.',
        icon: 'FaLeaf',
        color: '#47a248',
        levels: [
            { title: 'Basics', topics: ['Documents & Collections', 'CRUD Operations', 'Data Types', 'Import/Export'] },
            { title: 'Designing', topics: ['Schema Design', 'Relationships (Embed vs Ref)', 'Validation', 'Indexes'] },
            { title: 'Advanced', topics: ['Aggregation Framework', 'Replication', 'Sharding', 'Atlas Management'] }
        ]
    },

    // --- SECURITY ---
    {
        title: 'Cyber Security',
        slug: 'cyber-sec',
        category: 'Security',
        description: 'Defend systems from attacks.',
        icon: 'FaLock',
        color: '#ef4444',
        levels: [
            { title: 'Networking', topics: ['OSI Model', 'TCP/IP', 'DNS/HTTP', 'Subnetting'] },
            { title: 'Offensive', topics: ['Kali Linux', 'Scanning (Nmap)', 'Web Vulns (OWASP)', 'Metasploit'] },
            { title: 'Defensive', topics: ['Firewalls', 'SIEM', 'Logs Analysis', 'Incident Response'] }
        ]
    },

    // --- DEVOPS ---
    {
        title: 'DevOps Engineering',
        slug: 'devops-eng',
        category: 'Systems',
        description: 'Automate deployment and infrastructure.',
        icon: 'FaDocker',
        color: '#10b981',
        levels: [
            { title: 'Linux & Scripting', topics: ['Bash Scripting', 'File Permissions', 'Process Management', 'SSH'] },
            { title: 'Containerization', topics: ['Docker Basics', 'Dockerfiles', 'Compose', 'Networking'] },
            { title: 'Orchestration', topics: ['Kubernetes', 'AWS Basics', 'CI/CD Pipelines', 'Terraform'] }
        ]
    },

    // --- DESIGN ---
    {
        title: 'UI/UX Designer',
        slug: 'ui-ux-design',
        category: 'Design',
        description: 'User interfaces and experiences.',
        icon: 'FaPalette',
        color: '#d946ef',
        levels: [
            { title: 'Fundamentals', topics: ['Color Theory', 'Typography', 'Visual Hierarchy', 'Design Systems'] },
            { title: 'Tools', topics: ['Figma Mastery', 'Components & Variants', 'Auto-Layout', 'Wireframing'] },
            { title: 'Process', topics: ['User Research', 'Prototyping', 'Usability Testing', 'Handoff'] }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for Mega Seed...');

        await Roadmap.deleteMany({});
        console.log('Cleared existing roadmaps.');

        // Ensure data is properly structured for Schema (topics object vs string)
        const finalData = detailedRoadmaps.map(map => ({
            ...map,
            levels: map.levels.map(lvl => ({
                ...lvl,
                topics: lvl.topics.map(tStr => ({ topic: tStr, isCompleted: false }))
            }))
        }));

        await Roadmap.insertMany(finalData);
        console.log(`Successfully seeded ${finalData.length} comprehensive roadmaps!`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding roadmaps:', err);
        process.exit(1);
    }
};

seedDB();
