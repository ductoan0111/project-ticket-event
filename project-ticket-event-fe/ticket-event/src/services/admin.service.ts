import { api } from './api';
import type { Event } from './organizer.service';

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || 'https://localhost:44311/api';

export const adminService = {
  // Lấy tất cả sự kiện
  getAllEvents: async () => {
    const response = await api.get<Event[]>(`${ADMIN_API_URL}/admin/sukien`);
    return response.data;
  },

  // Lấy danh sách sự kiện chờ duyệt
  getPendingEvents: async () => {
    const response = await api.get<Event[]>(`${ADMIN_API_URL}/admin/sukien/pending`);
    return response.data;
  },

  // Duyệt sự kiện
  approveEvent: async (id: number) => {
    const response = await api.put(`${ADMIN_API_URL}/admin/sukien/${id}/approve`);
    return response.data;
  },

  // Từ chối sự kiện
  cancelEvent: async (id: number) => {
    const response = await api.put(`${ADMIN_API_URL}/admin/sukien/${id}/cancel`);
    return response.data;
  },
};
