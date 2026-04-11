import { attendeeApi } from './api';
import type { Event } from './event.service';

export interface FavoriteEvent extends Event {
  ngayYeuThich: string;
}

export interface FavoriteResponse {
  success: boolean;
  count: number;
  data: FavoriteEvent[];
}

export interface FavoriteIdsResponse {
  success: boolean;
  count: number;
  data: number[];
}

export interface FavoriteCheckResponse {
  success: boolean;
  suKienId: number;
  isFavorite: boolean; // Backend trả về isFavorite (không phải isYeuThich)
}

export interface FavoriteToggleResponse {
  success: boolean;
  message: string;
  isFavorite: boolean;
}

export interface FavoriteCountResponse {
  success: boolean;
  suKienId: number;
  count: number; // Backend trả về count (không phải soLuongYeuThich)
}

const favoriteService = {
  // Lấy danh sách sự kiện yêu thích
  getFavorites: async (): Promise<FavoriteEvent[]> => {
    const response = await attendeeApi.get<FavoriteResponse>('/SuKienYeuThich');
    return response.data.data;
  },

  // Lấy danh sách ID sự kiện yêu thích
  getFavoriteIds: async (): Promise<number[]> => {
    try {
      const response = await attendeeApi.get<FavoriteIdsResponse>('/SuKienYeuThich/ids');
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching favorite IDs:', error);
      return [];
    }
  },

  // Kiểm tra sự kiện có được yêu thích không
  checkFavorite: async (eventId: number): Promise<boolean> => {
    try {
      const response = await attendeeApi.get<FavoriteCheckResponse>(
        `/SuKienYeuThich/check/${eventId}`
      );
      return response.data.isFavorite; // FIX: đọc đúng field
    } catch (error) {
      console.error(`Error checking favorite ${eventId}:`, error);
      return false;
    }
  },

  // Thêm sự kiện vào yêu thích
  addFavorite: async (eventId: number): Promise<boolean> => {
    try {
      await attendeeApi.post(`/SuKienYeuThich/${eventId}`);
      return true;
    } catch (error) {
      console.error(`Error adding favorite ${eventId}:`, error);
      return false;
    }
  },

  // Xóa sự kiện khỏi yêu thích
  removeFavorite: async (eventId: number): Promise<boolean> => {
    try {
      await attendeeApi.delete(`/SuKienYeuThich/${eventId}`);
      return true;
    } catch (error) {
      console.error(`Error removing favorite ${eventId}:`, error);
      return false;
    }
  },

  // Toggle yêu thích
  toggleFavorite: async (eventId: number): Promise<boolean> => {
    const response = await attendeeApi.put<FavoriteToggleResponse>(
      `/SuKienYeuThich/toggle/${eventId}`
    );
    return response.data.isFavorite;
  },

  // Lấy số lượng người yêu thích
  getFavoriteCount: async (eventId: number): Promise<number> => {
    try {
      const response = await attendeeApi.get<FavoriteCountResponse>(
        `/SuKienYeuThich/count/${eventId}`
      );
      return response.data.count; // FIX: đọc đúng field
    } catch (error) {
      console.error(`Error fetching favorite count ${eventId}:`, error);
      return 0;
    }
  }
};

export default favoriteService;
