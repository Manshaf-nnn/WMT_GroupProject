const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminExists = await User.findOne({ email: 'admin@luxury.com' });
    
    if (adminExists) {
      console.log('✅ Admin already exists.');
      process.exit();
    }

    const admin = new User({
      name: 'System Admin',
      email: 'admin@luxury.com',
      password: 'admin1234',
      role: 'admin'
    });

    await admin.save();
    console.log('🚀 Super Admin Created Successfully!');
    console.log('Email: admin@luxury.com');
    console.log('Pass: admin1234');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
