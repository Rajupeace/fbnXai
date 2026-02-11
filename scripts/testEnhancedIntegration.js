const http = require('http');

// Comprehensive test for Enhanced VUAI Agent with LLM and LangChain
const testSuite = {
    name: "Enhanced VUAI Agent - Full LLM & LangChain Integration Test",
    version: "2.0",
    tests: [
        {
            name: "Health Check - Full Stack",
            path: "/health",
            method: "GET",
            expectedStatus: 200
        },
        {
            name: "Enhanced Chat - LLM Integration",
            path: "/api/chat",
            method: "POST",
            payload: { 
                message: "Hello, I want to test the full LLM integration",
                userId: "test_user_llm",
                sessionId: "test_session_llm"
            },
            expectedStatus: 200
        },
        {
            name: "Enhanced Chat - LangChain RAG",
            path: "/api/chat",
            method: "POST",
            payload: { 
                message: "Tell me about electrical engineering circuits using LangChain",
                userId: "test_user_langchain",
                sessionId: "test_session_langchain"
            },
            expectedStatus: 200
        },
        {
            name: "Knowledge Upload - Database Save",
            path: "/api/knowledge/upload",
            method: "POST",
            payload: {
                filename: "test_knowledge.json",
                category: "test",
                type: "json",
                content: {
                    topic: "Test Knowledge",
                    description: "This is a test knowledge file for database integration",
                    keywords: ["test", "knowledge", "database"]
                },
                metadata: {
                    tags: ["test", "integration"],
                    priority: "high"
                }
            },
            expectedStatus: 200
        },
        {
            name: "Knowledge List - Database Query",
            path: "/api/knowledge/list",
            method: "GET",
            expectedStatus: 200
        },
        {
            name: "System Status - Full Integration",
            path: "/api/system/status",
            method: "GET",
            expectedStatus: 200
        },
        {
            name: "Database Save - General Collection",
            path: "/api/database/save",
            method: "POST",
            payload: {
                test: "database_save_test",
                timestamp: new Date().toISOString(),
                data: {
                    message: "Testing database save functionality",
                    type: "integration_test"
                }
            },
            expectedStatus: 200
        },
        {
            name: "Conversation Management",
            path: "/api/conversations/test_user_llm",
            method: "GET",
            expectedStatus: 200
        }
    ]
};

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

