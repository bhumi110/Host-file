/**
 * Analytics Page
 * 
 * Usage analytics, transaction history, ROI calculator,
 * and performance metrics visualization.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { transactionsAPI, usersAPI } from '../services/api.js';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, DollarSign, Clock, Zap, ArrowUpRight,
  ArrowDownLeft, Calculator, History, Activity
} from 'lucide-react';

const COLORS = ['#06d6a0', '#4361ee', '#7b2ff7', '#f72585'];

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [roiInput, setRoiInput] = useState({ investment: 1000, months: 6, utilization: 75 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txRes, statsRes] = await Promise.all([
        transactionsAPI.getAll(),
        transactionsAPI.getStats(),
      ]);
      setTransactions(txRes.data.transactions || []);
      setStats(statsRes.data.stats);
    } catch (err) {
      setTransactions([
        { _id: '1', type: 'contribution', amount: 1500, currency: 'XLM', status: 'confirmed', description: 'AI Training GPU Cluster', createdAt: '2026-03-15T10:30:00Z' },
        { _id: '2', type: 'contribution', amount: 1200, currency: 'XLM', status: 'confirmed', description: 'Blockchain Node Cluster', createdAt: '2026-02-01T14:20:00Z' },
        { _id: '3', type: 'earning', amount: 45.5, currency: 'XLM', status: 'confirmed', description: 'Staking reward', createdAt: '2026-04-01T08:00:00Z' },
        { _id: '4', type: 'contribution', amount: 800, currency: 'XLM', status: 'confirmed', description: 'Web3 Hosting', createdAt: '2026-02-20T09:15:00Z' },
        { _id: '5', type: 'earning', amount: 22.3, currency: 'XLM', status: 'confirmed', description: 'Subleasing revenue', createdAt: '2026-03-28T12:00:00Z' },
        { _id: '6', type: 'contribution', amount: 500, currency: 'XLM', status: 'confirmed', description: 'Game Server Cluster', createdAt: '2026-04-05T16:45:00Z' },
      ]);
      setStats({
        totalContributed: 4000,
        totalEarnings: 67.8,
        totalTransactions: 6,
        monthlyContributions: [
          { month: 'Nov', amount: 0 }, { month: 'Dec', amount: 0 },
          { month: 'Jan', amount: 0 }, { month: 'Feb', amount: 2000 },
          { month: 'Mar', amount: 1500 }, { month: 'Apr', amount: 500 },
        ],
        byType: { contribution: 4, earning: 2, withdrawal: 0, transfer: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateROI = () => {
    const { investment, months, utilization } = roiInput;
    const monthlyReturn = (investment * (utilization / 100) * 0.04); // 4% monthly base return
    const totalReturn = monthlyReturn * months;
    const roi = ((totalReturn / investment) * 100);
    const netProfit = totalReturn - investment * 0.02; // 2% platform fee over entire period
    return { monthlyReturn: monthlyReturn.toFixed(2), totalReturn: totalReturn.toFixed(2), roi: roi.toFixed(1), netProfit: netProfit.toFixed(2) };
  };

  const roiResult = calculateROI();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: '#1a2035', border: '1px solid rgba(99,115,148,0.2)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}>
          <p style={{ color: '#f0f4ff', fontWeight: 600 }}>{label}</p>
          {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(6,214,160,0.2)', borderTopColor: '#06d6a0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Usage & <span className="gradient-text">Analytics</span>
        </h1>
        <p style={{ color: '#8892b0', fontSize: '0.9rem', marginBottom: '2rem' }}>Track your contributions, earnings, and compute usage</p>
      </motion.div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Contributed', value: `${stats?.totalContributed?.toLocaleString()} XLM`, color: '#4361ee', icon: DollarSign },
          { label: 'Total Earnings', value: `${stats?.totalEarnings} XLM`, color: '#06d6a0', icon: TrendingUp },
          { label: 'Transactions', value: stats?.totalTransactions, color: '#7b2ff7', icon: History },
          { label: 'ROI', value: `${roiResult.roi}%`, color: '#f72585', icon: Activity },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: `${card.color}15`, border: `1px solid ${card.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={18} color={card.color} />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#5a6380', fontWeight: 600 }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{card.value}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Monthly Contributions Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Monthly Contributions</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlyContributions}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,115,148,0.1)" />
                <XAxis dataKey="month" tick={{ fill: '#8892b0', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8892b0', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" name="Amount" stroke="#4361ee" fill="rgba(67,97,238,0.15)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ROI Calculator */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={16} color="#06d6a0" /> ROI Calculator
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.3rem' }}>Investment (XLM)</label>
              <input type="number" value={roiInput.investment} onChange={(e) => setRoiInput(p => ({ ...p, investment: parseInt(e.target.value) || 0 }))} className="input-field" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.3rem' }}>Duration (months)</label>
                <input type="number" value={roiInput.months} onChange={(e) => setRoiInput(p => ({ ...p, months: parseInt(e.target.value) || 1 }))} className="input-field" min="1" max="24" />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.3rem' }}>Utilization (%)</label>
                <input type="number" value={roiInput.utilization} onChange={(e) => setRoiInput(p => ({ ...p, utilization: parseInt(e.target.value) || 0 }))} className="input-field" min="0" max="100" />
              </div>
            </div>

            {/* Results */}
            <div style={{ padding: '1rem', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(6,214,160,0.06), rgba(67,97,238,0.06))', border: '1px solid rgba(6,214,160,0.15)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#5a6380', marginBottom: '0.15rem' }}>Monthly Return</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#06d6a0' }}>{roiResult.monthlyReturn} XLM</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#5a6380', marginBottom: '0.15rem' }}>Total Return</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#4361ee' }}>{roiResult.totalReturn} XLM</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#5a6380', marginBottom: '0.15rem' }}>Net Profit</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#7b2ff7' }}>{roiResult.netProfit} XLM</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#5a6380', marginBottom: '0.15rem' }}>ROI</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }} className="gradient-text">{roiResult.roi}%</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={16} color="#4361ee" /> Transaction History
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(99,115,148,0.15)' }}>
                {['Type', 'Amount', 'Description', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '0.65rem', textAlign: 'left', color: '#5a6380', fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} style={{ borderBottom: '1px solid rgba(99,115,148,0.08)' }}>
                  <td style={{ padding: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {tx.type === 'contribution' ? <ArrowUpRight size={14} color="#4361ee" /> : <ArrowDownLeft size={14} color="#06d6a0" />}
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{tx.type}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: tx.type === 'earning' ? '#06d6a0' : '#f0f4ff' }}>
                    {tx.type === 'earning' ? '+' : '-'}{tx.amount} {tx.currency}
                  </td>
                  <td style={{ padding: '0.65rem', color: '#8892b0', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tx.description}
                  </td>
                  <td style={{ padding: '0.65rem' }}>
                    <span className={`badge ${tx.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>{tx.status}</span>
                  </td>
                  <td style={{ padding: '0.65rem', color: '#5a6380', whiteSpace: 'nowrap' }}>
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
