import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Ticket, LogOut, User, Mail, Phone, Shield, Calendar, TrendingUp } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect attendees to their home page
  useEffect(() => {
    if (isAuthenticated && user?.vaiTroId === 3) {
      navigate('/attendee');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="home-container">
        <div className="home-background">
          <div className="floating-icon icon-1">🎫</div>
          <div className="floating-icon icon-2">🎟️</div>
          <div className="floating-icon icon-3">🎪</div>
          <div className="floating-icon icon-4">🎭</div>
          <div className="floating-icon icon-5">🎨</div>
          <div className="floating-icon icon-6">🎵</div>
        </div>

        <div className="welcome-card">
          <div className="welcome-header">
            <div className="welcome-logo">
              <Ticket size={60} />
            </div>
            <h1>Hệ thống Quản lý Sự kiện & Bán vé</h1>
            <p className="welcome-description">
              Nền tảng quản lý sự kiện chuyên nghiệp, giúp bạn tổ chức và bán vé trực tuyến dễ dàng
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <Calendar className="feature-icon" />
              <h3>Quản lý Sự kiện</h3>
              <p>Tạo và quản lý sự kiện một cách dễ dàng</p>
            </div>
            <div className="feature-card">
              <Ticket className="feature-icon" />
              <h3>Bán vé Trực tuyến</h3>
              <p>Hệ thống bán vé nhanh chóng và an toàn</p>
            </div>
            <div className="feature-card">
              <TrendingUp className="feature-icon" />
              <h3>Thống kê Chi tiết</h3>
              <p>Theo dõi doanh thu và hiệu suất</p>
            </div>
          </div>

          <div className="button-group">
            <button onClick={() => navigate('/login')} className="btn-primary">
              <User size={20} />
              Đăng nhập
            </button>
            <button onClick={() => navigate('/register')} className="btn-secondary">
              <Ticket size={20} />
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-background">
        <div className="floating-icon icon-1">🎫</div>
        <div className="floating-icon icon-2">🎟️</div>
        <div className="floating-icon icon-3">🎪</div>
        <div className="floating-icon icon-4">🎭</div>
      </div>

      <div className="user-card">
        <div className="user-header">
          <div className="user-avatar">
            <User size={40} />
          </div>
          <h1>Xin chào, {user?.hoTen}!</h1>
          <p className="user-welcome">Chào mừng bạn quay trở lại</p>
        </div>

        <div className="user-info-grid">
          <div className="info-item">
            <div className="info-icon">
              <User size={20} />
            </div>
            <div className="info-content">
              <span className="info-label">Tên đăng nhập</span>
              <span className="info-value">{user?.tenDangNhap}</span>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <Mail size={20} />
            </div>
            <div className="info-content">
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email}</span>
            </div>
          </div>

          {user?.soDienThoai && (
            <div className="info-item">
              <div className="info-icon">
                <Phone size={20} />
              </div>
              <div className="info-content">
                <span className="info-label">Số điện thoại</span>
                <span className="info-value">{user.soDienThoai}</span>
              </div>
            </div>
          )}

          {user?.vaiTro && (
            <div className="info-item">
              <div className="info-icon">
                <Shield size={20} />
              </div>
              <div className="info-content">
                <span className="info-label">Vai trò</span>
                <span className="info-value">{user.vaiTro}</span>
              </div>
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h3>Thao tác nhanh</h3>
          <div className="actions-grid">
            <button className="action-btn">
              <Calendar size={24} />
              <span>Sự kiện của tôi</span>
            </button>
            <button className="action-btn">
              <Ticket size={24} />
              <span>Quản lý vé</span>
            </button>
            <button className="action-btn">
              <TrendingUp size={24} />
              <span>Thống kê</span>
            </button>
          </div>
        </div>

        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Home;
