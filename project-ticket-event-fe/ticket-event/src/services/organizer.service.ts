import { api } from './api';

const ORGANIZER_API_URL = import.meta.env.VITE_ORGANIZER_API_URL || 'https://localhost:44310/api';

export interface CreateEventRequest {
  danhMucID: number;
  diaDiemID?: number;
  toChucID: number;
  tenSuKien: string;
  moTa?: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  anhBiaUrl?: string;
}

export interface Event {
  suKienID: number;
  danhMucID: number;
  diaDiemID?: number;
  toChucID: number;
  tenSuKien: string;
  moTa?: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  anhBiaUrl?: string;
  trangThai: number;
  ngayTao: string;
}

export const organizerService = {
  // Tạo sự kiện mới
  createEvent: async (data: CreateEventRequest) => {
    const response = await api.post(`${ORGANIZER_API_URL}/sukien`, data);
    return response.data;
  },

  // Lấy danh sách sự kiện của mình
  getMyEvents: async (status?: number) => {
    const params = status !== undefined ? { status } : {};
    const response = await api.get<Event[]>(`${ORGANIZER_API_URL}/sukien/my-events`, { params });
    return response.data;
  },

  // Lấy chi tiết sự kiện
  getEventById: async (id: number) => {
    const response = await api.get<Event>(`${ORGANIZER_API_URL}/sukien/${id}`);
    return response.data;
  },

  // Cập nhật sự kiện (chỉ khi TrangThai = 0)
  updateEvent: async (id: number, data: Partial<Event>) => {
    const response = await api.put(`${ORGANIZER_API_URL}/sukien/${id}`, data);
    return response.data;
  },

  // Xóa sự kiện
  deleteEvent: async (id: number) => {
    const response = await api.delete(`${ORGANIZER_API_URL}/sukien/${id}`);
    return response.data;
  },
};
