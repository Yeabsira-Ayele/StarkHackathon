import axios from 'axios';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Shared Axios Instance for Lewegene
 * Rule 5: There must be ONE shared Axios instance in src/api/axios.ts.
 * Everyone uses it. Each feature creates its own API functions on top of this.
 */
export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
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
    const responseMessage = error.response?.data?.message;
    const message =
      responseMessage ||
      (error.response
        ? error.message
        : 'Cannot reach the Lewegene API. Start the backend and check VITE_API_BASE_URL.') ||
      'An unexpected network error occurred';
    const code = error.response?.data?.error?.code || (error.response ? undefined : 'NETWORK_ERROR');
    return Promise.reject(new ApiRequestError(message, code, error.response?.status));
  }
);

export default api;
