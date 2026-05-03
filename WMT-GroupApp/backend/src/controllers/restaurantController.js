const Restaurant = require('../models/Restaurant');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
  try {
    const { cuisine, location, priceRange, search } = req.query;
    let query = {};

    if (cuisine) query.cuisine = cuisine;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (priceRange) query.priceRange = priceRange;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const restaurants = await Restaurant.find(query).populate('admin', 'name');
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('admin', 'name');
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
exports.createRestaurant = async (req, res) => {
  try {
    const { name, cuisine, location, priceRange, description, images } = req.body;

    const restaurant = new Restaurant({
      name,
      cuisine,
      location,
      priceRange,
      description,
      images: images || [],
      admin: req.user._id
    });

    const createdRestaurant = await restaurant.save();
    res.status(201).json(createdRestaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (restaurant) {
      if (restaurant.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to update this restaurant' });
      }

      restaurant.name = req.body.name || restaurant.name;
      restaurant.cuisine = req.body.cuisine || restaurant.cuisine;
      restaurant.location = req.body.location || restaurant.location;
      restaurant.priceRange = req.body.priceRange || restaurant.priceRange;
      restaurant.description = req.body.description || restaurant.description;
      restaurant.images = req.body.images || restaurant.images;

      const updatedRestaurant = await restaurant.save();
      res.json(updatedRestaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (restaurant) {
      if (restaurant.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to delete this restaurant' });
      }

      await restaurant.deleteOne();
      res.json({ message: 'Restaurant removed' });
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
