const express = require('express');
const router = express.Router();
const c = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, c.simulatePayment);
router.get('/my', protect, c.getMyPayments);
router.get('/methods', protect, c.listMethods);
router.post('/methods', protect, c.addMethod);
router.patch('/methods/:methodId/default', protect, c.setDefaultMethod);
router.delete('/methods/:methodId', protect, c.deleteMethod);

router.get('/:id', protect, c.getPaymentById);
router.post('/:id/refund', protect, c.refundPayment);

module.exports = router;
