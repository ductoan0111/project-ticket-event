import axios from 'axios';
import type { AxiosInstance } from 'axios';

// API configuration
// IIS Express HTTPS port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:44368/api';
const ATTENDEE_API_BASE_URL = import.meta.env.VITE_ATTENDEE_API_URL || 'https://localhost:44310/api';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/Auth/login`,
  REGISTER: `${API_BASE_URL}/Auth/register`,
  REFRESH_TOKEN: `${API_BASE_URL}/Auth/refresh`,
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Đổi từ 'token' thành 'accessToken'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401, clear tokens and redirect to login
    if (error.response?.status === 401) {
      console.error('Unauthorized (401). Clearing tokens and redirecting to login...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export { api };
export default api;

// ============================================
// ATTENDEE API INSTANCE
// ============================================
export const attendeeApi: AxiosInstance = axios.create({
  baseURL: ATTENDEE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attendeeApi
attendeeApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for attendeeApi
attendeeApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized (401) in attendeeApi. Redirecting to login...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// ORGANIZER API INSTANCE
// ============================================
const ORGANIZER_API_BASE_URL = import.meta.env.VITE_ORGANIZER_API_URL || 'https://localhost:44343/api';

export const organizerApi: AxiosInstance = axios.create({
  baseURL: ORGANIZER_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

organizerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

organizerApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized (401) in organizerApi. Redirecting to login...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// ADMIN API INSTANCE
// ============================================
const ADMIN_API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'https://localhost:44311/api';

export const adminApi: AxiosInstance = axios.create({
  baseURL: ADMIN_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized (401) in adminApi. Redirecting to login...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
