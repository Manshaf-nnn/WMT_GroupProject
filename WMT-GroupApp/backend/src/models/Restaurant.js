const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  tags: [{ type: String }]
}, { _id: true });

const menuSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: [menuItemSchema]
}, { _id: true });

const hoursSchema = new mongoose.Schema({
  day: { type: String, required: true },
  open: { type: String, default: '11:00' },
  close: { type: String, default: '23:00' },
  closed: { type: Boolean, default: false }
}, { _id: false });

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Restaurant name is required'], trim: true },
  cuisine: { type: String, required: [true, 'Cuisine type is required'] },
  location: { type: String, required: [true, 'Location is required'] },
  address: { type: String, default: '' },
  city: { type: String, default: 'New York' },
  priceRange: { type: String, enum: ['$', '$$', '$$$', '$$$$'], required: true },
  images: [{ type: String }],
  heroImage: { type: String, default: '' },
  description: { type: String, required: true },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  tags: [{ type: String }],
  menu: [menuSectionSchema],
  hours: [hoursSchema],
  capacity: { type: Number, default: 60 },
  depositRequired: { type: Boolean, default: false },
  depositAmount: { type: Number, default: 0 },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
