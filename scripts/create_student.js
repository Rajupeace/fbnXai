const axios = require('axios');

async function createStudent() {
  try {
    const response = await axios.post('http://localhost:5000/api/students/register', {
      studentName: 'Test Student',
      sid: 'student001',
      email: 'test@example.com',
      year: 1,
      section: 'A',
      branch: 'CSE',
      password: 'password123'
    });
    console.log('Student created:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

createStudent();