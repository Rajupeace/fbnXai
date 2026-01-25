const http = require('http');

const facultyId = 'FAC001'; // Assumption: there is at least one faculty or we can test with a generic ID

function checkEndpoint(path) {
    return new Promise(resolve => {
        http.get('http://localhost:5000' + path, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                console.log(`[${res.statusCode}] ${path}`);
                if (res.statusCode !== 200) console.log('Response:', data.substring(0, 100));
                resolve();
            });
        }).on('error', e => {
            console.log(`[ERR] ${path}: ${e.message}`);
            resolve();
        });
    });
}

async function run() {
    console.log('--- Checking Faculty Dashboard Endpoints ---');
    await checkEndpoint('/api/materials');
    await checkEndpoint('/api/messages');
    // We need a real faculty ID for this one to work perfectly, but testing it handles ID gracefully is good
    await checkEndpoint('/api/faculty-stats/FAC001/students');
    console.log('--- Done ---');
}

run();
