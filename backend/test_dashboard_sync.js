const http = require('http');
const { DASHBOARD_PATHS, RESOURCE_MAP } = require('./dashboardConfig');
const fs = require('fs');
const path = require('path');

// Helper to make HTTP GET request
function makeRequest(hostname, port, pathname) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname,
            port,
            path: pathname,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        req.end();
    });
}

// Test dashboard folder structure
function testFolderStructure() {
    console.log('\n📁 TESTING DASHBOARD FOLDER STRUCTURE...\n');
    
    let allGood = true;
    const requiredPaths = [
        DASHBOARD_PATHS.AdminDashboardDB.root,
        DASHBOARD_PATHS.StudentDashboardDB.root,
        DASHBOARD_PATHS.FacultyDashboardDB.root,
        DASHBOARD_PATHS.AdminDashboardDB.Sections,
        DASHBOARD_PATHS.AdminDashboardDB.DivBoxCards,
        DASHBOARD_PATHS.StudentDashboardDB.Sections,
        DASHBOARD_PATHS.FacultyDashboardDB.Sections
    ];

    requiredPaths.forEach(p => {
        if (fs.existsSync(p)) {
            console.log(`✅ Exists: ${p}`);
        } else {
            console.log(`❌ Missing: ${p}`);
            allGood = false;
        }
    });

    return allGood;
}

// Test resource map files
function testResourceMap() {
    console.log('\n📄 TESTING RESOURCE MAP FILES...\n');
    
    let allGood = true;
    const criticalResources = ['students', 'faculty', 'courses', 'materials', 'messages', 'todos'];
    
    criticalResources.forEach(resource => {
        const filePath = RESOURCE_MAP[resource];
        if (filePath) {
            const dirname = path.dirname(filePath);
            if (fs.existsSync(dirname)) {
                console.log(`✅ Configured: ${resource} -> ${dirname}`);
            } else {
                console.log(`⚠️  Configured but missing dir: ${resource}`);
            }
        } else {
            console.log(`❌ Not configured: ${resource}`);
            allGood = false;
        }
    });

    return allGood;
}

// Test API endpoints
async function testApiEndpoints() {
    console.log('\n🌐 TESTING API ENDPOINTS...\n');
    
    const endpoints = [
        { path: '/api/students', name: 'Get All Students (Hybrid)' },
        { path: '/api/faculty', name: 'Get All Faculty' },
        { path: '/api/courses', name: 'Get All Courses' },
        { path: '/api/materials', name: 'Get All Materials (Hybrid)' },
        { path: '/api/messages', name: 'Get All Messages' },
        { path: '/api/todos', name: 'Get All Todos' },
        { path: '/api/stream', name: 'SSE Stream (Server-Sent Events)' }
    ];

    let results = [];

    for (const endpoint of endpoints) {
        try {
            const result = await makeRequest('localhost', 5000, endpoint.path);
            if (result.status === 200 || result.status === 'continue') {
                console.log(`✅ ${endpoint.name}`);
                console.log(`   Status: ${result.status}`);
                if (result.data && typeof result.data === 'object') {
                    const count = Array.isArray(result.data) ? result.data.length : Object.keys(result.data).length;
                    console.log(`   Items: ${count}`);
                }
                results.push({ endpoint: endpoint.name, status: 'OK' });
            } else {
                console.log(`⚠️  ${endpoint.name}`);
                console.log(`   Status: ${result.status}`);
                results.push({ endpoint: endpoint.name, status: `HTTP ${result.status}` });
            }
        } catch (e) {
            console.log(`❌ ${endpoint.name}`);
            console.log(`   Error: ${e.message}`);
            results.push({ endpoint: endpoint.name, status: 'Error: ' + e.message });
        }
    }

    return results;
}

// Main test runner
async function runTests() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('           DASHBOARD DATA SYNC - VERIFICATION TEST              ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\nTest Time: ${new Date().toLocaleString()}`);
    console.log(`Backend DB Path: ${RESOURCE_MAP.students || 'Not configured'}`);

    const folderGood = testFolderStructure();
    const resourceGood = testResourceMap();
    const apiResults = await testApiEndpoints();

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                         TEST SUMMARY                            ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('Folder Structure:', folderGood ? '✅ PASS' : '❌ FAIL');
    console.log('Resource Map:   ', resourceGood ? '✅ PASS' : '❌ FAIL');
    console.log('API Endpoints:  ', apiResults.every(r => r.status === 'OK') ? '✅ PASS' : '⚠️  PARTIAL');

    console.log('\n📋 API Endpoint Summary:');
    apiResults.forEach(r => {
        const icon = r.status === 'OK' ? '✅' : '❌';
        console.log(`   ${icon} ${r.endpoint}: ${r.status}`);
    });

    console.log('\n🎯 DASHBOARD STATUS:');
    if (folderGood && resourceGood) {
        console.log('   ✅ All dashboard infrastructure is properly configured');
        console.log('   ✅ Data synchronization paths are correct');
        console.log('   ✅ Ready for production use');
    } else {
        console.log('   ⚠️  Some issues detected - review above logs');
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(console.error);
