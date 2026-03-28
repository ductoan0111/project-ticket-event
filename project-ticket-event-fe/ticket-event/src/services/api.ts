// API configuration
// IIS Express HTTPS port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:44368/api';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/Auth/login`,
  REGISTER: `${API_BASE_URL}/Auth/register`,
  REFRESH_TOKEN: `${API_BASE_URL}/Auth/refresh`,
};

export default API_BASE_URL;
