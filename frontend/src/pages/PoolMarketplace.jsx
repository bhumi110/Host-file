/**
 * Pool Marketplace Page
 * 
 * Browse, search, and filter available funding pools.
 * Displays pool cards with funding progress and specs.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { poolsAPI } from '../services/api.js';
import {
  Search, Filter, Plus, Server, Users, Cpu,
  HardDrive, Globe, Clock, ArrowRight, Loader2,
  Zap, Shield
} from 'lucide-react';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'compute', label: 'Compute' },
  { value: 'gpu', label: 'GPU' },
  { value: 'ml-training', label: 'ML Training' },
  { value: 'web-hosting', label: 'Web Hosting' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'rendering', label: 'Rendering' },
  { value: 'storage', label: 'Storage' },
];

const statusFilters = [
  { value: '', label: 'All Status' },
  { value: 'funding', label: 'Funding' },
  { value: 'active', label: 'Active' },
  { value: 'funded', label: 'Funded' },
];

const providerColors = { aws: '#ff9900', gcp: '#4285f4', azure: '#0078d4' };
const categoryIcons = {
  compute: Cpu, gpu: Zap, 'ml-training': Zap, 'web-hosting': Globe,
  gaming: Server, rendering: Server, storage: HardDrive,
};

export default function PoolMarketplace() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchPools();
  }, [category, status]);

  const fetchPools = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (status) params.status = status;
      if (search) params.search = search;

      const res = await poolsAPI.getAll(params);
      setPools(res.data.pools || []);
    } catch (err) {
      // Fallback demo data
      setPools([
        {
          _id: 'pool-demo-1', name: 'AI Training GPU Cluster', description: 'High-performance GPU cluster for distributed machine learning.', category: 'ml-training',
          serverSpec: { cpu: 32, ram: 256, storage: 2000, gpu: 'NVIDIA A100 x4', region: 'us-east-1', provider: 'aws' },
          fundingTarget: 5000, currentFunding: 3750, currency: 'XLM', status: 'funding',
          contributors: [{}, {}, {}], fundingProgress: 75, contributorCount: 3, tags: ['GPU', 'AI', 'ML'],
          fundingDeadline: '2026-05-01', maxContributors: 20,
        },
        {
          _id: 'pool-demo-2', name: 'Web3 Full-Stack Hosting', description: 'Scalable web hosting for decentralized applications.', category: 'web-hosting',
          serverSpec: { cpu: 16, ram: 64, storage: 500, gpu: 'none', region: 'eu-west-1', provider: 'gcp' },
          fundingTarget: 2000, currentFunding: 2000, currency: 'XLM', status: 'active',
          contributors: [{}, {}, {}], fundingProgress: 100, contributorCount: 3, tags: ['Web3', 'dApps'],
          fundingDeadline: '2026-04-20', maxContributors: 30,
        },
        {
          _id: 'pool-demo-3', name: 'Game Server Cluster', description: 'Low-latency gaming server infrastructure.', category: 'gaming',
          serverSpec: { cpu: 24, ram: 128, storage: 1000, gpu: 'NVIDIA T4 x2', region: 'us-west-2', provider: 'aws' },
          fundingTarget: 3500, currentFunding: 1200, currency: 'XLM', status: 'funding',
          contributors: [{}, {}], fundingProgress: 34.29, contributorCount: 2, tags: ['Gaming', 'Low-Latency'],
          fundingDeadline: '2026-05-15', maxContributors: 25,
        },
        {
          _id: 'pool-demo-4', name: 'Data Analytics Pipeline', description: 'Big data processing for real-time analytics.', category: 'compute',
          serverSpec: { cpu: 48, ram: 192, storage: 5000, gpu: 'none', region: 'ap-southeast-1', provider: 'azure' },
          fundingTarget: 8000, currentFunding: 6400, currency: 'USDC', status: 'funding',
          contributors: [{}, {}, {}, {}], fundingProgress: 80, contributorCount: 4, tags: ['Big Data', 'Analytics'],
          fundingDeadline: '2026-06-01', maxContributors: 15,
        },
        {
          _id: 'pool-demo-5', name: '3D Rendering Farm', description: 'Distributed GPU rendering for 3D artists.', category: 'rendering',
          serverSpec: { cpu: 64, ram: 512, storage: 4000, gpu: 'NVIDIA RTX 4090 x8', region: 'us-central-1', provider: 'gcp' },
          fundingTarget: 12000, currentFunding: 4800, currency: 'XLM', status: 'funding',
          contributors: [{}, {}, {}], fundingProgress: 40, contributorCount: 3, tags: ['3D', 'Rendering'],
          fundingDeadline: '2026-05-20', maxContributors: 10,
        },
        {
          _id: 'pool-demo-6', name: 'Blockchain Node Cluster', description: 'Multi-chain validator and RPC node infrastructure.', category: 'compute',
          serverSpec: { cpu: 16, ram: 64, storage: 2000, gpu: 'none', region: 'eu-central-1', provider: 'aws' },
          fundingTarget: 3000, currentFunding: 3000, currency: 'XLM', status: 'active',
          contributors: [{}, {}, {}], fundingProgress: 100, contributorCount: 3, tags: ['Blockchain', 'Validator'],
          fundingDeadline: '2026-04-01', maxContributors: 20,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPools();
  };

  const filteredPools = search
    ? pools.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    : pools;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Pool <span className="gradient-text">Marketplace</span>
          </motion.h1>
          <p style={{ color: '#8892b0', fontSize: '0.9rem' }}>Browse and join funding pools for shared cloud infrastructure</p>
        </div>
        <Link to="/create-pool" className="btn-primary">
          <Plus size={16} /> Create Pool
        </Link>
      </div>

      {/* Search & Filters */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} color="#5a6380" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pools..."
            className="input-field"
            style={{ paddingLeft: '2.25rem' }}
          />
        </form>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select-field"
          style={{ width: 'auto', minWidth: 150 }}
        >
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="select-field"
          style={{ width: 'auto', minWidth: 130 }}
        >
          {statusFilters.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Pool Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(6,214,160,0.2)', borderTopColor: '#06d6a0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ color: '#8892b0' }}>Loading pools...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1rem',
        }}>
          {filteredPools.map((pool, i) => {
            const CategoryIcon = categoryIcons[pool.category] || Server;
            const progress = pool.fundingProgress || (pool.currentFunding / pool.fundingTarget * 100);

            return (
              <motion.div
                key={pool._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link to={`/pools/${pool._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="glass-card" style={{ padding: '1.25rem', cursor: 'pointer' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          background: 'rgba(67, 97, 238, 0.12)',
                          border: '1px solid rgba(67, 97, 238, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <CategoryIcon size={20} color="#4361ee" />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.1rem', lineHeight: 1.2 }}>{pool.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: providerColors[pool.serverSpec?.provider] || '#8892b0' }} />
                            <span style={{ fontSize: '0.7rem', color: '#5a6380', textTransform: 'uppercase', fontWeight: 600 }}>
                              {pool.serverSpec?.provider || 'AWS'} • {pool.serverSpec?.region || 'us-east-1'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${pool.status === 'active' ? 'badge-success' : pool.status === 'funded' ? 'badge-info' : 'badge-warning'}`}>
                        {pool.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{ color: '#8892b0', fontSize: '0.82rem', marginBottom: '0.85rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {pool.description}
                    </p>

                    {/* Specs */}
                    <div style={{
                      display: 'flex',
                      gap: '0.75rem',
                      marginBottom: '0.85rem',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#8892b0' }}>
                        <Cpu size={13} color="#06d6a0" /> {pool.serverSpec?.cpu || 4} vCPU
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#8892b0' }}>
                        <Server size={13} color="#4361ee" /> {pool.serverSpec?.ram || 16} GB
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#8892b0' }}>
                        <HardDrive size={13} color="#7b2ff7" /> {pool.serverSpec?.storage || 100} GB
                      </div>
                      {pool.serverSpec?.gpu && pool.serverSpec.gpu !== 'none' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#8892b0' }}>
                          <Zap size={13} color="#f72585" /> {pool.serverSpec.gpu}
                        </div>
                      )}
                    </div>

                    {/* Funding Progress */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#8892b0' }}>
                          <span style={{ fontWeight: 700, color: '#f0f4ff', fontFamily: 'var(--font-mono)' }}>
                            {pool.currentFunding?.toLocaleString()}
                          </span>{' '}
                          / {pool.fundingTarget?.toLocaleString()} {pool.currency}
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#06d6a0', fontFamily: 'var(--font-mono)' }}>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#8892b0' }}>
                        <Users size={13} /> {pool.contributorCount || pool.contributors?.length || 0}/{pool.maxContributors || 50}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#06d6a0', fontWeight: 600 }}>
                        View Details <ArrowRight size={13} />
                      </div>
                    </div>

                    {/* Tags */}
                    {pool.tags && pool.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
                        {pool.tags.slice(0, 3).map(tag => (
                          <span key={tag} style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            background: 'rgba(67, 97, 238, 0.08)',
                            border: '1px solid rgba(67, 97, 238, 0.15)',
                            fontSize: '0.68rem',
                            color: '#8892b0',
                            fontWeight: 500,
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && filteredPools.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Server size={48} color="#5a6380" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No pools found</h3>
          <p style={{ color: '#8892b0', marginBottom: '1.5rem' }}>Try adjusting your search or filters</p>
          <Link to="/create-pool" className="btn-primary">
            <Plus size={16} /> Create a Pool
          </Link>
        </div>
      )}
    </div>
  );
}
