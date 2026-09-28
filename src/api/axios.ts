import axios from 'axios';

/**
 * Shared Axios Instance for Lewegene
 * Rule 5: There must be ONE shared Axios instance in src/api/axios.ts.
 * Everyone uses it. Each feature creates its own API functions on top of this.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor (e.g. auth tokens if present)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lewegene_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for uniform error parsing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default api;
