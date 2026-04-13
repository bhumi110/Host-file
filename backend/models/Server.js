/**
 * Server Model - MongoDB Schema
 * 
 * Represents a provisioned cloud server instance
 * with resource allocation tracking.
 */

const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String },
  percentage: { type: Number, required: true },
  // Resource limits based on percentage
  cpuAllocation: { type: Number },      // vCPU fraction
  ramAllocation: { type: Number },      // GB fraction
  storageAllocation: { type: Number },  // GB fraction
  // Usage tracking
  usedHours: { type: Number, default: 0 },
  remainingCredits: { type: Number, default: 100 },
  lastActive: Date,
  // Time slot bookings
  bookedSlots: [{
    start: Date,
    end: Date,
    status: { type: String, enum: ['booked', 'active', 'completed', 'cancelled'], default: 'booked' },
  }],
});

const serverSchema = new mongoose.Schema({
  poolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pool',
    required: true,
  },
  // Server identification
  instanceId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  // Provider details
  provider: {
    type: String,
    enum: ['aws', 'gcp', 'azure', 'mock'],
    default: 'mock',
  },
  region: {
    type: String,
    default: 'us-east-1',
  },
  // Server specifications
  specs: {
    cpu: { type: Number, required: true },
    ram: { type: Number, required: true },
    storage: { type: Number, required: true },
    bandwidth: { type: Number, default: 1000 },
    gpu: { type: String, default: 'none' },
    os: { type: String, default: 'Ubuntu 22.04 LTS' },
  },
  // Server status
  status: {
    type: String,
    enum: ['provisioning', 'running', 'stopped', 'terminated', 'error'],
    default: 'provisioning',
  },
  // IP and access details
  ipAddress: { type: String },
  sshKey: { type: String },
  accessUrl: { type: String },
  // Resource allocations per user
  allocations: [allocationSchema],
  // Performance metrics (simulated)
  metrics: {
    cpuUsage: { type: Number, default: 0 },
    ramUsage: { type: Number, default: 0 },
    storageUsage: { type: Number, default: 0 },
    networkIn: { type: Number, default: 0 },
    networkOut: { type: Number, default: 0 },
    uptime: { type: Number, default: 0 },      // Hours
    healthScore: { type: Number, default: 100 }, // 0-100
  },
  // Cost tracking
  costPerHour: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  // Timestamps
  provisionedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  lastHealthCheck: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

serverSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Server', serverSchema);
