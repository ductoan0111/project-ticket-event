import { attendeeApi } from './api';

export interface Category {
  danhMucID: number;
  tenDanhMuc: string;
  moTa: string | null;
}

// Map icon/màu theo tên danh mục (tiếng Việt)
const CATEGORY_ICONS: Record<string, { icon: string; color: string }> = {
  'âm nhạc': { icon: '🎵', color: '#ec4899' },
  'music': { icon: '🎵', color: '#ec4899' },
  'concert': { icon: '🎤', color: '#e879f9' },
  'nghệ thuật': { icon: '🎭', color: '#8b5cf6' },
  'art': { icon: '🎭', color: '#8b5cf6' },
  'thể thao': { icon: '⚽', color: '#10b981' },
  'sport': { icon: '⚽', color: '#10b981' },
  'hội thảo': { icon: '🎓', color: '#f59e0b' },
  'workshop': { icon: '🎓', color: '#f59e0b' },
  'seminar': { icon: '📊', color: '#f59e0b' },
  'lễ hội': { icon: '🎉', color: '#ef4444' },
  'festival': { icon: '🎉', color: '#ef4444' },
  'ẩm thực': { icon: '🍽️', color: '#06b6d4' },
  'food': { icon: '🍽️', color: '#06b6d4' },
  'công nghệ': { icon: '💻', color: '#3b82f6' },
  'tech': { icon: '💻', color: '#3b82f6' },
  'kinh doanh': { icon: '💼', color: '#6366f1' },
  'business': { icon: '💼', color: '#6366f1' },
  'giáo dục': { icon: '📚', color: '#f59e0b' },
  'education': { icon: '📚', color: '#f59e0b' },
  'sức khỏe': { icon: '🏃', color: '#10b981' },
  'health': { icon: '🏃', color: '#10b981' },
  'du lịch': { icon: '✈️', color: '#f97316' },
  'travel': { icon: '✈️', color: '#f97316' },
  'thời trang': { icon: '👗', color: '#ec4899' },
  'fashion': { icon: '👗', color: '#ec4899' },
  'cộng đồng': { icon: '🤝', color: '#8b5cf6' },
  'community': { icon: '🤝', color: '#8b5cf6' },
  'giải trí': { icon: '🎪', color: '#ef4444' },
  'entertainment': { icon: '🎪', color: '#ef4444' },
};

const DEFAULT_COLORS = ['#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#3b82f6', '#f97316'];

export function getCategoryIcon(tenDanhMuc: string): { icon: string; color: string } {
  const lower = tenDanhMuc.toLowerCase();
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (lower.includes(key)) {
      return CATEGORY_ICONS[key];
    }
  }
  // Default: hash tên thành màu & icon
  const hash = tenDanhMuc.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return { icon: '🎪', color: DEFAULT_COLORS[hash % DEFAULT_COLORS.length] };
}

const categoryService = {
  // Lấy tất cả danh mục
  // Backend /api/DanhMucSuKien trả về array trực tiếp (không có wrapper)
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await attendeeApi.get<Category[] | { success: boolean; data: Category[] }>('/DanhMucSuKien');

      // Trường hợp 1: backend trả về array trực tiếp
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Trường hợp 2: backend trả về { success, data: [...] }
      const wrapped = response.data as { success: boolean; data: Category[] };
      if (wrapped && Array.isArray(wrapped.data)) {
        return wrapped.data;
      }

      console.warn('Unexpected /DanhMucSuKien response:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Tìm danh mục theo tên
  getCategoryByName: async (name: string): Promise<Category | null> => {
    try {
      const response = await attendeeApi.get<Category>(
        `/DanhMucSuKien/by-name?ten=${encodeURIComponent(name)}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${name}:`, error);
      return null;
    }
  }
};

export default categoryService;
