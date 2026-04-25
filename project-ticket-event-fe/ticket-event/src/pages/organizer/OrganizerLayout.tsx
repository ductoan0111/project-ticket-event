import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './OrganizerLayout.css';


const NAV_ITEMS = [
  { path: '/organizer', icon: '📊', label: 'Dashboard', end: true },
  { path: '/organizer/events', icon: '🎪', label: 'Sự kiện của tôi' },
  { path: '/organizer/orders', icon: '📋', label: 'Đơn hàng' },
  { path: '/organizer/checkin', icon: '✅', label: 'Check-in' },
  { path: '/organizer/reports', icon: '📈', label: 'Báo cáo' },
  { path: '/organizer/notifications', icon: '🔔', label: 'Thông báo' },
];

export default function OrganizerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`org-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="org-sidebar">
        <div className="org-sidebar-header">
          <div className="org-logo">
            <span className="org-logo-icon">🎫</span>
            {sidebarOpen && <span className="org-logo-text">Organizer</span>}
          </div>
          <button className="org-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="org-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `org-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="org-nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="org-nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="org-sidebar-footer">
          <NavLink to="/attendee" className="org-nav-item back-link">
            <span className="org-nav-icon">🏠</span>
            {sidebarOpen && <span className="org-nav-label">Trang người dùng</span>}
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <div className="org-main">
        {/* Header */}
        <header className="org-header">
          <div className="org-header-left">
            <h2 className="org-header-title">Ban Tổ Chức</h2>
          </div>
          <div className="org-header-right">
            <div className="org-user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="org-user-avatar">
                {user?.hoTen?.charAt(0)?.toUpperCase() ?? 'O'}
              </div>
              <div className="org-user-info">
                <span className="org-user-name">{user?.hoTen ?? 'Organizer'}</span>
                <span className="org-user-role">Ban tổ chức</span>
              </div>
              <span className="org-dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>

              {dropdownOpen && (
                <div className="org-dropdown">
                  <NavLink to="/profile" className="org-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    👤 Hồ sơ
                  </NavLink>
                  <button className="org-dropdown-item logout-btn" onClick={handleLogout}>
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="org-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
