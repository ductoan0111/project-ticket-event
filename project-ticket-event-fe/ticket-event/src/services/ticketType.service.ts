import { attendeeApi } from './api';

export interface TicketType {
  loaiVeID: number;
  suKienID: number;
  tenLoaiVe: string;
  moTa?: string;
  donGia: number;
  soLuongToiDa: number;
  soLuongDaBan: number;
  soLuongCon: number;
  gioiHanMoiKhach?: number;
  thoiGianMoBan?: string;
  thoiGianDongBan?: string;
  trangThai: boolean;
  conVe: boolean;
  dangMoBan: boolean;
  trangThaiMoBan: string;
  phanTramDaBan: number;
}

export interface TicketTypeAvailability {
  loaiVeID: number;
  tenLoaiVe: string;
  donGia: number;
  soLuongToiDa: number;
  soLuongDaBan: number;
  soLuongCon: number;
  conVe: boolean;
  dangMoBan: boolean;
  trangThaiMoBan: string;
  gioiHanMoiKhach?: number;
}

export const ticketTypeService = {
  // Lấy tất cả loại vé
  getAll: async (): Promise<TicketType[]> => {
    const response = await attendeeApi.get<TicketType[]>('/LoaiVe');
    return response.data;
  },

  // Tìm loại vé theo tên
  getByName: async (ten: string): Promise<TicketType[]> => {
    const response = await attendeeApi.get<TicketType[]>(`/LoaiVe/by-name?ten=${encodeURIComponent(ten)}`);
    return response.data;
  },

  // Tìm loại vé theo tên sự kiện
  getByEventName: async (tenSuKien: string): Promise<TicketType[]> => {
    const response = await attendeeApi.get<TicketType[]>(`/LoaiVe/by-event-name?tenSuKien=${encodeURIComponent(tenSuKien)}`);
    return response.data;
  },

  // Lấy loại vé theo sự kiện (dùng cho trang chi tiết sự kiện)
  getByEventId: async (suKienId: number, chiBanDang?: boolean): Promise<{ success: boolean; suKienId: number; count: number; data: TicketType[] }> => {
    const params = chiBanDang ? `?chiBanDang=true` : '';
    const response = await attendeeApi.get(`/LoaiVe/sukien/${suKienId}${params}`);
    return response.data;
  },

  // Kiểm tra tồn kho và trạng thái mở bán
  checkAvailability: async (loaiVeId: number): Promise<{ success: boolean; data: TicketTypeAvailability }> => {
    const response = await attendeeApi.get(`/LoaiVe/${loaiVeId}/availability`);
    return response.data;
  },
};
