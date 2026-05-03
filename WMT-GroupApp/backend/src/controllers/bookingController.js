const crypto = require('crypto');
const Booking = require('../models/Booking');
const Restaurant = require('../models/Restaurant');

exports.createBooking = async (req, res) => {
  try {
    const { restaurant, date, time, guests, specialRequests, occasion, totalAmount, isGroup } = req.body;

    const r = await Restaurant.findById(restaurant);
    if (!r) return res.status(404).json({ message: 'Restaurant not found' });

    const slotBooked = await Booking.countDocuments({
      restaurant, date: new Date(date), time,
      status: { $in: ['pending', 'approved'] }
    });
    let status = 'pending';
    if (r.capacity && slotBooked * 2 >= r.capacity) status = 'waitlist';

    const booking = await Booking.create({
      user: req.user._id,
      restaurant,
      date,
      time,
      guests,
      specialRequests: specialRequests || '',
      occasion: occasion || '',
      totalAmount: totalAmount || 0,
      status,
      groupInviteCode: isGroup ? crypto.randomBytes(4).toString('hex').toUpperCase() : ''
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('restaurant', 'name location heroImage images averageRating priceRange cuisine')
      .sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('restaurant', 'name location heroImage images averageRating priceRange cuisine address city')
      .populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (['cancelled', 'completed', 'rejected'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot modify a finalized booking' });
    }

    ['date', 'time', 'guests', 'specialRequests', 'occasion'].forEach((f) => {
      if (req.body[f] !== undefined) booking[f] = req.body[f];
    });
    const updated = await booking.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkInBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.checkedIn = true;
    booking.status = 'completed';
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.body.status) booking.status = req.body.status;
    if (req.body.tableNumber !== undefined) booking.tableNumber = req.body.tableNumber;
    const updated = await booking.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
