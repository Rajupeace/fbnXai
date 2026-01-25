const http = require('http');
const https = require('https');
const { URL } = require('url');

const apiBase = process.env.API_BASE || process.argv[2] || 'http://localhost:5000';
const endpoints = [
  '/api/admin/sync-enrollments',
  '/api/admin/rebuild-faculty-assignments',
  '/api/admin/attendance-recompute'
];

function post(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, apiBase);
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', err => reject(err));
    req.write(JSON.stringify({}));
    req.end();
  });
}

(async () => {
  console.log('Starting sync-all to', apiBase);
  for (const ep of endpoints) {
    try {
      console.log('->', ep);
      const res = await post(ep);
      console.log(`   ${ep} -> ${res.status}`, JSON.stringify(res.body));
    } catch (err) {
      console.error('Error calling', ep, err.message || err);
      process.exit(1);
    }
  }
  console.log('sync-all completed');
})();
