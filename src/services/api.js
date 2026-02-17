// ─────────────────────────────────────────────────────────────────────────────
// WHY AXIOS OVER fetch()?
//  • Axios interceptors inject the JWT token on EVERY request automatically.
//    With fetch() you would have to manually add the Authorization header in
//    every single call — very error-prone.
//  • Axios throws on 4xx / 5xx automatically; fetch() doesn't.
//  • Axios auto-parses JSON; fetch() requires an extra `.json()` call.
//  • The 401 interceptor below handles token expiry in ONE place globally.
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

// Backend base URL.
// Auth endpoints live at  /api/v1/auth/**
// All other endpoints at  /api/user/** | /api/post/** | /api/category/** | /api/comment/**
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── REQUEST interceptor: attach JWT token automatically ──────────────────────
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

// ── RESPONSE interceptor: if token expires, clear storage and redirect ───────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;