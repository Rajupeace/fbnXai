const http = require('http');
const https = require('https');
const { URL } = require('url');

// Usage: set ENV API_BASE (e.g. http://localhost:5000) or pass as first arg
const apiBase = process.env.API_BASE || process.argv[2] || 'http://localhost:5000';
const endpoint = '/api/admin/attendance-recompute';

async function postRecompute() {
  const url = new URL(endpoint, apiBase);
  const client = url.protocol === 'https:' ? https : http;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = client.request(url, options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data || '{}');
        console.log('Response status:', res.statusCode);
        console.log('Body:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Response status:', res.statusCode);
        console.log('Body (raw):', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('Request error:', err.message);
  });

  req.write(JSON.stringify({}));
  req.end();
}

postRecompute();
