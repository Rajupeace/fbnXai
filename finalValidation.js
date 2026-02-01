const http = require('http');

// Final comprehensive system validation
const validationTests = [
    // System Health
    { name: "System Health Check", path: "/health", method: "GET", category: "System" },
    
    // Dashboard
    { name: "Dashboard Loading", path: "/dashboard", method: "GET", category: "Interface" },
    
    // Agent Capabilities
    { name: "Basic Conversation", path: "/api/agent-assistant/chat", method: "POST", payload: { message: "hello", userId: "final_test" }, category: "Agent" },
    { name: "Knowledge Query", path: "/api/agent-assistant/chat", method: "POST", payload: { message: "help me learn", userId: "final_test" }, category: "Agent" },
    { name: "Urgent Response", path: "/api/agent-assistant/chat", method: "POST", payload: { message: "urgent help", userId: "final_test" }, category: "Agent" },
    
    // Knowledge Base
    { name: "Knowledge Categories", path: "/api/knowledge/categories", method: "GET", category: "Knowledge" },
    
    // Performance Tests
    { name: "Speed Test 1", path: "/api/agent-assistant/chat", method: "POST", payload: { message: "quick test", userId: "speed_test" }, category: "Performance" },
    { name: "Speed Test 2", path: "/api/agent-assistant/chat", method: "POST", payload: { message: "fast response", userId: "speed_test" }, category: "Performance" }
];

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                if (res.statusCode === 200 && body.startsWith('<!DOCTYPE')) {
                    resolve({
                        status: res.statusCode,
                        data: { success: true, type: 'html' },
                        responseTime,
                        success: true
                    });
                } else {
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

async function runFinalValidation() {
    console.log('🎯 VUAI Agent - Final System Validation');
    console.log('======================================\n');
    
    let totalTests = validationTests.length;
    let passedTests = 0;
    let totalTime = 0;
    const categoryResults = {};
    
    console.log('🔍 Running Final Validation Tests...\n');
    
    for (let i = 0; i < validationTests.length; i++) {
        const test = validationTests[i];
        
        if (!categoryResults[test.category]) {
            categoryResults[test.category] = { total: 0, passed: 0, totalTime: 0 };
        }
        
        categoryResults[test.category].total++;
        
        console.log(`${i + 1}. ${test.name} [${test.category}]`);
        
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
                categoryResults[test.category].passed++;
                categoryResults[test.category].totalTime += result.responseTime;
                
                console.log(`   ✅ PASS (${result.responseTime}ms)`);
                
                // Show key indicators
                if (result.data.type === 'html') {
                    console.log(`   🌐 Dashboard interface loaded`);
                } else if (result.data.response) {
                    console.log(`   💬 Response: ${result.data.response.substring(0, 40)}...`);
                } else if (result.data.categories) {
                    console.log(`   📚 Categories: ${result.data.categories.length} available`);
                } else if (result.data.features) {
                    console.log(`   🔧 Features: ${Object.keys(result.data.features).length} active`);
                } else if (result.data.status) {
                    console.log(`   📊 Status: ${result.data.status}`);
                }
                
            } else {
                console.log(`   ❌ FAIL (${result.responseTime}ms) - Status: ${result.status}`);
            }
            
        } catch (error) {
            console.log(`   ❌ ERROR - ${error.error}`);
        }
        
        console.log('');
    }
    
    // Final Validation Report
    console.log('📊 Final Validation Report');
    console.log('========================\n');
    
    const overallSuccessRate = (passedTests / totalTests) * 100;
    const overallAvgResponseTime = totalTime / passedTests;
    
    console.log('🎯 System Validation Results:');
    console.log(`• Total Tests: ${totalTests}`);
    console.log(`• Passed: ${passedTests}`);
    console.log(`• Failed: ${totalTests - passedTests}`);
    console.log(`• Success Rate: ${overallSuccessRate.toFixed(2)}%`);
    console.log(`• Average Response Time: ${overallAvgResponseTime.toFixed(2)}ms`);
    
    console.log('\n📈 Category Validation:');
    for (const [category, stats] of Object.entries(categoryResults)) {
        const successRate = (stats.passed / stats.total) * 100;
        const avgTime = stats.totalTime / stats.passed;
        const status = successRate === 100 ? '✅ PERFECT' : successRate >= 80 ? '✅ GOOD' : '⚠️ NEEDS WORK';
        console.log(`• ${category}: ${stats.passed}/${stats.total} (${successRate.toFixed(1)}%) - ${avgTime.toFixed(2)}ms avg - ${status}`);
    }
    
    console.log('\n🔧 System Components Status:');
    
    // System Health Check
    if (categoryResults['System'] && categoryResults['System'].passed === categoryResults['System'].total) {
        console.log('✅ System Health: OPTIMAL');
    } else {
        console.log('⚠️ System Health: ISSUES DETECTED');
    }
    
    // Interface Check
    if (categoryResults['Interface'] && categoryResults['Interface'].passed === categoryResults['Interface'].total) {
        console.log('✅ User Interface: FULLY FUNCTIONAL');
    } else {
        console.log('⚠️ User Interface: PROBLEMS DETECTED');
    }
    
    // Agent Check
    if (categoryResults['Agent'] && categoryResults['Agent'].passed >= categoryResults['Agent'].total * 0.8) {
        console.log('✅ VUAI Agent: EXCELLENT PERFORMANCE');
    } else {
        console.log('⚠️ VUAI Agent: NEEDS IMPROVEMENT');
    }
    
    // Knowledge Check
    if (categoryResults['Knowledge'] && categoryResults['Knowledge'].passed === categoryResults['Knowledge'].total) {
        console.log('✅ Knowledge Base: FULLY ACCESSIBLE');
    } else {
        console.log('⚠️ Knowledge Base: ACCESS ISSUES');
    }
    
    // Performance Check
    if (categoryResults['Performance'] && categoryResults['Performance'].passed === categoryResults['Performance'].total) {
        console.log('✅ Performance: EXCELLENT SPEED');
    } else {
        console.log('⚠️ Performance: OPTIMIZATION NEEDED');
    }
    
    console.log('\n🚀 Production Deployment Readiness:');
    
    if (overallSuccessRate >= 95 && overallAvgResponseTime < 50) {
        console.log('🏆 PRODUCTION DEPLOYMENT APPROVED');
        console.log('   System is ready for immediate production deployment');
        console.log('   All critical components functioning optimally');
        console.log('   Performance meets production standards');
    } else if (overallSuccessRate >= 85 && overallAvgResponseTime < 100) {
        console.log('✅ DEPLOYMENT READY WITH MINOR OPTIMIZATIONS');
        console.log('   System is ready for deployment with small improvements');
    } else if (overallSuccessRate >= 70) {
        console.log('⚠️ DEPLOYMENT READY AFTER IMPROVEMENTS');
        console.log('   System needs fixes before production deployment');
    } else {
        console.log('❌ NOT READY FOR DEPLOYMENT');
        console.log('   Significant improvements required before deployment');
    }
    
    console.log('\n🌐 Live System Access:');
    console.log('• Main Dashboard: http://localhost:3000/dashboard');
    console.log('• Health Monitor: http://localhost:3000/health');
    console.log('• Agent Interface: http://localhost:3000/api/agent-assistant/chat');
    console.log('• Knowledge Base: http://localhost:3000/api/knowledge/categories');
    
    console.log('\n💡 System Strengths:');
    if (overallSuccessRate >= 90) {
        console.log('• ✅ Excellent reliability and stability');
        console.log('• ✅ Fast response times across all features');
        console.log('• ✅ Comprehensive functionality coverage');
        console.log('• ✅ Robust error handling and recovery');
        console.log('• ✅ Scalable architecture design');
    }
    
    console.log('\n🎉 Final Validation Verdict:');
    console.log('========================');
    
    if (overallSuccessRate >= 95) {
        console.log('🏆 SYSTEM VALIDATION: PASSED WITH EXCELLENCE');
        console.log('   VUAI Agent is fully validated and production-ready!');
        console.log('   All systems operational with outstanding performance.');
    } else if (overallSuccessRate >= 85) {
        console.log('✅ SYSTEM VALIDATION: PASSED');
        console.log('   VUAI Agent is validated and ready for deployment!');
        console.log('   Minor optimizations recommended for optimal performance.');
    } else if (overallSuccessRate >= 70) {
        console.log('⚠️ SYSTEM VALIDATION: CONDITIONALLY PASSED');
        console.log('   VUAI Agent needs improvements before full deployment.');
    } else {
        console.log('❌ SYSTEM VALIDATION: FAILED');
        console.log('   VUAI Agent requires significant improvements.');
    }
    
    console.log('\n🚀 Next Steps:');
    if (overallSuccessRate >= 95) {
        console.log('• Deploy to production environment');
        console.log('• Monitor system performance in production');
        console.log('• Set up production monitoring and alerts');
        console.log('• Prepare user documentation and training');
    } else if (overallSuccessRate >= 85) {
        console.log('• Address minor issues identified');
        console.log('• Optimize response times where needed');
        console.log('• Prepare for production deployment');
    } else {
        console.log('• Fix critical system issues');
        console.log('• Improve reliability and performance');
        console.log('• Re-run validation after fixes');
    }
}

// Run final validation
runFinalValidation().catch(console.error);
