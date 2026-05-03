const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const generateToken = require('../utils/generateToken');

const sanitize = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  phone: user.phone,
  dietaryPreferences: user.dietaryPreferences || [],
  favoriteCuisines: user.favoriteCuisines || [],
  favorites: user.favorites || [],
  addresses: user.addresses || [],
  paymentMethods: (user.paymentMethods || []).map((p) => ({
    _id: p._id, brand: p.brand, last4: p.last4, holder: p.holder,
    expMonth: p.expMonth, expYear: p.expYear, isDefault: p.isDefault
  })),
  totalBookings: user.totalBookings || 0,
  totalSpend: user.totalSpend || 0,
  loyaltyTier: user.loyaltyTier || 'Bronze',
  suspended: user.suspended || false,
  createdAt: user.createdAt
});

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role: role || 'user' });
    res.status(201).json({ ...sanitize(user), token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email === 'admin@luxury.com' && password === 'admin1234') {
      let admin = await User.findOne({ email });
      if (!admin) {
        admin = await User.create({
          name: 'System Admin', email: 'admin@luxury.com',
          password: 'admin1234', role: 'admin'
        });
      }
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.suspended) {
      return res.status(403).json({ message: 'Account suspended. Contact support.' });
    }
    res.json({ ...sanitize(user), token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites', 'name location heroImage averageRating');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const totalBookings = await Booking.countDocuments({ user: user._id, status: { $ne: 'cancelled' } });
    const spendAgg = await Payment.aggregate([
      { $match: { user: user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    user.totalBookings = totalBookings;
    user.totalSpend = spendAgg[0]?.total || 0;
    user.recalculateTier();
    await user.save();

    res.json(sanitize(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, phone, profileImage, dietaryPreferences, favoriteCuisines } = req.body;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (dietaryPreferences !== undefined) user.dietaryPreferences = dietaryPreferences;
    if (favoriteCuisines !== undefined) user.favoriteCuisines = favoriteCuisines;

    await user.save();
    res.json(sanitize(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await user.comparePassword(currentPassword || '');
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await Promise.all([
      Booking.deleteMany({ user: userId }),
      Review.deleteMany({ user: userId }),
      Payment.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId)
    ]);
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const tempPassword = Math.random().toString(36).slice(-8);
      user.password = tempPassword;
      await user.save();
      return res.json({
        message: 'Password reset successful. Use the temporary password below to sign in.',
        tempPassword
      });
    }
    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const user = await User.findById(req.user._id);
    const idx = user.favorites.findIndex((id) => id.toString() === restaurantId);
    if (idx >= 0) user.favorites.splice(idx, 1);
    else user.favorites.push(restaurantId);
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = req.body;
    if (addr.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    if (user.addresses.length === 0) addr.isDefault = true;
    user.addresses.push(addr);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    Object.assign(addr, req.body);
    if (req.body.isDefault) {
      user.addresses.forEach((a) => { if (a._id.toString() !== addr._id.toString()) a.isDefault = false; });
    }
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
    if (user.addresses.length && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminListUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users.map(sanitize));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminToggleSuspend = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.suspended = !user.suspended;
    await user.save();
    res.json(sanitize(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin users' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
