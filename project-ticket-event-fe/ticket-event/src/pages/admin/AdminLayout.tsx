import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield, LayoutDashboard, Calendar, Users, LogOut, ChevronDown,
  Tag, MapPin, ChevronLeft, ChevronRight, Bell, Settings
} from 'lucide-react';
import './AdminLayout.css';

const NAV_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/events', icon: Calendar, label: 'Sự kiện' },
  { path: '/admin/categories', icon: Tag, label: 'Danh mục' },
  { path: '/admin/locations', icon: MapPin, label: 'Địa điểm' },
  { path: '/admin/users', icon: Users, label: 'Người dùng' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.hoTen
    ? user.hoTen.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
    : 'AD';

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Header */}
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <Shield className="admin-logo-icon" size={26} />
            {sidebarOpen && <span className="admin-logo-text">AdminPanel</span>}
          </div>
          <button
            className="admin-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Thu gọn' : 'Mở rộng'}
          >
            {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-nav">
          {sidebarOpen && (
            <div className="admin-nav-section">
              <span className="admin-nav-section-label">Menu chính</span>
            </div>
          )}

          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon size={19} className="admin-nav-icon" />
              {sidebarOpen && <span className="admin-nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout at bottom */}
        {sidebarOpen && (
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-user-avatar">{initials}</div>
            <div className="admin-sidebar-user-info">
              <div className="admin-sidebar-user-name">{user?.hoTen || 'Admin'}</div>
              <div className="admin-sidebar-user-role">Quản trị viên</div>
            </div>
          </div>
        )}

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item logout-btn" onClick={handleLogout} title="Đăng xuất">
            <LogOut size={19} className="admin-nav-icon" />
            {sidebarOpen && <span className="admin-nav-label">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-header">
          <div className="admin-header-left">
            <h2 className="admin-header-title">Quản trị hệ thống</h2>
          </div>
          <div className="admin-header-right">
            <button className="admin-header-btn" title="Thông báo">
              <Bell size={17} />
            </button>
            <button className="admin-header-btn" title="Cài đặt">
              <Settings size={17} />
            </button>

            <div className="admin-user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="admin-user-avatar">{initials}</div>
              <div className="admin-user-info">
                <span className="admin-user-name">{user?.hoTen || 'Admin'}</span>
                <span className="admin-user-role">Quản trị viên</span>
              </div>
              <ChevronDown size={15} className={`admin-dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />

              {dropdownOpen && (
                <div className="admin-dropdown" onClick={e => e.stopPropagation()}>
                  <button className="admin-dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={15} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
