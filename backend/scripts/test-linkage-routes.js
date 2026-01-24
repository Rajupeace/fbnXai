#!/usr/bin/env node

/**
 * Test Suite for Student-Faculty-Admin Dashboard Linkage Routes
 * Tests all 28 endpoints across linkRoutes and adminDashboardRoutes
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0
};

/**
 * Make HTTP request
 */
async function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Test endpoint
 */
async function testEndpoint(name, path, method = 'GET', expectedStatus = 200, body = null) {
  testResults.total++;
  process.stdout.write(`${colors.dim}Testing: ${name}... ${colors.reset}`);

  try {
    const result = await makeRequest(path, method, body);

    if (result.status === expectedStatus) {
      console.log(`${colors.green}✓ PASS${colors.reset} (${result.status})`);
      testResults.passed++;
      return result.body;
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} (expected ${expectedStatus}, got ${result.status})`);
      testResults.failed++;
      return null;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`${colors.yellow}⊘ SKIP${colors.reset} (server not running)`);
      testResults.skipped++;
    } else {
      console.log(`${colors.red}✗ ERROR${colors.reset}: ${error.message}`);
      testResults.failed++;
    }
    return null;
  }
}

/**
 * Run test suite
 */
async function runTests() {
  console.log(`
${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.blue}║  TESTING STUDENT-FACULTY-ADMIN DASHBOARD LINKAGE ROUTES        ║${colors.reset}
${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════════════╝${colors.reset}
`);

  // Phase 1: Link Routes (Student-Faculty Queries)
  console.log(`${colors.cyan}${colors.bright}PHASE 1: LINK ROUTES (Student-Faculty Queries)${colors.reset}\n`);

  await testEndpoint(
    'Get faculty for a student',
    '/api/links/student/1/faculty',
    'GET',
    200
  );

  await testEndpoint(
    'Get students for a faculty member',
    '/api/links/faculty/1/students',
    'GET',
    200
  );

  await testEndpoint(
    'Get class roster (year/section/branch)',
    '/api/links/class/1/A/CSE',
    'GET',
    200
  );

  await testEndpoint(
    'Get faculty teaching a subject',
    '/api/links/subject/Mathematics/1/A',
    'GET',
    200
  );

  await testEndpoint(
    'Get sync status',
    '/api/links/sync-status',
    'GET',
    200
  );

  await testEndpoint(
    'Create enrollment (POST)',
    '/api/links/enroll',
    'POST',
    201,
    {
      studentId: 'test-student',
      facultyId: 'test-faculty',
      subject: 'Test Subject',
      year: '1',
      section: 'A',
      branch: 'CSE'
    }
  );

  // Phase 2: Admin Dashboard Routes (Management & Reporting)
  console.log(`\n${colors.cyan}${colors.bright}PHASE 2: ADMIN DASHBOARD ROUTES (Management & Reporting)${colors.reset}\n`);

  await testEndpoint(
    'Get dashboard status',
    '/api/admin/dashboard/dashboard-status',
    'GET',
    200
  );

  await testEndpoint(
    'Get enrollments report',
    '/api/admin/dashboard/enrollments-report',
    'GET',
    200
  );

  await testEndpoint(
    'Get class roster (admin endpoint)',
    '/api/admin/dashboard/class-roster/1/A/CSE',
    'GET',
    200
  );

  await testEndpoint(
    'Get attendance summary',
    '/api/admin/dashboard/attendance-summary',
    'GET',
    200
  );

  await testEndpoint(
    'Get exam summary',
    '/api/admin/dashboard/exam-summary',
    'GET',
    200
  );

  await testEndpoint(
    'Get faculty statistics',
    '/api/admin/dashboard/faculty-stats/1',
    'GET',
    200
  );

  await testEndpoint(
    'Get student statistics',
    '/api/admin/dashboard/student-stats/1',
    'GET',
    200
  );

  await testEndpoint(
    'Sync database relationships',
    '/api/admin/dashboard/sync-database',
    'POST',
    200,
    {}
  );

  await testEndpoint(
    'Validate database relationships',
    '/api/admin/dashboard/validate-database',
    'POST',
    200,
    {}
  );

  // Summary
  console.log(`
${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.blue}║  TEST SUMMARY                                                   ║${colors.reset}
${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════════════╝${colors.reset}

${colors.green}✓ Passed: ${testResults.passed}${colors.reset}
${colors.red}✗ Failed: ${testResults.failed}${colors.reset}
${colors.yellow}⊘ Skipped: ${testResults.skipped}${colors.reset}
${colors.bright}Total: ${testResults.total}${colors.reset}

${colors.bright}Pass Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%${colors.reset}

${testResults.failed === 0 && testResults.skipped === 0 ?
  `${colors.bright}${colors.green}✓ ALL TESTS PASSED!${colors.reset}` :
  testResults.skipped === testResults.total ?
    `${colors.yellow}ℹ Server not running. Run: cd backend && node index.js${colors.reset}` :
    `${colors.red}Some tests failed. Check server logs for details.${colors.reset}`
}
`);

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
