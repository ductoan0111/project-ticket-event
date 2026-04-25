import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '../types/auth.types';
import authService from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'user';

const parseJwtUser = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const nguoiDungId = Number(payload.sub);
    if (!nguoiDungId) return null;

    return {
      nguoiDungId,
      hoTen: payload.fullName || payload.unique_name || payload.email || '',
      tenDangNhap: payload.unique_name || '',
      email: payload.email || '',
      vaiTro: payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    };
  } catch {
    return null;
  }
};

const buildUserFromLoginResponse = (response: LoginResponse): User => ({
  nguoiDungId: response.nguoiDungId,
  hoTen: response.hoTen,
  tenDangNhap: response.tenDangNhap,
  email: response.email,
  soDienThoai: response.soDienThoai,
  vaiTro: response.vaiTro,
  vaiTroId: response.vaiTroId,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra token khi app load
    const token = authService.getAccessToken();
    if (token) {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        const tokenUser = parseJwtUser(token);
        if (tokenUser) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(tokenUser));
          setUser(tokenUser);
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await authService.login(credentials);
    const loggedInUser = buildUserFromLoginResponse(response);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return response; // Return response for redirect logic
  };

  const register = async (userData: RegisterRequest) => {
    await authService.register(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
