import type { LoginRequest, RegisterRequest, LoginResponse } from '../types/auth.types';
import axios from 'axios';

const AUTH_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:44368/api';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(`${AUTH_BASE_URL}/Auth/login`, credentials, {
        headers: { 'Content-Type': 'application/json' },
      });
      this.setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.message ||
        'Tên đăng nhập, email hoặc mật khẩu không đúng';
      throw new Error(message);
    }
  }

  async register(userData: RegisterRequest): Promise<void> {
    try {
      await axios.post(`${AUTH_BASE_URL}/Auth/register`, userData, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.message ||
        'Đăng ký thất bại';
      throw new Error(message);
    }
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export default new AuthService();
