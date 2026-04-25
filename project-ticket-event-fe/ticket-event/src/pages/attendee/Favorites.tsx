import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Calendar, MapPin, Trash2 } from 'lucide-react';
import favoriteService from '../../services/favorite.service';
import categoryService, { getCategoryIcon } from '../../services/category.service';
import locationService from '../../services/location.service';
import type { FavoriteEvent } from '../../services/favorite.service';
import type { Category } from '../../services/category.service';
import type { Location } from '../../services/location.service';
import './Favorites.css';

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [favoritesData, categoriesData, locationsData] = await Promise.all([
        favoriteService.getFavorites(),
        categoryService.getCategories(),
        locationService.getAll()
      ]);
      
      setFavorites(favoritesData);
      setCategories(categoriesData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (eventId: number) => {
    try {
      setRemovingId(eventId);
      await favoriteService.removeFavorite(eventId);
      setFavorites(prev => prev.filter(f => f.suKienID !== eventId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const getCategoryName = (id: number) => {
    return categories.find(c => c.danhMucID === id)?.tenDanhMuc || '';
  };

  const getLocationName = (id?: number) => {
    if (!id) return '';
    return locations.find(l => l.diaDiemID === id)?.tenDiaDiem || '';
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <div className="favorites-header-content">
          <div className="header-icon">
            <Heart size={32} fill="currentColor" />
          </div>
          <div>
            <h1>Sự kiện yêu thích</h1>
            <p>{favorites.length} sự kiện</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="favorites-loading">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="favorites-empty">
          <div className="empty-icon">
            <Heart size={80} />
          </div>
          <h3>Chưa có sự kiện yêu thích</h3>
          <p>Khám phá và lưu lại những sự kiện bạn quan tâm!</p>
          <button className="btn-primary" onClick={() => navigate('/attendee')}>
            Khám phá sự kiện
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(favorite => {
            const category = getCategoryIcon(getCategoryName(favorite.danhMucID));
            const isRemoving = removingId === favorite.suKienID;
            
            return (
              <div key={favorite.suKienID} className="favorite-card">
                <div 
                  className="favorite-image"
                  onClick={() => navigate(`/events/${favorite.suKienID}`)}
                >
                  {favorite.anhBiaUrl ? (
                    <img src={favorite.anhBiaUrl} alt={favorite.tenSuKien} />
                  ) : (
                    <div className="favorite-image-placeholder" style={{ background: category.color }}>
                      <span style={{ fontSize: '48px' }}>{category.icon}</span>
                    </div>
                  )}
                  
                  <button
                    className={`remove-btn ${isRemoving ? 'removing' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(favorite.suKienID);
                    }}
                    disabled={isRemoving}
                    title="Bỏ yêu thích"
                  >
                    {isRemoving ? (
                      <div className="mini-spinner"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                <div className="favorite-content">
                  <div className="favorite-category" style={{ color: category.color }}>
                    <span>{category.icon}</span>
                    {getCategoryName(favorite.danhMucID)}
                  </div>

                  <h3 
                    className="favorite-title"
                    onClick={() => navigate(`/events/${favorite.suKienID}`)}
                  >
                    {favorite.tenSuKien}
                  </h3>

                  <div className="favorite-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      {formatDate(favorite.thoiGianBatDau)}
                    </div>
                    {favorite.diaDiemID && (
                      <div className="meta-item">
                        <MapPin size={14} />
                        {getLocationName(favorite.diaDiemID)}
                      </div>
                    )}
                  </div>

                  {favorite.moTa && (
                    <p className="favorite-description">{favorite.moTa}</p>
                  )}

                  <div className="favorite-footer">
                    <div className="favorite-price">
                      {favorite.giaThapNhat ? (
                        <>
                          <span className="price-label">Từ</span>
                          <span className="price-value">{formatCurrency(favorite.giaThapNhat)}</span>
                        </>
                      ) : (
                        <span className="price-free">Miễn phí</span>
                      )}
                    </div>
                    <button 
                      className="btn-book"
                      onClick={() => navigate(`/events/${favorite.suKienID}`)}
                    >
                      Đặt vé
                    </button>
                  </div>

                  <div className="favorite-date-added">
                    <Heart size={12} fill="currentColor" />
                    Đã thích {formatDate(favorite.ngayYeuThich)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
