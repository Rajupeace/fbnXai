const express = require('express');
const router = express.Router();
const Roadmap = require('../models/Roadmap');

// @route   GET /api/roadmaps
// @desc    Get all learning roadmaps
// @access  Public (or Protected)
router.get('/', async (req, res) => {
    try {
        const roadmaps = await Roadmap.find().sort({ title: 1 });
        res.json(roadmaps);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/roadmaps/:slug
// @desc    Get single roadmap by slug
router.get('/:slug', async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({ slug: req.params.slug });
        if (!roadmap) {
            return res.status(404).json({ msg: 'Roadmap not found' });
        }
        res.json(roadmap);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
