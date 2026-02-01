const fs = require('fs');
const path = require('path');
const Roadmap = require('../models/Roadmap');
const PlacementCompany = require('../models/PlacementCompany');
const Material = require('../models/Material');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Message = require('../models/Message');
const { RESOURCE_MAP } = require('../dashboardConfig');

exports.syncLocalToCloud = async (req, res) => {
    const startTime = Date.now();
    const results = {
        roadmaps: 0,
        placements: 0,
        materials: 0,
        courses: 0,
        attendance: 0,
        messages: 0,
        errors: []
    };

    try {
        const getSyncPath = (key, defaultFilename) => {
            const primary = RESOURCE_MAP[key];
            if (primary && fs.existsSync(primary)) return primary;
            const fallback = path.join(__dirname, '../data', defaultFilename);
            if (fs.existsSync(fallback)) return fallback;
            return null;
        };

        // Standardized bulk sync helper
        const bulkSync = async (model, path, findQuery, transformFn) => {
            if (!path) return 0;
            const data = JSON.parse(fs.readFileSync(path, 'utf8'));
            const items = Array.isArray(data) ? data : [];
            if (items.length === 0) return 0;

            const operations = items.map(item => {
                const transformed = transformFn ? transformFn(item) : item;
                return {
                    updateOne: {
                        filter: findQuery(item),
                        update: transformed,
                        upsert: true
                    }
                };
            });

            const syncResult = await model.bulkWrite(operations);
            return syncResult.upsertedCount + syncResult.modifiedCount + syncResult.matchedCount;
        };

        // 1. Roadmaps
        results.roadmaps = await bulkSync(Roadmap, getSyncPath('roadmaps', 'roadmaps.json'), i => ({ slug: i.slug }));

        // 2. Placements
        results.placements = await bulkSync(PlacementCompany, getSyncPath('placements', 'placements.json'), i => ({ slug: i.slug }));

        // 3. Materials
        results.materials = await bulkSync(Material, getSyncPath('materials', 'materials.json'),
            i => ({ title: i.title, subject: i.subject }),
            i => {
                const item = { ...i };
                delete item._id; delete item.id;
                if (!item.fileUrl) item.fileUrl = item.url || 'https://placeholder.com';
                return item;
            }
        );

        // 4. Courses
        results.courses = await bulkSync(Course, getSyncPath('courses', 'courses.json'),
            i => ({ code: i.code || i.courseCode }),
            i => {
                if (i.courseCode && !i.code) i.code = i.courseCode;
                return i;
            }
        );

        // 5. Attendance
        results.attendance = await bulkSync(Attendance, getSyncPath('attendance', 'attendance.json'),
            i => ({ studentId: i.studentId, subject: i.subject, date: i.date }),
            i => {
                const item = {
                    ...i,
                    year: i.year || '1', section: i.section || 'A',
                    branch: i.branch || 'CSE', facultyId: i.facultyId || 'admin'
                };
                delete item._id; delete item.id;
                return item;
            }
        );

        // 6. Messages
        results.messages = await bulkSync(Message, getSyncPath('messages', 'messages.json'),
            i => ({ message: i.message, createdAt: i.createdAt || i.date }),
            i => {
                const item = { ...i, target: i.target || 'all', createdAt: i.createdAt || i.date || new Date().toISOString() };
                delete item._id; delete item.id;
                return item;
            }
        );

        const totalTime = Date.now() - startTime;
        console.log(`[Sync] High-speed migration complete in ${totalTime}ms. Results:`, results);
        res.json({ message: 'Migration successful (High Performance Mode)', results, timeMs: totalTime });
    } catch (err) {
        console.error('Migration failed:', err);
        res.status(500).json({ error: 'Migration failed', details: err.message });
    }
};
