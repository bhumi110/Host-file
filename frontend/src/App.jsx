/**
 * App Component - Root Application
 * 
 * Sets up routing, auth context, and layout structure
 * for the Fractional Server Hosting Pool platform.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PoolMarketplace from './pages/PoolMarketplace.jsx';
import CreatePool from './pages/CreatePool.jsx';
import PoolDetails from './pages/PoolDetails.jsx';
import Servers from './pages/Servers.jsx';
import ServerDetails from './pages/ServerDetails.jsx';
import Analytics from './pages/Analytics.jsx';
import Profile from './pages/Profile.jsx';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Layout wrapper for authenticated pages
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      {/* Background orbs for ambient effect */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0a0e1a',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48,
          height: 48,
          border: '3px solid rgba(6, 214, 160, 0.2)',
          borderTopColor: '#06d6a0',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem',
        }} />
        <div style={{ color: '#8892b0', fontSize: '0.9rem' }}>Loading...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/pools" element={
        <ProtectedRoute>
          <AppLayout><PoolMarketplace /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/pools/:id" element={
        <ProtectedRoute>
          <AppLayout><PoolDetails /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/create-pool" element={
        <ProtectedRoute>
          <AppLayout><CreatePool /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/servers" element={
        <ProtectedRoute>
          <AppLayout><Servers /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/servers/:id" element={
        <ProtectedRoute>
          <AppLayout><ServerDetails /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AppLayout><Analytics /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><Profile /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a2035',
              color: '#f0f4ff',
              border: '1px solid rgba(99, 115, 148, 0.2)',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#06d6a0', secondary: '#0a0e1a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0e1a' } },
          }}
        />
      </Router>
    </AuthProvider>
  );
}
