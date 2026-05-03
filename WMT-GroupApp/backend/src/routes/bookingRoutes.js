const express = require('express');
const router = express.Router();
const c = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, c.createBooking)
  .get(protect, admin, c.getAllBookings);

router.get('/my', protect, c.getMyBookings);

router.route('/:id')
  .get(protect, c.getBookingById)
  .put(protect, c.updateMyBooking)
  .patch(protect, admin, c.updateBookingStatus)
  .delete(protect, c.cancelBooking);

router.post('/:id/check-in', protect, c.checkInBooking);

module.exports = router;
