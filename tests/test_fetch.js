const axios = require('axios');

async function testStudentFetch() {
    try {
        const params = new URLSearchParams({
            year: '1',
            branch: 'CSE',
            section: 'A'
        });

        console.log('Fetching materials for Year 1, CSE, Section A...');
        const response = await axios.get(`http://localhost:5000/api/materials?${params.toString()}`);

        console.log('Status:', response.status);
        const materials = response.data;
        console.log('Total Materials found:', materials.length);

        const e2eTest = materials.find(m => m.title === 'Test Video E2E');
        if (e2eTest) {
            console.log('✅ SUCCESS: Found "Test Video E2E" in student material list.');
            console.log(JSON.stringify(e2eTest, null, 2));
        } else {
            console.log('❌ FAILURE: "Test Video E2E" not found for student.');
            console.log('Found materials titles:', materials.map(m => m.title));
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testStudentFetch();
