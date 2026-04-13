/**
 * Fractional Server Hosting Pool - Main Server Entry Point
 * 
 * This is the primary Express server that handles:
 * - REST API endpoints for pools, users, servers, and transactions
 * - WebSocket connections for real-time updates
 * - MongoDB database connection
 * - Authentication middleware
 * - CORS and security configuration
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { WebSocketServer } = require('ws');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server, path: '/ws' });

// Store connected clients for broadcasting
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('🔌 WebSocket client connected');
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('🔌 WebSocket client disconnected');
  });
});

// Broadcast function for real-time updates
const broadcast = (type, data) => {
  const message = JSON.stringify({ type, data, timestamp: new Date() });
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
};

// Make broadcast available globally
app.set('broadcast', broadcast);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Import Routes
const authRoutes = require('./routes/auth');
const poolRoutes = require('./routes/pools');
const serverRoutes = require('./routes/servers');
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');
const stellarRoutes = require('./routes/stellar');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/pools', poolRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stellar', stellarRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    version: '1.0.0',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      websocket: `${clients.size} clients connected`
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fractional-hosting');
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Running without database - using in-memory storage');
  }
};

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 Fractional Server Hosting Pool API`);
    console.log(`   Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   WebSocket: ws://localhost:${PORT}/ws`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
});

module.exports = { app, server, broadcast };
