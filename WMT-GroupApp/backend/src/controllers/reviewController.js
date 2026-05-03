const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

const recalcRestaurant = async (restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) return;
  const reviews = await Review.find({ restaurant: restaurantId, hidden: { $ne: true } });
  restaurant.numReviews = reviews.length;
  restaurant.averageRating = reviews.length
    ? reviews.reduce((acc, r) => r.rating + acc, 0) / reviews.length
    : 0;
  await restaurant.save();
};

exports.addReview = async (req, res) => {
  try {
    const { restaurant: restaurantId, rating, comment, tags, photos } = req.body;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const existing = await Review.findOne({ user: req.user._id, restaurant: restaurantId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this restaurant' });

    const review = await Review.create({
      user: req.user._id,
      restaurant: restaurantId,
      rating: Number(rating),
      comment,
      tags: Array.isArray(tags) ? tags : [],
      photos: Array.isArray(photos) ? photos : []
    });

    await recalcRestaurant(restaurantId);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (req.body.rating !== undefined) review.rating = Number(req.body.rating);
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    if (req.body.tags !== undefined) review.tags = req.body.tags;
    if (req.body.photos !== undefined) review.photos = req.body.photos;
    await review.save();
    await recalcRestaurant(review.restaurant);
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const restaurantId = review.restaurant;
    await review.deleteOne();
    await recalcRestaurant(restaurantId);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const uid = req.user._id.toString();
    const idx = review.helpfulBy.findIndex((u) => u.toString() === uid);
    if (idx >= 0) {
      review.helpfulBy.splice(idx, 1);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulBy.push(req.user._id);
      review.helpfulCount += 1;
    }
    await review.save();
    res.json({ helpfulCount: review.helpfulCount, helpfulByMe: idx < 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.reportCount += 1;
    if (review.reportCount >= 5) review.hidden = true;
    await review.save();
    res.json({ reportCount: review.reportCount, hidden: review.hidden });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminListReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminToggleHide = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.hidden = !review.hidden;
    await review.save();
    await recalcRestaurant(review.restaurant);
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('restaurant', 'name location heroImage')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId, hidden: { $ne: true } })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
