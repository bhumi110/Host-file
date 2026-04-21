/**
 * API Service
 * 
 * Centralized HTTP client for all backend API calls.
 * Uses axios with automatic token injection.
 */

import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: "https://fshp-backend.onrender.com",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject auth token into every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fshp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fshp_token');
      localStorage.removeItem('fshp_user');
      // Don't redirect on login/register failures
      if (!error.config.url.includes('/auth/')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// === Auth API ===
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  walletConnect: (data) => api.post('/auth/wallet-connect', data),
  getMe: () => api.get('/auth/me'),
};

// === Pools API ===
export const poolsAPI = {
  getAll: (params) => api.get('/pools', { params }),
  getById: (id) => api.get(`/pools/${id}`),
  create: (data) => api.post('/pools', data),
  contribute: (id, data) => api.post(`/pools/${id}/contribute`, data),
  getMyPools: () => api.get('/pools/user/my-pools'),
};

// === Servers API ===
export const serversAPI = {
  getAll: () => api.get('/servers'),
  getById: (id) => api.get(`/servers/${id}`),
  provision: (data) => api.post('/servers/provision', data),
  getMetrics: (id) => api.get(`/servers/${id}/metrics`),
};

// === Transactions API ===
export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getStats: () => api.get('/transactions/stats'),
};

// === Users API ===
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
  getNotifications: () => api.get('/users/notifications'),
};

// === Stellar API ===
export const stellarAPI = {
  getBalance: (address) => api.get(`/stellar/balance/${address}`),
  getTransactions: (address) => api.get(`/stellar/transactions/${address}`),
  verifyTx: (data) => api.post('/stellar/verify-tx', data),
  getNetworkInfo: () => api.get('/stellar/network-info'),
};

export default api;
