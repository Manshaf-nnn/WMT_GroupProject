const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

exports.autoSeed = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;

    const count = await Restaurant.countDocuments();
    if (count > 0) return; 

    console.log('🌱 Database is empty. Starting Auto-Seed...');

    // 1. Ensure Admin exists
    let admin = await User.findOne({ email: 'admin@luxury.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@luxury.com',
        password: 'admin1234',
        role: 'admin'
      });
      console.log('👤 Admin Created');
    }

    // 2. Create Restaurants linked to this admin
    const restaurants = [
      {
        name: 'The Golden Palace',
        description: 'An exquisite fine-dining experience featuring royal cuisines and gold-leaf desserts.',
        location: 'Downtown, Floor 52',
        cuisine: 'International',
        priceRange: '$$$$',
        averageRating: 4.9,
        admin: admin._id
      },
      {
        name: 'Azure Seafood Grill',
        description: 'Fresh seafood caught daily, served with a stunning ocean view.',
        location: 'Bayfront Harbor',
        cuisine: 'Seafood',
        priceRange: '$$$',
        averageRating: 4.7,
        admin: admin._id
      },
      {
        name: 'Street Luxury Tacos',
        description: 'Gourmet street food experience with premium wagyu beef and handmade tortillas.',
        location: 'East Side Market',
        cuisine: 'Mexican',
        priceRange: '$',
        averageRating: 4.5,
        admin: admin._id
      },
      {
        name: 'Little Italy Bistro',
        description: 'Cozy and authentic Italian pasta house with a selection of fine house wines.',
        location: 'South Square',
        cuisine: 'Italian',
        priceRange: '$$',
        averageRating: 4.3,
        admin: admin._id
      }
    ];

    await Restaurant.insertMany(restaurants);
    console.log('🍽️  Luxury Restaurants Auto-Seeded!');
    console.log('✅ Auto-Seed Complete.');
  } catch (error) {
    console.error('❌ Auto-Seed Failed:', error.message);
  }
};
