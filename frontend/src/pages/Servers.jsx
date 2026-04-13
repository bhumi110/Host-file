/**
 * Servers Page
 * 
 * List of provisioned cloud servers with status,
 * specs, and resource allocation overview.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { serversAPI } from '../services/api.js';
import {
  Server, Cpu, HardDrive, Globe, Activity, Clock,
  ArrowRight, CheckCircle, XCircle, Loader2, Wifi
} from 'lucide-react';

export default function Servers() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const res = await serversAPI.getAll();
      setServers(res.data.servers || []);
    } catch (err) {
      setServers([
        {
          _id: 'server-demo-1', name: 'web3-hosting-prod-01', provider: 'gcp', region: 'eu-west-1', status: 'running',
          specs: { cpu: 16, ram: 64, storage: 500, gpu: 'none', os: 'Ubuntu 22.04 LTS' },
          ipAddress: '35.246.128.42', metrics: { cpuUsage: 62, ramUsage: 45, healthScore: 98, uptime: 720 },
          costPerHour: 2.45, provisionedAt: '2026-03-01',
        },
        {
          _id: 'server-demo-2', name: 'blockchain-nodes-01', provider: 'aws', region: 'eu-central-1', status: 'running',
          specs: { cpu: 16, ram: 64, storage: 2000, gpu: 'none', os: 'Ubuntu 22.04 LTS' },
          ipAddress: '18.156.32.87', metrics: { cpuUsage: 78, ramUsage: 55, healthScore: 95, uptime: 1080 },
          costPerHour: 1.85, provisionedAt: '2026-02-10',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'running': return <CheckCircle size={14} color="#06d6a0" />;
      case 'stopped': return <XCircle size={14} color="#ef4444" />;
      case 'provisioning': return <Loader2 size={14} color="#ffd166" style={{ animation: 'spin 1s linear infinite' }} />;
      default: return <Activity size={14} color="#8892b0" />;
    }
  };

  const providerColor = { aws: '#ff9900', gcp: '#4285f4', azure: '#0078d4', mock: '#8892b0' };

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
          My <span className="gradient-text">Servers</span>
        </h1>
        <p style={{ color: '#8892b0', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Monitor and manage your provisioned cloud infrastructure
        </p>
      </motion.div>

      {/* Server Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { label: 'Active Servers', value: servers.filter(s => s.status === 'running').length, color: '#06d6a0', icon: Server },
          { label: 'Total vCPUs', value: servers.reduce((a, s) => a + (s.specs?.cpu || 0), 0), color: '#4361ee', icon: Cpu },
          { label: 'Total RAM', value: `${servers.reduce((a, s) => a + (s.specs?.ram || 0), 0)} GB`, color: '#7b2ff7', icon: HardDrive },
          { label: 'Avg Health', value: `${Math.round(servers.reduce((a, s) => a + (s.metrics?.healthScore || 0), 0) / (servers.length || 1))}%`, color: '#f72585', icon: Activity },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card"
            style={{ padding: '1rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <stat.icon size={16} color={stat.color} />
              <span style={{ fontSize: '0.75rem', color: '#5a6380', fontWeight: 600 }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Server Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {servers.map((server, i) => (
          <motion.div
            key={server._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={`/servers/${server._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  {/* Server Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '12px',
                      background: `${providerColor[server.provider]}15`,
                      border: `1px solid ${providerColor[server.provider]}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Server size={22} color={providerColor[server.provider]} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{server.name}</h3>
                        <span className={`badge ${server.status === 'running' ? 'badge-success' : 'badge-error'}`} style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          {statusIcon(server.status)} {server.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#8892b0' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Globe size={12} /> {(server.provider || 'aws').toUpperCase()} • {server.region}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Wifi size={12} /> {server.ipAddress}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Specs */}
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#5a6380', fontWeight: 600, marginBottom: '0.15rem' }}>CPU</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#06d6a0' }}>
                        {server.specs?.cpu} vCPU
                      </div>
                      <div className="progress-bar-container" style={{ height: 4, width: 60, marginTop: '0.25rem' }}>
                        <div className="progress-bar-fill" style={{ width: `${server.metrics?.cpuUsage || 0}%`, background: '#06d6a0' }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#5a6380', fontWeight: 600, marginBottom: '0.15rem' }}>RAM</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#4361ee' }}>
                        {server.specs?.ram} GB
                      </div>
                      <div className="progress-bar-container" style={{ height: 4, width: 60, marginTop: '0.25rem' }}>
                        <div className="progress-bar-fill" style={{ width: `${server.metrics?.ramUsage || 0}%`, background: '#4361ee' }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#5a6380', fontWeight: 600, marginBottom: '0.15rem' }}>Health</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: server.metrics?.healthScore >= 90 ? '#06d6a0' : '#ffd166' }}>
                        {server.metrics?.healthScore}%
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#5a6380', fontWeight: 600, marginBottom: '0.15rem' }}>Uptime</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f0f4ff' }}>
                        {Math.floor((server.metrics?.uptime || 0) / 24)}d {(server.metrics?.uptime || 0) % 24}h
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={18} color="#5a6380" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {servers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Server size={48} color="#5a6380" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No servers yet</h3>
          <p style={{ color: '#8892b0', marginBottom: '1.5rem' }}>Join a pool and contribute to get server access</p>
          <Link to="/pools" className="btn-primary">Browse Pools</Link>
        </div>
      )}
    </div>
  );
}
