import { attendeeApi } from './api';

export interface Order {
  donHangID: number;
  nguoiMuaID: number;
  suKienID: number;
  ngayDat: string;
  tongTien: number;
  trangThai: number; // 0=Chờ thanh toán, 1=Đã thanh toán, 2=Đã hủy, 3=Hoàn tiền
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}

export interface OrderItem {
  chiTietID: number;
  donHangID: number;
  loaiVeID: number;
  soLuong: number;
  donGia: number;
  thanhTien: number;
}

export interface CreateOrderRequest {
  nguoiMuaID: number;
  suKienID: number;
  items: {
    loaiVeID: number;
    soLuong: number;
  }[];
}

export const orderService = {
  // Lấy danh sách đơn hàng của tôi
  getMyOrders: async (nguoiMuaId: number): Promise<Order[]> => {
    const response = await attendeeApi.get<Order[]>(`/DonHang/me?nguoiMuaId=${nguoiMuaId}`);
    return response.data;
  },

  // Lấy chi tiết đơn hàng
  getOrderDetail: async (donHangId: number, nguoiMuaId: number): Promise<OrderDetail> => {
    const response = await attendeeApi.get<OrderDetail>(`/DonHang/${donHangId}?nguoiMuaId=${nguoiMuaId}`);
    return response.data;
  },

  // Tạo đơn hàng mới
  createOrder: async (data: CreateOrderRequest): Promise<{ donHangId: number }> => {
    const response = await attendeeApi.post<{ donHangId: number }>('/DonHang', data);
    return response.data;
  },

  // Hủy đơn hàng
  cancelOrder: async (donHangId: number, nguoiMuaId: number): Promise<{ message: string }> => {
    const response = await attendeeApi.patch<{ message: string }>(`/DonHang/${donHangId}/cancel?nguoiMuaId=${nguoiMuaId}`);
    return response.data;
  },
};
