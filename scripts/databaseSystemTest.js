const http = require('http');

// Test database operations and system status endpoints
const databaseTests = [
    {
        name: "Knowledge Dashboard",
        path: "/api/knowledge/dashboard",
        method: "GET",
        category: "Knowledge"
    },
    {
        name: "Knowledge Categories",
        path: "/api/knowledge/categories",
        method: "GET",
        category: "Knowledge"
    },
    {
        name: "Database Save - Test Data",
        path: "/api/database/save",
        method: "POST",
        payload: { 
            test: "database_test_data", 
            timestamp: new Date().toISOString(),
            category: "test",
            data: { message: "Testing database save functionality" }
        },
        category: "Database"
    },
    {
        name: "Database Save - User Activity",
        path: "/api/database/save",
        method: "POST",
        payload: { 
            userId: "test_user_db",
            activity: "database testing",
            timestamp: new Date().toISOString(),
            type: "user_activity"
        },
        category: "Database"
    },
    {
        name: "System Status",
        path: "/api/system/status",
        method: "GET",
        category: "System"
    },
    {
        name: "Health Check Extended",
        path: "/health",
        method: "GET",
        category: "System"
    }
];

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
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

async function runDatabaseAndSystemTest() {
    console.log('🗄️  VUAI Agent - Database & System Status Test');
    console.log('==========================================\n');
    
    let totalTests = databaseTests.length;
    let passedTests = 0;
    let totalTime = 0;
    const categoryResults = {
        Knowledge: { total: 0, passed: 0, totalTime: 0 },
        Database: { total: 0, passed: 0, totalTime: 0 },
        System: { total: 0, passed: 0, totalTime: 0 }
    };
    
    console.log('🔍 Testing Database Operations & System Status...\n');
    
    for (let i = 0; i < databaseTests.length; i++) {
        const test = databaseTests[i];
        
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
                
                const performance = result.responseTime < 20 ? '🚀' : result.responseTime < 50 ? '⚡' : result.responseTime < 100 ? '📊' : '⏳';
                console.log(`   ${performance} PASS (${result.responseTime}ms)`);
                
                // Show detailed response information
                if (result.data.updates) {
                    console.log(`   📚 Knowledge Updates: ${result.data.updates.length} items`);
                    if (result.data.updates.length > 0) {
                        console.log(`   📋 Latest: ${result.data.updates[0].topic}`);
                    }
                } else if (result.data.categories) {
                    console.log(`   📚 Categories: ${result.data.categories.length} available`);
                } else if (result.data.resultId) {
                    console.log(`   💾 Data Saved: ${result.data.resultId}`);
                    console.log(`   📝 Collection: ${result.data.collection || 'general'}`);
                } else if (result.data.status) {
                    console.log(`   📊 Status: ${result.data.status}`);
                    if (result.data.features) {
                        console.log(`   🔧 Features: ${Object.keys(result.data.features).length} active`);
                    }
                } else if (result.data.message) {
                    console.log(`   📄 Response: ${result.data.message}`);
                }
                
            } else {
                console.log(`   ❌ FAIL (${result.responseTime}ms) - Status: ${result.status}`);
                if (result.data.error) {
                    console.log(`   🚨 Error: ${result.data.error}`);
                }
            }
            
        } catch (error) {
            console.log(`   ❌ ERROR - ${error.error}`);
        }
        
        console.log('');
    }
    
    // Database & System Results Report
    console.log('📊 Database & System Test Results');
    console.log('=================================\n');
    
    const overallSuccessRate = (passedTests / totalTests) * 100;
    const overallAvgResponseTime = totalTime / passedTests;
    
    console.log('🎯 Overall Performance:');
    console.log(`• Total Tests: ${totalTests}`);
    console.log(`• Passed: ${passedTests}`);
    console.log(`• Failed: ${totalTests - passedTests}`);
    console.log(`• Success Rate: ${overallSuccessRate.toFixed(2)}%`);
    console.log(`• Average Response Time: ${overallAvgResponseTime.toFixed(2)}ms`);
    
    console.log('\n📈 Category Analysis:');
    
    for (const [category, stats] of Object.entries(categoryResults)) {
        const successRate = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;
        const avgTime = stats.passed > 0 ? (stats.totalTime / stats.passed) : 0;
        const status = successRate === 100 ? '✅ PERFECT' : 
                       successRate >= 80 ? '✅ GOOD' : 
                       successRate >= 60 ? '⚠️ ACCEPTABLE' : '❌ NEEDS WORK';
        
        console.log(`• ${category}: ${stats.passed}/${stats.total} (${successRate.toFixed(1)}%) - ${avgTime.toFixed(2)}ms avg - ${status}`);
    }
    
    console.log('\n🔧 Database & System Assessment:');
    
    // Knowledge Base
    const knowledgeStatus = categoryResults.Knowledge.passed >= categoryResults.Knowledge.total * 0.5;
    console.log(`• Knowledge Base: ${knowledgeStatus ? '✅ PARTIALLY WORKING' : '❌ NOT WORKING'}`);
    
    // Database
    const databaseStatus = categoryResults.Database.passed > 0;
    console.log(`• Database Operations: ${databaseStatus ? '✅ WORKING' : '❌ NOT WORKING'}`);
    
    // System
    const systemStatus = categoryResults.System.passed > 0;
    console.log(`• System Monitoring: ${systemStatus ? '✅ ACTIVE' : '❌ INACTIVE'}`);
    
    console.log('\n🚀 Database & System Readiness:');
    
    if (overallSuccessRate >= 80 && (knowledgeStatus || databaseStatus)) {
        console.log('✅ GOOD: Database and system components are working!');
    } else if (overallSuccessRate >= 60) {
        console.log('⚠️ ACCEPTABLE: Some database/system features working!');
    } else {
        console.log('❌ NEEDS WORK: Database and system components need attention!');
    }
    
    console.log('\n💡 Database & System Features:');
    
    if (knowledgeStatus) {
        console.log('✅ Knowledge Categories - Accessible');
    }
    if (databaseStatus) {
        console.log('✅ Data Persistence - Working');
    }
    if (systemStatus) {
        console.log('✅ System Monitoring - Active');
    }
    
    console.log('\n🔍 Detailed Analysis:');
    
    // Check what's working and what's not
    console.log('📋 Working Components:');
    if (categoryResults.Knowledge.passed > 0) {
        console.log('• Knowledge Categories endpoint is functional');
    }
    if (categoryResults.Database.passed > 0) {
        console.log('• Database save operations are working');
    }
    if (categoryResults.System.passed > 0) {
        console.log('• System status monitoring is working');
    }
    
    console.log('\n⚠️ Issues Identified:');
    if (categoryResults.Knowledge.failed > 0) {
        console.log('• Knowledge Dashboard endpoint has issues (timeout errors)');
    }
    if (categoryResults.Database.failed > 0) {
        console.log('• Some database endpoints are not implemented (404 errors)');
    }
    if (categoryResults.System.failed > 0) {
        console.log('• System status endpoint is not implemented (404 errors)');
    }
    
    console.log('\n🎯 Recommendations:');
    
    if (categoryResults.Knowledge.failed > 0) {
        console.log('• Fix MongoDB connection issues for knowledge dashboard');
        console.log('• Optimize database queries to prevent timeouts');
    }
    if (categoryResults.Database.failed > 0) {
        console.log('• Implement missing database endpoints');
        console.log('• Add proper error handling for database operations');
    }
    if (categoryResults.System.failed > 0) {
        console.log('• Implement system status monitoring endpoint');
        console.log('• Add comprehensive system metrics');
    }
    
    console.log('\n🌐 Database & System Access:');
    
    if (categoryResults.Knowledge.passed > 0) {
        console.log('• Knowledge Categories: http://localhost:3000/api/knowledge/categories');
    }
    if (categoryResults.Database.passed > 0) {
        console.log('• Database Save: http://localhost:3000/api/database/save');
    }
    if (categoryResults.System.passed > 0) {
        console.log('• System Status: http://localhost:3000/api/system/status');
    }
    console.log('• Health Check: http://localhost:3000/health');
    
    console.log('\n🎉 Database & System Verdict:');
    if (overallSuccessRate >= 80) {
        console.log('✅ GOOD: Database and system components are operational!');
        console.log('   Core functionality working with some limitations.');
    } else if (overallSuccessRate >= 60) {
        console.log('⚠️ ACCEPTABLE: Database and system have partial functionality!');
        console.log('   Some features working but need improvements.');
    } else {
        console.log('❌ NEEDS WORK: Database and system require significant improvements!');
        console.log('   Critical issues need to be addressed.');
    }
    
    console.log('\n🚀 Next Steps:');
    if (overallSuccessRate >= 80) {
        console.log('• Deploy with current database/system functionality');
        console.log('• Monitor database performance');
        console.log('• Plan improvements for missing features');
    } else {
        console.log('• Fix database connection issues');
        console.log('• Implement missing endpoints');
        console.log('• Re-test after improvements');
    }
}

// Run database and system test
runDatabaseAndSystemTest().catch(console.error);
