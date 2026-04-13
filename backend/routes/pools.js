/**
 * Pool Routes
 * 
 * CRUD operations for funding pools, contribution management,
 * and pool marketplace functionality.
 */

const express = require('express');
const router = express.Router();
const Pool = require('../models/Pool');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect, adminOnly } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// In-memory pool store (fallback)
const memoryPools = [
  // Pre-seeded demo pools
  {
    _id: 'pool-demo-1',
    name: 'AI Training GPU Cluster',
    description: 'High-performance GPU cluster for distributed machine learning model training. Pool contributors gain proportional access to NVIDIA A100 GPUs.',
    creator: 'demo-user-1',
    serverSpec: { cpu: 32, ram: 256, storage: 2000, bandwidth: 10000, gpu: 'NVIDIA A100 x4', region: 'us-east-1', provider: 'aws' },
    fundingTarget: 5000,
    currentFunding: 3750,
    currency: 'XLM',
    status: 'funding',
    contributors: [
      { userId: 'demo-user-1', username: 'alice_dev', amount: 1500, percentage: 40, contributedAt: new Date('2026-03-15') },
      { userId: 'demo-user-2', username: 'bob_ml', amount: 1250, percentage: 33.33, contributedAt: new Date('2026-03-18') },
      { userId: 'demo-user-3', username: 'charlie_ai', amount: 1000, percentage: 26.67, contributedAt: new Date('2026-03-20') },
    ],
    minContribution: 50,
    maxContributors: 20,
    duration: 30,
    fundingDeadline: new Date('2026-05-01'),
    category: 'ml-training',
    tags: ['GPU', 'AI', 'Machine Learning', 'Deep Learning'],
    transferable: true,
    isPublic: true,
    createdAt: new Date('2026-03-10'),
    updatedAt: new Date('2026-04-01'),
  },
  {
    _id: 'pool-demo-2',
    name: 'Web3 Full-Stack Hosting',
    description: 'Scalable web hosting infrastructure for decentralized applications. Includes load balancing, CDN, and auto-scaling capabilities.',
    creator: 'demo-user-2',
    serverSpec: { cpu: 16, ram: 64, storage: 500, bandwidth: 5000, gpu: 'none', region: 'eu-west-1', provider: 'gcp' },
    fundingTarget: 2000,
    currentFunding: 2000,
    currency: 'XLM',
    status: 'active',
    contributors: [
      { userId: 'demo-user-2', username: 'bob_ml', amount: 800, percentage: 40, contributedAt: new Date('2026-02-20') },
      { userId: 'demo-user-4', username: 'diana_web3', amount: 700, percentage: 35, contributedAt: new Date('2026-02-22') },
      { userId: 'demo-user-5', username: 'eve_stack', amount: 500, percentage: 25, contributedAt: new Date('2026-02-25') },
    ],
    minContribution: 25,
    maxContributors: 30,
    duration: 60,
    fundingDeadline: new Date('2026-04-20'),
    category: 'web-hosting',
    tags: ['Web3', 'dApps', 'Hosting', 'Full-Stack'],
    transferable: true,
    isPublic: true,
    serverId: 'server-demo-1',
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date('2026-03-01'),
  },
  {
    _id: 'pool-demo-3',
    name: 'Game Server Cluster',
    description: 'Low-latency gaming server infrastructure for multiplayer game hosting. Optimized for real-time performance with DDoS protection.',
    creator: 'demo-user-3',
    serverSpec: { cpu: 24, ram: 128, storage: 1000, bandwidth: 20000, gpu: 'NVIDIA T4 x2', region: 'us-west-2', provider: 'aws' },
    fundingTarget: 3500,
    currentFunding: 1200,
    currency: 'XLM',
    status: 'funding',
    contributors: [
      { userId: 'demo-user-3', username: 'charlie_ai', amount: 700, percentage: 58.33, contributedAt: new Date('2026-04-01') },
      { userId: 'demo-user-6', username: 'frank_gamer', amount: 500, percentage: 41.67, contributedAt: new Date('2026-04-03') },
    ],
    minContribution: 30,
    maxContributors: 25,
    duration: 45,
    fundingDeadline: new Date('2026-05-15'),
    category: 'gaming',
    tags: ['Gaming', 'Low-Latency', 'Multiplayer', 'DDoS Protection'],
    transferable: true,
    isPublic: true,
    createdAt: new Date('2026-03-28'),
    updatedAt: new Date('2026-04-03'),
  },
  {
    _id: 'pool-demo-4',
    name: 'Data Analytics Pipeline',
    description: 'Big data processing cluster for real-time analytics and ETL workloads. Features Apache Spark and Kafka integration.',
    creator: 'demo-user-4',
    serverSpec: { cpu: 48, ram: 192, storage: 5000, bandwidth: 10000, gpu: 'none', region: 'ap-southeast-1', provider: 'azure' },
    fundingTarget: 8000,
    currentFunding: 6400,
    currency: 'USDC',
    status: 'funding',
    contributors: [
      { userId: 'demo-user-4', username: 'diana_web3', amount: 2500, percentage: 39.06, contributedAt: new Date('2026-03-05') },
      { userId: 'demo-user-7', username: 'grace_data', amount: 2000, percentage: 31.25, contributedAt: new Date('2026-03-08') },
      { userId: 'demo-user-8', username: 'henry_ops', amount: 1200, percentage: 18.75, contributedAt: new Date('2026-03-12') },
      { userId: 'demo-user-9', username: 'ivy_analyst', amount: 700, percentage: 10.94, contributedAt: new Date('2026-03-15') },
    ],
    minContribution: 100,
    maxContributors: 15,
    duration: 90,
    fundingDeadline: new Date('2026-06-01'),
    category: 'compute',
    tags: ['Big Data', 'Analytics', 'Spark', 'Kafka'],
    transferable: true,
    isPublic: true,
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-15'),
  },
  {
    _id: 'pool-demo-5',
    name: '3D Rendering Farm',
    description: 'Distributed GPU rendering farm for 3D artists and animation studios. Supports Blender, Maya, and Cinema 4D.',
    creator: 'demo-user-5',
    serverSpec: { cpu: 64, ram: 512, storage: 4000, bandwidth: 10000, gpu: 'NVIDIA RTX 4090 x8', region: 'us-central-1', provider: 'gcp' },
    fundingTarget: 12000,
    currentFunding: 4800,
    currency: 'XLM',
    status: 'funding',
    contributors: [
      { userId: 'demo-user-5', username: 'eve_stack', amount: 2000, percentage: 41.67, contributedAt: new Date('2026-03-20') },
      { userId: 'demo-user-10', username: 'jack_3d', amount: 1800, percentage: 37.5, contributedAt: new Date('2026-03-22') },
      { userId: 'demo-user-11', username: 'kate_art', amount: 1000, percentage: 20.83, contributedAt: new Date('2026-03-25') },
    ],
    minContribution: 200,
    maxContributors: 10,
    duration: 60,
    fundingDeadline: new Date('2026-05-20'),
    category: 'rendering',
    tags: ['3D', 'Rendering', 'GPU', 'Animation', 'Blender'],
    transferable: true,
    isPublic: true,
    createdAt: new Date('2026-03-18'),
    updatedAt: new Date('2026-03-25'),
  },
  {
    _id: 'pool-demo-6',
    name: 'Blockchain Node Cluster',
    description: 'Multi-chain validator and RPC node infrastructure. Run Stellar, Ethereum, and Solana nodes with high availability.',
    creator: 'demo-user-1',
    serverSpec: { cpu: 16, ram: 64, storage: 2000, bandwidth: 5000, gpu: 'none', region: 'eu-central-1', provider: 'aws' },
    fundingTarget: 3000,
    currentFunding: 3000,
    currency: 'XLM',
    status: 'active',
    contributors: [
      { userId: 'demo-user-1', username: 'alice_dev', amount: 1200, percentage: 40, contributedAt: new Date('2026-02-01') },
      { userId: 'demo-user-6', username: 'frank_gamer', amount: 1000, percentage: 33.33, contributedAt: new Date('2026-02-05') },
      { userId: 'demo-user-7', username: 'grace_data', amount: 800, percentage: 26.67, contributedAt: new Date('2026-02-08') },
    ],
    minContribution: 50,
    maxContributors: 20,
    duration: 120,
    fundingDeadline: new Date('2026-04-01'),
    category: 'compute',
    tags: ['Blockchain', 'Validator', 'Nodes', 'Multi-Chain'],
    transferable: true,
    isPublic: true,
    serverId: 'server-demo-2',
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-02-10'),
  },
];

