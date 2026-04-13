/**
 * Authentication Routes
 * 
 * Handles user registration, login, wallet connect,
 * and profile management.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

// In-memory user store (fallback when MongoDB is unavailable)
const memoryUsers = [];

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please provide username, email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
      // Try MongoDB first
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email or username already exists' });
      }

      const user = await User.create({ email, password, username });
      const token = generateToken(user);

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          stats: user.stats,
        },
      });
    } catch (dbErr) {
      // Fallback to in-memory store
      const existing = memoryUsers.find(u => u.email === email || u.username === username);
      if (existing) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = {
        _id: require('crypto').randomUUID(),
        email,
        password: hashedPassword,
        username,
        role: 'user',
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
        stats: { totalContributed: 0, activePools: 0, totalComputeHours: 0, totalEarnings: 0, creditsAvailable: 100 },
        pools: [],
        createdAt: new Date(),
      };
      memoryUsers.push(user);

      const token = generateToken(user);
      res.status(201).json({
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar, stats: user.stats },
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login - Login with email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    try {
      // Try MongoDB
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user);
      res.json({
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar, stats: user.stats },
      });
    } catch (dbErr) {
      // Fallback to in-memory
      const bcrypt = require('bcryptjs');
      const user = memoryUsers.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user);
      res.json({
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar, stats: user.stats },
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/wallet-connect - Connect via Freighter wallet
router.post('/wallet-connect', async (req, res) => {
  try {
    const { walletAddress, publicKey } = req.body;
    const address = walletAddress || publicKey;

    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    try {
      let user = await User.findOne({ walletAddress: address });

      if (!user) {
        // Create new user with wallet
        const username = `stellar_${address.substring(0, 8).toLowerCase()}`;
        user = await User.create({
          walletAddress: address,
          username,
          role: 'user',
        });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user);
      res.json({
        token,
        user: { id: user._id, username: user.username, walletAddress: user.walletAddress, role: user.role, avatar: user.avatar, stats: user.stats },
      });
    } catch (dbErr) {
      // Fallback
      let user = memoryUsers.find(u => u.walletAddress === address);
      if (!user) {
        user = {
          _id: require('crypto').randomUUID(),
          walletAddress: address,
          username: `stellar_${address.substring(0, 8).toLowerCase()}`,
          role: 'user',
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
          stats: { totalContributed: 0, activePools: 0, totalComputeHours: 0, totalEarnings: 0, creditsAvailable: 100 },
          pools: [],
          createdAt: new Date(),
        };
        memoryUsers.push(user);
      }

      const token = generateToken(user);
      res.json({
        token,
        user: { id: user._id, username: user.username, walletAddress: user.walletAddress, role: user.role, avatar: user.avatar, stats: user.stats },
      });
    }
  } catch (error) {
    console.error('Wallet connect error:', error);
    res.status(500).json({ error: 'Wallet connection failed' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
        avatar: user.avatar,
        stats: user.stats || { totalContributed: 0, activePools: 0, totalComputeHours: 0, totalEarnings: 0, creditsAvailable: 100 },
        pools: user.pools || [],
        notifications: user.notifications,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

module.exports = router;
