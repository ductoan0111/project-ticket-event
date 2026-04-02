import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, MapPin, Search, TrendingUp, Clock, Ticket, User, LogOut, Bell,
  Star, Heart, ChevronRight, Music, Palette,
  PartyPopper, Users, ArrowRight, Sparkles, Tag
} from 'lucide-react';
import './AttendeeHome.css';

interface SuKien {
  suKienID: number;
  tenSuKien: string;
  moTa: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  diaDiemID: number;
  danhMucID: number;
  trangThai: number;
  ngayTao: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  count: number;
}

const AttendeeHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<SuKien[]>([]);
  const [popularEvents, setPopularEvents] = useState<SuKien[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const categories: Category[] = [
    { id: 1, name: 'Âm nhạc', icon: '🎵', color: '#ec4899', count: 45 },
    { id: 2, name: 'Nghệ thuật', icon: '🎭', color: '#8b5cf6', count: 32 },
    { id: 3, name: 'Thể thao', icon: '⚽', color: '#10b981', count: 28 },
    { id: 4, name: 'Hội thảo', icon: '🎓', color: '#f59e0b', count: 56 },
    { id: 5, name: 'Lễ hội', icon: '🎉', color: '#ef4444', count: 23 },
    { id: 6, name: 'Ẩm thực', icon: '🍽️', color: '#06b6d4', count: 19 },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch upcoming events
      const upcomingRes = await fetch('https://localhost:44310/api/SuKien/upcoming?limit=6');
      if (upcomingRes.ok) {
        const upcomingData = await upcomingRes.json();
        setUpcomingEvents(upcomingData.data || []);
      }

      // Fetch popular events
      const popularRes = await fetch('https://localhost:44310/api/SuKien/popular?limit=6');
      if (popularRes.ok) {
        const popularData = await popularRes.json();
        setPopularEvents(popularData.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="attendee-home">
      {/* Header */}
      <header className="home-header">
        <div className="header-container">
          <div className="logo-section" onClick={() => navigate('/attendee')}>
            <div className="logo-wrapper">
              <Ticket className="logo-icon" size={32} />
              <Sparkles className="sparkle" size={16} />
            </div>
            <div className="logo-content">
              <span className="logo-text">TicketEvent</span>
              <span className="logo-tagline">Khám phá sự kiện</span>
            </div>
          </div>

          <nav className="nav-menu">
            <a href="#home" className="nav-link active">
              <span>Trang chủ</span>
              <div className="nav-indicator"></div>
            </a>
            <a href="#events" className="nav-link">
              <span>Sự kiện</span>
              <div className="nav-indicator"></div>
            </a>
            <a href="#tickets" className="nav-link">
              <span>Vé của tôi</span>
              <div className="nav-indicator"></div>
            </a>
            <a href="#orders" className="nav-link">
              <span>Đơn hàng</span>
              <div className="nav-indicator"></div>
            </a>
          </nav>

          <div className="header-actions">
            <button className="icon-btn notification-btn">
              <Bell size={20} />
              <span className="badge pulse">3</span>
              <span className="tooltip">Thông báo</span>
            </button>
            
            <button className="icon-btn favorite-btn">
              <Heart size={20} />
              <span className="tooltip">Yêu thích</span>
            </button>

            <div className="user-menu" onMouseEnter={() => setShowUserMenu(true)} onMouseLeave={() => setShowUserMenu(false)}>
              <button className="user-btn">
                <div className="user-avatar-img">
                  <User size={18} />
                </div>
                <span className="user-name">{user?.hoTen}</span>
                <ChevronRight className={`chevron ${showUserMenu ? 'rotate' : ''}`} size={16} />
              </button>
              <div className={`dropdown-menu ${showUserMenu ? 'show' : ''}`}>
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    <User size={24} />
                  </div>
                  <div className="dropdown-user-info">
                    <p className="dropdown-name">{user?.hoTen}</p>
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <a href="#profile" className="dropdown-item">
                  <User size={16} />
                  <span>Thông tin cá nhân</span>
                </a>
                <a href="#my-tickets" className="dropdown-item">
                  <Ticket size={16} />
                  <span>Vé của tôi</span>
                </a>
                <a href="#favorites" className="dropdown-item">
                  <Heart size={16} />
                  <span>Yêu thích</span>
                </a>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Khám phá hơn 1000+ sự kiện</span>
          </div>
          
          <h1 className="hero-title">
            Trải nghiệm những
            <span className="gradient-text"> Sự kiện Tuyệt vời</span>
          </h1>
          
          <p className="hero-subtitle">
            Tìm và đặt vé cho hàng ngàn sự kiện hấp dẫn trên toàn quốc.
            <br />Từ concert, hội thảo đến lễ hội - tất cả đều có tại đây!
          </p>

          <form onSubmit={handleSearch} className="search-box-wrapper">
            <div className="search-box">
              <div className="search-input-group">
                <Search className="search-icon" size={22} />
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện, nghệ sĩ, địa điểm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="search-btn">
                <Search size={20} />
                <span>Tìm kiếm</span>
              </button>
            </div>
          </form>

          <div className="quick-filters">
            {categories.slice(0, 5).map((cat) => (
              <button 
                key={cat.id}
                className={`filter-chip ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                style={{ '--chip-color': cat.color } as React.CSSProperties}
              >
                <span className="chip-icon">{cat.icon}</span>
                <span className="chip-text">{cat.name}</span>
                <span className="chip-count">{cat.count}</span>
              </button>
            ))}
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-icon">
                <Calendar size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-value">1000+</p>
                <p className="stat-label">Sự kiện</p>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-icon">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-value">50K+</p>
                <p className="stat-label">Người dùng</p>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-icon">
                <Star size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-value">4.9/5</p>
                <p className="stat-label">Đánh giá</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        {/* Upcoming Events */}
        <section className="events-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Clock size={28} />
                Sự kiện sắp diễn ra
              </h2>
              <p className="section-subtitle">Đừng bỏ lỡ những sự kiện hấp dẫn</p>
            </div>
            <button className="view-all-btn">Xem tất cả →</button>
          </div>

          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="event-card skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="events-grid">
              {upcomingEvents.map((event, index) => (
                <div 
                  key={event.suKienID} 
                  className="event-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="event-image">
                    <div className="event-badge upcoming">
                      <Clock size={14} />
                      <span>Sắp diễn ra</span>
                    </div>
                    <button className="event-favorite">
                      <Heart size={18} />
                    </button>
                    <img
                      src={`https://picsum.photos/seed/${event.suKienID}/400/250`}
                      alt={event.tenSuKien}
                    />
                    <div className="event-overlay">
                      <button className="btn-quick-view">
                        <span>Xem chi tiết</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="event-content">
                    <div className="event-category">
                      <Music size={14} />
                      <span>Âm nhạc</span>
                    </div>
                    
                    <h3 className="event-title">{event.tenSuKien}</h3>
                    <p className="event-description">{event.moTa}</p>
                    
                    <div className="event-meta">
                      <div className="meta-item">
                        <Calendar size={16} />
                        <span>{formatDate(event.thoiGianBatDau)}</span>
                      </div>
                      <div className="meta-item">
                        <Clock size={16} />
                        <span>{formatTime(event.thoiGianBatDau)}</span>
                      </div>
                      <div className="meta-item">
                        <MapPin size={16} />
                        <span>TP. HCM</span>
                      </div>
                    </div>

                    <div className="event-footer">
                      <div className="event-price">
                        <span className="price-label">Từ</span>
                        <span className="price-value">500.000đ</span>
                      </div>
                      <button className="btn-book">
                        <Ticket size={18} />
                        <span>Đặt vé</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Popular Events */}
        <section className="events-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <TrendingUp size={28} />
                Sự kiện phổ biến
              </h2>
              <p className="section-subtitle">Được nhiều người quan tâm nhất</p>
            </div>
            <button className="view-all-btn">Xem tất cả →</button>
          </div>

          <div className="events-grid">
            {popularEvents.map((event, index) => (
              <div 
                key={event.suKienID} 
                className="event-card popular"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="event-image">
                  <div className="event-badge hot">
                    <TrendingUp size={14} />
                    <span>Hot</span>
                  </div>
                  <button className="event-favorite">
                    <Heart size={18} />
                  </button>
                  <div className="event-rating">
                    <Star size={14} fill="currentColor" />
                    <span>4.8</span>
                  </div>
                  <img
                    src={`https://picsum.photos/seed/pop${event.suKienID}/400/250`}
                    alt={event.tenSuKien}
                  />
                  <div className="event-overlay">
                    <button className="btn-quick-view">
                      <span>Xem chi tiết</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="event-content">
                  <div className="event-category">
                    <Palette size={14} />
                    <span>Nghệ thuật</span>
                  </div>
                  
                  <h3 className="event-title">{event.tenSuKien}</h3>
                  <p className="event-description">{event.moTa}</p>
                  
                  <div className="event-meta">
                    <div className="meta-item">
                      <Calendar size={16} />
                      <span>{formatDate(event.thoiGianBatDau)}</span>
                    </div>
                    <div className="meta-item">
                      <MapPin size={16} />
                      <span>TP. Hồ Chí Minh</span>
                    </div>
                  </div>

                  <div className="event-stats">
                    <div className="stat">
                      <Users size={14} />
                      <span>2.5K quan tâm</span>
                    </div>
                    <div className="stat">
                      <Ticket size={14} />
                      <span>85% đã bán</span>
                    </div>
                  </div>

                  <div className="event-footer">
                    <div className="event-price">
                      <span className="price-label">Từ</span>
                      <span className="price-value">300.000đ</span>
                    </div>
                    <button className="btn-book">
                      <Ticket size={18} />
                      <span>Đặt vé</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="categories-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Tag size={28} />
                Khám phá theo danh mục
              </h2>
              <p className="section-subtitle">Tìm sự kiện phù hợp với sở thích của bạn</p>
            </div>
          </div>
          
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div 
                key={category.id} 
                className="category-card"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  '--category-color': category.color 
                } as React.CSSProperties}
              >
                <div className="category-background"></div>
                <div className="category-icon">{category.icon}</div>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-count">{category.count} sự kiện</p>
                <button className="category-btn">
                  <span>Khám phá</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Banner */}
        <section className="featured-banner">
          <div className="banner-content">
            <div className="banner-text">
              <div className="banner-badge">
                <Sparkles size={16} />
                <span>Ưu đãi đặc biệt</span>
              </div>
              <h2 className="banner-title">Giảm giá 30% cho sự kiện đầu tiên</h2>
              <p className="banner-description">
                Đăng ký ngay hôm nay và nhận mã giảm giá cho lần đặt vé đầu tiên của bạn!
              </p>
              <button className="banner-btn">
                <Tag size={20} />
                <span>Nhận ưu đãi ngay</span>
                <ArrowRight size={20} />
              </button>
            </div>
            <div className="banner-image">
              <div className="banner-decoration">
                <PartyPopper size={80} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-glow footer-glow-1"></div>
        <div className="footer-glow footer-glow-2"></div>

        <div className="footer-content">
          <div className="footer-section footer-brand">
            <div className="footer-brand-top">
              <div className="footer-brand-logo">
                <Ticket size={26} />
              </div>
              <div>
                <h3>TicketEvent</h3>
                <span className="footer-brand-tagline">
                  Nền tảng khám phá sự kiện & đặt vé hiện đại
                </span>
              </div>
            </div>

            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <MapPin size={16} />
                <span>Trụ sở: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="footer-contact-item">
                <Bell size={16} />
                <span>Hỗ trợ khách hàng: 08:00 - 22:00 mỗi ngày</span>
              </div>
              <div className="footer-contact-item">
                <Ticket size={16} />
                <span>Đặt vé nhanh - xác nhận tức thì - quản lý vé dễ dàng</span>
              </div>
            </div>

            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Khám phá</h4>
            <a href="#">Sự kiện nổi bật</a>
            <a href="#">Sự kiện sắp diễn ra</a>
            <a href="#">Danh mục sự kiện</a>
            <a href="#">Ưu đãi & mã giảm giá</a>
            <a href="#">Sự kiện gần bạn</a>
          </div>

          <div className="footer-section">
            <h4>Dành cho người dùng</h4>
            <a href="#">Tài khoản của tôi</a>
            <a href="#">Vé của tôi</a>
            <a href="#">Lịch sử đơn hàng</a>
            <a href="#">Sự kiện yêu thích</a>
            <a href="#">Thông báo hệ thống</a>
          </div>

          <div className="footer-section">
            <h4>Hỗ trợ & chính sách</h4>
            <a href="#">Trung tâm hỗ trợ</a>
            <a href="#">Câu hỏi thường gặp</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Chính sách hoàn vé</a>
          </div>

          <div className="footer-section footer-subscribe">
            <h4>Nhận thông tin mới</h4>
            <p className="footer-subscribe-text">
              Đăng ký email để nhận thông báo về sự kiện hot, chương trình giảm giá
              và ưu đãi độc quyền mỗi tuần.
            </p>

            <form className="footer-subscribe-form">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="footer-input"
              />
              <button type="submit" className="footer-subscribe-btn">
                Đăng ký
              </button>
            </form>
          </div>
        </div>

      </footer>
    </div>
  );
};

export default AttendeeHome;
