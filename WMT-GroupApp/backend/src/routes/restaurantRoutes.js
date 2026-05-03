const express = require('express');
const router = express.Router();
const { 
  getRestaurants, 
  getRestaurantById, 
  createRestaurant, 
  updateRestaurant, 
  deleteRestaurant 
} = require('../controllers/restaurantController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getRestaurants)
  .post(protect, admin, createRestaurant);

router.route('/:id')
  .get(getRestaurantById)
  .put(protect, admin, updateRestaurant)
  .delete(protect, admin, deleteRestaurant);

module.exports = router;
