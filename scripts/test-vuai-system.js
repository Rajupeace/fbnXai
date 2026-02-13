#!/usr/bin/env node

/**
 * VuAI Agent System - Verification Test Script
 * Tests all three agents and their endpoints
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const tests = [];
let passed = 0;
let failed = 0;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Make HTTP request
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Test helper
 */
async function test(name, fn) {
  try {
    console.log(`\n${colors.cyan}Testing: ${name}${colors.reset}`);
    const result = await fn();
    if (result.success) {
      console.log(`${colors.green}✅ PASS${colors.reset} - ${result.message}`);
      passed++;
    } else {
      console.log(`${colors.red}❌ FAIL${colors.reset} - ${result.message}`);
      failed++;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR${colors.reset} - ${error.message}`);
    failed++;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}VuAI Agent System - Verification Tests${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}\n`);

  // Test 1: Health check
  await test('Fast Engine Health', async () => {
    const res = await makeRequest('GET', '/api/fast/health');
    if (res.status === 200 && res.data.status === 'healthy') {
      return { success: true, message: 'Fast engine is healthy' };
    }
    return { success: false, message: `Status code: ${res.status}` };
  });

  // Test 2: Chat Health
  await test('Chat Service Health', async () => {
    const res = await makeRequest('GET', '/api/chat/health');
    if (res.status === 200 && res.data.status === 'healthy') {
      return { success: true, message: 'Chat service is healthy' };
    }
    return { success: false, message: `Status code: ${res.status}` };
  });

  // Test 3: Student Agent Info
  await test('Student Agent Status', async () => {
    const res = await makeRequest('GET', '/api/chat/agent-info/student');
    if (res.status === 200 && res.data.agent === 'student') {
      return { success: true, message: `Student agent ready with ${res.data.knowledge} knowledge categories` };
    }
    return { success: false, message: `Status code: ${res.status}` };
  });

  // Test 4: Faculty Agent Info
  await test('Faculty Agent Status', async () => {
    const res = await makeRequest('GET', '/api/chat/agent-info/faculty');
    if (res.status === 200 && res.data.agent === 'faculty') {
      return { success: true, message: `Faculty agent ready with ${res.data.knowledge} knowledge categories` };
    }
    return { success: false, message: `Status code: ${res.status}` };
  });

  // Test 5: Admin Agent Info
  await test('Admin Agent Status', async () => {
    const res = await makeRequest('GET', '/api/chat/agent-info/admin');
    if (res.status === 200 && res.data.agent === 'admin') {
      return { success: true, message: `Admin agent ready with ${res.data.knowledge} knowledge categories` };
    }
    return { success: false, message: `Status code: ${res.status}` };
  });

  // Test 6: Quick Answer - Student
  await test('Quick Answer - Student Dashboard', async () => {
    const res = await makeRequest('POST', '/api/fast/quick-answer', {
      message: 'What is my attendance?',
      role: 'student',
      context: { name: 'Test Student', year: '2', branch: 'cse' }
    });
    if (res.status === 200 && res.data.response) {
      return { success: true, message: `Response in ${res.data.responseTime}ms` };
    }
    return { success: false, message: `Status code: ${res.status}` };
  });

  // Test 7: Quick Answer - Faculty
  await test('Quick Answer - Faculty Dashboard', async () => {
    const res = await makeRequest('POST', '/api/fast/quick-answer', {
      message: 'Show me my students',
      role: 'faculty',
      context: { name: 'Prof. Test' }
    });
    if (res.status === 200 && res.data.response) {
      return { success: true, message: `Response in ${res.data.responseTime}ms` };
    }
    return { success: false, message: `Status code: ${res.status}` };
  });

  // Test 8: Quick Answer - Admin
  await test('Quick Answer - Admin Dashboard', async () => {
    const res = await makeRequest('POST', '/api/fast/quick-answer', {
      message: 'System status',
      role: 'admin',
      context: {}
    });
    if (res.status === 200 && res.data.response) {
      return { success: true, message: `Response in ${res.data.responseTime}ms` };
    }
    return { success: false, message: `Status code: ${res.status}` };
  });

  // Test 9: Chat Endpoint
  await test('Main Chat Endpoint', async () => {
    const res = await makeRequest('POST', '/api/chat', {
      message: 'Hello, how can you help me?',
      role: 'student',
      userId: 'test-user-123'
    });
    if (res.status === 200 && res.data.response) {
      return { success: true, message: `Response in ${res.data.responseTime}ms` };
    }
    return { success: false, message: `Status code: ${res.status}` };
  });

  // Test 10: Batch Processing
  await test('Batch Message Processing', async () => {
    const res = await makeRequest('POST', '/api/chat/batch', {
      messages: ['Hello', 'How are you?', 'Tell me something'],
      role: 'student'
    });
    if (res.status === 200 && res.data.responses && res.data.responses.length === 3) {
      return { success: true, message: `Processed 3 messages in ${res.data.totalTime}ms (avg: ${Math.round(res.data.avgTime)}ms)` };
    }
    return { success: false, message: `Status code: ${res.status}` };
  });

  // Test 11: Cache Operations
  await test('Cache Clear', async () => {
    const res = await makeRequest('POST', '/api/fast/clear-cache');
    if (res.status === 200) {
      return { success: true, message: 'Cache cleared successfully' };
    }
    return { success: false, message: `Status code: ${res.status}` };
  });

  // Test 12: Predictive Responses
  await test('Predictive Responses', async () => {
    const res = await makeRequest('POST', '/api/fast/predictive', {
      partialMessage: 'what',
      role: 'student'
    });
    if (res.status === 200 && res.data.predictions) {
      return { success: true, message: `Generated ${res.data.predictions.length} predictions` };
    }
    return { success: false, message: `Status code: ${res.status}` };
  });

  // Summary
  console.log(`\n${colors.blue}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`${colors.cyan}📊 Total: ${passed + failed}${colors.reset}`);

  if (failed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed! VuAI System is ready to use.${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Please check the errors above.${colors.reset}\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal Error:${colors.reset}`, error.message);
  process.exit(1);
});
