const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

exports.getAnalytics = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);

    const [
      totalUsers,
      totalRestaurants,
      activeReservationsToday,
      totalReviews,
      revenueAgg,
      monthRevenueAgg,
      topRestaurantsAgg,
      revenueLast7,
      bookingsByStatus
    ] = await Promise.all([
      User.countDocuments({}),
      Restaurant.countDocuments({}),
      Booking.countDocuments({
        date: { $gte: startOfDay },
        status: { $in: ['pending', 'approved'] }
      }),
      Review.countDocuments({}),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Restaurant.find({}).sort({ averageRating: -1, numReviews: -1 }).limit(5)
        .select('name averageRating numReviews heroImage'),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: new Date(Date.now() - 6 * 86400000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = revenueLast7.find((r) => r._id === key);
      days.push({ date: key, total: found?.total || 0 });
    }

    res.json({
      totals: {
        users: totalUsers,
        restaurants: totalRestaurants,
        activeReservationsToday,
        reviews: totalReviews,
        revenueAllTime: revenueAgg[0]?.total || 0,
        revenueThisMonth: monthRevenueAgg[0]?.total || 0
      },
      topRestaurants: topRestaurantsAgg,
      revenueLast7Days: days,
      bookingsByStatus: Object.fromEntries(bookingsByStatus.map((b) => [b._id, b.count]))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
