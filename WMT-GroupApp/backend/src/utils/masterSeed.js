const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedDatabase = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!');

    // 1. Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});

    // 2. Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@luxury.com',
      password: 'admin1234',
      role: 'admin'
    });
    console.log('👤 Admin Created: admin@luxury.com / admin1234');

    // 3. Create Sample Restaurants
    const restaurants = [
      {
        name: 'The Golden Palace',
        description: 'An exquisite fine-dining experience featuring royal cuisines and gold-leaf desserts.',
        location: 'Downtown, Floor 52',
        cuisine: 'International Fine Dining',
        priceRange: '$$$$',
        averageRating: 4.9
      },
      {
        name: 'Azure Seafood Grill',
        description: 'Fresh seafood caught daily, served with a stunning ocean view.',
        location: 'Bayfront Harbor',
        cuisine: 'Seafood',
        priceRange: '$$$',
        averageRating: 4.7
      },
      {
        name: 'The Velvet Room',
        description: 'A cozy, high-end steakhouse with live jazz and premium cuts.',
        location: 'West End District',
        cuisine: 'Steakhouse',
        priceRange: '$$$$',
        averageRating: 4.8
      }
    ];

    await Restaurant.insertMany(restaurants);
    console.log('🍽️ ' + restaurants.length + ' Restaurants Added!');

    console.log('🚀 DATABASE IS NOW READY!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
