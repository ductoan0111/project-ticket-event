import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizerService } from '../../services/organizer.service';
import type { OrgEvent, CreateEventRequest } from '../../services/organizer.service';
import './OrganizerEvents.css';


const STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Chờ duyệt', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  1: { label: 'Đã duyệt', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  2: { label: 'Đang diễn ra', color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
  3: { label: 'Kết thúc', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  4: { label: 'Đã hủy', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

const EMPTY_FORM: CreateEventRequest = {
  danhMucID: 0,
  diaDiemID: undefined,
  toChucID: 1,
  tenSuKien: '',
  moTa: '',
  thoiGianBatDau: '',
  thoiGianKetThuc: '',
  anhBiaUrl: '',
};

export default function OrganizerEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [categories, setCategories] = useState<{ danhMucID: number; tenDanhMuc: string }[]>([]);
  const [locations, setLocations] = useState<{ diaDiemID: number; tenDiaDiem: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState<OrgEvent | null>(null);
  const [form, setForm] = useState<CreateEventRequest>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [evts, cats, locs] = await Promise.all([
        organizerService.getMyEvents(),
        organizerService.getDanhMuc(),
        organizerService.getDiaDiem(),
      ]);
      setEvents(evts);
      setCategories(cats);
      setLocations(locs);
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const filteredEvents = events.filter(ev => {
    const matchStatus = filterStatus === undefined || ev.trangThai === filterStatus;
    const matchSearch = ev.tenSuKien.toLowerCase().includes(searchText.toLowerCase());
    return matchStatus && matchSearch;
  });

  const openCreate = () => {
    setEditEvent(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (ev: OrgEvent) => {
    setEditEvent(ev);
    setForm({
      danhMucID: ev.danhMucID,
      diaDiemID: ev.diaDiemID,
      toChucID: ev.toChucID,
      tenSuKien: ev.tenSuKien,
      moTa: ev.moTa ?? '',
      thoiGianBatDau: ev.thoiGianBatDau?.slice(0, 16) ?? '',
      thoiGianKetThuc: ev.thoiGianKetThuc?.slice(0, 16) ?? '',
      anhBiaUrl: ev.anhBiaUrl ?? '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditEvent(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.tenSuKien.trim()) return setFormError('Tên sự kiện không được để trống.');
    if (!form.danhMucID) return setFormError('Vui lòng chọn danh mục.');
    if (!form.thoiGianBatDau) return setFormError('Vui lòng chọn thời gian bắt đầu.');
    if (!form.thoiGianKetThuc) return setFormError('Vui lòng chọn thời gian kết thúc.');
    if (new Date(form.thoiGianKetThuc) <= new Date(form.thoiGianBatDau)) {
      return setFormError('Thời gian kết thúc phải sau thời gian bắt đầu.');
    }

    try {
      setSubmitting(true);
      if (editEvent) {
        await organizerService.updateEvent(editEvent.suKienID, {
          ...editEvent,
          ...form,
        });
        showSuccess('Cập nhật sự kiện thành công!');
      } else {
        await organizerService.createEvent(form);
        showSuccess('Tạo sự kiện thành công! Đang chờ Admin duyệt.');
      }
      closeModal();
      await fetchAll();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Có lỗi xảy ra. Vui lòng thử lại.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await organizerService.deleteEvent(deleteId);
      showSuccess('Xóa sự kiện thành công!');
      setDeleteId(null);
      await fetchAll();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Không thể xóa sự kiện.';
      setError(msg);
      setDeleteId(null);
    }
  };

  const formatDate = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getCategoryName = (id: number) =>
    categories.find(c => c.danhMucID === id)?.tenDanhMuc ?? `#${id}`;

  const getLocationName = (id?: number) => {
    if (!id) return '—';
    return locations.find(l => l.diaDiemID === id)?.tenDiaDiem ?? `#${id}`;
  };

  return (
    <div className="org-events">
      <div className="oe-header">
        <div>
          <h1 className="oe-title">Quản lý Sự kiện</h1>
          <p className="oe-subtitle">{filteredEvents.length} sự kiện</p>
        </div>
        <button className="oe-create-btn" onClick={openCreate}>
          + Tạo sự kiện mới
        </button>
      </div>

      {successMsg && <div className="oe-toast success">✅ {successMsg}</div>}
      {error && <div className="oe-toast error">⚠️ {error} <button onClick={() => setError(null)}>✕</button></div>}

      <div className="oe-filters">
          <input
            type="text"
            className="oe-search"
            placeholder="🔍 Tìm sự kiện..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <div className="oe-status-filters">
            <button
              className={`oe-filter-btn ${filterStatus === undefined ? 'active' : ''}`}
              onClick={() => setFilterStatus(undefined)}
            >
              Tất cả
            </button>
            {Object.entries(STATUS_MAP).map(([key, s]) => (
              <button
                key={key}
                className={`oe-filter-btn ${filterStatus === Number(key) ? 'active' : ''}`}
                style={filterStatus === Number(key) ? { borderColor: s.color, color: s.color } : {}}
                onClick={() => setFilterStatus(filterStatus === Number(key) ? undefined : Number(key))}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="oe-loading">
            <div className="oe-spinner" />
            <p>Đang tải...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="oe-empty">
            <span>🎪</span>
            <p>Không có sự kiện nào</p>
            <button className="oe-create-btn" onClick={openCreate}>Tạo sự kiện đầu tiên</button>
          </div>
        ) : (
          <div className="oe-grid">
            {filteredEvents.map(ev => {
              const s = STATUS_MAP[ev.trangThai] ?? STATUS_MAP[0];
              const canEdit = ev.trangThai === 0;
              const canDelete = ev.trangThai !== 2; // Chỉ không cho xóa khi đang diễn ra

              return (
                <div key={ev.suKienID} className="oe-card">
                  <div
                    className="oe-card-img"
                    onClick={() => navigate(`/organizer/events/${ev.suKienID}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {ev.anhBiaUrl ? (
                      <img src={ev.anhBiaUrl} alt={ev.tenSuKien} />
                    ) : (
                      <div className="oe-card-img-placeholder">🎪</div>
                    )}
                    <span className="oe-card-status" style={{ color: s.color, background: s.bg }}>
                      {s.label}
                    </span>
                  </div>
                  <div className="oe-card-body">
                    <h3
                      className="oe-card-title"
                      onClick={() => navigate(`/organizer/events/${ev.suKienID}`)}
                    >
                      {ev.tenSuKien}
                    </h3>
                    <div className="oe-card-meta">
                      <span>📅 {formatDate(ev.thoiGianBatDau)}</span>
                      <span>🏷️ {getCategoryName(ev.danhMucID)}</span>
                      <span>📍 {getLocationName(ev.diaDiemID)}</span>
                    </div>
                    {ev.moTa && (
                      <p className="oe-card-desc">{ev.moTa}</p>
                    )}
                    <div className="oe-card-actions">
                      <button
                        className="oe-btn-detail"
                        onClick={() => navigate(`/organizer/events/${ev.suKienID}`)}
                      >
                        📋 Chi tiết
                      </button>
                      {canEdit && (
                        <button className="oe-btn-edit" onClick={() => openEdit(ev)}>
                          ✏️ Sửa
                        </button>
                      )}
                      {canDelete && (
                        <button className="oe-btn-delete" onClick={() => setDeleteId(ev.suKienID)}>
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CREATE/EDIT MODAL */}
        {showModal && (
        <div className="oe-modal-overlay" onClick={closeModal}>
          <div className="oe-modal" onClick={e => e.stopPropagation()}>
            <div className="oe-modal-header">
              <h2>{editEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}</h2>
              <button className="oe-modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="oe-form">
              {formError && <div className="oe-form-error">⚠️ {formError}</div>}

              <div className="oe-form-group">
                <label>Tên sự kiện *</label>
                <input
                  type="text"
                  value={form.tenSuKien}
                  onChange={e => setForm({ ...form, tenSuKien: e.target.value })}
                  placeholder="Nhập tên sự kiện..."
                  required
                />
              </div>

              <div className="oe-form-row">
                <div className="oe-form-group">
                  <label>Danh mục *</label>
                  <select
                    value={form.danhMucID}
                    onChange={e => setForm({ ...form, danhMucID: Number(e.target.value) })}
                    required
                  >
                    <option value={0}>-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.danhMucID} value={c.danhMucID}>{c.tenDanhMuc}</option>
                    ))}
                  </select>
                </div>

                <div className="oe-form-group">
                  <label>Địa điểm</label>
                  <select
                    value={form.diaDiemID ?? ''}
                    onChange={e => setForm({ ...form, diaDiemID: e.target.value ? Number(e.target.value) : undefined })}
                  >
                    <option value="">-- Chọn địa điểm --</option>
                    {locations.map(l => (
                      <option key={l.diaDiemID} value={l.diaDiemID}>{l.tenDiaDiem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="oe-form-row">
                <div className="oe-form-group">
                  <label>Thời gian bắt đầu *</label>
                  <input
                    type="datetime-local"
                    value={form.thoiGianBatDau}
                    onChange={e => setForm({ ...form, thoiGianBatDau: e.target.value })}
                    required
                  />
                </div>
                <div className="oe-form-group">
                  <label>Thời gian kết thúc *</label>
                  <input
                    type="datetime-local"
                    value={form.thoiGianKetThuc}
                    onChange={e => setForm({ ...form, thoiGianKetThuc: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="oe-form-group">
                <label>URL ảnh bìa</label>
                <input
                  type="url"
                  value={form.anhBiaUrl ?? ''}
                  onChange={e => setForm({ ...form, anhBiaUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="oe-form-group">
                <label>Mô tả</label>
                <textarea
                  value={form.moTa ?? ''}
                  onChange={e => setForm({ ...form, moTa: e.target.value })}
                  placeholder="Mô tả sự kiện..."
                  rows={4}
                />
              </div>

              {!editEvent && (
                <div className="oe-form-note">
                  ℹ️ Sự kiện mới sẽ ở trạng thái <strong>Chờ duyệt</strong>. Admin sẽ xem xét và duyệt.
                </div>
              )}

              <div className="oe-form-actions">
                <button type="button" className="oe-btn-cancel" onClick={closeModal} disabled={submitting}>
                  Hủy
                </button>
                <button type="submit" className="oe-btn-submit" disabled={submitting}>
                  {submitting ? 'Đang xử lý...' : editEvent ? 'Cập nhật' : 'Tạo sự kiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId !== null && (
        <div className="oe-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="oe-confirm" onClick={e => e.stopPropagation()}>
            <div className="oe-confirm-icon">🗑️</div>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa sự kiện này? Hành động này không thể hoàn tác.</p>
            <div className="oe-confirm-actions">
              <button className="oe-btn-cancel" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="oe-btn-delete-confirm" onClick={handleDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
