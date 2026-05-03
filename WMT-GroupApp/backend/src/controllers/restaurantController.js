const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');

exports.getRestaurants = async (req, res) => {
  try {
    const { cuisine, location, priceRange, search, featured, minRating } = req.query;
    let query = {};

    if (cuisine) query.cuisine = cuisine;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (priceRange) query.priceRange = priceRange;
    if (featured === 'true') query.featured = true;
    if (minRating) query.averageRating = { $gte: Number(minRating) };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const restaurants = await Restaurant.find(query).populate('admin', 'name');
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('admin', 'name');
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCuisines = async (req, res) => {
  try {
    const cuisines = await Restaurant.distinct('cuisine');
    res.json(cuisines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRestaurant = async (req, res) => {
  try {
    const payload = { ...req.body, admin: req.user._id };
    if (Array.isArray(payload.images) && payload.images.length && !payload.heroImage) {
      payload.heroImage = payload.images[0];
    }
    const restaurant = await Restaurant.create(payload);
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (restaurant.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const fields = ['name', 'cuisine', 'location', 'address', 'city', 'priceRange', 'description', 'images', 'heroImage', 'featured', 'tags', 'menu', 'hours', 'capacity', 'depositRequired', 'depositAmount'];
    fields.forEach((f) => { if (req.body[f] !== undefined) restaurant[f] = req.body[f]; });

    const updated = await restaurant.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (restaurant.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Promise.all([
      Review.deleteMany({ restaurant: restaurant._id }),
      restaurant.deleteOne()
    ]);
    res.json({ message: 'Restaurant removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
