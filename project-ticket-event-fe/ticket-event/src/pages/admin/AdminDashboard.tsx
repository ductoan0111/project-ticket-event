import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Users, DollarSign, Clock, Check, X,
  ChevronRight, Tag, MapPin, TrendingUp, Activity
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { AdminStats, OrgEvent } from '../../services/admin.service';
import './AdminDashboard.css';

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  0: { label: 'Chờ duyệt', cls: 'badge-pending' },
  1: { label: 'Đang mở bán', cls: 'badge-active' },
  2: { label: 'Đã kết thúc', cls: 'badge-ended' },
  3: { label: 'Đã huỷ', cls: 'badge-ended' },
  5: { label: 'Bị từ chối', cls: 'badge-rejected' },
};

const QUICK_ACTIONS = [
  { to: '/admin/categories', icon: Tag,     title: 'Quản lý danh mục',  desc: 'Thêm, sửa, xóa danh mục',    cls: 'qa-purple' },
  { to: '/admin/locations',  icon: MapPin,  title: 'Quản lý địa điểm',  desc: 'Cập nhật địa điểm tổ chức',  cls: 'qa-blue'   },
  { to: '/admin/users',      icon: Users,   title: 'Người dùng',        desc: 'Xem & quản lý tài khoản',     cls: 'qa-green'  },
  { to: '/admin/events',     icon: Calendar,title: 'Duyệt sự kiện',     desc: 'Xem các sự kiện chờ duyệt',   cls: 'qa-pink'   },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingEvents, setPendingEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [statsData, eventsData] = await Promise.all([
        adminService.getStats().catch(() => ({
          tongSuKien: 0, suKienChoDuyet: 0, tongNguoiDung: 0, tongDoanhThu: 0,
        })),
        adminService.getPendingEvents().catch(() => []),
      ]);
      setStats(statsData);
      setPendingEvents(eventsData.slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Duyệt sự kiện này?')) return;
    try {
      setProcessingId(id);
      await adminService.approveEvent(id);
      await loadAll();
    } catch { alert('Không thể duyệt sự kiện'); }
    finally { setProcessingId(null); }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Từ chối sự kiện này?')) return;
    try {
      setProcessingId(id);
      await adminService.rejectEvent(id);
      await loadAll();
    } catch { alert('Không thể từ chối sự kiện'); }
    finally { setProcessingId(null); }
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Greeting */}
      <div className="admin-greeting">
        <span className="admin-greeting-emoji">👋</span>
        <span className="admin-greeting-text">
          <strong>{greeting}!</strong> Hệ thống đang hoạt động bình thường.
          {(stats?.suKienChoDuyet ?? 0) > 0 && (
            <> Có <strong style={{ color: '#fbbf24' }}>{stats!.suKienChoDuyet} sự kiện</strong> chờ duyệt.</>
          )}
        </span>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card card-events">
          <div className="admin-stat-icon calendar">
            <Calendar size={22} />
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-label">Tổng sự kiện</div>
            <div className="admin-stat-value">{stats?.tongSuKien ?? 0}</div>
            <div className="admin-stat-trend neutral">
              <Activity size={12} /> Tất cả sự kiện
            </div>
          </div>
        </div>

        <div className="admin-stat-card card-pending">
          <div className="admin-stat-icon pending">
            <Clock size={22} />
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-label">Chờ duyệt</div>
            <div className="admin-stat-value">{stats?.suKienChoDuyet ?? 0}</div>
            <div className="admin-stat-trend" style={{ color: (stats?.suKienChoDuyet ?? 0) > 0 ? '#fbbf24' : '#8892aa' }}>
              <Clock size={12} /> Cần xem xét
            </div>
          </div>
        </div>

        <div className="admin-stat-card card-users">
          <div className="admin-stat-icon users">
            <Users size={22} />
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-label">Người dùng</div>
            <div className="admin-stat-value">{stats?.tongNguoiDung ?? 0}</div>
            <div className="admin-stat-trend">
              <TrendingUp size={12} /> Tài khoản đã đăng ký
            </div>
          </div>
        </div>

        <div className="admin-stat-card card-revenue">
          <div className="admin-stat-icon revenue">
            <DollarSign size={22} />
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-label">Doanh thu</div>
            <div className="admin-stat-value" style={{ fontSize: (stats?.tongDoanhThu ?? 0) > 9999999 ? '1.35rem' : undefined }}>
              {((stats?.tongDoanhThu ?? 0) / 1_000_000).toFixed(1)}M
            </div>
            <div className="admin-stat-trend">
              <TrendingUp size={12} /> {(stats?.tongDoanhThu ?? 0).toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="admin-main-grid">
        {/* Pending events */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <Clock size={16} />
              Sự kiện chờ duyệt
              {pendingEvents.length > 0 && (
                <span className="admin-badge badge-pending">{pendingEvents.length}</span>
              )}
            </div>
            <Link to="/admin/events" className="admin-card-link">
              Xem tất cả <ChevronRight size={12} />
            </Link>
          </div>
          <div className="admin-card-body">
            {pendingEvents.length === 0 ? (
              <div className="admin-table-empty">
                <Clock size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                <p>Không có sự kiện chờ duyệt</p>
              </div>
            ) : (
              <table className="admin-pending-table">
                <thead>
                  <tr>
                    <th>Sự kiện</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEvents.map((ev) => (
                    <tr key={ev.suKienID}>
                      <td>
                        <div className="event-name-cell">
                          <div className="event-avatar">
                            {ev.anhBiaUrl
                              ? <img src={ev.anhBiaUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} />
                              : <Calendar size={15} />
                            }
                          </div>
                          <div>
                            <div className="event-name">{ev.tenSuKien}</div>
                            <div className="event-date">
                              {new Date(ev.thoiGianBatDau).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge ${STATUS_MAP[ev.trangThai]?.cls || ''}`}>
                          {STATUS_MAP[ev.trangThai]?.label}
                        </span>
                      </td>
                      <td>
                        {ev.trangThai === 0 && (
                          <>
                            <button
                              className={`admin-action-btn btn-approve ${processingId === ev.suKienID ? 'btn-disabled' : ''}`}
                              onClick={() => handleApprove(ev.suKienID)}
                              disabled={processingId === ev.suKienID}
                            >
                              <Check size={12} /> Duyệt
                            </button>
                            <button
                              className={`admin-action-btn btn-reject ${processingId === ev.suKienID ? 'btn-disabled' : ''}`}
                              onClick={() => handleReject(ev.suKienID)}
                              disabled={processingId === ev.suKienID}
                            >
                              <X size={12} /> Từ chối
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <Activity size={16} />
              Truy cập nhanh
            </div>
          </div>
          <div className="admin-card-body admin-quick-actions">
            {QUICK_ACTIONS.map((qa) => (
              <Link key={qa.to} to={qa.to} className="admin-quick-action">
                <div className={`admin-quick-action-icon ${qa.cls}`}>
                  <qa.icon size={18} />
                </div>
                <div className="admin-quick-action-info">
                  <div className="admin-quick-action-title">{qa.title}</div>
                  <div className="admin-quick-action-desc">{qa.desc}</div>
                </div>
                <ChevronRight size={15} className="admin-quick-action-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
