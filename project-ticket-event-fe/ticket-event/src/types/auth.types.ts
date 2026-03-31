// Types cho authentication
export interface LoginRequest {
  tenDangNhap: string;
  email: string;
  matKhau: string;
}

export interface RegisterRequest {
  hoTen: string;
  tenDangNhap: string;
  email: string;
  matKhau: string;
  vaiTroId: number;
  soDienThoai?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  hoTen: string;
  tenDangNhap: string;
  email: string;
  soDienThoai?: string;
  vaiTro?: string;
  vaiTroId?: number;
}

export interface User {
  hoTen: string;
  tenDangNhap: string;
  email: string;
  soDienThoai?: string;
  vaiTro?: string;
  vaiTroId?: number;
}
