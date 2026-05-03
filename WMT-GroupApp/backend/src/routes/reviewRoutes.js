const express = require('express');
const router = express.Router();
const c = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, c.addReview);
router.get('/my', protect, c.getMyReviews);
router.get('/all', protect, admin, c.adminListReviews);

router.put('/:id', protect, c.updateReview);
router.delete('/:id', protect, c.deleteReview);

router.post('/:id/helpful', protect, c.markHelpful);
router.post('/:id/report', protect, c.reportReview);
router.patch('/:id/hide', protect, admin, c.adminToggleHide);

router.get('/restaurant/:restaurantId', c.getRestaurantReviews);

module.exports = router;
