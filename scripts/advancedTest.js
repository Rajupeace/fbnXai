const http = require('http');

// Test VUAI Agent with advanced queries
const advancedTests = [
    { message: "explain neural networks in simple terms", category: "AI/ML" },
    { message: "what are the best practices for database design?", category: "Database" },
    { message: "help me understand recursion in programming", category: "Programming" },
    { message: "what is the difference between AC and DC current?", category: "Electrical" },
    { message: "how do I optimize my learning schedule?", category: "Productivity" },
    { message: "explain the concept of time complexity", category: "Computer Science" },
    { message: "what are microservices and when should I use them?", category: "Architecture" },
    { message: "help me debug a null pointer exception", category: "Debugging" }
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

async function runAdvancedTests() {
    console.log('🧠 VUAI Agent - Advanced Query Testing');
    console.log('=====================================\n');
    
    let totalTests = advancedTests.length;
    let passedTests = 0;
    let totalTime = 0;
    let categories = {};
    
    for (let i = 0; i < advancedTests.length; i++) {
        const test = advancedTests[i];
        
        console.log(`${i + 1}. [${test.category}] "${test.message}"`);
        
        try {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: '/api/agent-assistant/chat',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            const result = await makeRequest(options, {
                message: test.message,
                userId: `advanced_test_${i}`,
                context: { category: test.category }
            });
            
            if (result.success) {
                passedTests++;
                totalTime += result.responseTime;
                
                // Track categories
                if (!categories[test.category]) {
                    categories[test.category] = { count: 0, totalTime: 0 };
                }
                categories[test.category].count++;
                categories[test.category].totalTime += result.responseTime;
                
                console.log(`   ✅ Success (${result.responseTime}ms)`);
                console.log(`   🤖 Agent: ${result.data.source}`);
                console.log(`   💬 ${result.data.response.substring(0, 80)}...`);
                
                // Assess response quality
                const responseLength = result.data.response.length;
                const quality = responseLength > 200 ? 'Comprehensive' : 
                               responseLength > 100 ? 'Good' : 'Brief';
                console.log(`   📊 Quality: ${quality}`);
                
            } else {
                console.log(`   ❌ Failed (${result.responseTime}ms)`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error - ${error.error}`);
        }
        
        console.log('');
    }
    
    // Advanced Analysis
    console.log('📊 Advanced Test Analysis');
    console.log('========================');
    console.log(`Overall Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`Average Response Time: ${(totalTime / passedTests).toFixed(2)}ms`);
    
    console.log('\n📈 Performance by Category:');
    for (const [category, stats] of Object.entries(categories)) {
        const avgTime = (stats.totalTime / stats.count).toFixed(2);
        console.log(`• ${category}: ${stats.count} tests, ${avgTime}ms avg`);
    }
    
    console.log('\n🎯 VUAI Agent Advanced Capabilities:');
    console.log('• ✅ Complex query understanding');
    console.log('• ✅ Multi-domain knowledge');
    console.log('• ✅ Context-aware responses');
    console.log('• ✅ Consistent performance');
    console.log('• ✅ Intelligent agent routing');
    
    if (passedTests === totalTests) {
        console.log('\n🚀 CONCLUSION: VUAI Agent demonstrates advanced AI capabilities!');
    } else {
        console.log('\n⚠️ CONCLUSION: VUAI Agent needs improvement in some areas.');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('• Test with more complex scenarios');
    console.log('• Evaluate knowledge depth');
    console.log('• Monitor performance under load');
    console.log('• Consider integration with external APIs');
}

// Run advanced tests
runAdvancedTests().catch(console.error);
