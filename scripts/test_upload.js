/*
Simple Node script to test multipart upload to the backend /api/materials endpoint.
Usage:
  node scripts/test_upload.js <API_URL> <TOKEN> <FILE_PATH> [subject] [year] [section]
Example:
  node scripts/test_upload.js http://localhost:5000 myAdminToken C:\temp\sample.pdf "Math - Year 1" 1 A

This script uses the built-in fetch and FormData available in Node 18+.
*/

const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: node scripts/test_upload.js <API_URL> <TOKEN> <FILE_PATH> [subject] [year] [section]');
    process.exit(1);
  }

  const [API_URL, TOKEN, FILE_PATH, subject = 'General', year = '1', section = 'A'] = args;

  if (!fs.existsSync(FILE_PATH)) {
    console.error('File not found:', FILE_PATH);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(FILE_PATH);
  const fileName = path.basename(FILE_PATH);

  // Use node's global FormData & fetch (Node 18+)
  const FormData = global.FormData || require('form-data');
  const fetch = global.fetch || (...args) => import('node-fetch').then(({default: f}) => f(...args));

  const fd = new FormData();
  fd.append('file', fileStream, fileName);
  fd.append('title', `Test Upload - ${fileName}`);
  fd.append('subject', subject);
  fd.append('year', year);
  fd.append('section', section);
  fd.append('type', 'notes');

  const headers = {
    'x-admin-token': TOKEN,
    // Don't set content-type; let FormData handle boundary
  };

  console.log('Uploading', FILE_PATH, 'to', API_URL + '/api/materials');

  try {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/materials`, {
      method: 'POST',
      headers,
      body: fd
    });

    const body = await res.text();
    console.log('Status:', res.status);
    try { console.log('Response JSON:', JSON.parse(body)); }
    catch (e) { console.log('Response Text:', body); }

    if (!res.ok) process.exit(2);
  } catch (e) {
    console.error('Upload failed:', e);
    process.exit(3);
  }
}

main();
