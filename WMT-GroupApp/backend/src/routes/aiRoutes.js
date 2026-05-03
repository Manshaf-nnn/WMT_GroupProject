const express = require('express');
const router = express.Router();
const { recommend } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/recommend', protect, recommend);

module.exports = router;
