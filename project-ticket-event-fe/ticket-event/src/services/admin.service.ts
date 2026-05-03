import { adminApi } from './api';
import type { OrgEvent } from './organizer.service';
export type { OrgEvent };

export interface AdminStats {
  tongSuKien: number;
  suKienChoDuyet: number;
  tongNguoiDung: number;
  tongDoanhThu: number;
}

export interface Category {
  danhMucID: number;
  tenDanhMuc: string;
  moTa?: string;
  icon?: string;
}

export interface Location {
  diaDiemID: number;
  tenDiaDiem: string;
  diaChi?: string;
  thanhPho?: string;
  quocGia?: string;
  sucChua?: number;
  trangThai: boolean;
}

export interface AdminUser {
  nguoiDungId: number;
  hoTen: string;
  email: string;
  tenDangNhap: string;
  soDienThoai?: string;
  vaiTroId?: number;
  ngayTao?: string;
  trangThai?: boolean;
}

export const adminService = {
  // ===== THỐNG KÊ =====
  getStats: async (): Promise<AdminStats> => {
    const response = await adminApi.get<AdminStats>('/Admin/stats');
    return response.data;
  },

  // ===== SỰ KIỆN =====
  getAllEvents: async (): Promise<OrgEvent[]> => {
    const response = await adminApi.get<OrgEvent[]>('/admin/sukien');
    return response.data;
  },

  getPendingEvents: async (): Promise<OrgEvent[]> => {
    const response = await adminApi.get<OrgEvent[]>('/admin/sukien/pending');
    return response.data;
  },

  approveEvent: async (id: number) => {
    const response = await adminApi.put(`/admin/sukien/${id}/approve`);
    return response.data;
  },

  rejectEvent: async (id: number) => {
    const response = await adminApi.put(`/admin/sukien/${id}/cancel`);
    return response.data;
  },

  // ===== DANH MỤC =====
  getAllCategories: async (): Promise<Category[]> => {
    const response = await adminApi.get<{ success: boolean; data: Category[] }>('/DanhMucSuKien');
    return response.data.data;
  },

  createCategory: async (data: Omit<Category, 'danhMucID'>): Promise<{ success: boolean; id: number }> => {
    const response = await adminApi.post('/DanhMucSuKien', data);
    return response.data;
  },

  updateCategory: async (id: number, data: Omit<Category, 'danhMucID'>): Promise<{ success: boolean }> => {
    const response = await adminApi.put(`/DanhMucSuKien/${id}`, { ...data, danhMucID: id });
    return response.data;
  },

  deleteCategory: async (id: number): Promise<{ success: boolean }> => {
    const response = await adminApi.delete(`/DanhMucSuKien/${id}`);
    return response.data;
  },

  // ===== ĐỊA ĐIỂM =====
  getAllLocations: async (): Promise<Location[]> => {
    const response = await adminApi.get<Location[]>('/admin/diadiem');
    return response.data;
  },

  createLocation: async (data: Omit<Location, 'diaDiemID'>): Promise<{ success: boolean; id: number }> => {
    const response = await adminApi.post('/admin/diadiem', data);
    return response.data;
  },

  updateLocation: async (id: number, data: Omit<Location, 'diaDiemID'>): Promise<{ success: boolean }> => {
    const response = await adminApi.put(`/admin/diadiem/${id}`, { ...data, diaDiemID: id });
    return response.data;
  },

  deleteLocation: async (id: number): Promise<{ success: boolean }> => {
    const response = await adminApi.delete(`/admin/diadiem/${id}`);
    return response.data;
  },

  // ===== NGƯỜI DÙNG =====
  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await adminApi.get<AdminUser[]>('/admin/nguoidung');
    return response.data;
  },

  getUserById: async (id: number): Promise<AdminUser> => {
    const response = await adminApi.get<AdminUser>(`/admin/nguoidung/${id}`);
    return response.data;
  },

  getUsersByRole: async (maVaiTro: string): Promise<AdminUser[]> => {
    const response = await adminApi.get<AdminUser[]>(`/admin/nguoidung/by-role?maVaiTro=${maVaiTro}`);
    return response.data;
  },

  updateUser: async (id: number, data: Partial<AdminUser>): Promise<{ success: boolean }> => {
    const response = await adminApi.put(`/admin/nguoidung/${id}`, data);
    return response.data;
  },

  disableUser: async (id: number): Promise<{ success: boolean }> => {
    const response = await adminApi.delete(`/admin/nguoidung/${id}`);
    return response.data;
  },
};
