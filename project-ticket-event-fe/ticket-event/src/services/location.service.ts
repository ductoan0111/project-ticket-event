import { attendeeApi } from './api';

export interface Location {
  diaDiemID: number;
  tenDiaDiem: string;
  diaChi: string;
  sucChua?: number;
  moTa?: string;
  trangThai: boolean;
}

const locationService = {
  // Lấy tất cả địa điểm
  // Backend /api/DiaDiem trả về array trực tiếp (không có wrapper { success, data })
  getAll: async (): Promise<Location[]> => {
    try {
      const response = await attendeeApi.get<Location[] | { success: boolean; data: Location[] }>('/DiaDiem');

      // Trường hợp 1: backend trả về array trực tiếp
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Trường hợp 2: backend trả về { success, data: [...] }
      const wrapped = response.data as { success: boolean; data: Location[] };
      if (wrapped && Array.isArray(wrapped.data)) {
        return wrapped.data;
      }

      console.warn('Unexpected /DiaDiem response structure:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  },

  // Lấy địa điểm theo ID
  getById: async (id: number): Promise<Location | null> => {
    try {
      const response = await attendeeApi.get<Location | { success: boolean; data: Location }>(`/DiaDiem/${id}`);

      if (!response.data) return null;

      // Trường hợp 1: trả về object Location trực tiếp
      const direct = response.data as Location;
      if (typeof direct.diaDiemID === 'number') {
        return direct;
      }

      // Trường hợp 2: trả về { success, data: { ... } }
      const wrapped = response.data as { success: boolean; data: Location };
      if (wrapped.data) return wrapped.data;

      return null;
    } catch (error) {
      console.error(`Error fetching location ${id}:`, error);
      return null;
    }
  }
};

export default locationService;
