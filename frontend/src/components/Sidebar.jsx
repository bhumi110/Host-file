/**
 * Sidebar Component
 * 
 * Main navigation sidebar with responsive mobile drawer.
 * Shows navigation links, wallet status, and user info.
 */

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, ShoppingBag, PlusCircle, Server,
  BarChart3, User, Settings, LogOut, Wallet, Menu,
  X, Zap, Bell, ChevronDown, Globe
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pools', label: 'Pool Marketplace', icon: ShoppingBag },
  { to: '/create-pool', label: 'Create Pool', icon: PlusCircle },
  { to: '/servers', label: 'My Servers', icon: Server },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '1.25rem',
    }}>
      {/* Logo */}
      <NavLink to="/" style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
          padding: '0.5rem 0',
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06d6a0 0%, #4361ee 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 214, 160, 0.3)',
          }}>
            <Zap size={20} color="#0a0e1a" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #06d6a0, #4361ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>FSHP</div>
            <div style={{ fontSize: '0.65rem', color: '#5a6380', fontWeight: 500, marginTop: '-2px' }}>
              Server Hosting Pool
            </div>
          </div>
        </div>
      </NavLink>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#5a6380', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
          Navigation
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#06d6a0' : '#8892b0',
                background: isActive ? 'rgba(6, 214, 160, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(6, 214, 160, 0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Network Status */}
      <div style={{
        padding: '0.75rem',
        borderRadius: '10px',
        background: 'rgba(6, 214, 160, 0.06)',
        border: '1px solid rgba(6, 214, 160, 0.15)',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Globe size={14} color="#06d6a0" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#06d6a0' }}>Stellar Testnet</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#5a6380' }}>Connected • Ledger #42891</div>
      </div>

      {/* User Section */}
      {isAuthenticated && user && (
        <div style={{
          padding: '0.75rem',
          borderRadius: '12px',
          background: 'rgba(21, 28, 47, 0.8)',
          border: '1px solid rgba(99, 115, 148, 0.15)',
        }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
            }}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
              alt="avatar"
              style={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                border: '2px solid rgba(6, 214, 160, 0.3)',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0f4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.username}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#5a6380' }}>
                {user.walletAddress ? `${user.walletAddress.substring(0, 8)}...` : user.email || 'User'}
              </div>
            </div>
            <ChevronDown size={16} color="#5a6380" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ borderTop: '1px solid rgba(99, 115, 148, 0.15)', marginTop: '0.65rem', paddingTop: '0.65rem' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.5rem',
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseOut={e => e.target.style.background = 'none'}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 260,
        height: '100vh',
        background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.98) 0%, rgba(10, 14, 26, 0.98) 100%)',
        borderRight: '1px solid rgba(99, 115, 148, 0.12)',
        zIndex: 40,
        overflowY: 'auto',
        display: 'none',
      }} className="sidebar-desktop">
        <SidebarContent />
      </aside>

      {/* Mobile Header Bar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3.5rem',
        background: 'rgba(10, 14, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99, 115, 148, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        zIndex: 50,
      }} className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', color: '#f0f4ff', cursor: 'pointer', padding: '4px' }}
          >
            <Menu size={22} />
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Zap size={18} color="#06d6a0" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }} className="gradient-text">FSHP</span>
          </div>
        </div>
        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={18} color="#8892b0" />
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
              alt="avatar"
              style={{ width: 30, height: 30, borderRadius: '8px' }}
            />
          </div>
        )}
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 45,
              }}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: 260,
                height: '100vh',
                background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.99) 0%, rgba(10, 14, 26, 0.99) 100%)',
                borderRight: '1px solid rgba(99, 115, 148, 0.12)',
                zIndex: 50,
                overflowY: 'auto',
              }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#8892b0',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 1025px) {
          .sidebar-desktop { display: block !important; }
          .mobile-header { display: none !important; }
        }
      `}</style>
    </>
  );
}
