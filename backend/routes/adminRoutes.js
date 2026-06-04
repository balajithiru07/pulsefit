import express from 'express';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Middleware to ensure user is an admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access only' });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    if (global.isMockDB) {
      const users = global.mockDB.users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      });
      res.json(users);
    } else {
      const users = await User.find({}).select('-password');
      res.json(users);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Toggle User Active/Banned status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put('/users/:id/status', protect, adminOnly, async (req, res) => {
  try {
    if (global.isMockDB) {
      const index = global.mockDB.users.findIndex(u => u._id.toString() === req.params.id.toString());
      if (index === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      global.mockDB.users[index].isActive = !global.mockDB.users[index].isActive;
      res.json({
        id: global.mockDB.users[index]._id,
        isActive: global.mockDB.users[index].isActive,
        message: `User status set to ${global.mockDB.users[index].isActive ? 'Active' : 'Deactivated'}`
      });
    } else {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.isActive = !user.isActive;
      await user.save();

      res.json({
        id: user._id,
        isActive: user.isActive,
        message: `User status set to ${user.isActive ? 'Active' : 'Deactivated'}`
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get Platform Summary Statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    let totalUsers = 0;
    let premiumUsers = 0;
    let totalWorkouts = 0;
    let totalCheckins = 0;

    if (global.isMockDB) {
      totalUsers = global.mockDB.users.length;
      premiumUsers = global.mockDB.users.filter(u => u.subscriptionStatus === 'premium').length;
      totalWorkouts = global.mockDB.workouts.length;
      totalCheckins = global.mockDB.checkins.length;
    } else {
      totalUsers = await User.countDocuments({});
      premiumUsers = await User.countDocuments({ subscriptionStatus: 'premium' });
      totalWorkouts = await mongoose.connection.db.collection('workouts').countDocuments({});
      totalCheckins = await mongoose.connection.db.collection('checkins').countDocuments({});
    }

    // calculate simulated revenue (premium count * 14.99)
    const totalRevenue = premiumUsers * 14.99;

    res.json({
      metrics: {
        totalUsers,
        premiumUsers,
        totalWorkouts,
        totalCheckins,
        totalRevenue: Math.round(totalRevenue * 100) / 100
      },
      trends: {
        registrations: [12, 19, 3, 5, 2, 3, 10, totalUsers],
        revenueTrend: [0, 14.99, 29.98, 14.99, 44.97, totalRevenue]
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
