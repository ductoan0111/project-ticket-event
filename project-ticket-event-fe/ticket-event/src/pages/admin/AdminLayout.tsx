import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, LayoutDashboard, Calendar, Users, LogOut, ChevronDown, Tag, MapPin } from 'lucide-react';
import './AdminLayout.css';

const NAV_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/events', icon: Calendar, label: 'Quản lý sự kiện' },
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

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <Shield className="admin-logo-icon" size={28} />
            {sidebarOpen && <span className="admin-logo-text">Admin </span>}
          </div>
          <button 
            className="admin-sidebar-toggle" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Thu gọn' : 'Mở rộng'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} className="admin-nav-icon" />
              {sidebarOpen && <span className="admin-nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} className="admin-nav-icon" />
            {sidebarOpen && <span className="admin-nav-label">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <h2 className="admin-header-title">Quản trị hệ thống</h2>
          </div>
          <div className="admin-header-right">
            <div className="admin-user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="admin-user-avatar">
                <Shield size={18} />
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">{user?.hoTen || 'Admin'}</span>
                <span className="admin-user-role">Quản trị viên</span>
              </div>
              <ChevronDown size={16} className={`admin-dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />

              {dropdownOpen && (
                <div className="admin-dropdown">
                  <button className="admin-dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
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
