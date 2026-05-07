import { useState, useEffect } from 'react';
import {
  Bell, Mail, Smartphone, MessageSquare,
  CheckCheck, Eye, X, Clock, BellOff, Check
} from 'lucide-react';
import notificationService, { type Notification } from '../../services/notification.service';
import './MyNotifications.css';

/* ─── Helpers ──────────────────────────────────────────── */
function fmtDateTime(s: string) {
  const d = new Date(s);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60_000) return 'Vừa xong';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} phút trước`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} giờ trước`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} ngày trước`;

  return d.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getTypeClass(loaiThongBao: string) {
  const l = loaiThongBao?.toUpperCase();
  if (l === 'EMAIL') return 'email';
  if (l === 'SMS')   return 'sms';
  return 'app';
}

function TypeIcon({ loai, size = 20 }: { loai: string; size?: number }) {
  const l = loai?.toUpperCase();
  if (l === 'EMAIL') return <Mail size={size} />;
  if (l === 'SMS')   return <Smartphone size={size} />;
  return <Bell size={size} />;
}

/* ─── Skeleton ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="mn-skel-card">
      <div className="mn-skel-line lg" />
      <div className="mn-skel-line" />
      <div className="mn-skel-line sm" />
    </div>
  );
}

/* ─── Detail Modal ─────────────────────────────────────── */
interface ModalProps {
  notif: Notification;
  onClose: () => void;
  onMarkRead: (id: number) => void;
}

function NotifModal({ notif, onClose, onMarkRead }: ModalProps) {
  const tc = getTypeClass(notif.loaiThongBao ?? '');
  return (
    <div className="mn-overlay" onClick={onClose}>
      <div className="mn-modal" onClick={e => e.stopPropagation()}>
        {/* Top bar */}
        <div className="mn-modal-top">
          <h2>Chi tiết thông báo</h2>
          <button className="mn-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="mn-modal-body">
          {/* Header with icon */}
          <div className={`mn-modal-header ${tc}`}>
            <div className={`mn-modal-icon ${tc}`}>
              <TypeIcon loai={notif.loaiThongBao ?? ''} size={24} />
            </div>
            <div>
              <p className="mn-modal-title">{notif.tieuDe}</p>
              <span className={`mn-modal-type-badge ${tc}`}>
                <TypeIcon loai={notif.loaiThongBao ?? ''} size={11} />
                {(notif.loaiThongBao ?? 'APP').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Meta info */}
          <div className="mn-modal-meta">
            <div className="mn-modal-meta-row">
              <span className="mn-modal-meta-key">Mã thông báo</span>
              <span className="mn-modal-meta-val">#{notif.thongBaoID}</span>
            </div>
            <div className="mn-modal-meta-row">
              <span className="mn-modal-meta-key">Thời gian tạo</span>
              <span className="mn-modal-meta-val">{fmtDateTime(notif.thoiGianTao)}</span>
            </div>
            {notif.thoiGianGui && (
              <div className="mn-modal-meta-row">
                <span className="mn-modal-meta-key">Thời gian gửi</span>
                <span className="mn-modal-meta-val">{fmtDateTime(notif.thoiGianGui)}</span>
              </div>
            )}
            <div className="mn-modal-meta-row">
              <span className="mn-modal-meta-key">Trạng thái</span>
              <span className="mn-modal-meta-val" style={{ color: notif.trangThai === 0 ? '#6366f1' : '#10b981' }}>
                {notif.trangThai === 0 ? '🔵 Chưa đọc' : '✅ Đã đọc'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="mn-modal-content-box">
            <p className="mn-modal-content-label">Nội dung thông báo</p>
            <p className="mn-modal-content-text">{notif.noiDung}</p>
          </div>

          {/* Action */}
          {notif.trangThai === 0 ? (
            <button
              className="mn-modal-action"
              onClick={() => { onMarkRead(notif.thongBaoID); onClose(); }}
            >
              <Check size={18} /> Đánh dấu đã đọc & Đóng
            </button>
          ) : (
            <button className="mn-modal-action" onClick={onClose}>
              <X size={18} /> Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────── */
const FILTERS = [
  { key: 'all' as const,   label: 'Tất cả',  icon: <Bell size={14} /> },
  { key: 'unread' as const, label: 'Chưa đọc', icon: <MessageSquare size={14} /> },
  { key: 'read' as const,   label: 'Đã đọc',   icon: <CheckCheck size={14} /> },
];

export default function MyNotifications() {
  const [notifs, setNotifs]       = useState<Notification[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<'all' | 'unread' | 'read'>('all');
  const [selected, setSelected]   = useState<Notification | null>(null);
  const [marking, setMarking]     = useState(false);

  useEffect(() => { loadNotifs(); }, []);

  const loadNotifs = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    const ok = await notificationService.markAsRead(id);
    if (ok) {
      setNotifs(prev =>
        prev.map(n => n.thongBaoID === id ? { ...n, trangThai: 1 } : n)
      );
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifs.filter(n => n.trangThai === 0);
    if (!unread.length) return;
    setMarking(true);
    await Promise.all(unread.map(n => notificationService.markAsRead(n.thongBaoID)));
    setNotifs(prev => prev.map(n => ({ ...n, trangThai: 1 })));
    setMarking(false);
  };

  const openDetail = (notif: Notification) => {
    setSelected(notif);
    if (notif.trangThai === 0) handleMarkRead(notif.thongBaoID);
  };

  /* Filtered list */
  const filtered = notifs.filter(n => {
    if (filter === 'unread') return n.trangThai === 0;
    if (filter === 'read')   return n.trangThai !== 0;
    return true;
  });

  const unreadCount = notifs.filter(n => n.trangThai === 0).length;
  const readCount   = notifs.filter(n => n.trangThai !== 0).length;

  return (
    <div className="mn-root">
      {/* ── HERO ── */}
      <div className="mn-hero">
        <div className="mn-hero-bg">
          <div className="mn-orb mn-orb-1" />
          <div className="mn-orb mn-orb-2" />
          <div className="mn-orb mn-orb-3" />
          <div className="mn-hero-grid" />
        </div>
        <div className="mn-hero-content">
          <div className="mn-hero-icon-wrap">
            <div className="mn-hero-pulse" />
            <Bell size={38} />
          </div>
          <h1 className="mn-hero-title">
            Thông báo <span className="mn-hero-accent">của tôi</span>
          </h1>
          <p className="mn-hero-sub">
            Nhận thông tin mới nhất từ ban tổ chức về sự kiện bạn tham dự
          </p>

          {/* Stats */}
          <div className="mn-stats-bar">
            <div className="mn-stat">
              <div className="mn-stat-icon"><Bell size={20} /></div>
              <div>
                <p className="mn-stat-val">{notifs.length}</p>
                <p className="mn-stat-lbl">Tổng thông báo</p>
              </div>
            </div>
            <div className="mn-stat-sep" />
            <div className="mn-stat">
              <div className="mn-stat-icon"><MessageSquare size={20} /></div>
              <div>
                <p className="mn-stat-val">{unreadCount}</p>
                <p className="mn-stat-lbl">Chưa đọc</p>
              </div>
            </div>
            <div className="mn-stat-sep" />
            <div className="mn-stat">
              <div className="mn-stat-icon"><CheckCheck size={20} /></div>
              <div>
                <p className="mn-stat-val">{readCount}</p>
                <p className="mn-stat-lbl">Đã đọc</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="mn-content">
        {/* Toolbar */}
        <div className="mn-toolbar">
          <div className="mn-filters">
            {FILTERS.map(f => {
              const count = f.key === 'all' ? notifs.length
                : f.key === 'unread' ? unreadCount : readCount;
              return (
                <button
                  key={f.key}
                  className={`mn-filter-btn ${filter === f.key ? 'active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.icon}
                  {f.label}
                  <span className="mn-filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          {unreadCount > 0 && (
            <button
              className="mn-mark-all-btn"
              onClick={handleMarkAllRead}
              disabled={marking}
            >
              <CheckCheck size={15} />
              {marking ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
            </button>
          )}
        </div>

        {/* Body */}
        {loading ? (
          <div className="mn-skeleton">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mn-empty">
            <div className="mn-empty-icon"><BellOff size={40} /></div>
            <h3>Không có thông báo nào</h3>
            <p>
              {filter === 'unread'
                ? 'Bạn đã đọc tất cả thông báo rồi!'
                : 'Chưa có thông báo nào được gửi đến bạn.'}
            </p>
          </div>
        ) : (
          <div className="mn-list">
            {filtered.map((notif, idx) => {
              const tc = getTypeClass(notif.loaiThongBao ?? '');
              const isUnread = notif.trangThai === 0;
              return (
                <div
                  key={notif.thongBaoID}
                  className={`mn-card ${isUnread ? 'unread' : ''}`}
                  style={{ animationDelay: `${idx * 0.06}s`, position: 'relative' }}
                  onClick={() => openDetail(notif)}
                >
                  <div className={`mn-card-stripe ${tc}`} />
                  <div className="mn-card-inner">
                    {/* Icon */}
                    <div className={`mn-card-icon ${tc}`}>
                      <TypeIcon loai={notif.loaiThongBao ?? ''} size={22} />
                    </div>

                    {/* Body */}
                    <div className="mn-card-body">
                      <div className="mn-card-head">
                        <p className="mn-card-title">{notif.tieuDe}</p>
                        <div className="mn-card-meta">
                          {isUnread && <span className="mn-unread-dot" />}
                          <span className="mn-card-time">
                            <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />
                            {fmtDateTime(notif.thoiGianTao)}
                          </span>
                        </div>
                      </div>

                      <p className="mn-card-content">{notif.noiDung}</p>

                      <div className="mn-card-footer">
                        <span className={`mn-type-badge ${tc}`}>
                          <TypeIcon loai={notif.loaiThongBao ?? ''} size={11} />
                          {(notif.loaiThongBao ?? 'APP').toUpperCase()}
                        </span>

                        {isUnread ? (
                          <span className="mn-type-badge app">Mới</span>
                        ) : (
                          <span className="mn-read-badge">
                            <Check size={11} /> Đã đọc
                          </span>
                        )}

                        <button
                          className="mn-mark-btn"
                          onClick={e => { e.stopPropagation(); openDetail(notif); }}
                        >
                          <Eye size={13} /> Xem
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {selected && (
        <NotifModal
          notif={selected}
          onClose={() => setSelected(null)}
          onMarkRead={handleMarkRead}
        />
      )}
    </div>
  );
}
