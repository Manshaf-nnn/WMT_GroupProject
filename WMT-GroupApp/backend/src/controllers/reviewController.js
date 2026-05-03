const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

// @desc    Add a review to a restaurant
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { restaurant: restaurantId, rating, comment } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      restaurant: restaurantId
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Restaurant already reviewed' });
    }

    const review = new Review({
      user: req.user._id,
      restaurant: restaurantId,
      rating: Number(rating),
      comment
    });

    await review.save();

    // Update restaurant average rating
    const reviews = await Review.find({ restaurant: restaurantId });
    restaurant.numReviews = reviews.length;
    restaurant.averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await restaurant.save();

    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews by current user
// @route   GET /api/reviews/my
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('restaurant', 'name location');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/:restaurantId
// @access  Public
exports.getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('user', 'name profileImage');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
