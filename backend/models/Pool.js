/**
 * Pool Model - MongoDB Schema
 * 
 * Represents a funding pool where users contribute
 * XLM/stablecoins to collectively rent cloud infrastructure.
 */

const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  walletAddress: { type: String },
  amount: { type: Number, required: true, min: 0 },
  percentage: { type: Number, default: 0 },
  contributedAt: { type: Date, default: Date.now },
  // Ownership token representation
  tokenId: { type: String },
  tokenAmount: { type: Number, default: 0 },
});

const poolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Server specification requirements
  serverSpec: {
    cpu: { type: Number, required: true },        // vCPUs
    ram: { type: Number, required: true },         // GB
    storage: { type: Number, required: true },     // GB
    bandwidth: { type: Number, default: 1000 },    // Mbps
    gpu: { type: String, default: 'none' },        // GPU type
    region: { type: String, default: 'us-east-1' },
    provider: { type: String, enum: ['aws', 'gcp', 'azure'], default: 'aws' },
  },
  // Funding details
  fundingTarget: {
    type: Number,
    required: true,
    min: 10, // Minimum 10 XLM
  },
  currentFunding: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    enum: ['XLM', 'USDC', 'EURC'],
    default: 'XLM',
  },
  // Pool status
  status: {
    type: String,
    enum: ['funding', 'funded', 'provisioning', 'active', 'expired', 'closed'],
    default: 'funding',
  },
  // Contributors list
  contributors: [contributorSchema],
  // Associated server (once provisioned)
  serverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
  },
  // Pool configuration
  minContribution: { type: Number, default: 1 },    // Minimum contribution in XLM
  maxContributors: { type: Number, default: 50 },    // Max participants
  duration: { type: Number, default: 30 },            // Pool duration in days
  // Deadlines
  fundingDeadline: {
    type: Date,
    required: true,
  },
  serverExpiryDate: Date,
  // Categories and tags
  category: {
    type: String,
    enum: ['compute', 'gpu', 'storage', 'ml-training', 'web-hosting', 'gaming', 'rendering'],
    default: 'compute',
  },
  tags: [{ type: String }],
  // Stellar pool escrow address
  escrowAddress: { type: String },
  // Whether ownership can be transferred/sold
  transferable: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Virtual: funding progress percentage
poolSchema.virtual('fundingProgress').get(function() {
  return Math.min((this.currentFunding / this.fundingTarget) * 100, 100);
});

// Virtual: number of contributors
poolSchema.virtual('contributorCount').get(function() {
  return this.contributors.length;
});

// Ensure virtuals are included in JSON output
poolSchema.set('toJSON', { virtuals: true });
poolSchema.set('toObject', { virtuals: true });

// Update contributor percentages when funding changes
poolSchema.methods.recalculatePercentages = function() {
  if (this.currentFunding === 0) return;
  this.contributors.forEach(contributor => {
    contributor.percentage = (contributor.amount / this.currentFunding) * 100;
  });
};

// Index for efficient queries
poolSchema.index({ status: 1, isPublic: 1 });
poolSchema.index({ category: 1 });
poolSchema.index({ creator: 1 });

module.exports = mongoose.model('Pool', poolSchema);
