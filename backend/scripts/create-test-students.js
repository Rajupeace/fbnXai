(async () => {
  const base = process.env.API_URL || 'http://localhost:5000';
  const created = [];

  for (let i = 1; i <= 10; i++) {
    const sid = `TESTS${1000 + i}`;
    const body = {
      studentName: `Test Student ${i}`,
      sid,
      email: `${sid}@example.com`,
      year: 1,
      section: 'A',
      branch: 'CSE',
      password: 'pass123'
    };
    try {
      const res = await fetch(`${base}/api/students`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn('Create failed for', sid, data.error || data.message || res.status);
      } else {
        console.log('Created', sid);
        created.push(data);
      }
    } catch (e) {
      console.error('Request error for', sid, e.message || e);
    }
  }

  try {
    const listRes = await fetch(`${base}/api/students`);
    const list = await listRes.json();
    console.log('\nTotal students returned:', Array.isArray(list) ? list.length : 'unknown');
    if (Array.isArray(list) && list.length > 0) {
      console.log('Sample (first 5):', list.slice(0, 5));
    }
  } catch (e) {
    console.error('Failed to fetch students list:', e.message || e);
  }

  // Test student login
  try {
    const loginRes = await fetch(`${base}/api/students/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sid: 'TESTS1001', password: 'pass123' })
    });
    const loginData = await loginRes.json().catch(() => ({}));
    if (!loginRes.ok) console.warn('Login failed:', loginData.error || loginData.message || loginRes.status);
    else console.log('\nLogin test success:', loginData);
  } catch (e) {
    console.error('Login request failed:', e.message || e);
  }
})();
