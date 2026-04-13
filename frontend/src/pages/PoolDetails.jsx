/**
 * Pool Details Page
 * 
 * Detailed view of a single funding pool with
 * contribution form, contributor list, and specs.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { poolsAPI } from '../services/api.js';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Cpu, Server, HardDrive, Globe, Users,
  Zap, Clock, Wallet, Shield, ArrowRight, Send,
  Share2, Copy, CheckCircle
} from 'lucide-react';

export default function PoolDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contributing, setContributing] = useState(false);
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPool();
  }, [id]);

  const fetchPool = async () => {
    try {
      const res = await poolsAPI.getById(id);
      setPool(res.data.pool);
    } catch (err) {
      // Demo data fallback
      const demoPools = {
        'pool-demo-1': {
          _id: 'pool-demo-1', name: 'AI Training GPU Cluster',
          description: 'High-performance GPU cluster for distributed machine learning model training. Pool contributors gain proportional access to NVIDIA A100 GPUs for training deep learning models, running inference workloads, and processing large datasets. Features include distributed training support, model checkpointing, and real-time monitoring.',
          category: 'ml-training', serverSpec: { cpu: 32, ram: 256, storage: 2000, bandwidth: 10000, gpu: 'NVIDIA A100 x4', region: 'us-east-1', provider: 'aws' },
          fundingTarget: 5000, currentFunding: 3750, currency: 'XLM', status: 'funding',
          contributors: [
            { userId: 'u1', username: 'alice_dev', amount: 1500, percentage: 40, contributedAt: '2026-03-15' },
            { userId: 'u2', username: 'bob_ml', amount: 1250, percentage: 33.33, contributedAt: '2026-03-18' },
            { userId: 'u3', username: 'charlie_ai', amount: 1000, percentage: 26.67, contributedAt: '2026-03-20' },
          ],
          minContribution: 50, maxContributors: 20, duration: 30,
          fundingDeadline: '2026-05-01', tags: ['GPU', 'AI', 'Machine Learning', 'Deep Learning'],
          transferable: true, escrowAddress: 'GESCROW7F2A4B...POOL1',
          fundingProgress: 75, contributorCount: 3,
        },
      };
      // Default to first demo pool
      setPool(demoPools[id] || demoPools['pool-demo-1']);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (pool.minContribution && amt < pool.minContribution) {
      toast.error(`Minimum contribution is ${pool.minContribution} ${pool.currency}`);
      return;
    }

    setContributing(true);
    try {
      const res = await poolsAPI.contribute(id, { amount: amt, txHash: `mock_tx_${Date.now()}` });
      setPool(res.data.pool);
      setAmount('');
      toast.success(`Successfully contributed ${amt} ${pool.currency}!`);
    } catch (err) {
      // Simulate success for demo
      const updatedPool = { ...pool };
      updatedPool.currentFunding += amt;
      updatedPool.fundingProgress = Math.min((updatedPool.currentFunding / updatedPool.fundingTarget) * 100, 100);
      const existing = updatedPool.contributors.find(c => c.username === user?.username);
      if (existing) {
        existing.amount += amt;
      } else {
        updatedPool.contributors.push({ userId: user?._id || 'you', username: user?.username || 'you', amount: amt, percentage: 0, contributedAt: new Date().toISOString() });
      }
      updatedPool.contributors.forEach(c => { c.percentage = (c.amount / updatedPool.currentFunding) * 100; });
      updatedPool.contributorCount = updatedPool.contributors.length;
      if (updatedPool.currentFunding >= updatedPool.fundingTarget) updatedPool.status = 'funded';
      setPool(updatedPool);
      setAmount('');
      toast.success(`Successfully contributed ${amt} ${pool.currency}! (Demo)`);
    } finally {
      setContributing(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(pool.escrowAddress || 'GESCROW...');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(6,214,160,0.2)', borderTopColor: '#06d6a0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!pool) return <div style={{ textAlign: 'center', padding: '4rem', color: '#8892b0' }}>Pool not found</div>;

  const progress = pool.fundingProgress || (pool.currentFunding / pool.fundingTarget * 100);
  const remaining = pool.fundingTarget - pool.currentFunding;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Link to="/pools" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#8892b0', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Marketplace
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {/* Main Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Pool Header Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className={`badge ${pool.status === 'active' ? 'badge-success' : pool.status === 'funded' ? 'badge-info' : 'badge-warning'}`} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  {pool.status}
                </span>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>{pool.name}</h1>
              </div>
            </div>
            <p style={{ color: '#8892b0', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1rem' }}>{pool.description}</p>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {pool.tags?.map(tag => (
                <span key={tag} style={{
                  padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(67,97,238,0.08)',
                  border: '1px solid rgba(67,97,238,0.15)', fontSize: '0.72rem', color: '#8892b0', fontWeight: 500,
                }}>{tag}</span>
              ))}
            </div>
          </motion.div>

          {/* Server Specs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={16} color="#4361ee" /> Server Specifications
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {[
                { icon: Cpu, label: 'CPU', value: `${pool.serverSpec?.cpu || 4} vCPUs`, color: '#06d6a0' },
                { icon: Server, label: 'RAM', value: `${pool.serverSpec?.ram || 16} GB`, color: '#4361ee' },
                { icon: HardDrive, label: 'Storage', value: `${pool.serverSpec?.storage || 100} GB`, color: '#7b2ff7' },
                { icon: Globe, label: 'Region', value: pool.serverSpec?.region || 'us-east-1', color: '#f72585' },
                { icon: Zap, label: 'GPU', value: pool.serverSpec?.gpu || 'None', color: '#ff6b35' },
                { icon: Shield, label: 'Provider', value: (pool.serverSpec?.provider || 'aws').toUpperCase(), color: '#ffd166' },
              ].map(spec => (
                <div key={spec.label} style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(17,24,39,0.5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <spec.icon size={14} color={spec.color} />
                    <span style={{ fontSize: '0.72rem', color: '#5a6380', fontWeight: 600 }}>{spec.label}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{spec.value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contributors */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} color="#06d6a0" /> Contributors ({pool.contributorCount || pool.contributors?.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pool.contributors?.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem',
                  borderRadius: '10px', background: 'rgba(17,24,39,0.5)',
                }}>
                  <img
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${c.username}`}
                    alt={c.username}
                    style={{ width: 32, height: 32, borderRadius: '8px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.username}</div>
                    <div style={{ fontSize: '0.72rem', color: '#5a6380' }}>
                      Joined {new Date(c.contributedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#06d6a0' }}>
                      {c.amount?.toLocaleString()} {pool.currency}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#8892b0' }}>
                      {c.percentage?.toFixed(1)}% share
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Funding Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Funding Status</h3>
            
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }} className="gradient-text">
                {progress.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.82rem', color: '#8892b0' }}>funded</div>
            </div>

            <div className="progress-bar-container" style={{ height: 12, marginBottom: '1rem' }}>
              <div className="progress-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(17,24,39,0.5)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#06d6a0' }}>
                  {pool.currentFunding?.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#5a6380' }}>Raised ({pool.currency})</div>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(17,24,39,0.5)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f0f4ff' }}>
                  {pool.fundingTarget?.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#5a6380' }}>Target ({pool.currency})</div>
              </div>
            </div>

            {remaining > 0 && (
              <div style={{
                padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,209,102,0.06)',
                border: '1px solid rgba(255,209,102,0.15)', textAlign: 'center', marginBottom: '1.25rem',
              }}>
                <span style={{ fontSize: '0.82rem', color: '#ffd166' }}>
                  <strong>{remaining.toLocaleString()} {pool.currency}</strong> remaining
                </span>
              </div>
            )}

            {/* Contribute Form */}
            {pool.status === 'funding' && (
              <form onSubmit={handleContribute}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.5rem' }}>
                  Contribute to this pool
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min ${pool.minContribution || 1} ${pool.currency}`}
                    className="input-field"
                    min={pool.minContribution || 1}
                    step="0.1"
                  />
                  <button
                    type="submit"
                    disabled={contributing}
                    className="btn-primary"
                    style={{ whiteSpace: 'nowrap', opacity: contributing ? 0.7 : 1 }}
                  >
                    {contributing ? '...' : <><Send size={14} /> Send</>}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[50, 100, 250, 500].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(String(preset))}
                      style={{
                        flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(99,115,148,0.15)',
                        background: amount === String(preset) ? 'rgba(6,214,160,0.1)' : 'transparent',
                        color: amount === String(preset) ? '#06d6a0' : '#8892b0', fontSize: '0.75rem', fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </form>
            )}

            {pool.status === 'active' && (
              <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.2)', textAlign: 'center' }}>
                <CheckCircle size={20} color="#06d6a0" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#06d6a0' }}>Server is Active!</div>
                <div style={{ fontSize: '0.75rem', color: '#8892b0', marginTop: '0.25rem' }}>Cloud infrastructure is running</div>
              </div>
            )}
          </motion.div>

          {/* Escrow Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={14} color="#06d6a0" /> Pool Escrow
            </h3>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem',
              borderRadius: '8px', background: 'rgba(17,24,39,0.5)',
            }}>
              <span style={{ flex: 1, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#8892b0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pool.escrowAddress || 'GESCROW7F2A4B...'}
              </span>
              <button onClick={copyAddress} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: copied ? '#06d6a0' : '#5a6380' }}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem' }}>
              <span style={{ color: '#5a6380' }}>Ownership</span>
              <span style={{ color: pool.transferable ? '#06d6a0' : '#ef4444', fontWeight: 600 }}>
                {pool.transferable ? 'Transferable' : 'Non-transferable'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.75rem' }}>
              <span style={{ color: '#5a6380' }}>Duration</span>
              <span style={{ color: '#f0f4ff', fontWeight: 600 }}>{pool.duration || 30} days</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.75rem' }}>
              <span style={{ color: '#5a6380' }}>Deadline</span>
              <span style={{ color: '#f0f4ff', fontWeight: 600 }}>{pool.fundingDeadline ? new Date(pool.fundingDeadline).toLocaleDateString() : 'N/A'}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
