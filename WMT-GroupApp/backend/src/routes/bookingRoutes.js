const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getMyBookings, 
  getAllBookings, 
  updateBookingStatus, 
  cancelBooking 
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createBooking)
  .get(protect, admin, getAllBookings);

router.get('/my', protect, getMyBookings);

router.route('/:id')
  .patch(protect, admin, updateBookingStatus)
  .delete(protect, cancelBooking);

module.exports = router;
