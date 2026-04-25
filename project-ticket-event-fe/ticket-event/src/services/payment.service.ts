import { attendeeApi } from './api';

export interface Payment {
  thanhToanID: number;
  donHangID: number;
  soTien: number;
  phuongThuc: string;
  trangThai: number;
  ngayThanhToan: string;
  ghiChu?: string;
}

export interface PaymentRequest {
  phuongThuc: string;
  ghiChu?: string;
  rawResponse?: string;
}

export const paymentService = {
  // Lấy lịch sử thanh toán
  getPaymentHistory: async (nguoiMuaId: number): Promise<Payment[]> => {
    const response = await attendeeApi.get<Payment[]>(`/ThanhToan/history?nguoiMuaId=${nguoiMuaId}`);
    return response.data;
  },

  // Lấy lịch sử thanh toán theo đơn hàng
  getPaymentByOrder: async (nguoiMuaId: number, donHangId: number): Promise<Payment[]> => {
    const response = await attendeeApi.get<Payment[]>(`/ThanhToan/history/by-donhang?nguoiMuaId=${nguoiMuaId}&donHangId=${donHangId}`);
    return response.data;
  },

  // Thanh toán mock
  mockPayment: async (donHangId: number, nguoiMuaId: number, data: PaymentRequest): Promise<{ success: boolean; message: string; thanhToanId?: number }> => {
    const response = await attendeeApi.post(`/ThanhToan/mock/${donHangId}?nguoiMuaId=${nguoiMuaId}`, data);
    return response.data;
  },
};
