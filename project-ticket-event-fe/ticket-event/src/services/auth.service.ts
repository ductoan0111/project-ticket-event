import type { LoginRequest, RegisterRequest, LoginResponse } from '../types/auth.types';
import api from './api';

const LOGIN_API_URL = import.meta.env.VITE_API_URL || 'https://localhost:44368/api';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Calling login API:', `${LOGIN_API_URL}/Auth/login`);
      console.log('Credentials:', credentials);

      const response = await api.post<LoginResponse>(`${LOGIN_API_URL}/Auth/login`, credentials);

      console.log('Login success:', response.data);
      this.setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      throw new Error(message);
    }
  }

  async register(userData: RegisterRequest): Promise<void> {
    try {
      console.log('Calling register API:', `${LOGIN_API_URL}/Auth/register`);
      console.log('User data:', userData);

      await api.post(`${LOGIN_API_URL}/Auth/register`, userData);

      console.log('Register success');
    } catch (error: any) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || error.message || 'Đăng ký thất bại';
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
