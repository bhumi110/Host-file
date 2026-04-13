/**
 * Login / Register / Wallet Connect Page
 * 
 * Tabbed authentication with email/password
 * and Freighter wallet integration.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { isConnected, getPublicKey } from '@stellar/freighter-api';
import {
  Mail, Lock, User, Wallet, ArrowRight, Zap,
  Eye, EyeOff, Loader2, AlertCircle
} from 'lucide-react';

export default function Login() {
  const { login, register, walletConnect, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | register | wallet
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        await register(formData.username, formData.email, formData.password);
        toast.success('Account created successfully!');
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Authentication failed. Is the backend running?';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    setLoading(true);
    setError('');

    try {
      // Try Freighter wallet
      if (await isConnected()) {
        const publicKey = await getPublicKey();
        await walletConnect(publicKey);
        toast.success('Wallet connected!');
        navigate('/dashboard');
        return;
      }

      // Fallback: use a demo wallet address
      const demoAddress = 'GDEMO' + Math.random().toString(36).substring(2, 15).toUpperCase() + 'STELLAR';
      await walletConnect(demoAddress);
      toast.success('Demo wallet connected!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Wallet connection failed. Is the backend running?';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
    }}>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: 440,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06d6a0, #4361ee)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap size={22} color="#0a0e1a" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.3rem' }} className="gradient-text">FSHP</span>
          </div>
        </Link>

        {/* Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Connect Wallet'}
          </h1>
          <p style={{ color: '#8892b0', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            {mode === 'wallet' ? 'Link your Stellar wallet to get started' : 'Enter your credentials to continue'}
          </p>

          {/* Mode Tabs */}
          <div style={{
            display: 'flex',
            borderRadius: '10px',
            background: 'rgba(17, 24, 39, 0.6)',
            padding: '4px',
            marginBottom: '1.5rem',
            gap: '4px',
          }}>
            {[
              { key: 'login', label: 'Sign In' },
              { key: 'register', label: 'Register' },
              { key: 'wallet', label: 'Wallet', icon: Wallet },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setMode(tab.key); setError(''); }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: mode === tab.key ? 'rgba(6, 214, 160, 0.15)' : 'transparent',
                  color: mode === tab.key ? '#06d6a0' : '#8892b0',
                  fontWeight: mode === tab.key ? 600 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                {tab.icon && <tab.icon size={14} />}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wallet Connect */}
          {mode === 'wallet' ? (
            <div>
              <button
                onClick={handleWalletConnect}
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Wallet size={18} />}
                {loading ? 'Connecting...' : 'Connect Freighter Wallet'}
              </button>
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                borderRadius: '10px',
                background: 'rgba(67, 97, 238, 0.08)',
                border: '1px solid rgba(67, 97, 238, 0.2)',
              }}>
                <p style={{ fontSize: '0.8rem', color: '#8892b0', lineHeight: 1.6 }}>
                  <strong style={{ color: '#4361ee' }}>Note:</strong> If Freighter is not installed, 
                  a demo wallet will be created for testing. Install{' '}
                  <a href="https://freighter.app" target="_blank" rel="noreferrer" style={{ color: '#06d6a0' }}>
                    Freighter Wallet
                  </a>{' '}
                  for full Stellar integration.
                </p>
              </div>
            </div>
          ) : (
            /* Email/Password Form */
            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 500, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>
                    Username
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#5a6380" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      className="input-field"
                      style={{ paddingLeft: '2.25rem' }}
                      required
                      minLength={3}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 500, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#5a6380" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="input-field"
                    style={{ paddingLeft: '2.25rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 500, color: '#8892b0', display: 'block', marginBottom: '0.35rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#5a6380" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="input-field"
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#5a6380',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', width: 18, height: 18, border: '2px solid rgba(10,14,26,0.3)', borderTopColor: '#0a0e1a', borderRadius: '50%' }} />
                    Processing...
                  </span>
                ) : (
                  <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: '#8892b0', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
