/**
 * Server Routes
 * 
 * Handles cloud server provisioning, monitoring,
 * and resource allocation management.
 */

const express = require('express');
const router = express.Router();
const Server = require('../models/Server');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// In-memory server store (fallback with demo data)
const memoryServers = [
  {
    _id: 'server-demo-1',
    poolId: 'pool-demo-2',
    instanceId: `i-${uuidv4().substring(0, 12)}`,
    name: 'web3-hosting-prod-01',
    provider: 'gcp',
    region: 'eu-west-1',
    specs: { cpu: 16, ram: 64, storage: 500, bandwidth: 5000, gpu: 'none', os: 'Ubuntu 22.04 LTS' },
    status: 'running',
    ipAddress: '35.246.128.42',
    accessUrl: 'https://web3-hosting-prod-01.fshp.cloud',
    allocations: [
      { userId: 'demo-user-2', username: 'bob_ml', percentage: 40, cpuAllocation: 6.4, ramAllocation: 25.6, storageAllocation: 200, usedHours: 128, remainingCredits: 72 },
      { userId: 'demo-user-4', username: 'diana_web3', percentage: 35, cpuAllocation: 5.6, ramAllocation: 22.4, storageAllocation: 175, usedHours: 96, remainingCredits: 82 },
      { userId: 'demo-user-5', username: 'eve_stack', percentage: 25, cpuAllocation: 4.0, ramAllocation: 16.0, storageAllocation: 125, usedHours: 64, remainingCredits: 90 },
    ],
    metrics: { cpuUsage: 62, ramUsage: 45, storageUsage: 38, networkIn: 1250, networkOut: 890, uptime: 720, healthScore: 98 },
    costPerHour: 2.45,
    totalCost: 1764,
    provisionedAt: new Date('2026-03-01'),
    expiresAt: new Date('2026-05-01'),
    lastHealthCheck: new Date(),
    createdAt: new Date('2026-03-01'),
  },
  {
    _id: 'server-demo-2',
    poolId: 'pool-demo-6',
    instanceId: `i-${uuidv4().substring(0, 12)}`,
    name: 'blockchain-nodes-01',
    provider: 'aws',
    region: 'eu-central-1',
    specs: { cpu: 16, ram: 64, storage: 2000, bandwidth: 5000, gpu: 'none', os: 'Ubuntu 22.04 LTS' },
    status: 'running',
    ipAddress: '18.156.32.87',
    accessUrl: 'https://blockchain-nodes-01.fshp.cloud',
    allocations: [
      { userId: 'demo-user-1', username: 'alice_dev', percentage: 40, cpuAllocation: 6.4, ramAllocation: 25.6, storageAllocation: 800, usedHours: 1440, remainingCredits: 56 },
      { userId: 'demo-user-6', username: 'frank_gamer', percentage: 33.33, cpuAllocation: 5.33, ramAllocation: 21.33, storageAllocation: 666, usedHours: 1200, remainingCredits: 64 },
      { userId: 'demo-user-7', username: 'grace_data', percentage: 26.67, cpuAllocation: 4.27, ramAllocation: 17.07, storageAllocation: 534, usedHours: 960, remainingCredits: 72 },
    ],
    metrics: { cpuUsage: 78, ramUsage: 55, storageUsage: 42, networkIn: 3200, networkOut: 2800, uptime: 1080, healthScore: 95 },
    costPerHour: 1.85,
    totalCost: 1998,
    provisionedAt: new Date('2026-02-10'),
    expiresAt: new Date('2026-06-10'),
    lastHealthCheck: new Date(),
    createdAt: new Date('2026-02-10'),
  },
];

