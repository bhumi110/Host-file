/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches user data to requests.
 * Supports both email/password and wallet-based auth.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized - no token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Try to find user in MongoDB, fall back to decoded data
    try {
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      } else {
        // Use decoded token data if MongoDB is not available
        req.user = { _id: decoded.id, role: decoded.role, username: decoded.username };
      }
    } catch (dbErr) {
      // Database not available, use token data
      req.user = { _id: decoded.id, role: decoded.role, username: decoded.username };
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Not authorized - invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Not authorized - token expired' });
    }
    return res.status(500).json({ error: 'Server error during authentication' });
  }
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Admin access required' });
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = { protect, adminOnly, generateToken };
