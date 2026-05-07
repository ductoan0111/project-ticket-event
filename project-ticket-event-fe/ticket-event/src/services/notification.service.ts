import { attendeeApi } from './api';

export interface Notification {
  thongBaoID: number;
  nguoiDungID: number;
  donHangID?: number;
  veID?: number;
  tieuDe: string;
  noiDung: string;
  loaiThongBao: string;   // backend returns loaiThongBao (not loai)
  trangThai: number;      // 0: chưa đọc, 1: đã đọc/đã gửi
  thoiGianTao: string;    // backend returns thoiGianTao (not ngayTao)
  thoiGianGui?: string;
  ghiChu?: string;
}

export interface NotificationsResponse {
  userId: number;
  trangThai: number | null;
  count: number;
  data: Notification[];
}

export interface UnreadCountResponse {
  userId: number;
  unreadCount: number;
}

const notificationService = {
  // Lấy danh sách thông báo
  getNotifications: async (trangThai?: number): Promise<Notification[]> => {
    const url = trangThai !== undefined
      ? `/ThongBao/me?trangThai=${trangThai}`
      : '/ThongBao/me';
    
    const response = await attendeeApi.get<NotificationsResponse>(url);
    return response.data.data;
  },

  // Lấy số thông báo chưa đọc
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await attendeeApi.get<UnreadCountResponse>('/ThongBao/unread-count');
      return response.data.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Đánh dấu đã đọc
  markAsRead: async (id: number): Promise<boolean> => {
    try {
      await attendeeApi.put(`/ThongBao/${id}/mark-read`);
      return true;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      return false;
    }
  },

  // Lấy chi tiết thông báo
  getNotificationById: async (id: number): Promise<Notification> => {
    const response = await attendeeApi.get<Notification>(`/ThongBao/${id}`);
    return response.data;
  }
};

export default notificationService;
