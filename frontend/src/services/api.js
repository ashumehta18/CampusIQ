import axios from 'axios';

/**
 * Axios instance pre-configured for the CampusIQ API.
 * In production, VITE_API_URL points to the deployed backend. During local
 * development, the Vite proxy handles the relative /api fallback.
 * The JWT token is automatically attached from localStorage on every request.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusiq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('campusiq_token');
      localStorage.removeItem('campusiq_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
