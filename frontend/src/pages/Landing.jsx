/**
 * Landing Page
 * 
 * Hero section, feature cards, how-it-works flow,
 * and CTA for the Fractional Server Hosting Pool.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Zap, Server, Users, Shield, ArrowRight, Globe,
  Wallet, BarChart3, Cpu, Cloud, Lock, TrendingUp
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const features = [
  { icon: Users, title: 'Fractional Ownership', desc: 'Pool funds with others to access enterprise-grade cloud infrastructure at a fraction of the cost.', color: '#06d6a0' },
  { icon: Globe, title: 'Stellar Powered', desc: 'All transactions processed on Stellar blockchain for instant, transparent, and low-fee transfers.', color: '#4361ee' },
  { icon: Server, title: 'Auto Provisioning', desc: 'Cloud servers are automatically provisioned when pool targets are reached. Zero manual setup.', color: '#7b2ff7' },
  { icon: BarChart3, title: 'Proportional Access', desc: 'Get compute power proportional to your contribution. Track usage in real-time dashboards.', color: '#f72585' },
  { icon: Shield, title: 'Secure & Transparent', desc: 'Smart contract escrow, transparent distribution, and secure wallet-based authentication.', color: '#ff6b35' },
  { icon: TrendingUp, title: 'Earn & Trade', desc: 'Sublease unused compute time and trade ownership tokens on the marketplace.', color: '#ffd166' },
];

const steps = [
  { num: '01', title: 'Connect Wallet', desc: 'Link your Freighter wallet or create an account to get started.', icon: Wallet },
  { num: '02', title: 'Join or Create Pool', desc: 'Browse the marketplace or create a new pool with custom server specs.', icon: Users },
  { num: '03', title: 'Contribute Funds', desc: 'Deposit XLM or stablecoins. Track real-time funding progress.', icon: Zap },
  { num: '04', title: 'Access Compute', desc: 'Once funded, your server goes live. Use your proportional compute share.', icon: Cpu },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Background Effects */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        background: 'rgba(10, 14, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99, 115, 148, 0.1)',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06d6a0, #4361ee)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Zap size={20} color="#0a0e1a" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }} className="gradient-text">FSHP</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>
              Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>
                Sign In
              </Link>
              <Link to="/login" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>
                Get Started <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 2rem 4rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ maxWidth: 900, textAlign: 'center' }}>
          <motion.div {...fadeUp}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 1rem',
              borderRadius: '9999px',
              background: 'rgba(6, 214, 160, 0.1)',
              border: '1px solid rgba(6, 214, 160, 0.25)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#06d6a0',
              marginBottom: '1.5rem',
            }}>
              <Zap size={14} /> Powered by Stellar Blockchain
            </div>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
            }}
          >
            Pool Resources.{' '}
            <span className="gradient-text">Share Compute.</span>
            <br />
            <span style={{ color: '#8892b0' }}>Build Together.</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#8892b0',
              maxWidth: 650,
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            A decentralized-style platform where users pool funds using Stellar tokens 
            to collectively rent high-performance cloud servers and share computing resources 
            proportionally.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="btn-primary"
              style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}
            >
              Launch App <ArrowRight size={18} />
            </button>
            <a href="#how-it-works" className="btn-secondary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
              How It Works
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{
              display: 'flex',
              gap: '3rem',
              justifyContent: 'center',
              marginTop: '4rem',
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Total Value Locked', value: '$2.4M' },
              { label: 'Active Pools', value: '47' },
              { label: 'Contributors', value: '1,250+' },
              { label: 'Servers Running', value: '23' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f0f4ff' }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#5a6380', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '5rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
              Why <span className="gradient-text">FSHP?</span>
            </h2>
            <p style={{ color: '#8892b0', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>
              Enterprise cloud computing, democratized through blockchain technology.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}>
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card"
                style={{ padding: '1.75rem' }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: `${feat.color}15`,
                  border: `1px solid ${feat.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <feat.icon size={24} color={feat.color} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{feat.title}</h3>
                <p style={{ color: '#8892b0', fontSize: '0.9rem', lineHeight: 1.6 }}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '5rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
              How It <span className="gradient-text">Works</span>
            </h2>
            <p style={{ color: '#8892b0', fontSize: '1.05rem' }}>
              Four simple steps to access shared cloud computing.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card"
                style={{ padding: '2rem 1.5rem', textAlign: 'center', position: 'relative' }}
              >
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, rgba(6,214,160,0.15), rgba(67,97,238,0.15))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '1rem',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {step.num}
                </div>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: '14px',
                  background: 'rgba(6, 214, 160, 0.1)',
                  border: '1px solid rgba(6, 214, 160, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <step.icon size={24} color="#06d6a0" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ color: '#8892b0', fontSize: '0.85rem', lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 2rem 4rem', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{
            maxWidth: 800,
            margin: '0 auto',
            textAlign: 'center',
            padding: '3.5rem 2rem',
            borderRadius: '24px',
            background: 'linear-gradient(145deg, rgba(67,97,238,0.12) 0%, rgba(123,47,247,0.08) 50%, rgba(247,37,133,0.06) 100%)',
            border: '1px solid rgba(99, 115, 148, 0.15)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to Pool Your Resources?
          </h2>
          <p style={{ color: '#8892b0', fontSize: '1rem', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
            Join thousands of users sharing enterprise-grade cloud infrastructure at a fraction of the cost.
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="btn-primary"
            style={{ fontSize: '1rem', padding: '0.85rem 2.5rem' }}
          >
            Get Started Now <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        borderTop: '1px solid rgba(99, 115, 148, 0.1)',
        textAlign: 'center',
        color: '#5a6380',
        fontSize: '0.8rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Zap size={14} color="#06d6a0" />
          <span style={{ fontWeight: 700, color: '#8892b0' }}>Fractional Server Hosting Pool</span>
        </div>
        <p>Built on Stellar • Decentralized Cloud Computing • © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
