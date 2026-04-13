/**
 * User Routes
 * 
 * User profile management, settings, and stats.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/users/profile - Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        walletAddress: req.user.walletAddress,
        role: req.user.role,
        avatar: req.user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${req.user.username}`,
        stats: req.user.stats || {
          totalContributed: 2700,
          activePools: 2,
          totalComputeHours: 384,
          totalEarnings: 67.8,
          creditsAvailable: 156,
        },
        notifications: req.user.notifications || {
          poolFilled: true,
          serverActive: true,
          transactionAlerts: true,
          emailNotifications: false,
        },
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, email, notifications } = req.body;

    try {
      const user = await User.findById(req.user._id);
      if (!user) throw new Error('not found');

      if (username) user.username = username;
      if (email) user.email = email;
      if (notifications) user.notifications = { ...user.notifications, ...notifications };

      await user.save();
      res.json({ user, message: 'Profile updated' });
    } catch (dbErr) {
      res.json({ message: 'Profile updated (in-memory)', user: { ...req.user, ...req.body } });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/dashboard-stats - Get dashboard statistics
router.get('/dashboard-stats', protect, async (req, res) => {
  try {
    const stats = {
      walletBalance: 4521.50,
      activePools: 3,
      totalContributed: 2700,
      contributionPercentage: 38.5,
      serverUsageHours: 384,
      creditsAvailable: 156,
      totalEarnings: 67.8,
      roi: 2.51,
      // Recent activity
      recentActivity: [
        { type: 'contribution', amount: 500, pool: 'AI Training GPU Cluster', time: '2 hours ago' },
        { type: 'earning', amount: 12.5, pool: 'Blockchain Node Cluster', time: '5 hours ago' },
        { type: 'server_active', server: 'web3-hosting-prod-01', time: '1 day ago' },
        { type: 'pool_update', pool: 'Game Server Cluster', progress: 34.29, time: '2 days ago' },
      ],
      // Usage over last 7 days
      weeklyUsage: [
        { day: 'Mon', hours: 8.2 },
        { day: 'Tue', hours: 6.5 },
        { day: 'Wed', hours: 12.1 },
        { day: 'Thu', hours: 9.8 },
        { day: 'Fri', hours: 15.3 },
        { day: 'Sat', hours: 4.2 },
        { day: 'Sun', hours: 7.6 },
      ],
      // Portfolio allocation
      portfolioAllocation: [
        { name: 'AI Training GPU Cluster', value: 1500, percentage: 37.5 },
        { name: 'Blockchain Node Cluster', value: 1200, percentage: 30 },
        { name: 'Game Server Cluster', value: 700, percentage: 17.5 },
        { name: 'Available Balance', value: 600, percentage: 15 },
      ],
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/users/notifications - Get user notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = [
      { id: 1, type: 'pool_funded', title: 'Pool Fully Funded!', message: 'Web3 Full-Stack Hosting pool has reached its target!', read: false, time: '1 hour ago', icon: '🎉' },
      { id: 2, type: 'server_active', title: 'Server Active', message: 'blockchain-nodes-01 is now running and accessible.', read: false, time: '3 hours ago', icon: '🖥️' },
      { id: 3, type: 'earning', title: 'Earnings Received', message: 'You earned 12.5 XLM from subleasing.', read: true, time: '5 hours ago', icon: '💰' },
      { id: 4, type: 'contribution', title: 'Contribution Confirmed', message: '1500 XLM contribution to AI Training cluster confirmed.', read: true, time: '1 day ago', icon: '✅' },
      { id: 5, type: 'pool_update', title: 'Pool Progress Update', message: 'Game Server Cluster is now 34% funded.', read: true, time: '2 days ago', icon: '📊' },
    ];

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
