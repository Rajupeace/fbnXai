const http = require('http');

// Comprehensive VUAI Agent Health Check
const healthChecks = [
    {
        name: 'Basic Health',
        path: '/health',
        method: 'GET',
        expectedStatus: 200
    },
    {
        name: 'Agent Assistant Chat',
        path: '/api/agent-assistant/chat',
        method: 'POST',
        payload: { message: 'hello', userId: 'health_check_user' },
        expectedStatus: 200
    },
    {
        name: 'Knowledge Categories',
        path: '/api/knowledge/categories',
        method: 'GET',
        expectedStatus: 200
    },
    {
        name: 'Dashboard Access',
        path: '/dashboard',
        method: 'GET',
        expectedStatus: 200
    }
];

const performanceTests = [
    {
        name: 'Fast Response Test - Simple Query',
        path: '/api/agent-assistant/chat',
        method: 'POST',
        payload: { message: 'help', userId: 'perf_test' },
        maxResponseTime: 50
    },
    {
        name: 'Fast Response Test - Complex Query',
        path: '/api/agent-assistant/chat',
        method: 'POST',
        payload: { message: 'navigate to machine learning and explain neural networks', userId: 'perf_test' },
        maxResponseTime: 100
    },
    {
        name: 'Fast Response Test - Health Check',
        path: '/health',
        method: 'GET',
        maxResponseTime: 30
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

async function runHealthCheck() {
    console.log('🔍 VUAI Agent Comprehensive Health Check');
    console.log('==========================================\n');
    
    const results = {
        healthChecks: { passed: 0, failed: 0, details: [] },
        performanceTests: { passed: 0, failed: 0, details: [] },
        overall: { status: 'UNKNOWN', issues: [] }
    };
    
    // Run health checks
    console.log('📋 System Health Checks:');
    for (const check of healthChecks) {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: check.path,
            method: check.method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (check.payload) {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(check.payload));
        }
        
        try {
            const result = await makeRequest(options, check.payload);
            const passed = result.status === check.expectedStatus;
            
            console.log(`   ${passed ? '✅' : '❌'} ${check.name}: ${result.status} (${result.responseTime}ms)`);
            
            results.healthChecks.details.push({
                name: check.name,
                status: result.status,
                responseTime: result.responseTime,
                success: passed
            });
            
            if (passed) {
                results.healthChecks.passed++;
            } else {
                results.healthChecks.failed++;
                results.overall.issues.push(`${check.name} returned ${result.status}`);
            }
        } catch (error) {
            console.log(`   ❌ ${check.name}: Failed (${error.responseTime}ms) - ${error.error}`);
            
            results.healthChecks.details.push({
                name: check.name,
                status: 'ERROR',
                responseTime: error.responseTime,
                success: false,
                error: error.error
            });
            
            results.healthChecks.failed++;
            results.overall.issues.push(`${check.name} failed: ${error.error}`);
        }
    }
    
    console.log('\n⚡ Performance Tests:');
    for (const test of performanceTests) {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: test.path,
            method: test.method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (test.payload) {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(test.payload));
        }
        
        try {
            const result = await makeRequest(options, test.payload);
            const passed = result.success && result.responseTime <= test.maxResponseTime;
            
            console.log(`   ${passed ? '✅' : '❌'} ${test.name}: ${result.responseTime}ms (max: ${test.maxResponseTime}ms)`);
            
            results.performanceTests.details.push({
                name: test.name,
                responseTime: result.responseTime,
                maxTime: test.maxResponseTime,
                success: passed
            });
            
            if (passed) {
                results.performanceTests.passed++;
            } else {
                results.performanceTests.failed++;
                const issue = result.responseTime > test.maxResponseTime 
                    ? `${test.name} too slow: ${result.responseTime}ms > ${test.maxResponseTime}ms`
                    : `${test.name} failed`;
                results.overall.issues.push(issue);
            }
        } catch (error) {
            console.log(`   ❌ ${test.name}: Failed (${error.responseTime}ms) - ${error.error}`);
            
            results.performanceTests.details.push({
                name: test.name,
                responseTime: error.responseTime,
                maxTime: test.maxResponseTime,
                success: false,
                error: error.error
            });
            
            results.performanceTests.failed++;
            results.overall.issues.push(`${test.name} failed: ${error.error}`);
        }
    }
    
    // Determine overall status
    const totalChecks = healthChecks.length + performanceTests.length;
    const totalPassed = results.healthChecks.passed + results.performanceTests.passed;
    const successRate = (totalPassed / totalChecks) * 100;
    
    if (successRate >= 90) {
        results.overall.status = 'EXCELLENT';
    } else if (successRate >= 75) {
        results.overall.status = 'GOOD';
    } else if (successRate >= 50) {
        results.overall.status = 'NEEDS_ATTENTION';
    } else {
        results.overall.status = 'CRITICAL';
    }
    
    // Generate report
    console.log('\n📊 Health Check Results:');
    console.log('========================');
    console.log(`Overall Status: ${results.overall.status}`);
    console.log(`Success Rate: ${successRate.toFixed(1)}% (${totalPassed}/${totalChecks})`);
    console.log(`Health Checks: ${results.healthChecks.passed}/${healthChecks.length} passed`);
    console.log(`Performance Tests: ${results.performanceTests.passed}/${performanceTests.length} passed`);
    
    if (results.overall.issues.length > 0) {
        console.log('\n⚠️ Issues Found:');
        results.overall.issues.forEach(issue => {
            console.log(`• ${issue}`);
        });
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (results.overall.status === 'EXCELLENT') {
        console.log('✅ System is performing excellently!');
        console.log('✅ All critical features are operational');
        console.log('✅ Response times are within optimal ranges');
    } else if (results.overall.status === 'GOOD') {
        console.log('✅ System is performing well');
        console.log('⚠️ Minor issues detected but system is functional');
        console.log('🔧 Consider addressing the minor issues for optimal performance');
    } else if (results.overall.status === 'NEEDS_ATTENTION') {
        console.log('⚠️ System needs attention');
        console.log('🔧 Some features may not be working properly');
        console.log('🚨 Address the issues above to restore full functionality');
    } else {
        console.log('🚨 CRITICAL ISSUES DETECTED');
        console.log('🔧 System requires immediate attention');
        console.log('🚨 Multiple critical features are not working');
    }
    
    // Feature-specific status
    console.log('\n🔧 Feature Status:');
    const agentAssistantTests = results.healthChecks.details.filter(t => t.name.includes('Agent Assistant'));
    const knowledgeTests = results.healthChecks.details.filter(t => t.name.includes('Knowledge'));
    const dashboardTests = results.healthChecks.details.filter(t => t.name.includes('Dashboard'));
    
    console.log(`• Agent+Assistant: ${agentAssistantTests.filter(t => t.success).length}/${agentAssistantTests.length} operational`);
    console.log(`• Knowledge Base: ${knowledgeTests.filter(t => t.success).length}/${knowledgeTests.length} operational`);
    console.log(`• Dashboard: ${dashboardTests.filter(t => t.success).length}/${dashboardTests.length} operational`);
    
    console.log('\n🌐 Access Points:');
    console.log('• Main Dashboard: http://localhost:3000/dashboard');
    console.log('• Health Check: http://localhost:3000/health');
    console.log('• Agent Chat: http://localhost:3000/api/agent-assistant/chat');
    
    console.log('\n🎯 Fast Response Status:');
    const avgResponseTime = [...results.healthChecks.details, ...results.performanceTests.details]
        .filter(d => d.success)
        .reduce((sum, d) => sum + (d.responseTime || 0), 0) / 
        [...results.healthChecks.details, ...results.performanceTests.details].filter(d => d.success).length;
    
    console.log(`• Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`• Response Classification: ${avgResponseTime <= 20 ? '🚀 Ultra Fast' : avgResponseTime <= 50 ? '⚡ Fast' : avgResponseTime <= 100 ? '📊 Good' : '⏳ Slow'}`);
    
    console.log('\n🎉 Health Check Completed!');
    console.log('============================\n');
    
    return results;
}

// Run the comprehensive health check
runHealthCheck().catch(console.error);
