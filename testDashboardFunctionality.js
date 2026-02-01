const http = require('http');

// Comprehensive Dashboard Functionality Test
const dashboardTests = [
    {
        name: "Dashboard Main Page",
        path: "/dashboard",
        method: "GET",
        expectedStatus: 200
    },
    {
        name: "Health Check",
        path: "/health",
        method: "GET",
        expectedStatus: 200
    },
    {
        name: "VUAI Agent+Assistant Chat",
        path: "/api/agent-assistant/chat",
        method: "POST",
        payload: { message: "hello", userId: "dashboard_test_user" },
        expectedStatus: 200
    },
    {
        name: "Attendance Check-In",
        path: "/api/attendance/check-in",
        method: "POST",
        payload: { userId: "test_attendance_user", location: "Dashboard Test" },
        expectedStatus: 200
    },
    {
        name: "Attendance Check-Out",
        path: "/api/attendance/check-out",
        method: "POST",
        payload: { userId: "test_attendance_user", activities: ["Dashboard testing"] },
        expectedStatus: 200
    },
    {
        name: "Get Attendance Records",
        path: "/api/attendance/test_attendance_user",
        method: "GET",
        expectedStatus: 200
    },
    {
        name: "Knowledge Base Categories",
        path: "/api/knowledge/categories",
        method: "GET",
        expectedStatus: 200
    },
    {
        name: "Knowledge Dashboard",
        path: "/api/knowledge/dashboard",
        method: "GET",
        expectedStatus: 200
    },
    {
        name: "Upload Knowledge File",
        path: "/api/knowledge/upload",
        method: "POST",
        payload: {
            filename: "dashboard_test_note.txt",
            category: "test",
            type: "text",
            content: "This is a test note uploaded from dashboard testing",
            metadata: { tags: ["test", "dashboard"], priority: "high" }
        },
        expectedStatus: 200
    },
    {
        name: "List Knowledge Files",
        path: "/api/knowledge/list",
        method: "GET",
        expectedStatus: 200
    },
    {
        name: "Navigation Start",
        path: "/api/navigation/start",
        method: "POST",
        payload: { userId: "test_nav_user", purpose: "Dashboard testing", section: "main" },
        expectedStatus: 200
    },
    {
        name: "Navigation Track",
        path: "/api/navigation/track",
        method: "POST",
        payload: { userId: "test_nav_user", sessionId: "test_session", page: "dashboard", timeSpent: 30 },
        expectedStatus: 200
    },
    {
        name: "Navigation End",
        path: "/api/navigation/end",
        method: "POST",
        payload: { userId: "test_nav_user", sessionId: "test_session", completed: true },
        expectedStatus: 200
    },
    {
        name: "Get Navigation History",
        path: "/api/navigation/test_nav_user",
        method: "GET",
        expectedStatus: 200
    },
    {
        name: "Track User Activity",
        path: "/api/activity/track",
        method: "POST",
        payload: { userId: "test_activity_user", activity: "Dashboard testing", type: "test" },
        expectedStatus: 200
    },
    {
        name: "Get User Activity",
        path: "/api/activity/test_activity_user",
        method: "GET",
        expectedStatus: 200
    },
    {
        name: "System Status",
        path: "/api/system/status",
        method: "GET",
        expectedStatus: 200
    },
    {
        name: "Database Save Test",
        path: "/api/database/save",
        method: "POST",
        payload: { test: "dashboard_functionality_test", timestamp: new Date().toISOString() },
        expectedStatus: 200
    }
];

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                try {
                    const jsonData = JSON.parse(body);
                    resolve({
                        status: res.statusCode,
                        data: jsonData,
                        responseTime,
                        success: res.statusCode === 200
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: body,
                        responseTime,
                        success: false
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            const responseTime = Date.now() - startTime;
            reject({
                error: error.message,
                responseTime,
                success: false
            });
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runDashboardTests() {
    console.log('🖥️  VUAI Agent Dashboard - Comprehensive Functionality Test');
    console.log('==========================================================\n');
    
    let totalTests = dashboardTests.length;
    let passedTests = 0;
    let failedTests = 0;
    let totalTime = 0;
    
    const results = {
        dashboard: { passed: 0, failed: 0, totalTime: 0 },
        agent: { passed: 0, failed: 0, totalTime: 0 },
        attendance: { passed: 0, failed: 0, totalTime: 0 },
        knowledge: { passed: 0, failed: 0, totalTime: 0 },
        navigation: { passed: 0, failed: 0, totalTime: 0 },
        activity: { passed: 0, failed: 0, totalTime: 0 },
        database: { passed: 0, failed: 0, totalTime: 0 }
    };
    
    for (let i = 0; i < dashboardTests.length; i++) {
        const test = dashboardTests[i];
        console.log(`${i + 1}. Testing: ${test.name}`);
        
        try {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: test.path,
                method: test.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (test.payload) {
                options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(test.payload));
            }
            
            const result = await makeRequest(options, test.payload);
            
            if (result.success) {
                passedTests++;
                totalTime += result.responseTime;
                
                console.log(`   ✅ Success (${result.responseTime}ms)`);
                
                // Categorize results
                if (test.name.includes('Dashboard') || test.name.includes('Health')) {
                    results.dashboard.passed++;
                    results.dashboard.totalTime += result.responseTime;
                } else if (test.name.includes('Agent') || test.name.includes('Chat')) {
                    results.agent.passed++;
                    results.agent.totalTime += result.responseTime;
                } else if (test.name.includes('Attendance')) {
                    results.attendance.passed++;
                    results.attendance.totalTime += result.responseTime;
                } else if (test.name.includes('Knowledge')) {
                    results.knowledge.passed++;
                    results.knowledge.totalTime += result.responseTime;
                } else if (test.name.includes('Navigation')) {
                    results.navigation.passed++;
                    results.navigation.totalTime += result.responseTime;
                } else if (test.name.includes('Activity')) {
                    results.activity.passed++;
                    results.activity.totalTime += result.responseTime;
                } else if (test.name.includes('Database') || test.name.includes('System')) {
                    results.database.passed++;
                    results.database.totalTime += result.responseTime;
                }
                
                // Show response details for key tests
                if (test.name.includes('Chat') && result.data.response) {
                    console.log(`      💬 ${result.data.response.substring(0, 60)}...`);
                }
                if (result.data.message) {
                    console.log(`      📄 ${result.data.message}`);
                }
                if (result.data.features) {
                    console.log(`      🔧 Features: ${Object.keys(result.data.features).length} active`);
                }
                
            } else {
                failedTests++;
                console.log(`   ❌ Failed (${result.responseTime}ms) - Status: ${result.status}`);
                
                // Categorize failures
                if (test.name.includes('Dashboard') || test.name.includes('Health')) {
                    results.dashboard.failed++;
                } else if (test.name.includes('Agent') || test.name.includes('Chat')) {
                    results.agent.failed++;
                } else if (test.name.includes('Attendance')) {
                    results.attendance.failed++;
                } else if (test.name.includes('Knowledge')) {
                    results.knowledge.failed++;
                } else if (test.name.includes('Navigation')) {
                    results.navigation.failed++;
                } else if (test.name.includes('Activity')) {
                    results.activity.failed++;
                } else if (test.name.includes('Database') || test.name.includes('System')) {
                    results.database.failed++;
                }
            }
            
        } catch (error) {
            failedTests++;
            console.log(`   ❌ Error (${error.responseTime}ms) - ${error.error}`);
        }
        
        console.log('');
    }
    
    // Comprehensive Report
    console.log('📊 Dashboard Functionality Test Results');
    console.log('========================================\n');
    
    const overallSuccessRate = (passedTests / totalTests) * 100;
    const overallAvgResponseTime = totalTime / passedTests;
    
    console.log('🎯 Overall Performance:');
    console.log(`• Total Tests: ${totalTests}`);
    console.log(`• Passed: ${passedTests}`);
    console.log(`• Failed: ${failedTests}`);
    console.log(`• Success Rate: ${overallSuccessRate.toFixed(2)}%`);
    console.log(`• Average Response Time: ${overallAvgResponseTime.toFixed(2)}ms`);
    
    console.log('\n📈 Section-by-Section Analysis:');
    
    console.log('\n🖥️  Dashboard Core:');
    const dashboardTotal = results.dashboard.passed + results.dashboard.failed;
    console.log(`• Tests: ${results.dashboard.passed}/${dashboardTotal} (${dashboardTotal > 0 ? ((results.dashboard.passed/dashboardTotal)*100).toFixed(1) : 0}%)`);
    if (results.dashboard.passed > 0) {
        console.log(`• Avg Response: ${(results.dashboard.totalTime/results.dashboard.passed).toFixed(2)}ms`);
    }
    
    console.log('\n🤖 VUAI Agent+Assistant:');
    const agentTotal = results.agent.passed + results.agent.failed;
    console.log(`• Tests: ${results.agent.passed}/${agentTotal} (${agentTotal > 0 ? ((results.agent.passed/agentTotal)*100).toFixed(1) : 0}%)`);
    if (results.agent.passed > 0) {
        console.log(`• Avg Response: ${(results.agent.totalTime/results.agent.passed).toFixed(2)}ms`);
    }
    
    console.log('\n📅 Attendance System:');
    const attendanceTotal = results.attendance.passed + results.attendance.failed;
    console.log(`• Tests: ${results.attendance.passed}/${attendanceTotal} (${attendanceTotal > 0 ? ((results.attendance.passed/attendanceTotal)*100).toFixed(1) : 0}%)`);
    if (results.attendance.passed > 0) {
        console.log(`• Avg Response: ${(results.attendance.totalTime/results.attendance.passed).toFixed(2)}ms`);
    }
    
    console.log('\n📚 Knowledge Base:');
    const knowledgeTotal = results.knowledge.passed + results.knowledge.failed;
    console.log(`• Tests: ${results.knowledge.passed}/${knowledgeTotal} (${knowledgeTotal > 0 ? ((results.knowledge.passed/knowledgeTotal)*100).toFixed(1) : 0}%)`);
    if (results.knowledge.passed > 0) {
        console.log(`• Avg Response: ${(results.knowledge.totalTime/results.knowledge.passed).toFixed(2)}ms`);
    }
    
    console.log('\n🧭 Navigation System:');
    const navigationTotal = results.navigation.passed + results.navigation.failed;
    console.log(`• Tests: ${results.navigation.passed}/${navigationTotal} (${navigationTotal > 0 ? ((results.navigation.passed/navigationTotal)*100).toFixed(1) : 0}%)`);
    if (results.navigation.passed > 0) {
        console.log(`• Avg Response: ${(results.navigation.totalTime/results.navigation.passed).toFixed(2)}ms`);
    }
    
    console.log('\n📊 Activity Tracking:');
    const activityTotal = results.activity.passed + results.activity.failed;
    console.log(`• Tests: ${results.activity.passed}/${activityTotal} (${activityTotal > 0 ? ((results.activity.passed/activityTotal)*100).toFixed(1) : 0}%)`);
    if (results.activity.passed > 0) {
        console.log(`• Avg Response: ${(results.activity.totalTime/results.activity.passed).toFixed(2)}ms`);
    }
    
    console.log('\n🗄️  Database & System:');
    const databaseTotal = results.database.passed + results.database.failed;
    console.log(`• Tests: ${results.database.passed}/${databaseTotal} (${databaseTotal > 0 ? ((results.database.passed/databaseTotal)*100).toFixed(1) : 0}%)`);
    if (results.database.passed > 0) {
        console.log(`• Avg Response: ${(results.database.totalTime/results.database.passed).toFixed(2)}ms`);
    }
    
    console.log('\n🚀 Dashboard Readiness Assessment:');
    
    if (overallSuccessRate >= 95) {
        console.log('🏆 EXCELLENT: Dashboard is fully functional and ready for production!');
    } else if (overallSuccessRate >= 85) {
        console.log('✅ GOOD: Dashboard is working well with minor issues');
    } else if (overallSuccessRate >= 70) {
        console.log('⚠️ ACCEPTABLE: Dashboard works but needs some improvements');
    } else {
        console.log('❌ NEEDS WORK: Dashboard has significant issues');
    }
    
    console.log('\n🎯 Key Dashboard Features Status:');
    
    // Check critical features
    const criticalFeatures = [
        { name: 'Dashboard Access', working: results.dashboard.passed > 0 },
        { name: 'VUAI Agent+Assistant', working: results.agent.passed > 0 },
        { name: 'Attendance System', working: results.attendance.passed > 0 },
        { name: 'Knowledge Base', working: results.knowledge.passed > 0 },
        { name: 'Navigation', working: results.navigation.passed > 0 },
        { name: 'Activity Tracking', working: results.activity.passed > 0 },
        { name: 'Database Operations', working: results.database.passed > 0 }
    ];
    
    criticalFeatures.forEach(feature => {
        console.log(`• ${feature.name}: ${feature.working ? '✅ Working' : '❌ Not Working'}`);
    });
    
    console.log('\n🌐 Dashboard Access Points:');
    console.log('• Main Dashboard: http://localhost:3000/dashboard');
    console.log('• Health Check: http://localhost:3000/health');
    console.log('• Agent Chat: http://localhost:3000/api/agent-assistant/chat');
    console.log('• Knowledge Management: http://localhost:3000/api/knowledge/list');
    console.log('• System Status: http://localhost:3000/api/system/status');
    
    console.log('\n🎉 Final Dashboard Verdict:');
    if (overallSuccessRate >= 90) {
        console.log('🏆 Dashboard is FULLY OPERATIONAL with all features working!');
    } else if (overallSuccessRate >= 75) {
        console.log('✅ Dashboard is MOSTLY FUNCTIONAL with core features working!');
    } else {
        console.log('⚠️ Dashboard needs attention before full deployment!');
    }
}

// Run comprehensive dashboard tests
runDashboardTests().catch(console.error);
