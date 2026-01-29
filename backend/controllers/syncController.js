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
        // Helper to find file in RESOURCE_MAP or fallback to backend/data
        const getSyncPath = (key, defaultFilename) => {
            const primary = RESOURCE_MAP[key];
            if (primary && fs.existsSync(primary)) return primary;

            const fallback = path.join(__dirname, '../data', defaultFilename);
            if (fs.existsSync(fallback)) return fallback;

            return null;
        };

        // 1. Sync Roadmaps
        const roadmapPath = getSyncPath('roadmaps', 'roadmaps.json');
        if (roadmapPath) {
            const data = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));
            for (const item of (Array.isArray(data) ? data : [])) {
                await Roadmap.findOneAndUpdate({ slug: item.slug }, item, { upsert: true });
                results.roadmaps++;
            }
        }

        // 2. Sync Placement Companies
        const placementPath = getSyncPath('placements', 'placements.json');
        if (placementPath) {
            const data = JSON.parse(fs.readFileSync(placementPath, 'utf8'));
            for (const item of (Array.isArray(data) ? data : [])) {
                await PlacementCompany.findOneAndUpdate({ slug: item.slug }, item, { upsert: true });
                results.placements++;
            }
        }

        // 3. Sync Materials (Metdata ONLY)
        const materialPath = getSyncPath('materials', 'materials.json');
        if (materialPath) {
            const data = JSON.parse(fs.readFileSync(materialPath, 'utf8'));
            for (const item of (Array.isArray(data) ? data : [])) {
                // Map local ID to _id if needed
                delete item._id;
                delete item.id;

                // Ensure fileUrl exists (Model requires it)
                if (!item.fileUrl && item.url) item.fileUrl = item.url;
                if (!item.fileUrl) item.fileUrl = 'https://placeholder.com'; // Fallback for strict mode

                await Material.findOneAndUpdate({ title: item.title, subject: item.subject }, item, { upsert: true });
                results.materials++;
            }
        }

        // 4. Sync Courses
        const coursePath = getSyncPath('courses', 'courses.json');
        if (coursePath) {
            const data = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
            for (const item of (Array.isArray(data) ? data : [])) {
                // Map courseCode to code
                const searchCode = item.code || item.courseCode;
                if (item.courseCode && !item.code) item.code = item.courseCode;

                await Course.findOneAndUpdate({ code: searchCode }, item, { upsert: true });
                results.courses++;
            }
        }

        // 5. Sync Attendance (Legacy fallback)
        const attendancePath = getSyncPath('attendance', 'attendance.json');
        if (attendancePath) {
            const data = JSON.parse(fs.readFileSync(attendancePath, 'utf8'));
            for (const item of (Array.isArray(data) ? data : [])) {
                if (!item.studentId || !item.subject || !item.date) continue;
                // Ensure required defaults
                const attendanceData = {
                    ...item,
                    year: item.year || '1',
                    section: item.section || 'A',
                    branch: item.branch || 'CSE',
                    facultyId: item.facultyId || 'admin'
                };
                delete attendanceData.id;
                delete attendanceData._id;

                await Attendance.findOneAndUpdate(
                    { studentId: item.studentId, subject: item.subject, date: item.date },
                    attendanceData,
                    { upsert: true }
                );
                results.attendance++;
            }
        }

        // 6. Sync Messages (Broadcasts)
        const messagePath = getSyncPath('messages', 'messages.json');
        if (messagePath) {
            const data = JSON.parse(fs.readFileSync(messagePath, 'utf8'));
            for (const item of (Array.isArray(data) ? data : [])) {
                if (!item.message) continue;
                const msgData = {
                    ...item,
                    target: item.target || 'all',
                    createdAt: item.createdAt || item.date || new Date().toISOString()
                };
                delete msgData.id;
                delete msgData._id;

                await Message.findOneAndUpdate(
                    { message: item.message, createdAt: msgData.createdAt },
                    msgData,
                    { upsert: true }
                );
                results.messages++;
            }
        }

        console.log('[Sync] Migration results:', results);
        res.json({ message: 'Migration successful', results });
    } catch (err) {
        console.error('Migration failed:', err);
        res.status(500).json({ error: 'Migration failed', details: err.message });
    }
};
