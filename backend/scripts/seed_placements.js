const mongoose = require('mongoose');
const PlacementCompany = require('../models/PlacementCompany');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * RICH PLACEMENT DATA SEED
 * Contains real interview questions and resources for top MNCs.
 */

const companies = [
    {
        slug: 'tcs',
        name: 'TCS',
        color: '#e11d48', // Tata Pink-Red
        logo: 'https://logo.clearbit.com/tcs.com',
        description: 'Tata Consultancy Services - Building on belief. Focuses on NQT (National Qualifier Test) covering Aptitude, Logic, and Coding.',
        hiringRole: 'Ninja / Digital / Prime',
        package: '3.36 - 9.0 LPA',
        domains: ['Software Engineer', 'Java Developer', 'Data Analyst', 'Aptitude', 'Reasoning'],
        questions: [
            // CODING (Software Engineer)
            { question: 'Program to check if a number is an Armstrong number.', answer: 'Sum of cubes of digits equals the number itself (e.g., 153). Iterate digits, cube them, sum them, compare.', category: 'Technical', domain: 'Software Engineer', difficulty: 'Easy' },
            { question: 'Find the second largest number in an array without sorting.', answer: 'Traverse array once maintaining two variables: largest and secondLargest.', category: 'Technical', domain: 'Software Engineer', difficulty: 'Medium' },
            { question: 'Difference between Call by Value and Call by Reference?', answer: 'Value: Copy of variable passed. Reference: Address of variable passed.', category: 'Technical', domain: 'Software Engineer', difficulty: 'Easy' },

            // JAVA
            { question: 'Why is String immutable in Java?', answer: 'Security, Synchronization, Caching (String Pool), and Class loading.', category: 'Technical', domain: 'Java Developer', difficulty: 'Medium' },
            { question: 'Explain the difference between JDK, JRE, and JVM.', answer: 'JDK = JRE + Dev Tools; JRE = JVM + Libraries; JVM = Runtime Environment.', category: 'Technical', domain: 'Java Developer', difficulty: 'Easy' },

            // APTITUDE
            { question: 'A train 240m long passes a pole in 24 seconds. How long will it take to pass a platform 650m long?', answer: 'Speed = 240/24 = 10m/s. Total distance = 240+650 = 890m. Time = 890/10 = 89 seconds.', category: 'Aptitude', domain: 'Aptitude', difficulty: 'Medium' },
            { question: 'If 1st Jan 2006 was Sunday, what was the day on 1st Jan 2010?', answer: 'Normal years have 1 odd day, Leap years 2. 2006, 2007, 2009 are normal (1 each). 2008 is leap (2). Total 5 odd days. Sunday + 5 = Friday.', category: 'Aptitude', domain: 'Aptitude', difficulty: 'Hard' }
                ,
                // ADDITIONAL APTITUDE
                { question: 'If the ratio of two numbers is 3:5 and their LCM is 180, find the numbers.', answer: 'Let numbers be 3k and 5k. LCM = 15k = 180 => k = 12. Numbers: 36 and 60.', category: 'Aptitude', domain: 'Aptitude', difficulty: 'Medium' },
                { question: 'Find the next number in series: 3, 6, 18, 108, ?', answer: 'Multiply: 3*2=6, 6*3=18, 18*6=108. Pattern multipliers: 2,3,6,... next multiplier 24 => 108*24 = 2592.', answer: '2592', category: 'Aptitude', domain: 'Aptitude', difficulty: 'Hard' }
        ]
    },
    {
        slug: 'infosys',
        name: 'Infosys',
        color: '#0284c7', // Infosys Blue
        logo: 'https://logo.clearbit.com/infosys.com',
        description: 'Infosys - Navigate your next. Famous for InfyTQ and HackWithInfy exams focusing on Python/Java and DB.',
        hiringRole: 'Systems Engineer / Power Programmer',
        package: '3.6 - 9.5 LPA',
        domains: ['Frontend Developer', 'Full Stack Developer', 'Python Developer', 'DBMS'],
        questions: [
            // PYTHON
            { question: 'Difference between List and Tuple in Python?', answer: 'List is mutable (can change), Tuple is immutable (cannot change). List uses [], Tuple uses ().', category: 'Technical', domain: 'Python Developer', difficulty: 'Easy' },
            { question: 'Explain Decorators in Python.', answer: 'Functions that modify the functionality of other functions. Uses @symbol.', category: 'Technical', domain: 'Python Developer', difficulty: 'Medium' },

            // FRONTEND (React)
            { question: 'What is the Virtual DOM?', answer: 'A lightweight JavaScript object which is a copy of the real DOM. React uses it for efficient updates (diffing algorithm).', category: 'Technical', domain: 'Frontend Developer', difficulty: 'Medium' },
            { question: 'Lifecycle methods in React Class Components?', answer: 'componentDidMount, componentDidUpdate, componentWillUnmount.', category: 'Technical', domain: 'Frontend Developer', difficulty: 'Hard' },

            // TESTING & INTERVIEW FOCUS
            { question: 'How do you test a React component that uses hooks?', answer: 'Use React Testing Library + Jest; render the component with `render()`, mock hook dependencies, and assert using `screen` queries. For custom hooks, use `renderHook` from @testing-library/react-hooks.', category: 'Technical', domain: 'Frontend Developer', difficulty: 'Medium' },
            { question: 'What is Prop Drilling and how to avoid it?', answer: 'Passing props through many levels. Avoid using Context API or state management (Redux) or lift state to common ancestor.', category: 'Technical', domain: 'Frontend Developer', difficulty: 'Medium' },

            // DBMS
            { question: 'What is a Primary Key vs Foreign Key?', answer: 'Primary: Unique ID for a record. Foreign: Links to Primary Key of another table.', category: 'Technical', domain: 'DBMS', difficulty: 'Easy' },
            { question: 'Explain the types of Joins.', answer: 'Inner, Left, Right, Full Outer.', category: 'Technical', domain: 'DBMS', difficulty: 'Medium' }
        ]
    },
    {
        slug: 'accenture',
        name: 'Accenture',
        color: '#7c3aed', // Accenture Purple
        logo: 'https://logo.clearbit.com/accenture.com',
        description: 'Accenture - Let there be change. Focuses on Cognitive Ability, Cloud Computing, and Communication skills.',
        hiringRole: 'App Development Associate',
        package: '4.5 - 6.5 LPA',
        domains: ['Cloud Computing', 'Testing', 'Communication', 'Reasoning'],
        questions: [
            // CLOUD
            { question: 'Benefits of Cloud Computing?', answer: 'Scalability, Cost-efficiency, Accessibility, Reliability.', category: 'Technical', domain: 'Cloud Computing', difficulty: 'Easy' },
            { question: 'What is SaaS?', answer: 'Software as a Service (e.g., Gmail, Google Docs). No install required.', category: 'Technical', domain: 'Cloud Computing', difficulty: 'Medium' },

            // TESTING
            { question: 'What is Regression Testing?', answer: 'Testing done to verify that a code change has not adversely affected existing features.', category: 'Technical', domain: 'Testing', difficulty: 'Medium' },

            // ADDITIONAL TESTING QUESTIONS
            { question: 'What is the difference between Unit, Integration, and E2E testing?', answer: 'Unit: tests individual functions/components. Integration: tests combined units working together. E2E: simulates user flows across the system.', category: 'Technical', domain: 'Testing', difficulty: 'Easy' },
            { question: 'How would you write test cases for a login API?', answer: 'Test valid credentials, invalid credentials, missing fields, rate limiting, SQL/NoSQL injection attempts, and token expiry scenarios.', category: 'Technical', domain: 'Testing', difficulty: 'Medium' },

            // REASONING
            { question: 'Find the missing number: 2, 6, 12, 20, 30, ?', answer: 'Differences are 4, 6, 8, 10. Next difference is 12. 30 + 12 = 42.', category: 'Aptitude', domain: 'Reasoning', difficulty: 'Easy' }
        ]
    },
    {
        slug: 'amazon',
        name: 'Amazon',
        color: '#f59e0b', // Amazon Orange
        logo: 'https://logo.clearbit.com/amazon.com',
        description: 'Amazon - Earth’s most customer-centric company. Focuses on Leadership Principles and DSA.',
        hiringRole: 'SDE I',
        package: '18 - 45 LPA',
        domains: ['Data Structures', 'Algorithms', 'Backend', 'Leadership'],
        questions: [
            // DSA
            { question: 'Trapping Rain Water Problem.', answer: 'Calculate max water trapped between bars. Use Two Pointers (left/right max) or Stack. O(n).', category: 'Technical', domain: 'Algorithms', difficulty: 'Hard' },
            { question: 'Detect loop in a Linked List.', answer: 'Floyd’s Cycle Detection (Tortoise and Hare). Fast ptr moves 2x, Slow ptr moves 1x.', category: 'Technical', domain: 'Data Structures', difficulty: 'Medium' },
            { question: 'Explain how you would test and validate a complex DSA solution before presenting it in interview.', answer: 'Run multiple tests including edge cases, random inputs, and compare results with brute-force for small sizes; analyze complexity and explain tradeoffs.', category: 'Technical', domain: 'Algorithms', difficulty: 'Medium' },
            { question: 'LRU Cache Implementation.', answer: 'Use HashMap + Doubly Linked List for O(1) get and put.', category: 'Technical', domain: 'Data Structures', difficulty: 'Hard' },

            // LEADERSHIP
            { question: 'Tell me about a time you disagreed with your manager.', answer: 'Focus on "Have Backbone; Disagree and Commit". Explain the data you used to support your view.', category: 'HR', domain: 'Leadership', difficulty: 'Medium' },
            { question: 'Explain "Customer Obsession" with an example.', answer: 'Working backwards from the customer needs, not just competitor analysis.', category: 'HR', domain: 'Leadership', difficulty: 'Easy' }
        ]
    },
    {
        slug: 'wipro',
        name: 'Wipro',
        color: '#0f766e', // Wipro Teal
        logo: 'https://logo.clearbit.com/wipro.com',
        description: 'Wipro - Applying Thought. Known for WILL (Wipro Integrated Learning Program) and NLTH.',
        hiringRole: 'Project Engineer',
        package: '3.5 - 7.0 LPA',
        domains: ['Networking', 'Cyber Security', 'Coding', 'Essay Writing'],
        questions: [
            // NETWORKING
            { question: 'Difference between TCP and UDP?', answer: 'TCP: Connection-oriented, reliable (3-way handshake). UDP: Connectionless, fast (streaming).', category: 'Technical', domain: 'Networking', difficulty: 'Medium' },
            { question: 'What is DNS?', answer: 'Domain Name System. Translates domain names (google.com) to IP addresses.', category: 'Technical', domain: 'Networking', difficulty: 'Easy' },

            // CODING
            { question: 'Write a program to reverse a string without using built-in functions.', answer: 'Swap characters from start and end pointers until they meet.', category: 'Technical', domain: 'Coding', difficulty: 'Easy' }
            ,
            // ADDITIONAL APTITUDE/TESTING FOR WIPRO
            { question: 'You have 8 balls; one is heavier. Find the heavy ball in minimum weighings using a balance scale.', answer: 'Use divide and conquer: weigh 3 vs 3. If equal, heavy is in remaining 2 -> weigh them (2 weighings). If not equal, keep reducing. Minimum 2-3 weighings depending on outcome; optimal strategy uses base-3 logic.', category: 'Aptitude', domain: 'Reasoning', difficulty: 'Hard' }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await PlacementCompany.deleteMany({});
        console.log('Cleared existing companies');

        await PlacementCompany.insertMany(companies);
        console.log(`Seeded ${companies.length} companies with extensive Q&A data`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
