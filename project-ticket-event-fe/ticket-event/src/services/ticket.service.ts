import { attendeeApi } from './api';

export interface Ticket {
  veID: number;
  donHangID: number;
  loaiVeID: number;
  nguoiSoHuuID: number;
  maVe: string;
  qrToken: string;
  trangThai: number; // 0=Chưa sử dụng, 1=Đã checkin, 2=Đã hủy
}

export const ticketService = {
  // Lấy danh sách vé của tôi
  getMyTickets: async (nguoiSoHuuId: number): Promise<{ nguoiSoHuuId: number; count: number; data: Ticket[] }> => {
    const response = await attendeeApi.get(`/Ve/me?nguoiSoHuuId=${nguoiSoHuuId}`);
    return response.data;
  },

  // Lấy chi tiết vé theo mã vé
  getTicketByCode: async (maVe: string, nguoiSoHuuId: number): Promise<Ticket> => {
    const response = await attendeeApi.get<Ticket>(`/Ve/${maVe}?nguoiSoHuuId=${nguoiSoHuuId}`);
    return response.data;
  },

  // Hủy vé
  cancelTicket: async (maVe: string, nguoiSoHuuId: number, lyDo?: string): Promise<{ message: string; maVe: string; trangThaiMoi: number }> => {
    const response = await attendeeApi.patch(`/Ve/${maVe}/cancel?nguoiSoHuuId=${nguoiSoHuuId}`, { lyDo });
    return response.data;
  },

  // Hoàn vé
  refundTicket: async (maVe: string, nguoiSoHuuId: number, lyDo?: string): Promise<{ success: boolean; message: string }> => {
    const response = await attendeeApi.post(`/Ve/${maVe}/refund?nguoiSoHuuId=${nguoiSoHuuId}`, { 
      lyDo,
      phuongThuc: 'REFUND_MOCK'
    });
    return response.data;
  },
};
