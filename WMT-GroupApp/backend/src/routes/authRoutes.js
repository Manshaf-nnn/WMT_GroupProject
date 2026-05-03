const express = require('express');
const router = express.Router();
const c = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', c.registerUser);
router.post('/login', c.loginUser);
router.post('/forgot-password', c.forgotPassword);

router.get('/profile', protect, c.getUserProfile);
router.put('/profile', protect, c.updateProfile);
router.post('/change-password', protect, c.changePassword);
router.delete('/account', protect, c.deleteAccount);

router.post('/favorites/toggle', protect, c.toggleFavorite);

router.get('/addresses', protect, c.listAddresses);
router.post('/addresses', protect, c.addAddress);
router.put('/addresses/:addressId', protect, c.updateAddress);
router.delete('/addresses/:addressId', protect, c.deleteAddress);

router.get('/users', protect, admin, c.adminListUsers);
router.patch('/users/:id/suspend', protect, admin, c.adminToggleSuspend);
router.delete('/users/:id', protect, admin, c.adminDeleteUser);

module.exports = router;