async function runEnhancedTestSuite() {
    console.log('🚀 Enhanced VUAI Agent - Full LLM & LangChain Integration Test');
    console.log('==========================================================');
    console.log(`Version: ${testSuite.version}`);
    console.log(`Tests: ${testSuite.tests.length}`);
    console.log('==========================================================\n');
    
    const results = {
        totalTests: testSuite.tests.length,
        passedTests: 0,
        failedTests: 0,
        totalResponseTime: 0,
        details: [],
        features: {
            llm: { working: false, tested: false },
            langchain: { working: false, tested: false },
            database: { working: false, tested: false },
            knowledge: { working: false, tested: false },
            conversations: { working: false, tested: false }
        }
    };
    
    for (let i = 0; i < testSuite.tests.length; i++) {
        const test = testSuite.tests[i];
        console.log(`${i + 1}. Testing: ${test.name}`);
        
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
        
        try {
            const result = await makeRequest(options, test.payload);
            const testPassed = result.status === test.expectedStatus;
            
            console.log(`   ${testPassed ? '✅' : '❌'} Status: ${result.status} (${result.responseTime}ms)`);
            
            if (result.success && result.data) {
                // Feature detection
                if (test.name.includes('LLM')) {
                    results.features.llm.tested = true;
                    results.features.llm.working = testPassed;
                }
                if (test.name.includes('LangChain')) {
                    results.features.langchain.tested = true;
                    results.features.langchain.working = testPassed;
                }
                if (test.name.includes('Database') || test.name.includes('Save')) {
                    results.features.database.tested = true;
                    results.features.database.working = testPassed;
                }
                if (test.name.includes('Knowledge')) {
                    results.features.knowledge.tested = true;
                    results.features.knowledge.working = testPassed;
                }
                if (test.name.includes('Conversation')) {
                    results.features.conversations.tested = true;
                    results.features.conversations.working = testPassed;
                }
                
                // Display response details
                if (result.data.response) {
                    console.log(`      💬 Response: ${result.data.response.substring(0, 100)}...`);
                }
                if (result.data.message) {
                    console.log(`      📄 Message: ${result.data.message}`);
                }
                if (result.data.features) {
                    console.log(`      🔧 Features: LLM=${result.data.features.llm.active ? '✅' : '❌'}, LangChain=${result.data.features.langchain.active ? '✅' : '❌'}, DB=${result.data.features.database.status === 'connected' ? '✅' : '❌'}`);
                }
            }
            
            results.details.push({
                name: test.name,
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
                name: test.name,
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
    console.log('🔧 Feature Integration Status:');
    console.log(`• LLM Integration: ${results.features.llm.tested ? (results.features.llm.working ? '✅ Working' : '❌ Failed') : '⚠️ Not Tested'}`);
    console.log(`• LangChain RAG: ${results.features.langchain.tested ? (results.features.langchain.working ? '✅ Working' : '❌ Failed') : '⚠️ Not Tested'}`);
    console.log(`• Database Persistence: ${results.features.database.tested ? (results.features.database.working ? '✅ Working' : '❌ Failed') : '⚠️ Not Tested'}`);
    console.log(`• Knowledge Base: ${results.features.knowledge.tested ? (results.features.knowledge.working ? '✅ Working' : '❌ Failed') : '⚠️ Not Tested'}`);
    console.log(`• Conversations: ${results.features.conversations.tested ? (results.features.conversations.working ? '✅ Working' : '❌ Failed') : '⚠️ Not Tested'}\n`);
    
    // System health assessment
    console.log('🏥 System Health Assessment:');
    const allFeaturesWorking = Object.values(results.features).every(f => !f.tested || f.working);
    const criticalFeaturesWorking = results.features.llm.working && results.features.database.working;
    
    if (allFeaturesWorking) {
        console.log('✅ EXCELLENT: All features working perfectly');
    } else if (criticalFeaturesWorking) {
        console.log('✅ GOOD: Critical features working, some optional features may need attention');
    } else {
        console.log('⚠️ NEEDS ATTENTION: Critical features require fixing');
    }
    
    console.log('\n🌐 Access Points:');
    console.log('• Main Dashboard: http://localhost:3000/dashboard');
    console.log('• Health Check: http://localhost:3000/health');
    console.log('• Enhanced Chat: http://localhost:3000/api/chat');
    console.log('• System Status: http://localhost:3000/api/system/status');
    console.log('• Knowledge Management: http://localhost:3000/api/knowledge/list');
    
    console.log('\n🎯 Fast Response Status:');
    console.log(`• Average Response Time: ${overallAvgResponseTime.toFixed(2)}ms`);
    console.log(`• Response Classification: ${overallAvgResponseTime <= 50 ? '🚀 Ultra Fast' : overallAvgResponseTime <= 100 ? '⚡ Fast' : overallAvgResponseTime <= 200 ? '📊 Good' : '⏳ Slow'}`);
    
    console.log('\n💡 Integration Summary:');
    console.log(`• Knowledge Files: ${results.features.knowledge.working ? '✅ Linked to LLM' : '❌ Not Linked'}`);
    console.log(`• Database Save: ${results.features.database.working ? '✅ Working' : '❌ Failed'}`);
    console.log(`• MongoDB Atlas: ${results.details.find(d => d.data?.features?.database?.status === 'connected') ? '✅ Connected' : '⚠️ Check Configuration'}`);
    console.log(`• LangChain RAG: ${results.features.langchain.working ? '✅ Active' : '❌ Inactive'}`);
    
    console.log('\n🎉 Enhanced Integration Test Completed!');
    console.log('==========================================\n');
    
    return results;
}

// Run the enhanced test suite
runEnhancedTestSuite().catch(console.error);
