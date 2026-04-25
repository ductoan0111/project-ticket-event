import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizerService } from '../../services/organizer.service';
import type { OrgEvent } from '../../services/organizer.service';
import './OrganizerDashboard.css';

const STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Chờ duyệt', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  1: { label: 'Đã duyệt', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  2: { label: 'Đang diễn ra', color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
  3: { label: 'Kết thúc', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  4: { label: 'Đã hủy', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching organizer events...');
      const data = await organizerService.getMyEvents();
      console.log('Events loaded:', data);
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối backend.');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: events.length,
    pending: events.filter(e => e.trangThai === 0).length,
    approved: events.filter(e => e.trangThai === 1).length,
    ongoing: events.filter(e => e.trangThai === 2).length,
    finished: events.filter(e => e.trangThai === 3).length,
  };

  const recentEvents = [...events]
    .sort((a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime())
    .slice(0, 5);

  const formatDate = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">Tổng quan các sự kiện của bạn</p>
        </div>
        <button className="dash-create-btn" onClick={() => navigate('/organizer/events')}>
          <span>+</span> Tạo sự kiện mới
        </button>
      </div>

      {loading && (
        <div className="dash-loading">
          <div className="dash-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="dash-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="dash-stats">
            <div className="stat-card total">
              <div className="stat-icon">🎪</div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Tổng sự kiện</span>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <span className="stat-value">{stats.pending}</span>
                <span className="stat-label">Chờ duyệt</span>
              </div>
            </div>
            <div className="stat-card approved">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-value">{stats.approved}</span>
                <span className="stat-label">Đã duyệt</span>
              </div>
            </div>
            <div className="stat-card ongoing">
              <div className="stat-icon">🔴</div>
              <div className="stat-info">
                <span className="stat-value">{stats.ongoing}</span>
                <span className="stat-label">Đang diễn ra</span>
              </div>
            </div>
            <div className="stat-card finished">
              <div className="stat-icon">🏁</div>
              <div className="stat-info">
                <span className="stat-value">{stats.finished}</span>
                <span className="stat-label">Kết thúc</span>
              </div>
            </div>
          </div>

          <div className="dash-card recent-events">
            <div className="dash-card-header">
              <h3>Sự kiện gần đây</h3>
              <button className="view-all-btn" onClick={() => navigate('/organizer/events')}>
                Xem tất cả →
              </button>
            </div>
            {recentEvents.length === 0 ? (
              <div className="empty-state">
                <span>🎪</span>
                <p>Chưa có sự kiện nào</p>
                <button className="create-first-btn" onClick={() => navigate('/organizer/events')}>
                  Tạo sự kiện đầu tiên
                </button>
              </div>
            ) : (
              <div className="event-list">
                {recentEvents.map(ev => {
                  const s = STATUS_MAP[ev.trangThai] ?? STATUS_MAP[0];
                  return (
                    <div
                      key={ev.suKienID}
                      className="event-item"
                      onClick={() => navigate(`/organizer/events/${ev.suKienID}`)}
                    >
                      <div className="event-item-img">
                        {ev.anhBiaUrl
                          ? <img src={ev.anhBiaUrl} alt={ev.tenSuKien} />
                          : <span>🎪</span>
                        }
                      </div>
                      <div className="event-item-info">
                        <p className="event-item-name">{ev.tenSuKien}</p>
                        <p className="event-item-date">
                          📅 {formatDate(ev.thoiGianBatDau)}
                        </p>
                      </div>
                      <span
                        className="event-status-badge"
                        style={{ color: s.color, background: s.bg }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
