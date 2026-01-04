require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Material = require('./models/Material');
const Admin = require('./models/Admin');
const Course = require('./models/Course');

const dataDir = path.join(__dirname, 'data');

async function migrate() {
    try {
        console.log('🚀 Starting migration to MongoDB Atlas...');
        console.log('');

        // Check if MONGO_URI exists
        if (!process.env.MONGO_URI) {
            console.error('❌ ERROR: MONGO_URI not found in .env file');
            console.error('');
            console.error('Please create a .env file in the backend folder with:');
            console.error('MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/friendly_notebook');
            console.error('');
            process.exit(1);
        }

        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');
        console.log('');

        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing collections...');
        await Student.deleteMany({});
        await Faculty.deleteMany({});
        await Material.deleteMany({});
        await Admin.deleteMany({});
        await Course.deleteMany({});
        console.log('✅ Collections cleared');
        console.log('');

        let totalMigrated = 0;

        // Migrate Students
        console.log('📚 Migrating students...');
        try {
            const studentsFile = path.join(dataDir, 'students.json');
            if (fs.existsSync(studentsFile)) {
                const studentsData = JSON.parse(fs.readFileSync(studentsFile, 'utf8'));
                if (Array.isArray(studentsData) && studentsData.length > 0) {
                    await Student.insertMany(studentsData);
                    console.log(`   ✅ Migrated ${studentsData.length} students`);
                    totalMigrated += studentsData.length;
                } else {
                    console.log('   ⚠️  No students to migrate');
                }
            } else {
                console.log('   ⚠️  students.json not found');
            }
        } catch (err) {
            console.error('   ❌ Error migrating students:', err.message);
        }
        console.log('');

        // Migrate Faculty
        console.log('👨‍🏫 Migrating faculty...');
        try {
            const facultyFile = path.join(dataDir, 'faculty.json');
            if (fs.existsSync(facultyFile)) {
                const facultyData = JSON.parse(fs.readFileSync(facultyFile, 'utf8'));
                if (Array.isArray(facultyData) && facultyData.length > 0) {
                    await Faculty.insertMany(facultyData);
                    console.log(`   ✅ Migrated ${facultyData.length} faculty members`);
                    totalMigrated += facultyData.length;
                } else {
                    console.log('   ⚠️  No faculty to migrate');
                }
            } else {
                console.log('   ⚠️  faculty.json not found');
            }
        } catch (err) {
            console.error('   ❌ Error migrating faculty:', err.message);
        }
        console.log('');

        // Migrate Materials
        console.log('📄 Migrating materials...');
        try {
            const materialsFile = path.join(dataDir, 'materials.json');
            if (fs.existsSync(materialsFile)) {
                const materialsData = JSON.parse(fs.readFileSync(materialsFile, 'utf8'));
                if (Array.isArray(materialsData) && materialsData.length > 0) {
                    await Material.insertMany(materialsData);
                    console.log(`   ✅ Migrated ${materialsData.length} materials`);
                    totalMigrated += materialsData.length;
                } else {
                    console.log('   ⚠️  No materials to migrate');
                }
            } else {
                console.log('   ⚠️  materials.json not found');
            }
        } catch (err) {
            console.error('   ❌ Error migrating materials:', err.message);
        }
        console.log('');

        // Migrate Admin
        console.log('🔐 Migrating admin...');
        try {
            const adminFile = path.join(dataDir, 'admin.json');
            if (fs.existsSync(adminFile)) {
                const adminData = JSON.parse(fs.readFileSync(adminFile, 'utf8'));
                if (adminData && adminData.adminId) {
                    await Admin.create(adminData);
                    console.log('   ✅ Migrated admin account');
                    totalMigrated += 1;
                } else {
                    console.log('   ⚠️  No admin data to migrate');
                }
            } else {
                console.log('   ⚠️  admin.json not found');
            }
        } catch (err) {
            console.error('   ❌ Error migrating admin:', err.message);
        }
        console.log('');

        // Migrate Courses
        console.log('📖 Migrating courses...');
        try {
            const coursesFile = path.join(dataDir, 'courses.json');
            if (fs.existsSync(coursesFile)) {
                const coursesData = JSON.parse(fs.readFileSync(coursesFile, 'utf8'));
                if (Array.isArray(coursesData) && coursesData.length > 0) {
                    await Course.insertMany(coursesData);
                    console.log(`   ✅ Migrated ${coursesData.length} courses`);
                    totalMigrated += coursesData.length;
                } else {
                    console.log('   ⚠️  No courses to migrate');
                }
            } else {
                console.log('   ⚠️  courses.json not found');
            }
        } catch (err) {
            console.error('   ❌ Error migrating courses:', err.message);
        }
        console.log('');

        console.log('═══════════════════════════════════════════');
        console.log('🎉 Migration completed successfully!');
        console.log('═══════════════════════════════════════════');
        console.log('');
        console.log('📊 Summary:');
        console.log(`   Total documents migrated: ${totalMigrated}`);
        console.log('');
        console.log('✅ Your data is now in MongoDB Atlas!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Verify data in MongoDB Atlas dashboard');
        console.log('2. Restart your backend server');
        console.log('3. Test your application');
        console.log('');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('');
        console.error('═══════════════════════════════════════════');
        console.error('❌ Migration failed!');
        console.error('═══════════════════════════════════════════');
        console.error('');
        console.error('Error:', error.message);
        console.error('');
        console.error('Troubleshooting:');
        console.error('1. Check your MONGO_URI in .env file');
        console.error('2. Verify MongoDB Atlas cluster is running');
        console.error('3. Check network access (IP whitelist)');
        console.error('4. Verify database user credentials');
        console.error('');

        await mongoose.connection.close();
        process.exit(1);
    }
}

migrate();
