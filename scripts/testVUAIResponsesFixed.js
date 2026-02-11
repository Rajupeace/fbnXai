const http = require('http');

// Test VUAI Agent response and processing
const agentTests = [
    {
        name: "Basic Greeting",
        path: "/api/agent-assistant/chat",
        method: "POST",
        payload: { message: "hello", userId: "test_user" },
        category: "Agent"
    },
    {
        name: "Help Request",
        path: "/api/agent-assistant/chat",
        method: "POST",
        payload: { message: "help me learn", userId: "test_user" },
        category: "Agent"
    },
    {
        name: "Knowledge Query",
        path: "/api/agent-assistant/chat",
        method: "POST",
        payload: { message: "explain electrical circuits", userId: "test_user" },
        category: "Agent"
    },
    {
        name: "Urgent Response",
        path: "/api/agent-assistant/chat",
        method: "POST",
        payload: { message: "urgent help needed", userId: "test_user" },
        category: "Agent"
    },
    {
        name: "Math Calculation",
        path: "/api/agent-assistant/chat",
        method: "POST",
        payload: { message: "calculate 25 * 8", userId: "test_user" },
        category: "Agent"
    },
    {
        name: "Navigation Help",
        path: "/api/agent-assistant/chat",
        method: "POST",
        payload: { message: "navigate to machine learning", userId: "test_user" },
        category: "Agent"
    },
    {
        name: "Complex Query",
        path: "/api/agent-assistant/chat",
        method: "POST",
        payload: { message: "create a study plan for electrical engineering", userId: "test_user" },
        category: "Agent"
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

async function testVUAIResponses() {
    console.log('🤖 VUAI Agent - Response and Processing Test');
    console.log('==========================================\n');
    
    let totalTests = agentTests.length;
    let passedTests = 0;
    let totalTime = 0;
    const agentResults = [];
    
    console.log('🔍 Testing VUAI Agent Responses...\n');
    
    for (let i = 0; i < agentTests.length; i++) {
        const test = agentTests[i];
        
        console.log(`${i + 1}. ${test.name}`);
        
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
                
                const performance = result.responseTime < 20 ? '🚀' : result.responseTime < 50 ? '⚡' : result.responseTime < 100 ? '📊' : '⏳';
                console.log(`   ${performance} PASS (${result.responseTime}ms)`);
                
                // Analyze response quality
                const responseLength = result.data.response ? result.data.response.length : 0;
                const hasProcessing = result.data.response && (
                    result.data.response.includes('processing') ||
                    result.data.response.includes('thinking') ||
                    result.data.response.includes('analyzing') ||
                    result.data.response.includes('calculating')
                );
                
                const isComprehensive = responseLength > 200;
                const isHelpful = result.data.response && (
                    result.data.response.includes('help') ||
                    result.data.response.includes('assist') ||
                    result.data.response.includes('guide') ||
                    result.data.response.includes('explain')
                );
                
                agentResults.push({
                    name: test.name,
                    responseTime: result.responseTime,
                    responseLength: responseLength,
                    agentType: result.data.source,
                    hasProcessing: hasProcessing,
                    isComprehensive: isComprehensive,
                    isHelpful: isHelpful,
                    response: result.data.response
                });
                
                console.log(`   🤖 Agent: ${result.data.source}`);
                console.log(`   📏 Length: ${responseLength} characters`);
                console.log(`   🔍 Processing: ${hasProcessing ? '✅ Yes' : '❌ No'}`);
                console.log(`   📊 Comprehensive: ${isComprehensive ? '✅ Yes' : '❌ No'}`);
                console.log(`   💬 Helpful: ${isHelpful ? '✅ Yes' : '❌ No'}`);
                console.log(`   💬 Response: ${result.data.response.substring(0, 80)}...`);
                
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
    
    // Response Analysis Report
    console.log('📊 VUAI Agent Response Analysis');
    console.log('================================\n');
    
    const overallSuccessRate = (passedTests / totalTests) * 100;
    const overallAvgResponseTime = totalTime / passedTests;
    
    console.log('🎯 Overall Performance:');
    console.log(`• Total Tests: ${totalTests}`);
    console.log(`• Passed: ${passedTests}`);
    console.log(`• Failed: ${totalTests - passedTests}`);
    console.log(`• Success Rate: ${overallSuccessRate.toFixed(2)}%`);
    console.log(`• Average Response Time: ${overallAvgResponseTime.toFixed(2)}ms`);
    
    console.log('\n🤖 Agent Response Quality Analysis:');
    
    const avgResponseLength = agentResults.reduce((sum, result) => sum + result.responseLength, 0) / agentResults.length;
    const processingCount = agentResults.filter(r => r.hasProcessing).length;
    const comprehensiveCount = agentResults.filter(r => r.isComprehensive).length;
    const helpfulCount = agentResults.filter(r => r.isHelpful).length;
    
    console.log(`• Average Response Length: ${avgResponseLength.toFixed(0)} characters`);
    console.log(`• Processing Indicators: ${processingCount}/${totalTests} (${((processingCount/totalTests)*100).toFixed(1)}%)`);
    console.log(`• Comprehensive Responses: ${comprehensiveCount}/${totalTests} (${((comprehensiveCount/totalTests)*100).toFixed(1)}%)`);
    console.log(`• Helpful Responses: ${helpfulCount}/${totalTests} (${((helpfulCount/totalTests)*100).toFixed(1)}%)`);
    
    console.log('\n🔍 Agent Type Distribution:');
    const agentTypes = {};
    agentResults.forEach(result => {
        agentTypes[result.agentType] = (agentTypes[result.agentType] || 0) + 1;
    });
    
    Object.entries(agentTypes).forEach(([agentType, count]) => {
        console.log(`• ${agentType}: ${count} responses`);
    });
    
    console.log('\n🚀 Response Performance Analysis:');
    
    const fastResponses = agentResults.filter(r => r.responseTime < 20).length;
    const slowResponses = agentResults.filter(r => r.responseTime > 100).length;
    
    console.log(`• Fast Responses (<20ms): ${fastResponses}/${totalTests} (${((fastResponses/totalTests)*100).toFixed(1)}%)`);
    console.log(`• Slow Responses (>100ms): ${slowResponses}/${totalTests} (${((slowResponses/totalTests)*100).toFixed(1)}%)`);
    
    console.log('\n🎯 VUAI Agent Assessment:');
    
    if (overallSuccessRate >= 90 && overallAvgResponseTime < 50) {
        console.log('🏆 EXCELLENT: VUAI Agent is responding perfectly!');
    } else if (overallSuccessRate >= 80 && overallAvgResponseTime < 100) {
        console.log('✅ VERY GOOD: VUAI Agent is responding well!');
    } else if (overallSuccessRate >= 70) {
        console.log('✅ GOOD: VUAI Agent is responding adequately!');
    } else {
        console.log('⚠️ NEEDS WORK: VUAI Agent response quality needs improvement!');
    }
    
    console.log('\n💡 Response Quality Insights:');
    
    if (avgResponseLength > 100) {
        console.log('✅ Response Length: Good - Detailed responses provided');
    } else {
        console.log('⚠️ Response Length: Short - Could be more detailed');
    }
    
    if (processingCount > 0) {
        console.log('✅ Processing Indicators: Good - Shows thinking process');
    } else {
        console.log('⚠️ Processing Indicators: Missing - Could show more processing');
    }
    
    if (comprehensiveCount >= totalTests * 0.7) {
        console.log('✅ Comprehensive: Good - Detailed responses provided');
    } else {
        console.log('⚠️ Comprehensive: Could be more detailed');
    }
    
    if (helpfulCount >= totalTests * 0.8) {
        console.log('✅ Helpfulness: Excellent - Very helpful responses');
    } else {
        console.log('⚠️ Helpfulness: Could be more helpful');
    }
    
    console.log('\n🌐 Working Agent Features:');
    console.log('• Agent Chat: http://localhost:3000/api/agent-assistant/chat');
    console.log('• Health Check: http://localhost:3000/health');
    console.log('• Knowledge Base: http://localhost:3000/api/knowledge/categories');
    
    console.log('\n🎉 Final Verdict:');
    if (overallSuccessRate >= 90) {
        console.log('🏆 OUTSTANDING: VUAI Agent is responding perfectly!');
        console.log('   All agent tests passed with excellent performance.');
    } else if (overallSuccessRate >= 80) {
        console.log('✅ VERY GOOD: VUAI Agent is responding well!');
        console.log('   Most agent tests passed with good performance.');
    } else if (overallSuccessRate >= 70) {
        console.log('✅ GOOD: VUAI Agent is responding adequately!');
        console.log('   Agent tests passed with acceptable performance.');
    } else {
        console.log('⚠️ NEEDS WORK: VUAI Agent response quality needs improvement!');
        console.log('   Agent tests failed or need significant improvement.');
    }
    
    console.log('\n🚀 Recommendations:');
    if (overallSuccessRate >= 90) {
        console.log('• Deploy agent to production with confidence');
        console.log('• Monitor response quality and performance');
        console.log('• Continue optimizing response times');
    } else if (overallSuccessRate >= 80) {
        console.log('• Deploy with confidence, monitor performance');
        console.log('• Optimize response times where possible');
        console.log('• Improve response comprehensiveness');
    } else {
        console.log('• Fix agent response issues before deployment');
        console.log('• Improve response times and quality');
        console.log('• Add more comprehensive responses');
    }
}

// Test VUAI Agent responses
testVUAIResponses().catch(console.error);
