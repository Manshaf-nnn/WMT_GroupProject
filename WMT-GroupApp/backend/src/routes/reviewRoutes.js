const express = require('express');
const router = express.Router();
const { addReview, getRestaurantReviews, getMyReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addReview);
router.get('/my', protect, getMyReviews);
router.get('/:restaurantId', getRestaurantReviews);

module.exports = router;
