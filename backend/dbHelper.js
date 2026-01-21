const fs = require('fs');
const path = require('path');
const { RESOURCE_MAP, DASHBOARD_PATHS } = require('./dashboardConfig');

// Helper to ensure directory exists
const ensureDir = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Ensure basic structure exists on load
try {
  Object.values(DASHBOARD_PATHS).forEach(p => {
    if (typeof p === 'string') {
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    } else if (typeof p === 'object' && p !== null) {
      Object.values(p).forEach(sub => {
        if (typeof sub === 'string' && !fs.existsSync(sub)) {
          fs.mkdirSync(sub, { recursive: true });
        }
      });
    }
  });
} catch (e) {
  console.error("Failed to initialize database folder structure:", e);
}

// Simple file-based DB helper
const dbFile = (name, initial) => {
  // Determine path from map, or default to Admin Sections
  let p = RESOURCE_MAP[name];

  if (!p) {
    // Fallback for unknown collections
    p = path.join(DASHBOARD_PATHS.admin.sections, 'Misc', `${name}.json`);
  }

  ensureDir(p);

  // Initialize file with empty array or object if it doesn't exist
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, JSON.stringify(initial, null, 2));
  }

  return {
    read: () => {
      try {
        const data = fs.readFileSync(p, 'utf8');
        return data ? JSON.parse(data) : initial;
      } catch (e) {
        // console.error(`Error reading ${name}.json:`, e); 
        // Suppress error log for cleaner console, usually means fresh start
        return initial;
      }
    },
    write: (data) => {
      try {
        ensureDir(p); // Ensure dir exists before write (in case it was deleted)
        fs.writeFileSync(p, JSON.stringify(data, null, 2));
      } catch (e) {
        console.error(`Error writing to ${name}.json:`, e);
        throw e;
      }
    },
    path: p // Expose path for watchers
  };
};

module.exports = dbFile;
