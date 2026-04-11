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
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(API_ENDPOINTS.REFRESH_TOKEN, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
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
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(API_ENDPOINTS.REFRESH_TOKEN, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return attendeeApi(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
