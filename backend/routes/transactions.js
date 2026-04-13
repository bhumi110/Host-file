/**
 * Transaction Routes
 * 
 * Transaction history and recording for all
 * financial operations on the platform.
 */

const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// Demo transactions
const memoryTransactions = [
  { _id: 'tx-1', userId: 'demo-user-1', poolId: 'pool-demo-1', type: 'contribution', amount: 1500, currency: 'XLM', status: 'confirmed', stellarTxHash: '0xabc123...def456', fromAddress: 'GALICE...', toAddress: 'GPOOL1...', description: 'Contribution to AI Training GPU Cluster', createdAt: new Date('2026-03-15T10:30:00Z') },
  { _id: 'tx-2', userId: 'demo-user-1', poolId: 'pool-demo-6', type: 'contribution', amount: 1200, currency: 'XLM', status: 'confirmed', stellarTxHash: '0xdef789...abc012', fromAddress: 'GALICE...', toAddress: 'GPOOL6...', description: 'Contribution to Blockchain Node Cluster', createdAt: new Date('2026-02-01T14:20:00Z') },
  { _id: 'tx-3', userId: 'demo-user-2', poolId: 'pool-demo-2', type: 'contribution', amount: 800, currency: 'XLM', status: 'confirmed', stellarTxHash: '0xghi345...jkl678', description: 'Contribution to Web3 Full-Stack Hosting', createdAt: new Date('2026-02-20T09:15:00Z') },
  { _id: 'tx-4', userId: 'demo-user-1', poolId: 'pool-demo-6', type: 'earning', amount: 45.5, currency: 'XLM', status: 'confirmed', description: 'Staking reward from Blockchain Node Cluster', createdAt: new Date('2026-04-01T08:00:00Z') },
  { _id: 'tx-5', userId: 'demo-user-2', poolId: 'pool-demo-1', type: 'contribution', amount: 1250, currency: 'XLM', status: 'confirmed', description: 'Contribution to AI Training GPU Cluster', createdAt: new Date('2026-03-18T16:45:00Z') },
  { _id: 'tx-6', userId: 'demo-user-1', poolId: null, type: 'earning', amount: 22.3, currency: 'XLM', status: 'confirmed', description: 'Subleasing revenue share', createdAt: new Date('2026-03-28T12:00:00Z') },
];

// GET /api/transactions - Get user's transaction history
router.get('/', protect, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;

    try {
      const query = { userId: req.user._id };
      if (type) query.type = type;
      if (status) query.status = status;

      const transactions = await Transaction.find(query)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('poolId', 'name');

      const total = await Transaction.countDocuments(query);

      res.json({ transactions, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
    } catch (dbErr) {
      // Return demo transactions
      let txs = [...memoryTransactions];
      if (type) txs = txs.filter(t => t.type === type);
      if (status) txs = txs.filter(t => t.status === status);

      res.json({ transactions: txs, total: txs.length, page: 1, totalPages: 1 });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/transactions/stats - Get transaction statistics
router.get('/stats', protect, async (req, res) => {
  try {
    // Return demo stats
    const stats = {
      totalContributed: 2700,
      totalEarnings: 67.8,
      totalTransactions: 6,
      monthlyContributions: [
        { month: 'Jan', amount: 0 },
        { month: 'Feb', amount: 1200 },
        { month: 'Mar', amount: 1500 },
        { month: 'Apr', amount: 0 },
      ],
      byType: {
        contribution: 4,
        earning: 2,
        withdrawal: 0,
        transfer: 0,
      },
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
