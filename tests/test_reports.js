/**
 * Report Generation API Test Suite
 * Tests PDF/Excel export, date filtering, and custom filters
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Configuration
const API_BASE_URL = 'http://localhost:5000';
const REPORT_OUTPUT_DIR = path.join(__dirname, '../test_reports_output');
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_db';

// Test Results
let testsPassed = 0;
let testsFailed = 0;
let testResults = [];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function log(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const icons = {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        warn: '⚠️',
        test: '🧪'
    };
    console.log(`[${timestamp}] ${icons[level]} ${message}`);
}

function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body && method !== 'GET') {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
        }

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', reject);

        if (body && method !== 'GET') {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

function recordTest(name, passed, details = '') {
    if (passed) {
        testsPassed++;
        log(`PASS: ${name}`, 'success');
    } else {
        testsFailed++;
        log(`FAIL: ${name}`, 'error');
        if (details) log(`  → ${details}`, 'error');
    }
    testResults.push({ name, passed, details });
}

async function saveTestFile(filename, data) {
    try {
        if (!fs.existsSync(REPORT_OUTPUT_DIR)) {
            fs.mkdirSync(REPORT_OUTPUT_DIR, { recursive: true });
        }
        fs.writeFileSync(path.join(REPORT_OUTPUT_DIR, filename), data);
        return true;
    } catch (err) {
        log(`Failed to save test file ${filename}: ${err.message}`, 'error');
        return false;
    }
}

// ============================================
// TEST SUITES
// ============================================

/**
 * TEST 1: Report Summary Endpoint
 */
async function testReportSummary() {
    log('\n🧪 Testing Report Summary Endpoint', 'test');

    try {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        const response = await makeRequest(
            `/api/reports/summary?startDate=${startDate}&endDate=${endDate}`
        );

        const passed = response.statusCode === 200;
        recordTest('Summary endpoint returns 200', passed, 
            `Got: ${response.statusCode}`);

        if (passed) {
            const data = JSON.parse(response.body);
            recordTest('Summary has period info', data.period !== undefined);
            recordTest('Summary has record count', data.totalRecords !== undefined);
            recordTest('Summary has attendance percent', data.overallAttendancePercent !== undefined);
            recordTest('Summary has faculty count', data.totalFaculty !== undefined);
            recordTest('Summary has class count', data.totalClasses !== undefined);
            recordTest('Summary has student count', data.totalStudents !== undefined);

            log(`  Summary Stats:`, 'info');
            log(`    • Period: ${data.period || 'N/A'}`, 'info');
            log(`    • Records: ${data.totalRecords || 0}`, 'info');
            log(`    • Attendance: ${data.overallAttendancePercent || 0}%`, 'info');
            log(`    • Faculty: ${data.totalFaculty || 0}`, 'info');
            log(`    • Classes: ${data.totalClasses || 0}`, 'info');
            log(`    • Students: ${data.totalStudents || 0}`, 'info');
        }
    } catch (err) {
        recordTest('Summary endpoint request', false, err.message);
    }
}

/**
 * TEST 2: PDF Report Generation
 */
async function testPDFGeneration() {
    log('\n🧪 Testing PDF Report Generation', 'test');

    try {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        const response = await makeRequest(
            `/api/reports/pdf?startDate=${startDate}&endDate=${endDate}`
        );

        const passed = response.statusCode === 200;
        recordTest('PDF endpoint returns 200', passed, `Got: ${response.statusCode}`);

        if (passed) {
            recordTest('PDF has correct content type', 
                response.headers['content-type']?.includes('pdf'),
                `Got: ${response.headers['content-type']}`);

            recordTest('PDF has content', 
                response.body.length > 0, 
                `Size: ${response.body.length} bytes`);

            recordTest('PDF starts with PDF signature',
                response.body.startsWith('%PDF'),
                `Signature: ${response.body.substring(0, 10)}`);

            // Save test PDF
            const saved = await saveTestFile(`test_report_${Date.now()}.pdf`, response.body);
            recordTest('PDF file saved to disk', saved);

            log(`  PDF generated: ${response.body.length} bytes`, 'info');
        }
    } catch (err) {
        recordTest('PDF generation request', false, err.message);
    }
}

/**
 * TEST 3: Excel Report Generation
 */
