// src/utils/api.js — Axios instance with base URL and authorization interceptor
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tripsplit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Request failed';
    // If token expired/invalid, logout user
    if (err.response?.status === 401) {
      localStorage.removeItem('tripsplit_token');
      localStorage.removeItem('tripsplit_user');
      // Redirect to login only if not already on the login/landing page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(msg));
  }
);

export default api;
