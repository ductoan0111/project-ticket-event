import { attendeeApi } from './api';

export interface UserProfile {
  nguoiDungId: number;
  hoTen: string;
  email: string;
  tenDangNhap: string;
  soDienThoai?: string;
  vaiTroId: number;
  ngayTao: string;
  trangThai: boolean;
}

export interface UpdateProfileRequest {
  hoTen?: string;
  soDienThoai?: string;
  tenDangNhap?: string;
}

export interface ChangePasswordRequest {
  matKhauCu: string;
  matKhauMoi: string;
}

const userService = {
  // Lấy thông tin profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await attendeeApi.get<{ success: boolean; data: UserProfile }>('/User/profile');
    return response.data.data;
  },

  // Cập nhật profile
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await attendeeApi.put<{ success: boolean; message: string; data: UserProfile }>(
      '/User/profile',
      data
    );
    return response.data.data;
  },

  // Đổi mật khẩu
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await attendeeApi.put<{ success: boolean; message: string }>(
      '/User/change-password',
      data
    );
  }
};

export default userService;