async function testExcelGeneration() {
    log('\n🧪 Testing Excel Report Generation', 'test');

    try {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        const response = await makeRequest(
            `/api/reports/excel?startDate=${startDate}&endDate=${endDate}`
        );

        const passed = response.statusCode === 200;
        recordTest('Excel endpoint returns 200', passed, `Got: ${response.statusCode}`);

        if (passed) {
            recordTest('Excel has correct content type',
                response.headers['content-type']?.includes('spreadsheet') || 
                response.headers['content-type']?.includes('excel'),
                `Got: ${response.headers['content-type']}`);

            recordTest('Excel has content',
                response.body.length > 0,
                `Size: ${response.body.length} bytes`);

            // Save test Excel file
            const saved = await saveTestFile(`test_report_${Date.now()}.xlsx`, response.body);
            recordTest('Excel file saved to disk', saved);

            log(`  Excel generated: ${response.body.length} bytes`, 'info');
        }
    } catch (err) {
        recordTest('Excel generation request', false, err.message);
    }
}

/**
 * TEST 4: Custom Date Range Filtering
 */
async function testDateRangeFiltering() {
    log('\n🧪 Testing Date Range Filtering', 'test');

    try {
        // Test 1: Last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const startDate7d = sevenDaysAgo.toISOString().split('T')[0];
        const endDate7d = new Date().toISOString().split('T')[0];

        const response7d = await makeRequest(
            `/api/reports/summary?startDate=${startDate7d}&endDate=${endDate7d}`
        );

        recordTest('7-day range summary loads', response7d.statusCode === 200);

        if (response7d.statusCode === 200) {
            const data7d = JSON.parse(response7d.body);
            log(`  7-day records: ${data7d.totalRecords || 0}`, 'info');
        }

        // Test 2: Last 14 days
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const startDate14d = fourteenDaysAgo.toISOString().split('T')[0];
        const endDate14d = new Date().toISOString().split('T')[0];

        const response14d = await makeRequest(
            `/api/reports/summary?startDate=${startDate14d}&endDate=${endDate14d}`
        );

        recordTest('14-day range summary loads', response14d.statusCode === 200);

        if (response14d.statusCode === 200) {
            const data14d = JSON.parse(response14d.body);
            log(`  14-day records: ${data14d.totalRecords || 0}`, 'info');
        }

        // Test 3: Last 60 days
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const startDate60d = sixtyDaysAgo.toISOString().split('T')[0];
        const endDate60d = new Date().toISOString().split('T')[0];

        const response60d = await makeRequest(
            `/api/reports/summary?startDate=${startDate60d}&endDate=${endDate60d}`
        );

        recordTest('60-day range summary loads', response60d.statusCode === 200);

        if (response60d.statusCode === 200) {
            const data60d = JSON.parse(response60d.body);
            log(`  60-day records: ${data60d.totalRecords || 0}`, 'info');
        }
    } catch (err) {
        recordTest('Date range filtering', false, err.message);
    }
}

/**
 * TEST 5: Custom Filters (Department/Class)
 */
async function testCustomFilters() {
    log('\n🧪 Testing Custom Filters', 'test');

    try {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        // Test 1: Filter by department
        const deptFilter = {
            startDate,
            endDate,
            department: 'CSE'
        };

        try {
            const responseDept = await makeRequest(
                '/api/reports/with-filters',
                'POST',
                deptFilter
            );

            recordTest('Department filter loads', responseDept.statusCode === 200);

            if (responseDept.statusCode === 200) {
                const data = JSON.parse(responseDept.body);
                log(`  CSE records: ${data.totalRecords || 0}`, 'info');
                recordTest('Department filter has data', data.totalRecords !== undefined);
            }
        } catch (err) {
            recordTest('Department filter request', false, err.message);
        }

        // Test 2: Filter by class
        const classFilter = {
            startDate,
            endDate,
            className: '1A'
        };

        try {
            const responseClass = await makeRequest(
                '/api/reports/with-filters',
                'POST',
                classFilter
            );

            recordTest('Class filter loads', responseClass.statusCode === 200);

            if (responseClass.statusCode === 200) {
                const data = JSON.parse(responseClass.body);
                log(`  Class 1A records: ${data.totalRecords || 0}`, 'info');
                recordTest('Class filter has data', data.totalRecords !== undefined);
            }
        } catch (err) {
            recordTest('Class filter request', false, err.message);
        }

        // Test 3: Combined filter
        const combinedFilter = {
            startDate,
            endDate,
            department: 'CSE',
            className: '1A'
        };

        try {
            const responseCombined = await makeRequest(
                '/api/reports/with-filters',
                'POST',
                combinedFilter
            );

            recordTest('Combined filter loads', responseCombined.statusCode === 200);

            if (responseCombined.statusCode === 200) {
                const data = JSON.parse(responseCombined.body);
                log(`  CSE 1A records: ${data.totalRecords || 0}`, 'info');
            }
        } catch (err) {
            recordTest('Combined filter request', false, err.message);
        }
    } catch (err) {
        recordTest('Custom filters', false, err.message);
    }
}

