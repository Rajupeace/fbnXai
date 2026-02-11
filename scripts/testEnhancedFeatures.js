const http = require('http');

// Test the enhanced VUAI agent features
const testCases = [
    {
        name: 'Health Check',
        method: 'GET',
        path: '/health',
        payload: null
    },
    {
        name: 'Agent+Assistant Chat - Help',
        method: 'POST',
        path: '/api/agent-assistant/chat',
        payload: { 
            message: 'help', 
            userId: 'test_user_123',
            context: 'dashboard'
        }
    },
    {
        name: 'Agent+Assistant Chat - Attendance',
        method: 'POST',
        path: '/api/agent-assistant/chat',
        payload: { 
            message: 'check me in', 
            userId: 'test_user_123'
        }
    },
    {
        name: 'Agent+Assistant Chat - Navigation',
        method: 'POST',
        path: '/api/agent-assistant/chat',
        payload: { 
            message: 'navigate to machine learning', 
            userId: 'test_user_123'
        }
    },
    {
        name: 'Agent+Assistant Chat - Knowledge',
        method: 'POST',
        path: '/api/agent-assistant/chat',
        payload: { 
            message: 'teach me about circuits', 
            userId: 'test_user_123'
        }
    },
    {
        name: 'Agent+Assistant Chat - Dashboard',
        method: 'POST',
        path: '/api/agent-assistant/chat',
        payload: { 
            message: 'show my progress', 
            userId: 'test_user_123'
        }
    },
    {
        name: 'Attendance Check-In',
        method: 'POST',
        path: '/api/attendance/check-in',
        payload: { 
            userId: 'test_user_123',
            location: 'Test Location',
            notes: 'Test check-in'
        }
    },
    {
        name: 'Knowledge Categories',
        method: 'GET',
        path: '/api/knowledge/categories',
        payload: null
    },
    {
        name: 'Knowledge Dashboard',
        method: 'GET',
        path: '/api/knowledge/dashboard',
        payload: null
    },
    {
        name: 'User Activity',
        method: 'GET',
        path: '/api/activity/test_user_123',
        payload: null
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

async function runEnhancedTests() {
    console.log('🚀 Enhanced VUAI Agent+Assistant Test Suite');
    console.log('==========================================\n');
    
    const results = {
        totalTests: testCases.length,
        passedTests: 0,
        failedTests: 0,
        totalResponseTime: 0,
        details: []
    };
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`${i + 1}. Testing: ${testCase.name}`);
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: testCase.path,
            method: testCase.method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (testCase.payload) {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(testCase.payload));
        }
        
        try {
            const result = await makeRequest(options, testCase.payload);
            const testPassed = result.success;
            
            console.log(`   ${testPassed ? '✅' : '❌'} Status: ${result.status} (${result.responseTime}ms)`);
            
            if (result.success && result.data) {
                if (result.data.response) {
                    console.log(`   💬 Response: ${result.data.response.substring(0, 100)}...`);
                } else if (result.data.message) {
                    console.log(`   📄 Message: ${result.data.message}`);
                } else if (result.data.success) {
                    console.log(`   ✅ Success: ${result.data.success}`);
                }
            }
            
            results.details.push({
                name: testCase.name,
                status: result.status,
                responseTime: result.responseTime,
                success: testPassed,
                data: result.data
            });
            
            results.totalResponseTime += result.responseTime;
            if (testPassed) {
                results.passedTests++;
            } else {
                results.failedTests++;
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.error} (${error.responseTime}ms)`);
            
            results.details.push({
                name: testCase.name,
                status: 'ERROR',
                responseTime: error.responseTime,
                success: false,
                error: error.error
            });
            
            results.totalResponseTime += error.responseTime;
            results.failedTests++;
        }
        
        console.log('');
    }
    
    // Generate comprehensive report
    console.log('📊 Enhanced Test Results');
    console.log('========================\n');
    
    const overallSuccessRate = (results.passedTests / results.totalTests) * 100;
    const overallAvgResponseTime = results.totalResponseTime / results.totalTests;
    
    console.log('🎯 Overall Performance:');
    console.log(`• Total Tests: ${results.totalTests}`);
    console.log(`• Passed: ${results.passedTests}`);
    console.log(`• Failed: ${results.failedTests}`);
    console.log(`• Success Rate: ${overallSuccessRate.toFixed(2)}%`);
    console.log(`• Average Response Time: ${overallAvgResponseTime.toFixed(2)}ms\n`);
    
    // Feature-specific results
    console.log('🔧 Feature Status:');
    const agentAssistantTests = results.details.filter(t => t.name.includes('Agent+Assistant'));
    const attendanceTests = results.details.filter(t => t.name.includes('Attendance'));
    const knowledgeTests = results.details.filter(t => t.name.includes('Knowledge'));
    const activityTests = results.details.filter(t => t.name.includes('Activity'));
    
    console.log(`• Agent+Assistant: ${agentAssistantTests.filter(t => t.success).length}/${agentAssistantTests.length} working`);
    console.log(`• Attendance System: ${attendanceTests.filter(t => t.success).length}/${attendanceTests.length} working`);
    console.log(`• Knowledge Base: ${knowledgeTests.filter(t => t.success).length}/${knowledgeTests.length} working`);
    console.log(`• Activity Tracking: ${activityTests.filter(t => t.success).length}/${activityTests.length} working`);
    
    console.log('\n🌐 Dashboard Access:');
    console.log('• Web Dashboard: http://localhost:3000/dashboard');
    console.log('• Health Check: http://localhost:3000/health');
    console.log('• Agent Chat: http://localhost:3000/api/agent-assistant/chat');
    
    console.log('\n💡 Next Steps:');
    if (overallSuccessRate >= 90) {
        console.log('✅ System is ready! Access the dashboard to explore all features.');
        console.log('✅ Try the attendance system, navigation, and knowledge base.');
        console.log('✅ Chat with the enhanced Agent+Assistant.');
    } else {
        console.log('⚠️  Some features need attention. Check the failed tests above.');
    }
    
    console.log('\n🎉 Enhanced VUAI Agent+Assistant Test Completed!');
    console.log('==============================================\n');
    
    return results;
}

// Run the enhanced test suite
runEnhancedTests().catch(console.error);
