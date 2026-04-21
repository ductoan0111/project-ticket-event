import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { organizerService } from '../services/organizer.service';
import type { OrgEvent, OrgLoaiVe, CreateLoaiVeRequest, UpdateLoaiVeRequest } from '../services/organizer.service';
import './OrganizerEventDetail.css';

const STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Chờ duyệt', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  1: { label: 'Đã duyệt', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  2: { label: 'Đang diễn ra', color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
  3: { label: 'Kết thúc', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  4: { label: 'Đã hủy', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

const EMPTY_LOAIVE: CreateLoaiVeRequest = {
  suKienID: 0,
  tenLoaiVe: '',
  moTa: '',
  donGia: 0,
  soLuongToiDa: 100,
  gioiHanMoiKhach: undefined,
  thoiGianMoBan: undefined,
  thoiGianDongBan: undefined,
};

export default function OrganizerEventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const suKienId = Number(id);

  const [event, setEvent] = useState<OrgEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaiVes, setLoaiVes] = useState<OrgLoaiVe[]>([]);
  const [lvLoading, setLvLoading] = useState(false);
  
  // Modal states
  const [showLvModal, setShowLvModal] = useState(false);
  const [editLv, setEditLv] = useState<OrgLoaiVe | null>(null);
  const [lvForm, setLvForm] = useState<CreateLoaiVeRequest>(EMPTY_LOAIVE);
  const [lvSubmitting, setLvSubmitting] = useState(false);
  const [lvFormError, setLvFormError] = useState<string | null>(null);
  const [deleteLvId, setDeleteLvId] = useState<number | null>(null);
  
  // Toast
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!suKienId) return;
    loadEventData();
  }, [suKienId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const ev = await organizerService.getEventById(suKienId);
      setEvent(ev);
      
      if (ev) {
        await loadLoaiVe();
      }
    } catch (error) {
      console.error('Error loading event:', error);
      showErr('Không thể tải thông tin sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const loadLoaiVe = async () => {
    try {
      setLvLoading(true);
      const data = await organizerService.getLoaiVeBySuKien(suKienId);
      setLoaiVes(data);
    } catch (error) {
      console.error('Error loading loai ve:', error);
      showErr('Không thể tải danh sách loại vé');
    } finally {
      setLvLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const showErr = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  const openCreateLv = () => {
    setEditLv(null);
    setLvForm({ ...EMPTY_LOAIVE, suKienID: suKienId });
    setLvFormError(null);
    setShowLvModal(true);
  };

  const openEditLv = (lv: OrgLoaiVe) => {
    setEditLv(lv);
    setLvForm({
      suKienID: suKienId,
      tenLoaiVe: lv.tenLoaiVe,
      moTa: lv.moTa ?? '',
      donGia: lv.donGia,
      soLuongToiDa: lv.soLuongToiDa,
      gioiHanMoiKhach: lv.gioiHanMoiKhach,
      thoiGianMoBan: lv.thoiGianMoBan?.slice(0, 16),
      thoiGianDongBan: lv.thoiGianDongBan?.slice(0, 16),
    });
    setLvFormError(null);
    setShowLvModal(true);
  };

  const handleLvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLvFormError(null);
    
    if (!lvForm.tenLoaiVe.trim()) {
      return setLvFormError('Tên loại vé không được để trống.');
    }
    if (lvForm.donGia < 0) {
      return setLvFormError('Đơn giá phải >= 0.');
    }
    if (lvForm.soLuongToiDa <= 0) {
      return setLvFormError('Số lượng tối đa phải > 0.');
    }

    try {
      setLvSubmitting(true);
      if (editLv) {
        const upd: UpdateLoaiVeRequest = {
          tenLoaiVe: lvForm.tenLoaiVe,
          moTa: lvForm.moTa,
          donGia: lvForm.donGia,
          soLuongToiDa: lvForm.soLuongToiDa,
          gioiHanMoiKhach: lvForm.gioiHanMoiKhach,
          thoiGianMoBan: lvForm.thoiGianMoBan,
          thoiGianDongBan: lvForm.thoiGianDongBan,
          trangThai: editLv.trangThai,
        };
        await organizerService.updateLoaiVe(editLv.loaiVeID, upd);
        showSuccess('Cập nhật loại vé thành công!');
      } else {
        await organizerService.createLoaiVe(lvForm);
        showSuccess('Tạo loại vé thành công!');
      }
      setShowLvModal(false);
      await loadLoaiVe();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra.';
      setLvFormError(msg);
    } finally {
      setLvSubmitting(false);
    }
  };

  const handleDeleteLv = async () => {
    if (deleteLvId === null) return;
    try {
      await organizerService.deleteLoaiVe(deleteLvId);
      showSuccess('Xóa loại vé thành công!');
      setDeleteLvId(null);
      await loadLoaiVe();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Không thể xóa loại vé.';
      showErr(msg);
      setDeleteLvId(null);
    }
  };

  const formatDate = (dt: string) => {
    try {
      return new Date(dt).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dt;
    }
  };

  const formatCurrency = (n: number) =>
    n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  if (loading) {
    return (
      <div className="oed-loading">
        <div className="oed-spinner" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="oed-not-found">
        <span>😕</span>
        <p>Không tìm thấy sự kiện.</p>
        <button onClick={() => navigate('/organizer/events')}>Quay lại</button>
      </div>
    );
  }

  const s = STATUS_MAP[event.trangThai] ?? STATUS_MAP[0];

  return (
    <div className="oed">
      {/* Toast */}
      {successMsg && <div className="oed-toast success">✅ {successMsg}</div>}
      {errorMsg && <div className="oed-toast error">⚠️ {errorMsg}</div>}

      {/* Breadcrumb */}
      <div className="oed-breadcrumb">
          <button onClick={() => navigate('/organizer')}>Dashboard</button>
          <span>›</span>
          <button onClick={() => navigate('/organizer/events')}>Sự kiện</button>
          <span>›</span>
          <span className="oed-breadcrumb-current">{event.tenSuKien}</span>
        </div>

        {/* Event Hero */}
        <div className="oed-hero">
          {event.anhBiaUrl && (
            <div className="oed-hero-img">
              <img src={event.anhBiaUrl} alt={event.tenSuKien} />
            </div>
          )}
          <div className="oed-hero-info">
            <span className="oed-hero-status" style={{ color: s.color, background: s.bg }}>
              {s.label}
            </span>
            <h1 className="oed-hero-title">{event.tenSuKien}</h1>
            <div className="oed-hero-meta">
              <span>📅 {formatDate(event.thoiGianBatDau)} – {formatDate(event.thoiGianKetThuc)}</span>
              {event.moTa && <p className="oed-hero-desc">{event.moTa}</p>}
            </div>
          </div>
        </div>

        {/* Loại vé section */}
        <div className="oed-tab-content">
          <div className="tab-header">
            <h2>🎟️ Loại vé ({loaiVes.length})</h2>
            <button className="tab-btn-primary" onClick={openCreateLv}>
              + Thêm loại vé
            </button>
          </div>

          {lvLoading ? (
            <div className="tab-loading"><div className="oed-spinner" /></div>
          ) : loaiVes.length === 0 ? (
            <div className="tab-empty">
              <span style={{ fontSize: '48px' }}>🎟️</span>
              <p>Chưa có loại vé nào</p>
              <button className="tab-btn-primary" onClick={openCreateLv}>
                Tạo loại vé đầu tiên
              </button>
            </div>
          ) : (
            <div className="lv-grid">
              {loaiVes.map(lv => (
                <div key={lv.loaiVeID} className="lv-card">
                  <div className="lv-card-header">
                    <h3>{lv.tenLoaiVe}</h3>
                    <span className={`lv-status ${lv.trangThai ? 'active' : 'inactive'}`}>
                      {lv.trangThai ? 'Đang bán' : 'Tạm dừng'}
                    </span>
                  </div>
                  {lv.moTa && <p className="lv-desc">{lv.moTa}</p>}
                  <div className="lv-price">{formatCurrency(lv.donGia)}</div>
                  <div className="lv-progress">
                    <div className="lv-progress-info">
                      <span>Đã bán: {lv.soLuongDaBan}/{lv.soLuongToiDa}</span>
                      <span>{lv.phanTramDaBan}%</span>
                    </div>
                    <div className="lv-progress-bar">
                      <div
                        className="lv-progress-fill"
                        style={{ width: `${Math.min(lv.phanTramDaBan, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="lv-meta">
                    <span>Còn lại: <strong>{lv.soLuongCon}</strong></span>
                    {lv.gioiHanMoiKhach && (
                      <span>Giới hạn/khách: <strong>{lv.gioiHanMoiKhach}</strong></span>
                    )}
                  </div>
                  <div className="lv-actions">
                    <button className="lv-btn-edit" onClick={() => openEditLv(lv)}>
                      ✏️ Sửa
                    </button>
                    {lv.soLuongDaBan === 0 && (
                      <button className="lv-btn-delete" onClick={() => setDeleteLvId(lv.loaiVeID)}>
                        🗑️ Xóa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== LOAI VE MODAL ===== */}
        {showLvModal && (
        <div className="oe-modal-overlay" onClick={() => setShowLvModal(false)}>
          <div className="oe-modal" onClick={e => e.stopPropagation()}>
            <div className="oe-modal-header">
              <h2>{editLv ? 'Chỉnh sửa loại vé' : 'Thêm loại vé mới'}</h2>
              <button className="oe-modal-close" onClick={() => setShowLvModal(false)}>✕</button>
            </div>
            <form onSubmit={handleLvSubmit} className="oe-form">
              {lvFormError && <div className="oe-form-error">⚠️ {lvFormError}</div>}
              
              <div className="oe-form-group">
                <label>Tên loại vé *</label>
                <input
                  type="text"
                  value={lvForm.tenLoaiVe}
                  onChange={e => setLvForm({ ...lvForm, tenLoaiVe: e.target.value })}
                  placeholder="VD: Vé VIP, Vé thường..."
                  required
                />
              </div>

              <div className="oe-form-row">
                <div className="oe-form-group">
                  <label>Đơn giá (VNĐ) *</label>
                  <input
                    type="number"
                    value={lvForm.donGia}
                    onChange={e => setLvForm({ ...lvForm, donGia: Number(e.target.value) })}
                    min={0}
                    required
                  />
                </div>
                <div className="oe-form-group">
                  <label>Số lượng tối đa *</label>
                  <input
                    type="number"
                    value={lvForm.soLuongToiDa}
                    onChange={e => setLvForm({ ...lvForm, soLuongToiDa: Number(e.target.value) })}
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="oe-form-group">
                <label>Giới hạn mỗi khách</label>
                <input
                  type="number"
                  value={lvForm.gioiHanMoiKhach ?? ''}
                  onChange={e => setLvForm({ ...lvForm, gioiHanMoiKhach: e.target.value ? Number(e.target.value) : undefined })}
                  min={1}
                  placeholder="Không giới hạn"
                />
              </div>

              <div className="oe-form-row">
                <div className="oe-form-group">
                  <label>Thời gian mở bán</label>
                  <input
                    type="datetime-local"
                    value={lvForm.thoiGianMoBan ?? ''}
                    onChange={e => setLvForm({ ...lvForm, thoiGianMoBan: e.target.value || undefined })}
                  />
                </div>
                <div className="oe-form-group">
                  <label>Thời gian đóng bán</label>
                  <input
                    type="datetime-local"
                    value={lvForm.thoiGianDongBan ?? ''}
                    onChange={e => setLvForm({ ...lvForm, thoiGianDongBan: e.target.value || undefined })}
                  />
                </div>
              </div>

              <div className="oe-form-group">
                <label>Mô tả</label>
                <textarea
                  value={lvForm.moTa ?? ''}
                  onChange={e => setLvForm({ ...lvForm, moTa: e.target.value })}
                  placeholder="Mô tả loại vé..."
                  rows={3}
                />
              </div>

              <div className="oe-form-actions">
                <button type="button" className="oe-btn-cancel" onClick={() => setShowLvModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="oe-btn-submit" disabled={lvSubmitting}>
                  {lvSubmitting ? 'Đang xử lý...' : editLv ? 'Cập nhật' : 'Thêm loại vé'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRM ===== */}
      {deleteLvId !== null && (
        <div className="oe-modal-overlay" onClick={() => setDeleteLvId(null)}>
          <div className="oe-confirm" onClick={e => e.stopPropagation()}>
            <div className="oe-confirm-icon">🗑️</div>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa loại vé này? Hành động này không thể hoàn tác.</p>
            <div className="oe-confirm-actions">
              <button className="oe-btn-cancel" onClick={() => setDeleteLvId(null)}>Hủy</button>
              <button className="oe-btn-delete-confirm" onClick={handleDeleteLv}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
