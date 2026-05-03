const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  line1: { type: String, required: true },
  line2: { type: String, default: '' },
  city: { type: String, required: true },
  postalCode: { type: String, default: '' },
  country: { type: String, default: 'United States' },
  isDefault: { type: Boolean, default: false }
}, { _id: true, timestamps: false });

const paymentMethodSchema = new mongoose.Schema({
  brand: { type: String, enum: ['visa', 'mastercard', 'amex', 'discover'], default: 'visa' },
  last4: { type: String, required: true },
  holder: { type: String, required: true },
  expMonth: { type: Number, required: true, min: 1, max: 12 },
  expYear: { type: Number, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true, timestamps: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profileImage: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  },
  phone: { type: String, default: '' },
  dietaryPreferences: [{ type: String }],
  favoriteCuisines: [{ type: String }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  addresses: [addressSchema],
  paymentMethods: [paymentMethodSchema],
  totalBookings: { type: Number, default: 0 },
  totalSpend: { type: Number, default: 0 },
  loyaltyTier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  suspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.recalculateTier = function() {
  const spend = this.totalSpend || 0;
  if (spend >= 5000) this.loyaltyTier = 'Platinum';
  else if (spend >= 2000) this.loyaltyTier = 'Gold';
  else if (spend >= 500) this.loyaltyTier = 'Silver';
  else this.loyaltyTier = 'Bronze';
};

module.exports = mongoose.model('User', userSchema);