/**
 * TEST 6: Error Handling
 */
async function testErrorHandling() {
    log('\n🧪 Testing Error Handling', 'test');

    try {
        // Test 1: Invalid date format
        const invalidDateResponse = await makeRequest(
            '/api/reports/summary?startDate=invalid&endDate=invalid'
        );
        
        recordTest('Invalid dates handled gracefully',
            invalidDateResponse.statusCode === 200 || invalidDateResponse.statusCode === 400);

        // Test 2: Missing parameters
        const missingParamResponse = await makeRequest('/api/reports/summary');
        recordTest('Missing parameters handled',
            missingParamResponse.statusCode === 200 || missingParamResponse.statusCode === 400);

        // Test 3: Invalid POST body
        const invalidBodyResponse = await makeRequest(
            '/api/reports/with-filters',
            'POST',
            { invalidField: 'test' }
        );

        recordTest('Invalid POST body handled',
            invalidBodyResponse.statusCode === 200 || invalidBodyResponse.statusCode === 400);

    } catch (err) {
        recordTest('Error handling', false, err.message);
    }
}

/**
 * TEST 7: Response Headers Validation
 */
async function testResponseHeaders() {
    log('\n🧪 Testing Response Headers', 'test');

    try {
        // Test PDF headers
        const pdfResponse = await makeRequest('/api/reports/pdf');
        recordTest('PDF has download header',
            pdfResponse.headers['content-disposition']?.includes('attachment') ||
            pdfResponse.headers['content-disposition']?.includes('inline'));

        // Test Excel headers
        const excelResponse = await makeRequest('/api/reports/excel');
        recordTest('Excel has download header',
            excelResponse.headers['content-disposition']?.includes('attachment'));

    } catch (err) {
        recordTest('Response headers validation', false, err.message);
    }
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
    log('\n═══════════════════════════════════════════════════════════', 'test');
    log('                  REPORT GENERATION TEST SUITE                ', 'test');
    log('═══════════════════════════════════════════════════════════\n', 'test');

    // Check if server is running
    try {
        await makeRequest('/api/test');
    } catch (err) {
        log('\n❌ FATAL: Backend server is not running on http://localhost:5000', 'error');
        log('   Please start the backend with: npm run dev:backend', 'warn');
        process.exit(1);
    }

    // Run all test suites
    await testReportSummary();
    await testPDFGeneration();
    await testExcelGeneration();
    await testDateRangeFiltering();
    await testCustomFilters();
    await testErrorHandling();
    await testResponseHeaders();

    // Print summary
    log('\n═══════════════════════════════════════════════════════════', 'test');
    log('                      TEST SUMMARY                             ', 'test');
    log('═══════════════════════════════════════════════════════════\n', 'test');

    const totalTests = testsPassed + testsFailed;
    const percentage = totalTests > 0 ? Math.round((testsPassed / totalTests) * 100) : 0;

    log(`Total Tests: ${totalTests}`, 'info');
    log(`Passed: ${testsPassed} ✅`, 'success');
    log(`Failed: ${testsFailed} ❌`, 'error');
    log(`Success Rate: ${percentage}%\n`, percentage === 100 ? 'success' : 'warn');

    // Test report details
    log('═══════════════════════════════════════════════════════════', 'test');
    log('                    DETAILED RESULTS                         ', 'test');
    log('═══════════════════════════════════════════════════════════\n', 'test');

    testResults.forEach((result, index) => {
        const status = result.passed ? '✅' : '❌';
        log(`${index + 1}. ${status} ${result.name}`, result.passed ? 'success' : 'error');
        if (result.details) {
            log(`   Details: ${result.details}`, 'info');
        }
    });

    log('\n═══════════════════════════════════════════════════════════\n', 'test');

    // Report file location
    if (fs.existsSync(REPORT_OUTPUT_DIR)) {
        const files = fs.readdirSync(REPORT_OUTPUT_DIR);
        if (files.length > 0) {
            log(`Test reports saved to: ${REPORT_OUTPUT_DIR}`, 'info');
            files.forEach(file => {
                const fullPath = path.join(REPORT_OUTPUT_DIR, file);
                const stats = fs.statSync(fullPath);
                log(`  • ${file} (${Math.round(stats.size / 1024)}KB)`, 'info');
            });
        }
    }

    // Exit with appropriate code
    process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
    log(`\n❌ Fatal error: ${err.message}`, 'error');
    console.error(err);
    process.exit(1);
});
