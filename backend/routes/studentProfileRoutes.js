const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// All profile routes depend on student SID
router.get('/:id', studentController.getStudentProfile);
router.put('/:id', studentController.updateStudentProfile);

module.exports = router;
