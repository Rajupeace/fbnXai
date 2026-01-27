const express = require('express');
const router = express.Router();
const StudentData = require('../models/StudentData');
const { protect } = require('../middleware/authMiddleware');

// Get student data
router.get('/:studentId', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        let studentData = await StudentData.findOne({ studentId })
            .populate('studentId', 'name email rollNumber');
        
        if (!studentData) {
            studentData = new StudentData({ studentId });
            await studentData.save();
        }
        
        res.json(studentData);
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create student data
router.post('/', protect, async (req, res) => {
    try {
        const studentData = new StudentData(req.body);
        await studentData.save();
        try { global.broadcastEvent && global.broadcastEvent({ resource: 'studentData', action: 'create', data: { studentId: studentData.studentId } }); } catch (e) {}
        res.status(201).json(studentData);
    } catch (error) {
        console.error('Error creating student data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update student data
router.put('/:studentId', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const studentData = await StudentData.findOneAndUpdate(
            { studentId },
            { ...req.body, updatedAt: new Date() },
            { new: true, upsert: true }
        );
        try { global.broadcastEvent && global.broadcastEvent({ resource: 'studentData', action: 'update', data: { studentId } }); } catch (e) {}
        res.json(studentData);
    } catch (error) {
        console.error('Error updating student data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update student section data
router.put('/:studentId/section/:sectionName', protect, async (req, res) => {
    try {
        const { studentId, sectionName } = req.params;
        const updateData = {
            [`sections.${sectionName}`]: req.body,
            updatedAt: new Date()
        };
        
        const studentData = await StudentData.findOneAndUpdate(
            { studentId },
            updateData,
            { new: true }
        );
        
        res.json(studentData);
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific section data
router.get('/:studentId/section/:sectionName', protect, async (req, res) => {
    try {
        const { studentId, sectionName } = req.params;
        const studentData = await StudentData.findOne({ studentId });
        
        if (!studentData) {
            return res.status(404).json({ error: 'Student data not found' });
        }
        
        const sectionData = studentData.sections[sectionName];
        res.json(sectionData || {});
    } catch (error) {
        console.error('Error fetching section:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update student progress (streak, aiUsageCount, tasksCompleted, etc.)
router.put('/:studentId/progress', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { streak, aiUsageCount, tasksCompleted, advancedProgress } = req.body;
        
        const studentData = await StudentData.findOne({ studentId });
        
        if (!studentData) {
            return res.status(404).json({ error: 'Student data not found' });
        }
        
        // Update progress fields
        if (streak !== undefined) studentData.progress.streak = streak;
        if (aiUsageCount !== undefined) studentData.progress.aiUsageCount = aiUsageCount;
        if (tasksCompleted !== undefined) studentData.progress.tasksCompleted = tasksCompleted;
        if (advancedProgress !== undefined) studentData.progress.advancedProgress = advancedProgress;
        
        studentData.progress.lastUpdated = new Date();
        await studentData.save();
        
        res.json(studentData.progress);
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get student progress
router.get('/:studentId/progress', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const studentData = await StudentData.findOne({ studentId });
        
        if (!studentData) {
            return res.status(404).json({ error: 'Student data not found' });
        }
        
        res.json(studentData.progress);
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update attendance
router.post('/:studentId/attendance', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const studentData = await StudentData.findOne({ studentId });
        
        if (!studentData) {
            return res.status(404).json({ error: 'Student data not found' });
        }
        
        const { status } = req.body;
        
        studentData.sections.attendance.attendanceRecords.push(req.body);
        studentData.sections.attendance.totalClasses += 1;
        
        if (status === 'Present') {
            studentData.sections.attendance.totalPresent += 1;
        } else if (status === 'Absent') {
            studentData.sections.attendance.totalAbsent += 1;
        }
        
        studentData.sections.attendance.attendancePercentage = 
            Math.round((studentData.sections.attendance.totalPresent / 
            studentData.sections.attendance.totalClasses) * 100);
        
        await studentData.save();
        try { global.broadcastEvent && global.broadcastEvent({ resource: 'attendance', action: 'update', data: { studentId, attendance: studentData.sections.attendance } }); } catch (e) {}
        res.json(studentData.sections.attendance);
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send chat message
router.post('/:studentId/chat', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { message, role } = req.body;
        
        const studentData = await StudentData.findOne({ studentId });
        
        if (!studentData) {
            return res.status(404).json({ error: 'Student data not found' });
        }
        
        studentData.sections.chat.conversationHistory.push({
            role,
            message,
            timestamp: new Date(),
            helpful: null
        });
        
        studentData.sections.chat.totalChats += 1;
        await studentData.save();
        try { global.broadcastEvent && global.broadcastEvent({ resource: 'chat', action: 'create', data: { studentId, message: { role, message, timestamp: new Date() } } }); } catch (e) {}
        res.json(studentData.sections.chat);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get student chat history
router.get('/:studentId/chat', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const studentData = await StudentData.findOne({ studentId });
        
        if (!studentData) {
            return res.status(404).json({ error: 'Student data not found' });
        }
        
        res.json(studentData.sections.chat);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get student dashboard overview
router.get('/:studentId/dashboard', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const studentData = await StudentData.findOne({ studentId });
        
        if (!studentData) {
            return res.status(404).json({ error: 'Student data not found' });
        }
        
        const overview = {
            studentInfo: {
                name: studentData.name,
                rollNumber: studentData.rollNumber,
                branch: studentData.branch,
                currentSemester: studentData.currentSemester
            },
            overview: studentData.sections.overview,
            progress: studentData.progress,
            statistics: studentData.statistics,
            recentActivity: studentData.activityLog.slice(-5)
        };
        
        res.json(overview);
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add activity log
router.post('/:studentId/activity', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const studentData = await StudentData.findOneAndUpdate(
            { studentId },
            { 
                $push: { activityLog: req.body },
                updatedAt: new Date()
            },
            { new: true }
        );
        try { global.broadcastEvent && global.broadcastEvent({ resource: 'activity', action: 'create', data: { studentId, activity: req.body } }); } catch (e) {}
        res.json(studentData);
    } catch (error) {
        console.error('Error adding activity:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete student data
router.delete('/:studentId', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        await StudentData.findOneAndDelete({ studentId });
        res.json({ message: 'Student data deleted successfully' });
    } catch (error) {
        console.error('Error deleting student data:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
