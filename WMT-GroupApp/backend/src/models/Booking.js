const mongoose = require('mongoose');
const crypto = require('crypto');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed', 'waitlist'],
    default: 'pending'
  },
  specialRequests: { type: String, default: '' },
  occasion: { type: String, default: '' },
  tableNumber: { type: String, default: '' },
  checkInCode: {
    type: String,
    default: function () { return crypto.randomBytes(4).toString('hex').toUpperCase(); }
  },
  checkedIn: { type: Boolean, default: false },
  depositPaid: { type: Boolean, default: false },
  totalAmount: { type: Number, default: 0 },
  groupInviteCode: { type: String, default: '' },
  groupConfirmedBy: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
