const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');

const detectBrand = (number) => {
  const n = (number || '').replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6/.test(n)) return 'discover';
  return 'visa';
};

exports.simulatePayment = async (req, res) => {
  try {
    const { bookingId, amount, methodId, type, splits, tip } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    let booking = null;
    if (bookingId) {
      booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
    }

    let cardBrand = '';
    let cardLast4 = '';
    if (methodId) {
      const user = await User.findById(req.user._id);
      const m = user.paymentMethods.id(methodId);
      if (m) { cardBrand = m.brand; cardLast4 = m.last4; }
    }

    const transactionId = 'TXN_' + crypto.randomBytes(8).toString('hex').toUpperCase();
    const payment = await Payment.create({
      user: req.user._id,
      booking: bookingId || undefined,
      amount: Number(amount) + Number(tip || 0),
      status: 'completed',
      transactionId,
      paymentMethod: cardBrand ? `${cardBrand.toUpperCase()} •••• ${cardLast4}` : 'Simulation',
      cardLast4,
      cardBrand,
      type: type || 'full',
      splits: Array.isArray(splits) ? splits : []
    });

    if (booking && type === 'deposit') {
      booking.depositPaid = true;
      await booking.save();
    }

    res.status(201).json({ message: 'Payment completed', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate({ path: 'booking', populate: { path: 'restaurant', select: 'name heroImage' } })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: 'booking', populate: { path: 'restaurant', select: 'name heroImage location' } });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    payment.status = 'refunded';
    await payment.save();
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ----- Saved payment methods -----
exports.listMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.paymentMethods || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMethod = async (req, res) => {
  try {
    const { number, holder, expMonth, expYear, isDefault } = req.body;
    const cleanNumber = (number || '').replace(/\D/g, '');
    if (cleanNumber.length < 12) return res.status(400).json({ message: 'Invalid card number' });

    const user = await User.findById(req.user._id);
    if (isDefault || user.paymentMethods.length === 0) {
      user.paymentMethods.forEach((m) => (m.isDefault = false));
    }
    user.paymentMethods.push({
      brand: detectBrand(cleanNumber),
      last4: cleanNumber.slice(-4),
      holder,
      expMonth: Number(expMonth),
      expYear: Number(expYear),
      isDefault: isDefault || user.paymentMethods.length === 0
    });
    await user.save();
    res.status(201).json(user.paymentMethods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setDefaultMethod = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let found = false;
    user.paymentMethods.forEach((m) => {
      if (m._id.toString() === req.params.methodId) { m.isDefault = true; found = true; }
      else m.isDefault = false;
    });
    if (!found) return res.status(404).json({ message: 'Method not found' });
    await user.save();
    res.json(user.paymentMethods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMethod = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const wasDefault = user.paymentMethods.find((m) => m._id.toString() === req.params.methodId)?.isDefault;
    user.paymentMethods = user.paymentMethods.filter((m) => m._id.toString() !== req.params.methodId);
    if (wasDefault && user.paymentMethods.length) user.paymentMethods[0].isDefault = true;
    await user.save();
    res.json(user.paymentMethods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
