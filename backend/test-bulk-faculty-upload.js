// TEST SCRIPT: Bulk Faculty Upload
// Run with: node backend/test-bulk-faculty-upload.js

const axios = require('axios');

const API_URL = 'http://localhost:5000';

// Sample faculty data for testing
const testFaculties = [
    {
        facultyId: "TEST001",
        name: "Dr. Test Faculty 1",
        email: "test1@university.edu",
        password: "test123",
        department: "CSE",
        designation: "Professor",
        phone: "9876543210",
        assignments: [
            { year: "3", section: "A", subject: "Artificial Intelligence" },
            { year: "3", section: "B", subject: "Machine Learning" }
        ]
    },
    {
        facultyId: "TEST002",
        name: "Dr. Test Faculty 2",
        email: "test2@university.edu",
        password: "test123",
        department: "ECE",
        designation: "Associate Professor",
        assignments: "Year 2 Section A Subject Digital Electronics; Year 2 Section B Subject Microprocessors"
    },
    {
        facultyId: "TEST003",
        name: "Dr. Test Faculty 3",
        // Minimal fields - should use defaults
    },
    {
        // Missing required fields - should fail
        name: "Missing ID Faculty"
    }
];

async function testBulkUpload() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║         TESTING BULK FACULTY UPLOAD                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    try {
        console.log('📤 Sending bulk upload request...\n');
        console.log(`Uploading ${testFaculties.length} faculty members`);

        const response = await axios.post(`${API_URL}/api/faculty/bulk`, {
            faculties: testFaculties
        });

        console.log('\n✅ UPLOAD COMPLETE!\n');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📊 RESULTS:');
        console.log('═══════════════════════════════════════════════════════════\n');

        const { results } = response.data;

        console.log(`Total: ${results.total}`);
        console.log(`✅ Success: ${results.success.length}`);
        console.log(`❌ Errors: ${results.errors.length}\n`);

        if (results.success.length > 0) {
            console.log('📗 SUCCESSFUL UPLOADS:');
            console.log('─────────────────────────────────────────────────────────\n');
            results.success.forEach(s => {
                console.log(`  ✅ Row ${s.row}: ${s.facultyId} - ${s.name}`);
            });
            console.log('');
        }

        if (results.errors.length > 0) {
            console.log('📕 FAILED UPLOADS:');
            console.log('─────────────────────────────────────────────────────────\n');
            results.errors.forEach(e => {
                console.log(`  ❌ Row ${e.row}: ${e.facultyId}`);
                console.log(`     Error: ${e.error}\n`);
            });
        }

        console.log('═══════════════════════════════════════════════════════════');
        console.log('✅ TEST COMPLETE');
        console.log('═══════════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:\n');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        console.log('\n💡 Make sure:');
        console.log('   1. Backend server is running (npm run dev)');
        console.log('   2. MongoDB is connected');
        console.log('   3. API endpoint is correct\n');
    }
}

// Run test
testBulkUpload();
