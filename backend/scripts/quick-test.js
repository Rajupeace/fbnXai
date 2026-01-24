#!/usr/bin/env node

const http = require('http');

// Simple test for linkage routes
const tests = [
  { path: '/api/health', name: 'Health Check' },
  { path: '/api/links/sync-status', name: 'Link Routes - Sync Status' },
  { path: '/api/admin/dashboard/dashboard-status', name: 'Admin Routes - Dashboard Status' }
];

let tested = 0;
let passed = 0;

function testRoute(path, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5000${path}`, { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✓ ${name} (${res.statusCode})`);
        passed++;
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`✗ ${name} - ${err.message}`);
      resolve();
    });

    req.on('timeout', () => {
      console.log(`✗ ${name} - Timeout`);
      req.destroy();
      resolve();
    });
  });
}

async function runTests() {
  console.log('\n🧪 Quick Route Test\n');
  
  for (const test of tests) {
    tested++;
    await testRoute(test.path, test.name);
  }

  console.log(`\n Result: ${passed}/${tested} tests passed\n`);
  process.exit(passed === tested ? 0 : 1);
}

runTests();
