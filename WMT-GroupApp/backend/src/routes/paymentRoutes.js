const express = require('express');
const router = express.Router();
const { simulatePayment, getMyPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, simulatePayment);
router.get('/my', protect, getMyPayments);

module.exports = router;
