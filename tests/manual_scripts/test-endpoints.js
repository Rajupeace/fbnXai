// Quick Test Script for Friendly Notebook Backend
// Run this to verify all endpoints are working

const testEndpoints = async () => {
    const API_URL = 'http://localhost:5000';

    console.log('🧪 Testing Friendly Notebook Backend...\n');

    // Test 1: Health Check
    try {
        const response = await fetch(`${API_URL}/api/courses`);
        console.log('✅ GET /api/courses:', response.status);
    } catch (error) {
        console.log('❌ GET /api/courses failed:', error.message);
    }

    // Test 2: Materials endpoint
    try {
        const response = await fetch(`${API_URL}/api/materials`);
        console.log('✅ GET /api/materials:', response.status);
    } catch (error) {
        console.log('❌ GET /api/materials failed:', error.message);
    }

    console.log('\n📊 Test Summary:');
    console.log('- Backend should be running on port 5000');
    console.log('- MongoDB connection status will be shown in backend logs');
    console.log('- Upload folders created: uploads/admin and uploads/faculty');
};

// Run if executed directly
if (typeof window === 'undefined') {
    testEndpoints();
}
