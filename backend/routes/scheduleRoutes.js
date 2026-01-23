const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');

const dbFile = require('../dbHelper');

// Get all schedules (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { year, section, branch, day, semester, faculty } = req.query;

        let query = {};
        if (year) query.year = year;
        if (section) query.section = section;
        if (branch) query.branch = branch;
        if (day) query.day = day;
        if (semester) query.semester = semester;

        // Match faculty name slightly loosely if needed, or exact
        if (faculty) {
            query.faculty = { $regex: new RegExp(faculty, 'i') };
        }

        const schedules = await Schedule.find(query).sort({ day: 1, time: 1 });
        res.json(schedules);
    } catch (error) {
        console.error('MongoDB Schedule fetch failed, trying file DB:', error.message);
        try {
            let all = dbFile('schedule').read() || [];

            // Apply Filters manually
            const { year, section, branch, day, semester, faculty } = req.query;
            if (year) all = all.filter(s => s.year === year);
            if (section) all = all.filter(s => s.section === section);
            if (branch) all = all.filter(s => s.branch === branch);
            if (day) all = all.filter(s => s.day === day);
            if (semester) all = all.filter(s => s.semester === semester);
            if (faculty) all = all.filter(s => s.faculty && s.faculty.toLowerCase().includes(faculty.toLowerCase()));

            res.json(all);
        } catch (fileErr) {
            console.error('[SCHEDULE FETCH ERROR]:', fileErr);
            res.status(500).json({ error: 'Failed to fetch schedules', details: fileErr.message });
        }
    }
});

// Get schedule by ID
router.get('/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        res.json(schedule);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

// Create new schedule entry
router.post('/', async (req, res) => {
    try {
        const scheduleData = {
            ...req.body,
            createdBy: req.body.adminId || 'admin'
        };

        const schedule = new Schedule(scheduleData);
        await schedule.save();

        res.status(201).json(schedule);
    } catch (error) {
        console.error('MongoDB Schedule save failed, trying file DB:', error.message);
        try {
            const all = dbFile('schedule').read() || [];
            const newItem = {
                ...req.body,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            all.push(newItem);
            dbFile('schedule').write(all);
            res.status(201).json(newItem);
        } catch (fileErr) {
            res.status(500).json({ error: 'Failed to create schedule', details: error.message });
        }
    }
});

// Update schedule
router.put('/:id', async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: req.body.adminId || 'admin'
        };

        const schedule = await Schedule.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        res.json(schedule);
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ error: 'Failed to update schedule', details: error.message });
    }
});

// Delete schedule
router.delete('/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndDelete(req.params.id);

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        res.json({ message: 'Schedule deleted successfully', schedule });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});

// Bulk create schedules (for importing timetables)
router.post('/bulk', async (req, res) => {
    try {
        const { schedules, adminId } = req.body;

        if (!Array.isArray(schedules)) {
            return res.status(400).json({ error: 'Schedules must be an array' });
        }

        const schedulesWithMeta = schedules.map(s => ({
            ...s,
            createdBy: adminId || 'admin'
        }));

        const result = await Schedule.insertMany(schedulesWithMeta);
        res.status(201).json({
            message: `${result.length} schedules created successfully`,
            schedules: result
        });
    } catch (error) {
        console.error('Error bulk creating schedules:', error);
        res.status(500).json({ error: 'Failed to bulk create schedules', details: error.message });
    }
});

// Delete all schedules for a specific class (year, section, branch)
router.delete('/class/:year/:section/:branch', async (req, res) => {
    try {
        const { year, section, branch } = req.params;

        const result = await Schedule.deleteMany({ year, section, branch });

        res.json({
            message: `Deleted ${result.deletedCount} schedules for Year ${year}, Section ${section}, Branch ${branch}`
        });
    } catch (error) {
        console.error('Error deleting class schedules:', error);
        res.status(500).json({ error: 'Failed to delete class schedules' });
    }
});

module.exports = router;
