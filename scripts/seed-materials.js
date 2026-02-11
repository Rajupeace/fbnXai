const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '..', 'backend', 'data');
const materialsFile = path.join(dataDir, 'materials.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(materialsFile)) fs.writeFileSync(materialsFile, JSON.stringify([], null, 2));

const branches = ['CSE', 'IT', 'AIML', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const subjectsBySem = {
  1: ['Engineering Mathematics I', 'Engineering Physics', 'Basic Electrical Engineering', 'Programming for Problem Solving (C)'],
  2: ['Engineering Mathematics II', 'Engineering Chemistry', 'Data Structures', 'Object-Oriented Programming (C++)'],
  3: ['Engineering Mathematics III', 'Digital Logic Design', 'Computer Organization & Architecture', 'Operating Systems'],
  4: ['Theory of Computation', 'Design & Analysis of Algorithms', 'Database Management Systems', 'Software Engineering'],
  5: ['Computer Networks', 'Compiler Design', 'Artificial Intelligence', 'Web Technologies'],
  6: ['Machine Learning', 'Cloud Computing', 'Data Mining & Warehousing', 'Embedded Systems'],
  7: ['Distributed Systems', 'Information Security', 'Mobile Application Development', 'Professional Elective I'],
  8: ['Professional Elective III', 'Professional Elective IV', 'Industrial Training', 'Project Work']
};

const advancedTechs = [
  'Python', 'Java', 'Go', 'Rust', 'C++', 'Swift',
  'React', 'Node.js', 'DevOps', 'Cloud', 'Modern CSS', 'AI Engineering'
];

function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeEntry(branch, year, subject, type, sem, extra = {}) {
  return {
    id: uuidv4(),
    title: extra.title || `${subject} - ${type} (Sentinel Archive)`,
    year: String(year),
    section: 'A',
    subject,
    type,
    module: extra.module || null,
    unit: extra.unit || null,
    branch,
    uploadedAt: new Date().toISOString(),
    filename: null,
    url: extra.url || `https://example.com/${encodeURIComponent(subject)}-${type}.pdf`,
    originalName: null,
    uploadedBy: 'sentinel-seeder',
    uploaderId: null,
    uploaderName: 'SENTINEL CORE',
    isAdvanced: extra.isAdvanced || false
  };
}

let all = [];

// 1. Seed Standard Curriculum
for (let year = 1; year <= 4; year++) {
  for (const branch of branches) {
    const sem1 = (year - 1) * 2 + 1;
    const sem2 = sem1 + 1;
    [sem1, sem2].forEach(sem => {
      const subjects = subjectsBySem[sem] || ['General Subject'];
      subjects.forEach((subj, idx) => {
        all.push(makeEntry(branch, year, subj, 'notes', sem, { module: String((idx % 2) + 1), unit: String((idx % 2) + 1) }));
        all.push(makeEntry(branch, year, subj, 'videos', sem, { module: String((idx % 2) + 1), url: `https://www.youtube.com/embed/example` }));
        if (Math.random() > 0.7) {
          all.push(makeEntry(branch, year, subj, 'modelPapers', sem, {}));
        }
      });
    });
  }
}

// 2. Seed Advanced Learning Track (High-Fidelity)
advancedTechs.forEach(tech => {
  // Add 3 Videos
  for (let i = 1; i <= 3; i++) {
    all.push(makeEntry('CSE', '3', tech, 'videos', '5', {
      title: `${tech} Mastery: Module ${i}`,
      isAdvanced: true,
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }));
  }
  // Add 2 Notes
  for (let i = 1; i <= 2; i++) {
    all.push(makeEntry('CSE', '3', tech, 'notes', '5', {
      title: `${tech} Technical Specification v${i}.0`,
      isAdvanced: true
    }));
  }
  // Add 3 Interview Q&A
  for (let i = 1; i <= 3; i++) {
    all.push(makeEntry('CSE', '3', tech, 'interviewQnA', '5', {
      title: `${tech} Elite Interview Intel - Sector ${i}`,
      isAdvanced: true
    }));
  }
});

// Deduplicate and Write
const byTitleUrl = new Map();
const deduped = all.filter(item => {
  const key = `${item.title}-${item.url}`;
  if (byTitleUrl.has(key)) return false;
  byTitleUrl.set(key, true);
  return true;
});

fs.writeFileSync(materialsFile, JSON.stringify(deduped, null, 2));
console.log(`🚀 SENTINEL CORE: Seeded ${deduped.length} materials into ${materialsFile}`);
