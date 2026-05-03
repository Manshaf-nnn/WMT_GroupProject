const mongoose = require('mongoose');

const splitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  paid: { type: Boolean, default: false }
}, { _id: true });

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: false },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String, unique: true, required: true },
  paymentMethod: { type: String, default: 'Simulation' },
  cardLast4: { type: String, default: '' },
  cardBrand: { type: String, default: '' },
  type: { type: String, enum: ['deposit', 'full', 'tip'], default: 'full' },
  splits: [splitSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
