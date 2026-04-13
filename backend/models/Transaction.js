/**
 * Transaction Model - MongoDB Schema
 * 
 * Records all financial transactions including
 * pool contributions, withdrawals, and transfers.
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  poolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pool',
  },
  type: {
    type: String,
    enum: ['contribution', 'withdrawal', 'transfer', 'earning', 'refund', 'escrow'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ['XLM', 'USDC', 'EURC'],
    default: 'XLM',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'cancelled'],
    default: 'pending',
  },
  // Stellar transaction details
  stellarTxHash: { type: String },
  fromAddress: { type: String },
  toAddress: { type: String },
  memo: { type: String },
  // Fee information
  networkFee: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  // Additional metadata
  description: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
});

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ poolId: 1 });
transactionSchema.index({ stellarTxHash: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