// GET /api/pools - Get all public pools (marketplace)
router.get('/', async (req, res) => {
  try {
    const { status, category, search, sort = '-createdAt', page = 1, limit = 12 } = req.query;
    
    try {
      // Try MongoDB
      const query = { isPublic: true };
      if (status) query.status = status;
      if (category) query.category = category;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ];
      }

      const pools = await Pool.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('creator', 'username avatar');

      const total = await Pool.countDocuments(query);

      res.json({ pools, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
    } catch (dbErr) {
      // Fallback to in-memory
      let pools = [...memoryPools].filter(p => p.isPublic);
      
      if (status) pools = pools.filter(p => p.status === status);
      if (category) pools = pools.filter(p => p.category === category);
      if (search) {
        const s = search.toLowerCase();
        pools = pools.filter(p => 
          p.name.toLowerCase().includes(s) || 
          p.description.toLowerCase().includes(s) ||
          p.tags.some(t => t.toLowerCase().includes(s))
        );
      }

      // Add virtuals
      pools = pools.map(p => ({
        ...p,
        fundingProgress: Math.min((p.currentFunding / p.fundingTarget) * 100, 100),
        contributorCount: p.contributors.length,
      }));

      const total = pools.length;
      const start = (parseInt(page) - 1) * parseInt(limit);
      const paginatedPools = pools.slice(start, start + parseInt(limit));

      res.json({ pools: paginatedPools, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    }
  } catch (error) {
    console.error('Get pools error:', error);
    res.status(500).json({ error: 'Failed to fetch pools' });
  }
});

// GET /api/pools/:id - Get single pool details
router.get('/:id', async (req, res) => {
  try {
    try {
      const pool = await Pool.findById(req.params.id)
        .populate('creator', 'username avatar')
        .populate('serverId');
      if (!pool) throw new Error('not found');
      res.json({ pool });
    } catch (dbErr) {
      const pool = memoryPools.find(p => p._id === req.params.id);
      if (!pool) return res.status(404).json({ error: 'Pool not found' });
      
      res.json({ 
        pool: {
          ...pool,
          fundingProgress: Math.min((pool.currentFunding / pool.fundingTarget) * 100, 100),
          contributorCount: pool.contributors.length,
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pool' });
  }
});

// POST /api/pools - Create a new pool
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, serverSpec, fundingTarget, currency, minContribution, maxContributors, duration, category, tags, fundingDeadline } = req.body;

    if (!name || !description || !fundingTarget) {
      return res.status(400).json({ error: 'Name, description, and funding target are required' });
    }

    const poolData = {
      name,
      description,
      creator: req.user._id,
      serverSpec: serverSpec || { cpu: 4, ram: 16, storage: 100, bandwidth: 1000, gpu: 'none', region: 'us-east-1', provider: 'aws' },
      fundingTarget,
      currency: currency || 'XLM',
      minContribution: minContribution || 1,
      maxContributors: maxContributors || 50,
      duration: duration || 30,
      category: category || 'compute',
      tags: tags || [],
      fundingDeadline: fundingDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      escrowAddress: `GESCROW${require('crypto').randomBytes(20).toString('hex').toUpperCase().substring(0, 46)}`,
    };

    try {
      const pool = await Pool.create(poolData);
      
      // Broadcast new pool creation
      const broadcast = req.app.get('broadcast');
      if (broadcast) broadcast('POOL_CREATED', { poolId: pool._id, name: pool.name });

      res.status(201).json({ pool });
    } catch (dbErr) {
      const pool = {
        ...poolData,
        _id: `pool-${uuidv4().substring(0, 8)}`,
        currentFunding: 0,
        status: 'funding',
        contributors: [],
        transferable: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        fundingProgress: 0,
        contributorCount: 0,
      };
      memoryPools.push(pool);

      const broadcast = req.app.get('broadcast');
      if (broadcast) broadcast('POOL_CREATED', { poolId: pool._id, name: pool.name });

      res.status(201).json({ pool });
    }
  } catch (error) {
    console.error('Create pool error:', error);
    res.status(500).json({ error: 'Failed to create pool' });
  }
});

// POST /api/pools/:id/contribute - Contribute to a pool
router.post('/:id/contribute', protect, async (req, res) => {
  try {
    const { amount, txHash } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid contribution amount' });
    }

    try {
      const pool = await Pool.findById(req.params.id);
      if (!pool) throw new Error('not found');

      if (pool.status !== 'funding') {
        return res.status(400).json({ error: 'Pool is no longer accepting contributions' });
      }

      if (amount < pool.minContribution) {
        return res.status(400).json({ error: `Minimum contribution is ${pool.minContribution} ${pool.currency}` });
      }

      if (pool.contributors.length >= pool.maxContributors) {
        return res.status(400).json({ error: 'Pool has reached maximum contributors' });
      }

      // Add or update contribution
      const existingContributor = pool.contributors.find(c => c.userId.toString() === req.user._id.toString());
      if (existingContributor) {
        existingContributor.amount += amount;
      } else {
        pool.contributors.push({
          userId: req.user._id,
          username: req.user.username,
          walletAddress: req.user.walletAddress,
          amount,
        });
      }

      pool.currentFunding += amount;
      pool.recalculatePercentages();

      // Check if pool is fully funded
      if (pool.currentFunding >= pool.fundingTarget) {
        pool.status = 'funded';
      }

      await pool.save();

      // Record transaction
      await Transaction.create({
        userId: req.user._id,
        poolId: pool._id,
        type: 'contribution',
        amount,
        currency: pool.currency,
        status: 'confirmed',
        stellarTxHash: txHash || `mock_tx_${Date.now()}`,
        description: `Contribution to pool: ${pool.name}`,
      });

      const broadcast = req.app.get('broadcast');
      if (broadcast) broadcast('POOL_CONTRIBUTION', { poolId: pool._id, amount, fundingProgress: pool.fundingProgress });

      res.json({ pool, message: 'Contribution successful' });
    } catch (dbErr) {
      // In-memory fallback
      const pool = memoryPools.find(p => p._id === req.params.id);
      if (!pool) return res.status(404).json({ error: 'Pool not found' });

      if (pool.status !== 'funding') {
        return res.status(400).json({ error: 'Pool is no longer accepting contributions' });
      }

      const existingIdx = pool.contributors.findIndex(c => c.userId === req.user._id);
      if (existingIdx >= 0) {
        pool.contributors[existingIdx].amount += amount;
      } else {
        pool.contributors.push({
          userId: req.user._id,
          username: req.user.username || 'anonymous',
          amount,
          percentage: 0,
          contributedAt: new Date(),
        });
      }

      pool.currentFunding += amount;
      // Recalculate percentages
      pool.contributors.forEach(c => {
        c.percentage = (c.amount / pool.currentFunding) * 100;
      });

      if (pool.currentFunding >= pool.fundingTarget) {
        pool.status = 'funded';
      }

      pool.updatedAt = new Date();

      const broadcast = req.app.get('broadcast');
      if (broadcast) {
        broadcast('POOL_CONTRIBUTION', {
          poolId: pool._id,
          amount,
          fundingProgress: Math.min((pool.currentFunding / pool.fundingTarget) * 100, 100),
        });
      }

      res.json({
        pool: {
          ...pool,
          fundingProgress: Math.min((pool.currentFunding / pool.fundingTarget) * 100, 100),
          contributorCount: pool.contributors.length,
        },
        message: 'Contribution successful',
      });
    }
  } catch (error) {
    console.error('Contribution error:', error);
    res.status(500).json({ error: 'Contribution failed' });
  }
});

// GET /api/pools/user/my-pools - Get pools the user is contributing to
router.get('/user/my-pools', protect, async (req, res) => {
  try {
    try {
      const pools = await Pool.find({ 'contributors.userId': req.user._id }).populate('creator', 'username avatar');
      res.json({ pools });
    } catch (dbErr) {
      const pools = memoryPools.filter(p => p.contributors.some(c => c.userId === req.user._id));
      res.json({ pools });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user pools' });
  }
});

module.exports = router;