// GET /api/servers - Get all servers (admin) or user's servers
router.get('/', protect, async (req, res) => {
  try {
    try {
      let servers;
      if (req.user.role === 'admin') {
        servers = await Server.find().populate('poolId', 'name');
      } else {
        servers = await Server.find({ 'allocations.userId': req.user._id }).populate('poolId', 'name');
      }
      res.json({ servers });
    } catch (dbErr) {
      // Return all demo servers for any user
      res.json({ servers: memoryServers });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch servers' });
  }
});

// GET /api/servers/:id - Get server details
router.get('/:id', protect, async (req, res) => {
  try {
    try {
      const server = await Server.findById(req.params.id).populate('poolId');
      if (!server) throw new Error('not found');
      res.json({ server });
    } catch (dbErr) {
      const server = memoryServers.find(s => s._id === req.params.id);
      if (!server) return res.status(404).json({ error: 'Server not found' });
      
      // Simulate real-time metrics updates
      server.metrics.cpuUsage = Math.min(100, Math.max(10, server.metrics.cpuUsage + (Math.random() * 10 - 5)));
      server.metrics.ramUsage = Math.min(100, Math.max(10, server.metrics.ramUsage + (Math.random() * 6 - 3)));
      server.metrics.networkIn = Math.max(0, server.metrics.networkIn + Math.floor(Math.random() * 200 - 100));
      server.metrics.networkOut = Math.max(0, server.metrics.networkOut + Math.floor(Math.random() * 150 - 75));
      server.lastHealthCheck = new Date();

      res.json({ server });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch server' });
  }
});

// POST /api/servers/provision - Provision a new server (triggered when pool is funded)
router.post('/provision', protect, async (req, res) => {
  try {
    const { poolId, specs } = req.body;

    const serverData = {
      poolId,
      instanceId: `i-${uuidv4().substring(0, 12)}`,
      name: `fshp-${Date.now().toString(36)}`,
      provider: specs?.provider || 'mock',
      region: specs?.region || 'us-east-1',
      specs: {
        cpu: specs?.cpu || 4,
        ram: specs?.ram || 16,
        storage: specs?.storage || 100,
        bandwidth: specs?.bandwidth || 1000,
        gpu: specs?.gpu || 'none',
        os: 'Ubuntu 22.04 LTS',
      },
      status: 'provisioning',
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      costPerHour: (specs?.cpu || 4) * 0.05 + (specs?.ram || 16) * 0.01,
      provisionedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lastHealthCheck: new Date(),
    };

    try {
      const server = await Server.create(serverData);
      
      // Simulate provisioning delay then set to running
      setTimeout(async () => {
        server.status = 'running';
        server.accessUrl = `https://${server.name}.fshp.cloud`;
        await server.save();
        
        const broadcast = req.app.get('broadcast');
        if (broadcast) broadcast('SERVER_READY', { serverId: server._id, name: server.name });
      }, 5000);

      res.status(201).json({ server, message: 'Server provisioning started' });
    } catch (dbErr) {
      const server = {
        ...serverData,
        _id: `server-${uuidv4().substring(0, 8)}`,
        accessUrl: `https://${serverData.name}.fshp.cloud`,
        allocations: [],
        metrics: { cpuUsage: 0, ramUsage: 0, storageUsage: 0, networkIn: 0, networkOut: 0, uptime: 0, healthScore: 100 },
        createdAt: new Date(),
      };
      
      // Simulate provisioning
      setTimeout(() => {
        server.status = 'running';
        const broadcast = req.app.get('broadcast');
        if (broadcast) broadcast('SERVER_READY', { serverId: server._id, name: server.name });
      }, 5000);

      memoryServers.push(server);
      res.status(201).json({ server, message: 'Server provisioning started' });
    }
  } catch (error) {
    console.error('Provision error:', error);
    res.status(500).json({ error: 'Server provisioning failed' });
  }
});

// GET /api/servers/:id/metrics - Get real-time server metrics
router.get('/:id/metrics', protect, async (req, res) => {
  try {
    const server = memoryServers.find(s => s._id === req.params.id) || memoryServers[0];
    
    // Generate time-series data for charts (last 24 hours)
    const now = Date.now();
    const metrics = {
      cpu: Array.from({ length: 24 }, (_, i) => ({
        time: new Date(now - (23 - i) * 3600000).toISOString(),
        value: Math.min(100, Math.max(15, 50 + Math.sin(i * 0.5) * 20 + Math.random() * 15)),
      })),
      ram: Array.from({ length: 24 }, (_, i) => ({
        time: new Date(now - (23 - i) * 3600000).toISOString(),
        value: Math.min(100, Math.max(20, 40 + Math.sin(i * 0.3) * 15 + Math.random() * 10)),
      })),
      network: Array.from({ length: 24 }, (_, i) => ({
        time: new Date(now - (23 - i) * 3600000).toISOString(),
        inbound: Math.floor(800 + Math.random() * 1200),
        outbound: Math.floor(500 + Math.random() * 800),
      })),
      current: server ? server.metrics : { cpuUsage: 45, ramUsage: 38, storageUsage: 25, uptime: 720, healthScore: 97 },
    };

    res.json({ metrics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

module.exports = router;
