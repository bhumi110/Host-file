/**
 * Dashboard Page
 * 
 * Main user dashboard showing wallet balance, active pools,
 * contribution stats, usage charts, and recent activity.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { usersAPI } from '../services/api.js';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Wallet, Server, TrendingUp, Clock, Zap, ArrowUpRight,
  ArrowDownLeft, Activity, Bell, ChevronRight, Cpu, HardDrive
} from 'lucide-react';

const COLORS = ['#06d6a0', '#4361ee', '#7b2ff7', '#f72585', '#ff6b35', '#ffd166'];

const statCards = [
  { key: 'walletBalance', label: 'Wallet Balance', icon: Wallet, suffix: ' XLM', color: '#06d6a0', bgColor: 'rgba(6,214,160,0.08)' },
  { key: 'activePools', label: 'Active Pools', icon: Server, suffix: '', color: '#4361ee', bgColor: 'rgba(67,97,238,0.08)' },
  { key: 'totalContributed', label: 'Total Contributed', icon: TrendingUp, suffix: ' XLM', color: '#7b2ff7', bgColor: 'rgba(123,47,247,0.08)' },
  { key: 'serverUsageHours', label: 'Compute Hours', icon: Clock, suffix: ' hrs', color: '#f72585', bgColor: 'rgba(247,37,133,0.08)' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, notifsRes] = await Promise.all([
          usersAPI.getDashboardStats(),
          usersAPI.getNotifications(),
        ]);
        setStats(statsRes.data.stats);
        setNotifications(notifsRes.data.notifications);
      } catch (err) {
        // Use fallback data if API unavailable
        setStats({
          walletBalance: 4521.50,
          activePools: 3,
          totalContributed: 2700,
          contributionPercentage: 38.5,
          serverUsageHours: 384,
          creditsAvailable: 156,
          totalEarnings: 67.8,
          roi: 2.51,
          recentActivity: [
            { type: 'contribution', amount: 500, pool: 'AI Training GPU Cluster', time: '2 hours ago' },
            { type: 'earning', amount: 12.5, pool: 'Blockchain Node Cluster', time: '5 hours ago' },
            { type: 'server_active', server: 'web3-hosting-prod-01', time: '1 day ago' },
          ],
          weeklyUsage: [
            { day: 'Mon', hours: 8.2 }, { day: 'Tue', hours: 6.5 },
            { day: 'Wed', hours: 12.1 }, { day: 'Thu', hours: 9.8 },
            { day: 'Fri', hours: 15.3 }, { day: 'Sat', hours: 4.2 },
            { day: 'Sun', hours: 7.6 },
          ],
          portfolioAllocation: [
            { name: 'AI Training', value: 1500, percentage: 37.5 },
            { name: 'Blockchain Nodes', value: 1200, percentage: 30 },
            { name: 'Game Server', value: 700, percentage: 17.5 },
            { name: 'Available', value: 600, percentage: 15 },
          ],
        });
        setNotifications([
          { id: 1, type: 'pool_funded', title: 'Pool Fully Funded!', message: 'Web3 Hosting pool reached target!', read: false, time: '1h ago', icon: '🎉' },
          { id: 2, type: 'server_active', title: 'Server Active', message: 'blockchain-nodes-01 is running.', read: false, time: '3h ago', icon: '🖥️' },
          { id: 3, type: 'earning', title: 'Earnings Received', message: 'You earned 12.5 XLM.', read: true, time: '5h ago', icon: '💰' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(6,214,160,0.2)', borderTopColor: '#06d6a0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#8892b0' }}>Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#1a2035',
          border: '1px solid rgba(99,115,148,0.2)',
          borderRadius: '8px',
          padding: '0.5rem 0.75rem',
          fontSize: '0.8rem',
        }}>
          <p style={{ color: '#f0f4ff', fontWeight: 600 }}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' }}
        >
          Welcome back, <span className="gradient-text">{user?.username || 'User'}</span>
        </motion.h1>
        <p style={{ color: '#8892b0', fontSize: '0.9rem' }}>Here's your compute portfolio overview</p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card"
            style={{ padding: '1.25rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: '10px',
                background: card.bgColor,
                border: `1px solid ${card.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <card.icon size={20} color={card.color} />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#06d6a0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <ArrowUpRight size={12} /> +{(Math.random() * 15 + 2).toFixed(1)}%
              </span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.15rem', fontFamily: 'var(--font-mono)' }}>
              {typeof stats[card.key] === 'number' ? stats[card.key].toLocaleString() : stats[card.key]}{card.suffix}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#5a6380', fontWeight: 500 }}>{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {/* Weekly Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
          style={{ padding: '1.25rem' }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Weekly Usage</h3>
          <p style={{ color: '#5a6380', fontSize: '0.78rem', marginBottom: '1rem' }}>Compute hours per day</p>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,115,148,0.1)" />
                <XAxis dataKey="day" tick={{ fill: '#8892b0', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8892b0', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" name="Hours" fill="#4361ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Portfolio Allocation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
          style={{ padding: '1.25rem' }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Portfolio Allocation</h3>
          <p style={{ color: '#5a6380', fontSize: '0.78rem', marginBottom: '1rem' }}>Your fund distribution</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.portfolioAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.portfolioAllocation.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, fontSize: '0.8rem' }}>
              {stats.portfolioAllocation.map((item, i) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '3px', background: COLORS[i % COLORS.length] }} />
                  <span style={{ flex: 1, color: '#8892b0' }}>{item.name}</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Activity + Notifications */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1rem',
      }}>
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card"
          style={{ padding: '1.25rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Activity</h3>
            <Link to="/analytics" style={{ color: '#06d6a0', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {stats.recentActivity.map((activity, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem',
                borderRadius: '10px',
                background: 'rgba(17, 24, 39, 0.5)',
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  background: activity.type === 'contribution' ? 'rgba(67,97,238,0.15)' : activity.type === 'earning' ? 'rgba(6,214,160,0.15)' : 'rgba(247,37,133,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {activity.type === 'contribution' ? <ArrowUpRight size={16} color="#4361ee" /> :
                   activity.type === 'earning' ? <ArrowDownLeft size={16} color="#06d6a0" /> :
                   <Activity size={16} color="#f72585" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activity.type === 'contribution' ? `Contributed ${activity.amount} XLM` :
                     activity.type === 'earning' ? `Earned ${activity.amount} XLM` :
                     `Server ${activity.server} Active`}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#5a6380' }}>{activity.pool || activity.server}</div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#5a6380', whiteSpace: 'nowrap' }}>{activity.time}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card"
          style={{ padding: '1.25rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} /> Notifications
            </h3>
            <span className="badge badge-info">{notifications.filter(n => !n.read).length} new</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {notifications.map(notif => (
              <div key={notif.id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                padding: '0.65rem',
                borderRadius: '10px',
                background: notif.read ? 'transparent' : 'rgba(6, 214, 160, 0.04)',
                border: notif.read ? 'none' : '1px solid rgba(6, 214, 160, 0.1)',
              }}>
                <span style={{ fontSize: '1.2rem' }}>{notif.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.1rem' }}>{notif.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8892b0' }}>{notif.message}</div>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#5a6380', whiteSpace: 'nowrap' }}>{notif.time}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <Link to="/pools" className="btn-primary" style={{ fontSize: '0.85rem' }}>
          <Server size={16} /> Browse Pools
        </Link>
        <Link to="/create-pool" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          <Zap size={16} /> Create New Pool
        </Link>
        <Link to="/analytics" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          <Activity size={16} /> View Analytics
        </Link>
      </motion.div>
    </div>
  );
}
