/**
 * Server Details Page
 * 
 * Detailed server view with real-time metrics,
 * resource allocations, and performance charts.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { serversAPI } from '../services/api.js';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft, Server, Cpu, HardDrive, Globe, Activity,
  Clock, Wifi, Shield, Users, Terminal, RefreshCw
} from 'lucide-react';

export default function ServerDetails() {
  const { id } = useParams();
  const [server, setServer] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [serverRes, metricsRes] = await Promise.all([
        serversAPI.getById(id),
        serversAPI.getMetrics(id),
      ]);
      setServer(serverRes.data.server);
      setMetrics(metricsRes.data.metrics);
    } catch (err) {
      // Fallback demo data
      setServer({
        _id: id, name: 'web3-hosting-prod-01', provider: 'gcp', region: 'eu-west-1', status: 'running',
        specs: { cpu: 16, ram: 64, storage: 500, bandwidth: 5000, gpu: 'none', os: 'Ubuntu 22.04 LTS' },
        ipAddress: '35.246.128.42', accessUrl: 'https://web3-hosting-prod-01.fshp.cloud',
        allocations: [
          { username: 'bob_ml', percentage: 40, cpuAllocation: 6.4, ramAllocation: 25.6, usedHours: 128, remainingCredits: 72 },
          { username: 'diana_web3', percentage: 35, cpuAllocation: 5.6, ramAllocation: 22.4, usedHours: 96, remainingCredits: 82 },
          { username: 'eve_stack', percentage: 25, cpuAllocation: 4.0, ramAllocation: 16.0, usedHours: 64, remainingCredits: 90 },
        ],
        metrics: { cpuUsage: 62, ramUsage: 45, storageUsage: 38, networkIn: 1250, networkOut: 890, uptime: 720, healthScore: 98 },
        costPerHour: 2.45, totalCost: 1764, provisionedAt: '2026-03-01', expiresAt: '2026-05-01',
      });

      const now = Date.now();
      setMetrics({
        cpu: Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, value: Math.round(40 + Math.sin(i * 0.5) * 20 + Math.random() * 10) })),
        ram: Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, value: Math.round(35 + Math.sin(i * 0.3) * 12 + Math.random() * 8) })),
        network: Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, inbound: Math.floor(800 + Math.random() * 1200), outbound: Math.floor(500 + Math.random() * 800) })),
        current: { cpuUsage: 62, ramUsage: 45, storageUsage: 38, uptime: 720, healthScore: 98 },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !server) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(6,214,160,0.2)', borderTopColor: '#06d6a0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: '#1a2035', border: '1px solid rgba(99,115,148,0.2)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}>
          <p style={{ color: '#f0f4ff', fontWeight: 600 }}>{label}</p>
          {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}{p.name === 'CPU' || p.name === 'RAM' ? '%' : ' Mbps'}</p>)}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Link to="/servers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#8892b0', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Servers
      </Link>

      {/* Server Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{server.name}</h1>
              <span className={`badge ${server.status === 'running' ? 'badge-success' : 'badge-error'}`}>
                {server.status}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#8892b0', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Globe size={14} /> {server.provider?.toUpperCase()} • {server.region}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Wifi size={14} /> {server.ipAddress}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> Uptime: {Math.floor(server.metrics?.uptime / 24)}d {server.metrics?.uptime % 24}h</span>
            </div>
          </div>
          <button onClick={fetchData} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Live Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'CPU Usage', value: `${server.metrics?.cpuUsage}%`, color: '#06d6a0', progress: server.metrics?.cpuUsage },
          { label: 'RAM Usage', value: `${server.metrics?.ramUsage}%`, color: '#4361ee', progress: server.metrics?.ramUsage },
          { label: 'Storage', value: `${server.metrics?.storageUsage}%`, color: '#7b2ff7', progress: server.metrics?.storageUsage },
          { label: 'Health', value: `${server.metrics?.healthScore}%`, color: server.metrics?.healthScore >= 90 ? '#06d6a0' : '#ffd166', progress: server.metrics?.healthScore },
          { label: 'Net In', value: `${server.metrics?.networkIn} Mbps`, color: '#f72585' },
          { label: 'Net Out', value: `${server.metrics?.networkOut} Mbps`, color: '#ff6b35' },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#5a6380', fontWeight: 600, marginBottom: '0.35rem' }}>{m.label}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: m.color }}>{m.value}</div>
            {m.progress !== undefined && (
              <div className="progress-bar-container" style={{ height: 4, marginTop: '0.5rem' }}>
                <div style={{ height: '100%', width: `${m.progress}%`, background: m.color, borderRadius: 'var(--radius-full)', transition: 'width 0.5s' }} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>CPU & RAM (24h)</h3>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.cpu.map((c, i) => ({ ...c, ram: metrics.ram[i]?.value }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,115,148,0.1)" />
                  <XAxis dataKey="time" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" name="CPU" stroke="#06d6a0" fill="rgba(6,214,160,0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="ram" name="RAM" stroke="#4361ee" fill="rgba(67,97,238,0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Network I/O (24h)</h3>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.network}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,115,148,0.1)" />
                  <XAxis dataKey="time" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="inbound" name="Inbound" stroke="#f72585" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="outbound" name="Outbound" stroke="#ff6b35" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* Resource Allocations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={16} color="#06d6a0" /> Resource Allocations
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(99,115,148,0.15)' }}>
                {['User', 'Share', 'CPU', 'RAM', 'Hours Used', 'Credits'].map(h => (
                  <th key={h} style={{ padding: '0.65rem', textAlign: 'left', color: '#5a6380', fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {server.allocations?.map((alloc, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(99,115,148,0.08)' }}>
                  <td style={{ padding: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${alloc.username}`} alt="" style={{ width: 28, height: 28, borderRadius: '6px' }} />
                      <span style={{ fontWeight: 600 }}>{alloc.username}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.65rem', fontFamily: 'var(--font-mono)', color: '#06d6a0', fontWeight: 700 }}>{alloc.percentage}%</td>
                  <td style={{ padding: '0.65rem', fontFamily: 'var(--font-mono)' }}>{alloc.cpuAllocation} vCPU</td>
                  <td style={{ padding: '0.65rem', fontFamily: 'var(--font-mono)' }}>{alloc.ramAllocation} GB</td>
                  <td style={{ padding: '0.65rem', fontFamily: 'var(--font-mono)' }}>{alloc.usedHours}h</td>
                  <td style={{ padding: '0.65rem' }}>
                    <span className={`badge ${alloc.remainingCredits > 50 ? 'badge-success' : 'badge-warning'}`}>
                      {alloc.remainingCredits} credits
                    </span>
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
