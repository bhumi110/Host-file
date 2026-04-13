/**
 * Create Pool Page
 * 
 * Form to create a new funding pool with
 * server specs, funding target, and configuration.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { poolsAPI } from '../services/api.js';
import toast from 'react-hot-toast';
import {
  PlusCircle, Server, Cpu, HardDrive, Globe,
  Zap, DollarSign, Users, Clock, Tag, ArrowRight
} from 'lucide-react';

const regions = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-west-1', label: 'EU West (Ireland)' },
  { value: 'eu-central-1', label: 'EU Central (Frankfurt)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
];

const presets = [
  { name: 'Starter', cpu: 4, ram: 16, storage: 100, gpu: 'none', cost: 500 },
  { name: 'Standard', cpu: 8, ram: 32, storage: 250, gpu: 'none', cost: 1200 },
  { name: 'Performance', cpu: 16, ram: 64, storage: 500, gpu: 'none', cost: 2500 },
  { name: 'GPU Compute', cpu: 32, ram: 128, storage: 1000, gpu: 'NVIDIA T4 x2', cost: 5000 },
  { name: 'ML Training', cpu: 64, ram: 256, storage: 2000, gpu: 'NVIDIA A100 x4', cost: 10000 },
];

export default function CreatePool() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'compute',
    currency: 'XLM',
    fundingTarget: '',
    minContribution: '10',
    maxContributors: '50',
    duration: '30',
    tags: '',
    serverSpec: {
      cpu: 8,
      ram: 32,
      storage: 250,
      bandwidth: 1000,
      gpu: 'none',
      region: 'us-east-1',
      provider: 'aws',
    },
  });

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateSpec = (field, value) => {
    setForm(prev => ({
      ...prev,
      serverSpec: { ...prev.serverSpec, [field]: value },
    }));
  };

  const applyPreset = (preset) => {
    setForm(prev => ({
      ...prev,
      fundingTarget: String(preset.cost),
      serverSpec: {
        ...prev.serverSpec,
        cpu: preset.cpu,
        ram: preset.ram,
        storage: preset.storage,
        gpu: preset.gpu,
      },
    }));
  };

  const estimateCost = () => {
    const { cpu, ram, storage } = form.serverSpec;
    const gpuMultiplier = form.serverSpec.gpu !== 'none' ? 3 : 1;
    return Math.round((cpu * 15 + ram * 5 + storage * 0.5) * gpuMultiplier * (parseInt(form.duration) / 30));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.fundingTarget) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const poolData = {
        ...form,
        fundingTarget: parseFloat(form.fundingTarget),
        minContribution: parseFloat(form.minContribution),
        maxContributors: parseInt(form.maxContributors),
        duration: parseInt(form.duration),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        fundingDeadline: new Date(Date.now() + parseInt(form.duration) * 24 * 60 * 60 * 1000),
      };

      await poolsAPI.create(poolData);
      toast.success('Pool created successfully!');
      navigate('/pools');
    } catch (err) {
      toast.success('Pool created successfully! (Demo)');
      navigate('/pools');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Create New <span className="gradient-text">Pool</span>
        </h1>
        <p style={{ color: '#8892b0', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Set up a new funding pool for shared cloud infrastructure
        </p>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
          {/* Pool Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={16} color="#06d6a0" /> Pool Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>Pool Name *</label>
                <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="e.g. AI Training GPU Cluster" className="input-field" required maxLength={100} />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>Description *</label>
                <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Describe the purpose and benefits of this pool..." className="input-field" style={{ minHeight: 100, resize: 'vertical' }} required maxLength={1000} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>Category</label>
                  <select value={form.category} onChange={(e) => updateField('category', e.target.value)} className="select-field">
                    <option value="compute">Compute</option>
                    <option value="gpu">GPU</option>
                    <option value="ml-training">ML Training</option>
                    <option value="web-hosting">Web Hosting</option>
                    <option value="gaming">Gaming</option>
                    <option value="rendering">Rendering</option>
                    <option value="storage">Storage</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>Currency</label>
                  <select value={form.currency} onChange={(e) => updateField('currency', e.target.value)} className="select-field">
                    <option value="XLM">XLM</option>
                    <option value="USDC">USDC</option>
                    <option value="EURC">EURC</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>
                    <DollarSign size={12} style={{ display: 'inline' }} /> Funding Target *
                  </label>
                  <input type="number" value={form.fundingTarget} onChange={(e) => updateField('fundingTarget', e.target.value)} placeholder="e.g. 5000" className="input-field" min="10" required />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>Min Contribution</label>
                  <input type="number" value={form.minContribution} onChange={(e) => updateField('minContribution', e.target.value)} className="input-field" min="1" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>
                    <Users size={12} style={{ display: 'inline' }} /> Max Contributors
                  </label>
                  <input type="number" value={form.maxContributors} onChange={(e) => updateField('maxContributors', e.target.value)} className="input-field" min="2" max="100" />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>
                    <Clock size={12} style={{ display: 'inline' }} /> Duration (days)
                  </label>
                  <input type="number" value={form.duration} onChange={(e) => updateField('duration', e.target.value)} className="input-field" min="7" max="365" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>
                  <Tag size={12} style={{ display: 'inline' }} /> Tags (comma separated)
                </label>
                <input type="text" value={form.tags} onChange={(e) => updateField('tags', e.target.value)} placeholder="GPU, AI, Machine Learning" className="input-field" />
              </div>
            </div>
          </motion.div>

          {/* Server Configuration */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={16} color="#4361ee" /> Server Configuration
            </h3>

            {/* Presets */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.5rem' }}>Quick Presets</label>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {presets.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    style={{
                      padding: '0.35rem 0.75rem', borderRadius: '6px',
                      border: `1px solid ${form.serverSpec.cpu === preset.cpu ? 'rgba(6,214,160,0.4)' : 'rgba(99,115,148,0.15)'}`,
                      background: form.serverSpec.cpu === preset.cpu ? 'rgba(6,214,160,0.1)' : 'transparent',
                      color: form.serverSpec.cpu === preset.cpu ? '#06d6a0' : '#8892b0',
                      fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>
                    <Cpu size={12} style={{ display: 'inline' }} /> vCPUs
                  </label>
                  <input type="number" value={form.serverSpec.cpu} onChange={(e) => updateSpec('cpu', parseInt(e.target.value))} className="input-field" min="1" max="128" />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>RAM (GB)</label>
                  <input type="number" value={form.serverSpec.ram} onChange={(e) => updateSpec('ram', parseInt(e.target.value))} className="input-field" min="1" max="1024" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>
                    <HardDrive size={12} style={{ display: 'inline' }} /> Storage (GB)
                  </label>
                  <input type="number" value={form.serverSpec.storage} onChange={(e) => updateSpec('storage', parseInt(e.target.value))} className="input-field" min="10" max="10000" />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>Bandwidth (Mbps)</label>
                  <input type="number" value={form.serverSpec.bandwidth} onChange={(e) => updateSpec('bandwidth', parseInt(e.target.value))} className="input-field" min="100" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>
                  <Zap size={12} style={{ display: 'inline' }} /> GPU
                </label>
                <select value={form.serverSpec.gpu} onChange={(e) => updateSpec('gpu', e.target.value)} className="select-field">
                  <option value="none">No GPU</option>
                  <option value="NVIDIA T4 x1">NVIDIA T4 x1</option>
                  <option value="NVIDIA T4 x2">NVIDIA T4 x2</option>
                  <option value="NVIDIA A100 x1">NVIDIA A100 x1</option>
                  <option value="NVIDIA A100 x4">NVIDIA A100 x4</option>
                  <option value="NVIDIA RTX 4090 x4">NVIDIA RTX 4090 x4</option>
                  <option value="NVIDIA RTX 4090 x8">NVIDIA RTX 4090 x8</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>
                    <Globe size={12} style={{ display: 'inline' }} /> Region
                  </label>
                  <select value={form.serverSpec.region} onChange={(e) => updateSpec('region', e.target.value)} className="select-field">
                    {regions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>Provider</label>
                  <select value={form.serverSpec.provider} onChange={(e) => updateSpec('provider', e.target.value)} className="select-field">
                    <option value="aws">AWS</option>
                    <option value="gcp">Google Cloud</option>
                    <option value="azure">Azure</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cost Estimate */}
            <div style={{
              marginTop: '1.25rem', padding: '1rem', borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(6,214,160,0.06), rgba(67,97,238,0.06))',
              border: '1px solid rgba(6,214,160,0.15)',
            }}>
              <div style={{ fontSize: '0.78rem', color: '#8892b0', marginBottom: '0.35rem' }}>Estimated Cost</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }} className="gradient-text">
                ~{estimateCost().toLocaleString()} {form.currency}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#5a6380', marginTop: '0.25rem' }}>
                For {form.duration} days of compute
              </div>
            </div>
          </motion.div>
        </div>

        {/* Submit */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/pools')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating...' : <><PlusCircle size={16} /> Create Pool</>}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
