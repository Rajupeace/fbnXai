const express = require('express');
const router = express.Router();
const PlacementCompany = require('../models/PlacementCompany');

// Get All Companies
router.get('/', async (req, res) => {
    try {
        const companies = await PlacementCompany.find({}).sort({ name: 1 });
        res.json(companies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Company by Slug or ID
router.get('/:id', async (req, res) => {
    try {
        let company;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            company = await PlacementCompany.findById(req.params.id);
        } else {
            company = await PlacementCompany.findOne({ slug: req.params.id });
        }

        if (!company) return res.status(404).json({ error: 'Company not found' });
        res.json(company);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
