/**
 * User Model - MongoDB Schema
 * 
 * Stores user accounts with wallet integration,
 * contribution stats, and role-based access control.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
    select: false, // Don't include password by default in queries
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // Contribution statistics
  stats: {
    totalContributed: { type: Number, default: 0 },      // Total XLM contributed
    activePools: { type: Number, default: 0 },            // Number of active pools
    totalComputeHours: { type: Number, default: 0 },      // Total compute hours used
    totalEarnings: { type: Number, default: 0 },           // Earnings from subleasing
    creditsAvailable: { type: Number, default: 0 },        // Available compute credits
  },
  // Notification preferences
  notifications: {
    poolFilled: { type: Boolean, default: true },
    serverActive: { type: Boolean, default: true },
    transactionAlerts: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: false },
  },
  // User's pools and ownership
  pools: [{
    poolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pool' },
    contributionAmount: { type: Number, default: 0 },
    ownershipPercentage: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
  }],
  transactionHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  }],
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate avatar URL based on username
userSchema.pre('save', function(next) {
  if (!this.avatar) {
    this.avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${this.username}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
