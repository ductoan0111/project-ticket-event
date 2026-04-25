import { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, MapPin, Search, TrendingUp, Clock, Ticket, User, LogOut, Bell,
  Star, Heart, ChevronDown, Music, PartyPopper, Users, ArrowRight, Sparkles, Tag,
  Filter, ChevronRight, Zap, Radio
} from 'lucide-react';
import eventService from '../../services/event.service';
import favoriteService from '../../services/favorite.service';
import notificationService from '../../services/notification.service';
import locationService from '../../services/location.service';
import categoryService, { getCategoryIcon } from '../../services/category.service';
import type { Event } from '../../services/event.service';
import type { Location } from '../../services/location.service';
import type { Category } from '../../services/category.service';
import './AttendeeHome.css';

const AttendeeHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [ongoingEvents, setOngoingEvents] = useState<Event[]>([]);
  const [popularEvents, setPopularEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]); // Lưu tất cả events
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]); // Events sau khi lọc
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false); // Đang ở chế độ tìm kiếm
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [isFilteringByCategory, setIsFilteringByCategory] = useState(false); // Đang lọc theo danh mục
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favoriteCounts, setFavoriteCounts] = useState<Map<number, number>>(new Map());
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const [upcoming, ongoing, popular, cats, favIds, unread, locations] = await Promise.all([
        eventService.getUpcomingEvents(9).catch(() => []),
        eventService.getOngoingEvents(9).catch(() => []),
        eventService.getPopularEvents(9).catch(() => []),
        categoryService.getCategories().catch(() => []),
        user ? favoriteService.getFavoriteIds().catch(() => []) : Promise.resolve([]),
        user ? notificationService.getUnreadCount().catch(() => 0) : Promise.resolve(0),
        locationService.getAll().catch(() => []),
      ]);

      // Build location map
      const locationMap = new Map<number, Location>();
      if (Array.isArray(locations)) {
        locations.forEach(loc => locationMap.set(loc.diaDiemID, loc));
      }
      const categoryMap = new Map<number, Category>();
      if (Array.isArray(cats)) {
        cats.forEach(cat => categoryMap.set(cat.danhMucID, cat));
      }

      const enrichEvents = (events: Event[]) => {
        if (!Array.isArray(events)) return [];
        return events.map(event => ({
          ...event,
          // Ưu tiên tenDiaDiem từ backend response (đã join sẵn)
          // Fallback về locationMap lookup, sau đó về text mặc định
          tenDiaDiem: event.tenDiaDiem ||
            locationMap.get(event.diaDiemID)?.tenDiaDiem ||
            (event.diaDiemID > 0 ? `Địa điểm #${event.diaDiemID}` : 'Chưa xác định'),
          tenDanhMuc: event.tenDanhMuc || categoryMap.get(event.danhMucID)?.tenDanhMuc,
        }));
      };

      const enrichedUpcoming = enrichEvents(upcoming);
      const enrichedOngoing = enrichEvents(ongoing);
      const enrichedPopular = enrichEvents(popular);

      setUpcomingEvents(enrichedUpcoming);
      setOngoingEvents(enrichedOngoing);
      setPopularEvents(enrichedPopular);
      
      // Lưu tất cả events để tìm kiếm
      const combined = [...enrichedUpcoming, ...enrichedOngoing, ...enrichedPopular];
      // Loại bỏ duplicate dựa trên suKienID
      const uniqueEvents = Array.from(
        new Map(combined.map(e => [e.suKienID, e])).values()
      );
      setAllEvents(uniqueEvents);
      
      setCategories(Array.isArray(cats) ? cats : []);
      setFavoriteIds(new Set(Array.isArray(favIds) ? favIds : []));
      setUnreadCount(unread || 0);

      // Load favorite counts
      const allEvents = [...enrichedUpcoming, ...enrichedOngoing, ...enrichedPopular];
      const uniqueEventIds = [...new Set(allEvents.map(e => e.suKienID))];
      if (uniqueEventIds.length > 0) {
        const counts = new Map<number, number>();
        await Promise.all(
          uniqueEventIds.map(async (id) => {
            const count = await favoriteService.getFavoriteCount(id).catch(() => 0);
            counts.set(id, count);
          })
        );
        setFavoriteCounts(counts);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (eventId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast('Vui lòng đăng nhập để thêm yêu thích');
      navigate('/login');
      return;
    }
    try {
      const isNowFavorite = await favoriteService.toggleFavorite(eventId);
      const newFavoriteIds = new Set(favoriteIds);
      if (isNowFavorite) {
        newFavoriteIds.add(eventId);
        showToast('Đã thêm vào danh sách yêu thích ❤️');
      } else {
        newFavoriteIds.delete(eventId);
        showToast('Đã xóa khỏi danh sách yêu thích');
      }
      setFavoriteIds(newFavoriteIds);
      const newCount = await favoriteService.getFavoriteCount(eventId);
      setFavoriteCounts(new Map(favoriteCounts.set(eventId, newCount)));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    
    if (!query) {
      // Nếu ô tìm kiếm trống, thoát chế độ tìm kiếm
      setIsSearching(false);
      setFilteredEvents([]);
      return;
    }

    // Lọc events theo tên
    const results = allEvents.filter(event => 
      event.tenSuKien.toLowerCase().includes(query) ||
      (event.moTa && event.moTa.toLowerCase().includes(query)) ||
      (event.tenDanhMuc && event.tenDanhMuc.toLowerCase().includes(query)) ||
      (event.tenDiaDiem && event.tenDiaDiem.toLowerCase().includes(query))
    );

    setFilteredEvents(results);
    setIsSearching(true);
    
    if (results.length === 0) {
      showToast(`Không tìm thấy sự kiện nào với từ khóa "${searchQuery}"`);
    } else {
      showToast(`Tìm thấy ${results.length} sự kiện`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setFilteredEvents([]);
    setActiveCategory(null);
    setIsFilteringByCategory(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEventClick = (eventId: number) => navigate(`/events/${eventId}`);
  const handleBookTicket = (eventId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/events/${eventId}`);
  };
  const handleCategoryClick = (categoryId: number) => {
    // Nếu click vào danh mục đang active, thì bỏ lọc
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      setIsFilteringByCategory(false);
      setFilteredEvents([]);
      return;
    }

    // Lọc events theo danh mục
    setActiveCategory(categoryId);
    setIsFilteringByCategory(true);
    setIsSearching(false); // Tắt chế độ tìm kiếm
    setSearchQuery(''); // Xóa search query

    const results = allEvents.filter(event => event.danhMucID === categoryId);
    setFilteredEvents(results);

    if (results.length === 0) {
      const categoryName = categories.find(c => c.danhMucID === categoryId)?.tenDanhMuc || 'danh mục này';
      showToast(`Không có sự kiện nào trong ${categoryName}`);
    } else {
      showToast(`Tìm thấy ${results.length} sự kiện`);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Chưa xác định';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Chưa xác định';
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return 'Chưa xác định'; }
  };

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const renderEventCard = (event: Event, index: number, badge: 'upcoming' | 'ongoing' | 'hot') => {
    const isFav = favoriteIds.has(event.suKienID);
    const favCount = favoriteCounts.get(event.suKienID) || 0;
    const catInfo = getCategoryIcon(event.tenDanhMuc || '');
    const badgeContent = {
      upcoming: { icon: <Clock size={12} />, label: 'Sắp diễn ra' },
      ongoing: { icon: <Radio size={12} />, label: 'Đang diễn ra' },
      hot: { icon: <Zap size={12} />, label: 'Nổi bật' },
    }[badge];

    return (
      <div
        key={event.suKienID}
        className="event-card"
        style={{ animationDelay: `${index * 0.08}s` }}
        onClick={() => handleEventClick(event.suKienID)}
        role="button"
        tabIndex={0}
      >
        <div className="event-image-wrap">
          <img
            src={event.anhBiaUrl || `https://picsum.photos/seed/${event.suKienID + badge}/400/250`}
            alt={event.tenSuKien}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${event.suKienID + badge}/400/250`;
            }}
          />
          <div className="event-img-overlay" />

          <div className={`event-badge-chip ${badge}`}>
            {badgeContent.icon}
            <span>{badgeContent.label}</span>
          </div>

          <button
            className={`btn-favorite ${isFav ? 'is-fav' : ''}`}
            onClick={(e) => handleToggleFavorite(event.suKienID, e)}
            title={isFav ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
          >
            <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
          </button>

          {event.giaThapNhat !== undefined && (
            <div className="event-price-tag">
              {event.giaThapNhat === 0 ? (
                <span className="price-free">Miễn phí</span>
              ) : (
                <span className="price-amount">{formatPrice(event.giaThapNhat)}</span>
              )}
            </div>
          )}
        </div>

        <div className="event-body">
          <div className="event-cat-row">
            <span className="event-cat-pill" style={{ '--cat-color': catInfo.color } as React.CSSProperties}>
              <span className="cat-icon-sm">{catInfo.icon}</span>
              <span>{event.tenDanhMuc || 'Sự kiện'}</span>
            </span>
            <span className="fav-count">
              <Heart size={12} />
              {favCount}
            </span>
          </div>

          <h3 className="event-title" title={event.tenSuKien}>{event.tenSuKien}</h3>

          {event.moTa && (
            <p className="event-desc">{event.moTa}</p>
          )}

          <div className="event-meta-list">
            <div className="event-meta-item">
              <Calendar size={14} />
              <span>{formatDate(event.thoiGianBatDau)}</span>
              {formatTime(event.thoiGianBatDau) && (
                <span className="meta-time">{formatTime(event.thoiGianBatDau)}</span>
              )}
            </div>
            <div className="event-meta-item">
              <MapPin size={14} />
              <span className="meta-location">{event.tenDiaDiem || 'Chưa xác định'}</span>
            </div>
          </div>

          <div className="event-footer-row">
            {event.giaThapNhat !== undefined && event.giaThapNhat > 0 ? (
              // Có giá: hiện giá bên trái, nút bên phải
              <>
                <div className="price-cell">
                  <span className="price-from">Từ</span>
                  <span className="price-val">{formatPrice(event.giaThapNhat)}</span>
                </div>
                <button
                  className="btn-book"
                  onClick={(e) => handleBookTicket(event.suKienID, e)}
                >
                  <Ticket size={15} />
                  <span>Đặt vé</span>
                </button>
              </>
            ) : (
              // Miễn phí hoặc chưa có giá: nút full width
              <button
                className="btn-book btn-book-full"
                onClick={(e) => handleBookTicket(event.suKienID, e)}
              >
                <Ticket size={15} />
                <span>Đặt vé</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ah-root">
      {/* Toast */}
      {toastMsg && (
        <div className="ah-toast">
          <Sparkles size={16} />
          {toastMsg}
        </div>
      )}

      {/* ===== HEADER ===== */}
      <header className="ah-header">
        <div className="ah-header-inner">
          {/* Logo */}
          <div className="ah-logo" onClick={() => navigate('/attendee')}>
            <div className="ah-logo-icon">
              <Ticket size={24} />
              <Sparkles size={12} className="ah-logo-sparkle" />
            </div>
            <div>
              <span className="ah-logo-name">TicketEvent</span>
              <span className="ah-logo-sub">Khám phá sự kiện</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="ah-nav">
            <NavLink to="/attendee" className={({ isActive }) => `ah-nav-link ${isActive ? 'active' : ''}`}>
              Trang chủ
            </NavLink>
            <NavLink to="/my-tickets" className={({ isActive }) => `ah-nav-link ${isActive ? 'active' : ''}`}>
              Vé của tôi
            </NavLink>
            <NavLink to="/my-orders" className={({ isActive }) => `ah-nav-link ${isActive ? 'active' : ''}`}>
              Đơn hàng
            </NavLink>
          </nav>

          {/* Actions */}
          <div className="ah-actions">
            <button className="ah-icon-btn" onClick={() => navigate('/notifications')} title="Thông báo">
              <Bell size={20} />
              {unreadCount > 0 && <span className="ah-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            <button className="ah-icon-btn" onClick={() => navigate('/favorites')} title="Yêu thích">
              <Heart size={20} />
            </button>

            {user ? (
              <div className="ah-user-menu" ref={userMenuRef}>
                <button className="ah-user-btn" onClick={() => setShowUserMenu(v => !v)}>
                  <div className="ah-avatar">
                    <User size={16} />
                  </div>
                  <span className="ah-user-name">{user.hoTen}</span>
                  <ChevronDown size={14} className={`ah-chevron ${showUserMenu ? 'open' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="ah-dropdown">
                    <div className="ah-dropdown-head">
                      <div className="ah-dropdown-avatar"><User size={20} /></div>
                      <div>
                        <p className="ah-dropdown-name">{user.hoTen}</p>
                        <p className="ah-dropdown-email">{user.email}</p>
                      </div>
                    </div>
                    <div className="ah-dropdown-divider" />
                    <button onClick={() => { navigate('/profile'); setShowUserMenu(false); }} className="ah-dropdown-item">
                      <User size={15} /><span>Thông tin cá nhân</span>
                    </button>
                    <button onClick={() => { navigate('/my-tickets'); setShowUserMenu(false); }} className="ah-dropdown-item">
                      <Ticket size={15} /><span>Vé của tôi</span>
                    </button>
                    <button onClick={() => { navigate('/favorites'); setShowUserMenu(false); }} className="ah-dropdown-item">
                      <Heart size={15} /><span>Yêu thích</span>
                    </button>
                    <div className="ah-dropdown-divider" />
                    <button onClick={handleLogout} className="ah-dropdown-item danger">
                      <LogOut size={15} /><span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="ah-btn-login" onClick={() => navigate('/login')}>
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="ah-hero">
        <div className="ah-hero-bg">
          <div className="ah-hero-orb ah-orb-1" />
          <div className="ah-hero-orb ah-orb-2" />
          <div className="ah-hero-orb ah-orb-3" />
          <div className="ah-hero-grid" />
        </div>
        <div className="ah-hero-content">
          <div className="ah-hero-pill">
            <Sparkles size={14} />
            <span>Hơn 1,000+ sự kiện đang chờ bạn</span>
          </div>
          <h1 className="ah-hero-title">
            Khám phá những
            <span className="ah-hero-accent"> Sự kiện </span>
            đáng nhớ
          </h1>
          <p className="ah-hero-subtitle">
            Tìm và đặt vé cho hàng nghìn sự kiện hấp dẫn trên toàn quốc — từ concert, hội thảo đến lễ hội.
          </p>

          <form onSubmit={handleSearch} className="ah-search-form">
            <div className="ah-search-box">
              <Search size={20} className="ah-search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện, nghệ sĩ, địa điểm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="ah-search-input"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="ah-search-clear" 
                  onClick={handleClearSearch}
                  title="Xóa tìm kiếm"
                >✕</button>
              )}
            </div>
            <button type="submit" className="ah-search-btn">
              <Search size={18} />
              <span>Tìm kiếm</span>
            </button>
          </form>

          {/* Category chips từ API */}
          {categories.length > 0 && (
            <div className="ah-cat-chips">
              <Filter size={14} />
              {categories.slice(0, 6).map(cat => {
                const ci = getCategoryIcon(cat.tenDanhMuc);
                return (
                  <button
                    key={cat.danhMucID}
                    className={`ah-cat-chip ${activeCategory === cat.danhMucID ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat.danhMucID)}
                    style={{ '--chip-color': ci.color } as React.CSSProperties}
                  >
                    <span>{ci.icon}</span>
                    <span>{cat.tenDanhMuc}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Stats */}
          <div className="ah-stats">
            <div className="ah-stat">
              <div className="ah-stat-ico"><Calendar size={18} /></div>
              <div>
                <p className="ah-stat-val">1,000+</p>
                <p className="ah-stat-lbl">Sự kiện</p>
              </div>
            </div>
            <div className="ah-stat-sep" />
            <div className="ah-stat">
              <div className="ah-stat-ico"><Users size={18} /></div>
              <div>
                <p className="ah-stat-val">50K+</p>
                <p className="ah-stat-lbl">Người dùng</p>
              </div>
            </div>
            <div className="ah-stat-sep" />
            <div className="ah-stat">
              <div className="ah-stat-ico"><Star size={18} /></div>
              <div>
                <p className="ah-stat-val">4.9/5</p>
                <p className="ah-stat-lbl">Đánh giá</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAIN ===== */}
      <main className="ah-main">

        {/* KẾT QUẢ TÌM KIẾM */}
        {isSearching && (
          <section className="ah-section">
            {filteredEvents.length === 0 ? (
              <div className="ah-empty">
                <Search size={56} />
                <h3>Không tìm thấy sự kiện nào</h3>
                <p>Thử tìm kiếm với từ khóa khác hoặc xem các sự kiện đề xuất bên dưới</p>
                <button className="ah-empty-btn" onClick={handleClearSearch}>
                  Xem tất cả sự kiện
                </button>
              </div>
            ) : (
              <div className="ah-events-grid">
                {filteredEvents.map((ev, i) => renderEventCard(ev, i, 'hot'))}
              </div>
            )}
          </section>
        )}

        {/* KẾT QUẢ LỌC THEO DANH MỤC */}
        {isFilteringByCategory && !isSearching && (
          <section className="ah-section">
            {filteredEvents.length === 0 ? (
              <div className="ah-empty">
                <Tag size={56} />
                <h3>Không có sự kiện nào</h3>
                <p>Chưa có sự kiện nào trong danh mục này</p>
                <button className="ah-empty-btn" onClick={handleClearSearch}>
                  Xem tất cả sự kiện
                </button>
              </div>
            ) : (
              <div className="ah-events-grid">
                {filteredEvents.map((ev, i) => renderEventCard(ev, i, 'hot'))}
              </div>
            )}
          </section>
        )}

        {/* CATEGORIES từ API - Ẩn khi đang tìm kiếm hoặc lọc */}
        {!isSearching && !isFilteringByCategory && categories.length > 0 && (
          <section className="ah-section">
            <div className="ah-section-head">
              <div>
                <h2 className="ah-section-title"><Tag size={24} />Khám phá theo danh mục</h2>
                <p className="ah-section-sub">Tìm sự kiện phù hợp với sở thích của bạn</p>
              </div>
              <button className="ah-view-all" onClick={() => navigate('/events')}>
                Tất cả <ArrowRight size={16} />
              </button>
            </div>
            <div className="ah-cats-grid">
              {categories.map((cat, idx) => {
                const ci = getCategoryIcon(cat.tenDanhMuc);
                return (
                  <div
                    key={cat.danhMucID}
                    className="ah-cat-card"
                    style={{ '--cat-color': ci.color, animationDelay: `${idx * 0.07}s` } as React.CSSProperties}
                    onClick={() => handleCategoryClick(cat.danhMucID)}
                  >
                    <div className="ah-cat-glow" />
                    <span className="ah-cat-emoji">{ci.icon}</span>
                    <h3 className="ah-cat-name">{cat.tenDanhMuc}</h3>
                    {cat.moTa && <p className="ah-cat-desc">{cat.moTa}</p>}
                    <span className="ah-cat-arrow"><ChevronRight size={16} /></span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* UPCOMING EVENTS - Ẩn khi đang tìm kiếm hoặc lọc */}
        {!isSearching && !isFilteringByCategory && (
        <section className="ah-section">
          <div className="ah-section-head">
            <div>
              <h2 className="ah-section-title"><Clock size={24} />Sự kiện sắp diễn ra</h2>
              <p className="ah-section-sub">Đừng bỏ lỡ những sự kiện hấp dẫn sắp tới</p>
            </div>
            <button className="ah-view-all" onClick={() => navigate('/events?filter=upcoming')}>
              Xem tất cả <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="ah-skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="ah-skeleton-card">
                  <div className="ah-skel-img" />
                  <div className="ah-skel-body">
                    <div className="ah-skel-line w60" />
                    <div className="ah-skel-line w90" />
                    <div className="ah-skel-line w75" />
                    <div className="ah-skel-line w50" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="ah-empty">
              <Clock size={56} />
              <h3>Chưa có sự kiện sắp diễn ra</h3>
              <p>Hãy quay lại sau để khám phá các sự kiện mới!</p>
            </div>
          ) : (
            <div className="ah-events-grid">
              {upcomingEvents.map((ev, i) => renderEventCard(ev, i, 'upcoming'))}
            </div>
          )}
        </section>
        )}

        {/* ONGOING EVENTS - Ẩn khi đang tìm kiếm hoặc lọc */}
        {/* POPULAR EVENTS - Ẩn khi đang tìm kiếm hoặc lọc */}
        {!isSearching && !isFilteringByCategory && (
        <section className="ah-section">
          <div className="ah-section-head">
            <div>
              <h2 className="ah-section-title"><Radio size={24} />Sự kiện đang diễn ra</h2>
              <p className="ah-section-sub">Tham gia ngay các sự kiện đang mở cửa</p>
            </div>
            <button className="ah-view-all" onClick={() => navigate('/events?filter=ongoing')}>
              Xem tất cả <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="ah-skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="ah-skeleton-card">
                  <div className="ah-skel-img" />
                  <div className="ah-skel-body">
                    <div className="ah-skel-line w60" />
                    <div className="ah-skel-line w90" />
                    <div className="ah-skel-line w75" />
                    <div className="ah-skel-line w50" />
                  </div>
                </div>
              ))}
            </div>
          ) : ongoingEvents.length === 0 ? (
            <div className="ah-empty">
              <Radio size={56} />
              <h3>Chưa có sự kiện đang diễn ra</h3>
              <p>Các sự kiện sẽ xuất hiện ở đây khi đến giờ bắt đầu.</p>
            </div>
          ) : (
            <div className="ah-events-grid">
              {ongoingEvents.map((ev, i) => renderEventCard(ev, i, 'ongoing'))}
            </div>
          )}
        </section>
        )}

        {!isSearching && !isFilteringByCategory && (
        <section className="ah-section">
          <div className="ah-section-head">
            <div>
              <h2 className="ah-section-title"><TrendingUp size={24} />Sự kiện nổi bật</h2>
              <p className="ah-section-sub">Được nhiều người quan tâm nhất</p>
            </div>
            <button className="ah-view-all" onClick={() => navigate('/events?filter=popular')}>
              Xem tất cả <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="ah-skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="ah-skeleton-card">
                  <div className="ah-skel-img" />
                  <div className="ah-skel-body">
                    <div className="ah-skel-line w60" />
                    <div className="ah-skel-line w90" />
                    <div className="ah-skel-line w75" />
                    <div className="ah-skel-line w50" />
                  </div>
                </div>
              ))}
            </div>
          ) : popularEvents.length === 0 ? (
            <div className="ah-empty">
              <TrendingUp size={56} />
              <h3>Chưa có sự kiện nổi bật</h3>
              <p>Hãy quay lại sau để khám phá các sự kiện mới!</p>
            </div>
          ) : (
            <div className="ah-events-grid">
              {popularEvents.map((ev, i) => renderEventCard(ev, i, 'hot'))}
            </div>
          )}
        </section>
        )}

        {/* PROMO BANNER - Ẩn khi đang tìm kiếm hoặc lọc */}
        {!isSearching && !isFilteringByCategory && (
        <section className="ah-promo-banner">
          <div className="ah-promo-bg">
            <div className="ah-promo-orb-1" />
            <div className="ah-promo-orb-2" />
          </div>
          <div className="ah-promo-content">
            <div className="ah-promo-text">
              <div className="ah-promo-pill">
                <Sparkles size={14} />
                <span>Ưu đãi đặc biệt</span>
              </div>
              <h2 className="ah-promo-title">Giảm 30% cho lần đặt vé đầu tiên</h2>
              <p className="ah-promo-desc">
                Đăng ký ngay hôm nay và nhận mã giảm giá exclusive dành riêng cho thành viên mới!
              </p>
              <button className="ah-promo-btn" onClick={() => navigate('/register')}>
                <Tag size={18} />
                <span>Nhận ưu đãi ngay</span>
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="ah-promo-deco">
              <PartyPopper size={100} />
              <Music size={44} className="ah-deco-music" />
            </div>
          </div>
        </section>
        )}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="ah-footer">
        <div className="ah-footer-inner">
          <div className="ah-footer-brand">
            <div className="ah-footer-logo">
              <Ticket size={22} />
              <span>TicketEvent</span>
            </div>
            <p className="ah-footer-desc">Nền tảng khám phá sự kiện & đặt vé hàng đầu Việt Nam</p>
            <div className="ah-footer-contacts">
              <span><MapPin size={14} /> 123 Nguyễn Huệ, Q.1, TP.HCM</span>
              <span><Bell size={14} /> Hỗ trợ 08:00 – 22:00 mỗi ngày</span>
            </div>
          </div>

          <div className="ah-footer-col">
            <h4>Khám phá</h4>
            <a href="#" onClick={e => { e.preventDefault(); navigate('/events?filter=upcoming'); }}>Sự kiện sắp diễn ra</a>
            <a href="#" onClick={e => { e.preventDefault(); navigate('/events?filter=popular'); }}>Sự kiện nổi bật</a>
            <a href="#" onClick={e => { e.preventDefault(); navigate('/events'); }}>Tất cả sự kiện</a>
            <a href="#" onClick={e => { e.preventDefault(); navigate('/favorites'); }}>Yêu thích</a>
          </div>

          <div className="ah-footer-col">
            <h4>Tài khoản</h4>
            <a href="#" onClick={e => { e.preventDefault(); navigate('/profile'); }}>Thông tin cá nhân</a>
            <a href="#" onClick={e => { e.preventDefault(); navigate('/my-tickets'); }}>Vé của tôi</a>
            <a href="#" onClick={e => { e.preventDefault(); navigate('/orders'); }}>Lịch sử đơn hàng</a>
            <a href="#" onClick={e => { e.preventDefault(); navigate('/notifications'); }}>Thông báo</a>
          </div>

          <div className="ah-footer-col">
            <h4>Hỗ trợ</h4>
            <a href="#">Trung tâm hỗ trợ</a>
            <a href="#">Câu hỏi thường gặp</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Chính sách hoàn vé</a>
          </div>
        </div>
        <div className="ah-footer-bottom">
          <p>© 2026 TicketEvent. All rights reserved.</p>
          <div className="ah-footer-socials">
            <a href="#" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AttendeeHome;
