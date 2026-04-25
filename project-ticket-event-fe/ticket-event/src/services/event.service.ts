import { attendeeApi } from './api';

export interface Event {
  suKienID: number;
  danhMucID: number;
  diaDiemID: number;
  toChucID: number;
  tenSuKien: string;
  moTa: string | null;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  anhBiaUrl: string | null;
  trangThai: number;
  ngayTao: string;
  // Extended fields (có thể có hoặc không từ backend)
  tenDiaDiem?: string;
  tenDanhMuc?: string;
  giaThapNhat?: number; // Giá vé thấp nhất từ backend
}

export interface LoaiVe {
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

export interface EventDetail extends Event {
  loaiVes: LoaiVe[];
  giaThapNhat: number;
  giaCaoNhat: number;
  tongVeConLai: number;
  conVe: boolean;
}

export interface EventsResponse {
  success: boolean;
  count: number;
  data: Event[];
}

export interface EventDetailResponse {
  success: boolean;
  data: Event;
}

export interface FilterParams {
  danhMucId?: number;
  diaDiemId?: number;
  tuNgay?: string;
  denNgay?: string;
  giaMin?: number;
  giaMax?: number;
  trangThai?: number;
  sapXep?: string;
  page?: number;
  pageSize?: number;
}

const eventService = {
  // Lấy danh sách tất cả sự kiện
  getEvents: async (): Promise<Event[]> => {
    const response = await attendeeApi.get<EventsResponse>('/SuKien');
    return response.data.data;
  },

  // Lấy chi tiết sự kiện với danh sách loại vé
  getEventDetail: async (id: number): Promise<EventDetail> => {
    const response = await attendeeApi.get<{ success: boolean; data: EventDetail }>(
      `/SuKien/${id}/detail`
    );
    return response.data.data;
  },

  // Lấy chi tiết sự kiện (cũ - không có loại vé)
  getEventById: async (id: number): Promise<Event> => {
    const response = await attendeeApi.get<EventDetailResponse>(`/SuKien/${id}`);
    return response.data.data;
  },

  // Lấy sự kiện sắp diễn ra
  getUpcomingEvents: async (limit: number = 9): Promise<Event[]> => {
    try {
      const response = await attendeeApi.get<EventsResponse>(
        `/SuKien/upcoming?limit=${limit}`
      );
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      console.warn('Unexpected response structure for upcoming events:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
  },

  // Lấy sự kiện phổ biến
  getPopularEvents: async (limit: number = 9): Promise<Event[]> => {
    try {
      const response = await attendeeApi.get<EventsResponse>(
        `/SuKien/popular?limit=${limit}`
      );
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      console.warn('Unexpected response structure for popular events:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching popular events:', error);
      return [];
    }
  },

  // Lấy sự kiện đang diễn ra
  getOngoingEvents: async (limit: number = 9): Promise<Event[]> => {
    try {
      const response = await attendeeApi.get<EventsResponse>(
        `/SuKien/filter?trangThai=2&pageSize=${limit}&sortBy=ThoiGianKetThuc&sortOrder=asc`
      );
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      console.warn('Unexpected response structure for ongoing events:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching ongoing events:', error);
      return [];
    }
  },

  // Tìm kiếm sự kiện
  searchEvents: async (query: string, limit: number = 20): Promise<Event[]> => {
    const response = await attendeeApi.get<EventsResponse>(
      `/SuKien/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data.data;
  },

  // Lọc sự kiện nâng cao
  filterEvents: async (params: FilterParams): Promise<Event[]> => {
    const queryParams = new URLSearchParams();
    
    if (params.danhMucId) queryParams.append('danhMucId', params.danhMucId.toString());
    if (params.diaDiemId) queryParams.append('diaDiemId', params.diaDiemId.toString());
    if (params.tuNgay) queryParams.append('tuNgay', params.tuNgay);
    if (params.denNgay) queryParams.append('denNgay', params.denNgay);
    if (params.giaMin) queryParams.append('giaMin', params.giaMin.toString());
    if (params.giaMax) queryParams.append('giaMax', params.giaMax.toString());
    if (params.trangThai) queryParams.append('trangThai', params.trangThai.toString());
    if (params.sapXep) queryParams.append('sapXep', params.sapXep);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const response = await attendeeApi.get<EventsResponse>(
      `/SuKien/filter?${queryParams.toString()}`
    );
    return response.data.data;
  }
};

export default eventService;
