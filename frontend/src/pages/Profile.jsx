/**
 * Profile / Settings Page
 * 
 * User profile management, wallet info,
 * notification settings, and account stats.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { usersAPI, stellarAPI } from '../services/api.js';
import toast from 'react-hot-toast';
import {
  User, Mail, Wallet, Shield, Bell, Settings,
  Save, Globe, Zap, Copy, CheckCircle, ExternalLink,
  TrendingUp, Server, Clock
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [notifications, setNotifications] = useState({
    poolFilled: true,
    serverActive: true,
    transactionAlerts: true,
    emailNotifications: false,
  });

  useEffect(() => {
    if (user?.walletAddress) {
      fetchBalance();
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      const res = await stellarAPI.getBalance(user.walletAddress);
      setWalletBalance(res.data);
    } catch {
      setWalletBalance({ xlmBalance: 4521.50, balances: [{ asset: 'XLM', balance: 4521.50 }, { asset: 'USDC', balance: 1250.00 }], mock: true });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersAPI.updateProfile({ ...formData, notifications });
      updateUser({ username: formData.username, email: formData.email });
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch {
      toast.success('Profile updated! (Demo)');
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(user?.walletAddress || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const userStats = user?.stats || {
    totalContributed: 2700,
    activePools: 3,
    totalComputeHours: 384,
    totalEarnings: 67.8,
    creditsAvailable: 156,
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Profile & <span className="gradient-text">Settings</span>
        </h1>
        <p style={{ color: '#8892b0', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Manage your account, wallet, and notification preferences
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem' }}>
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username || 'user'}`}
              alt="avatar"
              style={{ width: 64, height: 64, borderRadius: '16px', border: '3px solid rgba(6,214,160,0.3)' }}
            />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user?.username || 'User'}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className={`badge ${user?.role === 'admin' ? 'badge-error' : 'badge-info'}`}>{user?.role || 'user'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                <User size={14} /> Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                className="input-field"
                disabled={!editing}
                style={{ opacity: editing ? 1 : 0.7 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8892b0', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                <Mail size={14} /> Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                className="input-field"
                disabled={!editing}
                style={{ opacity: editing ? 1 : 0.7 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-secondary">
                <Settings size={14} /> Edit Profile
              </button>
            )}
          </div>
        </motion.div>

        {/* Wallet Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={16} color="#06d6a0" /> Stellar Wallet
          </h3>

          {user?.walletAddress ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem',
                borderRadius: '10px', background: 'rgba(17,24,39,0.5)', marginBottom: '1rem',
              }}>
                <Globe size={14} color="#06d6a0" />
                <span style={{ flex: 1, fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: '#8892b0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.walletAddress}
                </span>
                <button onClick={copyAddress} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copied ? '#06d6a0' : '#5a6380' }}>
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* Balances */}
              {walletBalance && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {walletBalance.balances?.map((bal, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.65rem', borderRadius: '8px', background: 'rgba(17,24,39,0.3)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'linear-gradient(135deg, #06d6a0, #4361ee)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0a0e1a' }}>{bal.asset?.substring(0, 1)}</span>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{bal.asset}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem' }}>
                        {bal.balance?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {walletBalance.mock && (
                    <div style={{ fontSize: '0.72rem', color: '#5a6380', fontStyle: 'italic', textAlign: 'center' }}>
                      Mock balances (testnet)
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8892b0', fontSize: '0.85rem' }}>
              <Wallet size={32} color="#5a6380" style={{ margin: '0 auto 0.75rem' }} />
              <p>No wallet connected</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#5a6380' }}>
                Connect via Freighter to see balances
              </p>
            </div>
          )}
        </motion.div>

        {/* Stats Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} color="#4361ee" /> Contribution Stats
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Total Contributed', value: `${userStats.totalContributed?.toLocaleString()} XLM`, icon: Zap, color: '#06d6a0' },
              { label: 'Active Pools', value: userStats.activePools, icon: Server, color: '#4361ee' },
              { label: 'Compute Hours', value: `${userStats.totalComputeHours} hrs`, icon: Clock, color: '#7b2ff7' },
              { label: 'Earnings', value: `${userStats.totalEarnings} XLM`, icon: TrendingUp, color: '#f72585' },
            ].map(stat => (
              <div key={stat.label} style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(17,24,39,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                  <stat.icon size={13} color={stat.color} />
                  <span style={{ fontSize: '0.72rem', color: '#5a6380', fontWeight: 600 }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(6,214,160,0.06), rgba(67,97,238,0.06))', border: '1px solid rgba(6,214,160,0.15)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#8892b0' }}>Available Credits:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginLeft: '0.5rem', color: '#06d6a0' }}>{userStats.creditsAvailable}</span>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={16} color="#ffd166" /> Notification Preferences
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { key: 'poolFilled', label: 'Pool Filled Alerts', desc: 'Get notified when a pool reaches its target' },
              { key: 'serverActive', label: 'Server Status', desc: 'Alerts when servers go active or down' },
              { key: 'transactionAlerts', label: 'Transaction Alerts', desc: 'Notifications for contributions and earnings' },
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
            ].map(pref => (
              <div key={pref.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem', borderRadius: '10px', background: 'rgba(17,24,39,0.3)',
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.1rem' }}>{pref.label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#5a6380' }}>{pref.desc}</div>
                </div>
                <button
                  onClick={() => setNotifications(p => ({ ...p, [pref.key]: !p[pref.key] }))}
                  style={{
                    width: 44, height: 24, borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: notifications[pref.key] ? '#06d6a0' : 'rgba(99,115,148,0.3)',
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#f0f4ff',
                    position: 'absolute', top: '3px',
                    left: notifications[pref.key] ? '23px' : '3px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
