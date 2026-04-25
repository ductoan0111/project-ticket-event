import { organizerApi } from './api';

// ============================================
// TYPES - Sự kiện
// ============================================
export interface OrgEvent {
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

// ============================================
// TYPES - Loại vé
// ============================================
export interface OrgLoaiVe {
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

export interface CreateLoaiVeRequest {
  suKienID: number;
  tenLoaiVe: string;
  moTa?: string;
  donGia: number;
  soLuongToiDa: number;
  gioiHanMoiKhach?: number;
  thoiGianMoBan?: string;
  thoiGianDongBan?: string;
}

export interface UpdateLoaiVeRequest {
  tenLoaiVe: string;
  moTa?: string;
  donGia: number;
  soLuongToiDa: number;
  gioiHanMoiKhach?: number;
  thoiGianMoBan?: string;
  thoiGianDongBan?: string;
  trangThai: boolean;
}

// ============================================
// TYPES - Báo cáo
// ============================================
export interface TongQuanBaoCao {
  tongVeDaBan: number;
  tongDoanhThu: number;
  tongDonHang: number;
  tongNguoiMua: number;
  tongCheckIn: number;
  tyLeCheckIn: number;
}

export interface DoanhThuTheoNgay {
  ngay: string;
  soVe: number;
  doanhThu: number;
}

export interface LoaiVeBanChay {
  loaiVeID: number;
  tenLoaiVe: string;
  soLuongBan: number;
  doanhThu: number;
  phanTram: number;
}

export interface TopKhachHang {
  nguoiDungID: number;
  hoTen: string;
  email: string;
  soVe: number;
  tongChiTieu: number;
}

export interface ThongKeCheckIn {
  tongVe: number;
  daCheckIn: number;
  chuaCheckIn: number;
  tyLe: number;
}

export interface CheckInTheoGio {
  gio: number;
  soLuong: number;
}

// ============================================
// TYPES - Đơn hàng
// ============================================
export interface OrgDonHang {
  donHangID: number;
  nguoiDungID: number;
  tenNguoiDung?: string;
  email?: string;
  ngayDat: string;
  tongTien: number;
  trangThai: number;
  phuongThucThanhToan?: string;
}

export interface OrgDonHangChiTiet {
  chiTietID: number;
  donHangID: number;
  loaiVeID: number;
  tenLoaiVe: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
}

export interface OrgDonHangDetail {
  donHangID: number;
  nguoiMuaID: number;
  suKienID: number;
  ngayDat: string;
  tongTien: number;
  trangThai: number;
  hoTen?: string;
  email?: string;
  items?: OrgDonHangChiTiet[];
}

export interface ThongKeDonHang {
  tongDonHang: number;
  tongDoanhThu: number;
  donHangThanhCong: number;
  donHangHuy: number;
}

// ============================================
// TYPES - Check-in
// ============================================
export interface CheckInRequest {
  qrToken?: string;
  maVe?: string;
  nhanVienID: number;
  suKienID: number;
}

// ============================================
// TYPES - Thông báo
// ============================================
export interface GuiThongBaoRequest {
  suKienID: number;
  tieuDe: string;
  noiDung: string;
  loaiThongBao: 'EMAIL' | 'SMS' | 'APP';
  nguoiDungIDs?: number[];
  ghiChu?: string;
}

export interface OrgThongBao {
  thongBaoID: number;
  suKienID: number;
  nguoiDungID: number;
  loaiThongBao: string;
  tieuDe: string;
  noiDung: string;
  trangThai: number;
  ngayGui?: string;
  ghiChu?: string;
}

// ============================================
// SERVICE
// ============================================
export const organizerService = {
  // ===== SỰ KIỆN =====
  getMyEvents: async (status?: number): Promise<OrgEvent[]> => {
    const params: Record<string, unknown> = {};
    if (status !== undefined) params.status = status;
    const res = await organizerApi.get<OrgEvent[]>('/SuKien/my-events', { params });
    return Array.isArray(res.data) ? res.data : [];
  },

  getEventById: async (id: number): Promise<OrgEvent | null> => {
    try {
      const res = await organizerApi.get<OrgEvent>(`/SuKien/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  createEvent: async (data: CreateEventRequest): Promise<{ suKien: OrgEvent; message: string }> => {
    const res = await organizerApi.post('/SuKien', data);
    return res.data;
  },

  updateEvent: async (id: number, data: Partial<OrgEvent>): Promise<{ message: string }> => {
    const res = await organizerApi.put(`/SuKien/${id}`, { ...data, suKienID: id });
    return res.data;
  },

  deleteEvent: async (id: number): Promise<{ message: string }> => {
    const res = await organizerApi.delete(`/SuKien/${id}`);
    return res.data;
  },

  // ===== LOẠI VÉ =====
  getLoaiVeBySuKien: async (suKienId: number, trangThai?: boolean): Promise<OrgLoaiVe[]> => {
    const params: Record<string, unknown> = {};
    if (trangThai !== undefined) params.trangThai = trangThai;
    const res = await organizerApi.get<{ suKienId: number; count: number; data: OrgLoaiVe[] }>(
      `/LoaiVe/sukien/${suKienId}`,
      { params }
    );
    return res.data?.data ?? [];
  },

  getLoaiVeById: async (id: number): Promise<OrgLoaiVe | null> => {
    try {
      const res = await organizerApi.get<OrgLoaiVe>(`/LoaiVe/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  createLoaiVe: async (data: CreateLoaiVeRequest): Promise<{ message: string; loaiVeId: number }> => {
    const res = await organizerApi.post('/LoaiVe', data);
    return res.data;
  },

  updateLoaiVe: async (id: number, data: UpdateLoaiVeRequest): Promise<{ message: string }> => {
    const res = await organizerApi.put(`/LoaiVe/${id}`, data);
    return res.data;
  },

  deleteLoaiVe: async (id: number): Promise<{ message: string }> => {
    const res = await organizerApi.delete(`/LoaiVe/${id}`);
    return res.data;
  },

  // ===== BÁO CÁO =====
  getTongQuan: async (suKienId: number): Promise<TongQuanBaoCao> => {
    const res = await organizerApi.get<{ suKienId: number; data: TongQuanBaoCao }>(`/BaoCao/sukien/${suKienId}/tongquan`);
    return res.data?.data;
  },

  getDoanhThuTheoNgay: async (suKienId: number, fromDate?: string, toDate?: string): Promise<DoanhThuTheoNgay[]> => {
    const params: Record<string, unknown> = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const res = await organizerApi.get<{ data: DoanhThuTheoNgay[] }>(`/BaoCao/sukien/${suKienId}/doanhthu`, { params });
    return res.data?.data ?? [];
  },

  getLoaiVeBanChay: async (suKienId: number): Promise<LoaiVeBanChay[]> => {
    const res = await organizerApi.get<{ data: LoaiVeBanChay[] }>(`/BaoCao/sukien/${suKienId}/loaive`);
    return res.data?.data ?? [];
  },

  getTopKhachHang: async (suKienId: number, top = 10): Promise<TopKhachHang[]> => {
    const res = await organizerApi.get<{ data: TopKhachHang[] }>(`/BaoCao/sukien/${suKienId}/topkhachhang`, { params: { top } });
    return res.data?.data ?? [];
  },

  getThongKeCheckIn: async (suKienId: number): Promise<ThongKeCheckIn> => {
    const res = await organizerApi.get<{ data: ThongKeCheckIn }>(`/BaoCao/sukien/${suKienId}/checkin`);
    return res.data?.data;
  },

  getCheckInTheoGio: async (suKienId: number): Promise<CheckInTheoGio[]> => {
    const res = await organizerApi.get<{ data: CheckInTheoGio[] }>(`/BaoCao/sukien/${suKienId}/checkin-theo-gio`);
    return res.data?.data ?? [];
  },

  // ===== ĐƠN HÀNG =====
  getDonHangBySuKien: async (suKienId: number, trangThai?: number): Promise<OrgDonHang[]> => {
    const params: Record<string, unknown> = {};
    if (trangThai !== undefined) params.trangThai = trangThai;
    const res = await organizerApi.get<{ data: OrgDonHang[] }>(`/DonHang/sukien/${suKienId}`, { params });
    return res.data?.data ?? [];
  },

  getDonHangDetail: async (donHangId: number, suKienId: number): Promise<OrgDonHangDetail | null> => {
    try {
      const res = await organizerApi.get<OrgDonHangDetail>(`/DonHang/${donHangId}/sukien/${suKienId}`);
      return res.data;
    } catch {
      return null;
    }
  },

  getThongKeDonHang: async (suKienId: number): Promise<ThongKeDonHang | null> => {
    try {
      const res = await organizerApi.get<{ thongKe: ThongKeDonHang }>(`/DonHang/sukien/${suKienId}/thongke`);
      return res.data?.thongKe ?? null;
    } catch {
      return null;
    }
  },

  // ===== CHECK-IN =====
  checkIn: async (data: CheckInRequest): Promise<unknown> => {
    const res = await organizerApi.post('/CheckIn', data);
    return res.data;
  },

  // ===== THÔNG BÁO =====
  guiThongBao: async (data: GuiThongBaoRequest): Promise<{ message: string; soLuongGui: number }> => {
    const res = await organizerApi.post('/ThongBao/gui', data);
    return res.data;
  },

  getThongBaoBySuKien: async (suKienId: number, trangThai?: number): Promise<OrgThongBao[]> => {
    const params: Record<string, unknown> = {};
    if (trangThai !== undefined) params.trangThai = trangThai;
    const res = await organizerApi.get<{ data: OrgThongBao[] }>(`/ThongBao/sukien/${suKienId}`, { params });
    return res.data?.data ?? [];
  },

  // ===== DANH MỤC & ĐỊA ĐIỂM (qua Organizer API) =====
  getDanhMuc: async (): Promise<{ danhMucID: number; tenDanhMuc: string; moTa?: string }[]> => {
    try {
      const res = await organizerApi.get<{ danhMucID: number; tenDanhMuc: string; moTa?: string }[]>('/DanhMucSuKien');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  getDiaDiem: async (): Promise<{ diaDiemID: number; tenDiaDiem: string; diaChi?: string }[]> => {
    try {
      const res = await organizerApi.get<{ diaDiemID: number; tenDiaDiem: string; diaChi?: string }[]>('/DiaDiem');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },
};

export default organizerService;

