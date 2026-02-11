// Small helper to trace JSON.parse failures during build
const fs = require('fs');
const origRead = fs.readFileSync;
fs.readFileSync = function(path, ...args) {
  const res = origRead.apply(fs, [path, ...args]);
  try {
    const p = String(path || '');
    if (p.endsWith('.json')) {
      const len = Buffer.isBuffer(res) ? res.length : (res && res.length) || 0;
      console.error('READ_JSON', p, 'len=', len);
    }
  } catch (e) {
    // ignore
  }
  return res;
};

const origParse = JSON.parse;
JSON.parse = function(...args) {
  try {
    return origParse.apply(this, args);
  } catch (e) {
    try {
      console.error('JSON.parse failed:', e && e.message);
      const input = args[0];
      if (typeof input === 'string') {
        console.error('Input length:', input.length);
        console.error('Input preview:', input.slice(0, 200));
      }
      console.error(e.stack);
    } catch (inner) {
      // ignore
    }
    throw e;
  }
};
