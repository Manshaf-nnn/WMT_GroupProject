const express = require('express');
const router = express.Router();
const c = require('../controllers/restaurantController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/cuisines', c.getCuisines);

router.route('/')
  .get(c.getRestaurants)
  .post(protect, admin, c.createRestaurant);

router.route('/:id')
  .get(c.getRestaurantById)
  .put(protect, admin, c.updateRestaurant)
  .delete(protect, admin, c.deleteRestaurant);

module.exports = router;
