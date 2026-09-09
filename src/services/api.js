/**
 * src/services/api.js
 * ----------------------------------------------------------------------------
 * Shared Axios instance for ALL backend calls.
 *
 *  - Base URL comes from `VITE_API_URL` (`/api` in dev → Vite proxies it to
 *    the Express server, so the browser never touches :5000 directly).
 *  - Request interceptor injects `Authorization: Bearer <jwt>` from storage.
 *  - Response interceptor clears the session + bounces to /login on 401s
 *    (except on login/register themselves, where 401 just means bad input).
 * ----------------------------------------------------------------------------
 */
import axios from 'axios';

// `/api` by default — override per-environment with VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send the httpOnly JWT cookie alongside the header
});

// Attach the stored JWT to every outgoing request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 handling: expired/invalid session → wipe + redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = /\/(login|register)$/.test(url);
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('udevs_session');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
