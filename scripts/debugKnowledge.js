const http = require('http');

// Debug knowledge endpoint failures
async function debugKnowledgeEndpoint() {
    console.log('🔍 Debugging Knowledge Endpoint Failures');
    console.log('==========================================\n');
    
    const testCases = [
        { query: "python", category: "cse" },
        { query: "java", category: "cse" },
        { query: "circuit", category: "eee" },
        { query: "digital", category: "ece" },
        { query: "algorithm", category: "leetcode" }
    ];
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`Test ${i + 1}: ${JSON.stringify(testCase)}`);
        
        try {
            const result = await makeRequest(testCase);
            console.log(`✅ Success: ${result.responseTime}ms`);
            console.log(`Response: ${result.data.response.substring(0, 100)}...\n`);
        } catch (error) {
            console.log(`❌ Failed: ${error.error || error.message}`);
            console.log(`Response Time: ${error.responseTime}ms\n`);
        }
    }
}

function makeRequest(testCase) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/knowledge',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(testCase))
            }
        };
        
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                try {
                    const jsonData = JSON.parse(body);
                    if (res.statusCode === 200) {
                        resolve({ 
                            status: res.statusCode, 
                            data: jsonData, 
                            responseTime,
                            success: true
                        });
                    } else {
                        reject({ 
                            error: `HTTP ${res.statusCode}: ${body}`,
                            responseTime,
                            success: false
                        });
                    }
                } catch (error) {
                    reject({ 
                        error: `JSON Parse Error: ${error.message}`,
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
        
        req.write(JSON.stringify(testCase));
        req.end();
    });
}

debugKnowledgeEndpoint().catch(console.error);
