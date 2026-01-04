const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../models/Course');
const connectDB = require('../config/db');

// Data adapted from branchData.js
const subjects = {
    CSE: {
        '1': [
            {
                sem: 1, subjects: [
                    { name: 'Engineering Mathematics I', code: 'BS-M101' },
                    { name: 'Engineering Physics', code: 'BS-PH101' },
                    { name: 'Basic Electrical Engineering', code: 'ES-EE101' },
                    { name: 'Programming for Problem Solving (C)', code: 'ES-CS101' }
                ]
            },
            {
                sem: 2, subjects: [
                    { name: 'Engineering Mathematics II', code: 'BS-M201' },
                    { name: 'Engineering Chemistry', code: 'BS-CH201' },
                    { name: 'Data Structures', code: 'PC-CS201' },
                    { name: 'Object-Oriented Programming (C++)', code: 'ES-CS202' }
                ]
            }
        ],
        '2': [
            {
                sem: 3, subjects: [
                    { name: 'Engineering Mathematics III', code: 'BS-M301' },
                    { name: 'Digital Logic Design', code: 'PC-CS301' },
                    { name: 'Computer Organization & Architecture', code: 'PC-CS302' },
                    { name: 'Operating Systems', code: 'PC-CS303' }
                ]
            },
            {
                sem: 4, subjects: [
                    { name: 'Theory of Computation', code: 'PC-CS401' },
                    { name: 'Design & Analysis of Algorithms', code: 'PC-CS402' },
                    { name: 'Database Management Systems', code: 'PC-CS403' },
                    { name: 'Software Engineering', code: 'PC-CS404' }
                ]
            }
        ],
        '3': [
            {
                sem: 5, subjects: [
                    { name: 'Computer Networks', code: 'PC-CS501' },
                    { name: 'Compiler Design', code: 'PC-CS502' },
                    { name: 'Artificial Intelligence', code: 'PC-CS503' },
                    { name: 'Web Technologies', code: 'PE-CS501' }
                ]
            },
            {
                sem: 6, subjects: [
                    { name: 'Machine Learning', code: 'PC-CS601' },
                    { name: 'Cloud Computing', code: 'PC-CS602' },
                    { name: 'Data Mining & Warehousing', code: 'PE-CS601' },
                    { name: 'Internet of Things (IoT)', code: 'OE-CS601' }
                ]
            }
        ],
        '4': [
            {
                sem: 7, subjects: [
                    { name: 'Distributed Systems', code: 'PC-CS701' },
                    { name: 'Information Security', code: 'PC-CS702' },
                    { name: 'Mobile Application Development', code: 'PE-CS701' },
                    { name: 'Deep Learning', code: 'PE-CS702' }
                ]
            },
            {
                sem: 8, subjects: [
                    { name: 'Project Work Phase II', code: 'PROJ-CS801' },
                    { name: 'Industrial Training / Internship', code: 'PROJ-CS802' },
                    { name: 'Professional Elective III', code: 'PE-CS801' },
                    { name: 'Professional Elective IV', code: 'PE-CS802' }
                ]
            }
        ]
    },
    // Add mappings for other branches similarly, or minimal set.
    // Including MECH/CIVIL standardized names.
    MECH: {
        '1': [
            { sem: 1, subjects: [{ name: 'Engineering Mathematics I', code: 'BS-M101' }, { name: 'Engineering Physics', code: 'BS-PH101' }, { name: 'Engineering Mechanics', code: 'ES-ME101' }] },
            { sem: 2, subjects: [{ name: 'Engineering Mathematics II', code: 'BS-M201' }, { name: 'Thermodynamics', code: 'PC-ME201' }] }
        ]
    },
    CIVIL: {
        '1': [
            { sem: 1, subjects: [{ name: 'Engineering Mathematics I', code: 'BS-M101' }, { name: 'Engineering Physics', code: 'BS-PH101' }, { name: 'Engineering Mechanics', code: 'ES-CE101' }] },
            { sem: 2, subjects: [{ name: 'Engineering Mathematics II', code: 'BS-M201' }, { name: 'Strength of Materials', code: 'PC-CE201' }] }
        ]
    },
    ECE: {
        '1': [
            { sem: 1, subjects: [{ name: 'Engineering Mathematics I', code: 'BS-M101' }, { name: 'Engineering Physics', code: 'BS-PH101' }, { name: 'Basic Electrical Engineering', code: 'ES-EE101' }] },
            { sem: 2, subjects: [{ name: 'Engineering Mathematics II', code: 'BS-M201' }, { name: 'Engineering Chemistry', code: 'BS-CH201' }, { name: 'Basic Electronics Engineering', code: 'ES-EC201' }] }
        ]
    }
};

const mapBranch = (b) => {
    if (b === 'Mechanical') return 'MECH';
    if (b === 'Civil') return 'CIVIL';
    return b;
};

const runSeed = async () => {
    await connectDB();

    let count = 0;
    for (const [branch, years] of Object.entries(subjects)) {
        for (const [year, semesters] of Object.entries(years)) {
            for (const semData of semesters) {
                for (const sub of semData.subjects) {
                    // Check if exists
                    const exists = await Course.findOne({ courseCode: sub.code });
                    if (!exists) {
                        await Course.create({
                            courseName: sub.name,
                            courseCode: sub.code,
                            year: year,
                            semester: String(semData.sem),
                            department: mapBranch(branch), // Store as canonical branch 'CSE', 'MECH'
                            credits: 4 // Default
                        });
                        console.log(`Created: ${sub.code} - ${sub.name}`);
                        count++;
                    } else {
                        // Optional: Update?
                        console.log(`Exists: ${sub.code}`);
                    }
                }
            }
        }
    }

    console.log(`Seed completed. Added ${count} new courses.`);
    process.exit(0);
};

runSeed().catch(err => {
    console.error(err);
    process.exit(1);
});
