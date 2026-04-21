import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizerService } from '../services/organizer.service';
import type { OrgEvent, OrgThongBao, GuiThongBaoRequest } from '../services/organizer.service';
import './OrganizerNotifications.css';

const LOAI_MAP: Record<string, { label: string; icon: string; color: string }> = {
  EMAIL: { label: 'Email', icon: '📧', color: '#6366f1' },
  SMS: { label: 'SMS', icon: '💬', color: '#10b981' },
  APP: { label: 'App', icon: '🔔', color: '#f59e0b' },
};

const TRANG_THAI_TB = {
  0: { label: 'Chờ gửi', color: '#f59e0b' },
  1: { label: 'Đã gửi', color: '#10b981' },
  2: { label: 'Thất bại', color: '#ef4444' },
};

const EMPTY_FORM: GuiThongBaoRequest = {
  suKienID: 0,
  tieuDe: '',
  noiDung: '',
  loaiThongBao: 'APP',
  nguoiDungIDs: [],
  ghiChu: '',
};

export default function OrganizerNotifications() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number>(0);
  const [notifications, setNotifications] = useState<OrgThongBao[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GuiThongBaoRequest>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [nguoiDungInput, setNguoiDungInput] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId > 0) {
      loadNotifications();
      setForm(prev => ({ ...prev, suKienID: selectedEventId }));
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const data = await organizerService.getMyEvents();
      setEvents(data);
      if (data.length > 0) setSelectedEventId(data[0].suKienID);
    } catch { /* silent */ }
  };

  const loadNotifications = async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      const data = await organizerService.getThongBaoBySuKien(selectedEventId);
      setNotifications(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitResult(null);

    if (!form.tieuDe.trim()) {
      setSubmitResult({ success: false, message: 'Vui lòng nhập tiêu đề.' });
      return;
    }
    if (!form.noiDung.trim()) {
      setSubmitResult({ success: false, message: 'Vui lòng nhập nội dung.' });
      return;
    }

    // Parse nguoiDungIDs
    let ids: number[] = [];
    if (nguoiDungInput.trim()) {
      ids = nguoiDungInput.split(',').map(s => Number(s.trim())).filter(n => n > 0);
    }

    try {
      setSubmitting(true);
      const payload: GuiThongBaoRequest = {
        ...form,
        suKienID: selectedEventId,
        nguoiDungIDs: ids.length > 0 ? ids : [],
      };
      const res = await organizerService.guiThongBao(payload);
      setSubmitResult({
        success: true,
        message: `${res.message} (Đã gửi: ${res.soLuongGui})`
      });
      setForm({ ...EMPTY_FORM, suKienID: selectedEventId });
      setNguoiDungInput('');
      await loadNotifications();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra khi gửi thông báo.';
      setSubmitResult({ success: false, message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (s?: string) => {
    if (!s) return '—';
    try {
      return new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return s; }
  };

  return (
    <div className="org-notifications">
      <div className="notif-header">
        <div>
          <h1 className="notif-title">🔔 Thông báo</h1>
          <p className="notif-subtitle">Gửi thông báo đến người tham dự sự kiện</p>
        </div>
        <div className="notif-header-actions">
          <button
            className="notif-send-btn"
            onClick={() => { setShowForm(true); setSubmitResult(null); }}
          >
            + Gửi thông báo mới
          </button>
          <button className="notif-back-btn" onClick={() => navigate('/organizer')}>
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Event selector */}
      <div className="notif-event-selector">
        <label>Sự kiện:</label>
        <select
          value={selectedEventId}
          onChange={e => setSelectedEventId(Number(e.target.value))}
          className="notif-select"
        >
          <option value={0}>-- Chọn sự kiện --</option>
          {events.map(ev => (
            <option key={ev.suKienID} value={ev.suKienID}>{ev.tenSuKien}</option>
          ))}
        </select>
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="notif-loading">
          <div className="notif-spinner" />
          <p>Đang tải thông báo...</p>
        </div>
      ) : selectedEventId === 0 ? (
        <div className="notif-placeholder">
          <span>🔔</span>
          <p>Chọn sự kiện để xem lịch sử thông báo</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="notif-empty">
          <span>📭</span>
          <p>Chưa có thông báo nào cho sự kiện này</p>
          <button className="notif-send-btn" onClick={() => setShowForm(true)}>
            Gửi thông báo đầu tiên
          </button>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map(n => {
            const loai = LOAI_MAP[n.loaiThongBao] ?? LOAI_MAP.APP;
            const tt = TRANG_THAI_TB[n.trangThai as keyof typeof TRANG_THAI_TB] ?? TRANG_THAI_TB[0];
            return (
              <div key={n.thongBaoID} className="notif-card">
                <div className="notif-card-icon" style={{ color: loai.color }}>
                  {loai.icon}
                </div>
                <div className="notif-card-body">
                  <div className="notif-card-header">
                    <h3>{n.tieuDe}</h3>
                    <div className="notif-card-badges">
                      <span className="notif-badge loai" style={{ color: loai.color }}>{loai.label}</span>
                      <span className="notif-badge tt" style={{ color: tt.color }}>{tt.label}</span>
                    </div>
                  </div>
                  <p className="notif-card-content">{n.noiDung}</p>
                  <div className="notif-card-footer">
                    <span>👤 Người nhận #{n.nguoiDungID}</span>
                    <span>🕐 {formatDate(n.ngayGui)}</span>
                    {n.ghiChu && <span>📝 {n.ghiChu}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Send Notification Modal */}
      {showForm && (
        <div className="notif-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="notif-modal" onClick={e => e.stopPropagation()}>
            <div className="notif-modal-header">
              <h2>🔔 Gửi thông báo mới</h2>
              <button className="notif-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="notif-form">
              {submitResult && (
                <div className={`notif-result ${submitResult.success ? 'success' : 'error'}`}>
                  {submitResult.success ? '✅' : '⚠️'} {submitResult.message}
                </div>
              )}

              <div className="notif-form-group">
                <label>Loại thông báo</label>
                <div className="notif-type-selector">
                  {(['APP', 'EMAIL', 'SMS'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`notif-type-btn ${form.loaiThongBao === t ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, loaiThongBao: t })}
                      style={form.loaiThongBao === t ? { borderColor: LOAI_MAP[t].color, color: LOAI_MAP[t].color } : {}}
                    >
                      {LOAI_MAP[t].icon} {LOAI_MAP[t].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="notif-form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={form.tieuDe}
                  onChange={e => setForm({ ...form, tieuDe: e.target.value })}
                  placeholder="VD: Nhắc nhở sự kiện sắp diễn ra..."
                  required
                  className="notif-input"
                />
              </div>

              <div className="notif-form-group">
                <label>Nội dung *</label>
                <textarea
                  value={form.noiDung}
                  onChange={e => setForm({ ...form, noiDung: e.target.value })}
                  placeholder="Nhập nội dung thông báo..."
                  rows={4}
                  required
                  className="notif-textarea"
                />
              </div>

              <div className="notif-form-group">
                <label>
                  Người nhận cụ thể{' '}
                  <small>(ID cách nhau bằng dấu phẩy, để trống = gửi tất cả)</small>
                </label>
                <input
                  type="text"
                  value={nguoiDungInput}
                  onChange={e => setNguoiDungInput(e.target.value)}
                  placeholder="VD: 1, 2, 3 (để trống = gửi cho tất cả người mua vé)"
                  className="notif-input"
                />
              </div>

              <div className="notif-form-group">
                <label>Ghi chú (tùy chọn)</label>
                <input
                  type="text"
                  value={form.ghiChu ?? ''}
                  onChange={e => setForm({ ...form, ghiChu: e.target.value })}
                  placeholder="Ghi chú nội bộ..."
                  className="notif-input"
                />
              </div>

              <div className="notif-form-info">
                ℹ️ Nếu không chọn người nhận cụ thể, thông báo sẽ được gửi đến
                <strong> tất cả người đã mua vé</strong> của sự kiện này.
              </div>

              <div className="notif-form-actions">
                <button type="button" className="notif-btn-cancel" onClick={() => setShowForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="notif-btn-submit" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : `${LOAI_MAP[form.loaiThongBao].icon} Gửi thông báo`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
