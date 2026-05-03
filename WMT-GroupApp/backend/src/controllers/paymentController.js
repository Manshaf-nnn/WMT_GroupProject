const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const crypto = require('crypto');

// @desc    Simulate a payment for a booking
// @route   POST /api/payments
// @access  Private
exports.simulatePayment = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Simulate success
    const transactionId = 'SIM_' + crypto.randomBytes(8).toString('hex');

    const payment = new Payment({
      user: req.user._id,
      booking: bookingId,
      amount,
      status: 'completed',
      transactionId,
      paymentMethod: 'Simulation'
    });

    await payment.save();

    res.status(201).json({
      message: 'Payment simulated successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my payment history
// @route   GET /api/payments/my
// @access  Private
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate({
        path: 'booking',
        populate: { path: 'restaurant', select: 'name' }
      });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
