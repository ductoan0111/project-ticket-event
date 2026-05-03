import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, X, Search, Users } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { Location } from '../../services/admin.service';
import '../admin/admin.shared.css';

const CITIES = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Huế', 'Nha Trang', 'Vũng Tàu'];

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filtered, setFiltered] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState({
    tenDiaDiem: '', diaChi: '', thanhPho: '', quocGia: 'Việt Nam', sucChua: 0, trangThai: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? locations.filter(l => l.tenDiaDiem.toLowerCase().includes(q) || (l.thanhPho || '').toLowerCase().includes(q)) : locations);
  }, [locations, search]);

  const load = async () => {
    try { setLoading(true); setLocations(await adminService.getAllLocations().catch(() => [])); }
    finally { setLoading(false); }
  };

  const openModal = (loc?: Location) => {
    setEditing(loc || null);
    setForm(loc
      ? { tenDiaDiem: loc.tenDiaDiem, diaChi: loc.diaChi || '', thanhPho: loc.thanhPho || '', quocGia: loc.quocGia || 'Việt Nam', sucChua: loc.sucChua || 0, trangThai: loc.trangThai }
      : { tenDiaDiem: '', diaChi: '', thanhPho: '', quocGia: 'Việt Nam', sucChua: 0, trangThai: true });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tenDiaDiem.trim()) return;
    try {
      setSubmitting(true);
      if (editing) await adminService.updateLocation(editing.diaDiemID, form);
      else await adminService.createLocation(form);
      await load(); closeModal();
    } catch { alert('Không thể lưu địa điểm'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa địa điểm này?')) return;
    try { await adminService.deleteLocation(id); await load(); }
    catch { alert('Không thể xóa địa điểm'); }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-top">
        <div>
          <h1>Địa điểm tổ chức</h1>
          <p>Quản lý các địa điểm tổ chức sự kiện trên toàn quốc</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="admin-count-chip"><MapPin size={13} />{locations.length} địa điểm</span>
          <button className="admin-btn-primary" onClick={() => openModal()}>
            <Plus size={16} /> Thêm địa điểm
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div className="admin-search-bar">
          <Search size={15} className="search-icon" />
          <input placeholder="Tìm địa điểm, thành phố..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="admin-page-loading"><div className="spinner" /><p>Đang tải...</p></div>
      ) : filtered.length === 0 ? (
        <div className="admin-page-empty"><MapPin size={40} /><p>Chưa có địa điểm nào</p></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Địa điểm</th>
                <th>Địa chỉ</th>
                <th>Thành phố</th>
                <th>Sức chứa</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(loc => (
                <tr key={loc.diaDiemID}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, background: 'rgba(59,130,246,0.12)',
                        border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#93c5fd', flexShrink: 0
                      }}>
                        <MapPin size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{loc.tenDiaDiem}</div>
                        <div style={{ fontSize: 11.5, color: '#6b7694' }}>ID #{loc.diaDiemID}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: '#8892aa', maxWidth: 200 }}>
                    {loc.diaChi || <span style={{ color: '#4a5270' }}>—</span>}
                  </td>
                  <td>
                    {loc.thanhPho
                      ? <span className="admin-badge badge-blue">{loc.thanhPho}</span>
                      : <span style={{ color: '#4a5270' }}>—</span>
                    }
                  </td>
                  <td>
                    {(loc.sucChua && loc.sucChua > 0)
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#c4ccdf' }}>
                          <Users size={12} /> {loc.sucChua.toLocaleString('vi-VN')}
                        </span>
                      : <span style={{ color: '#4a5270' }}>—</span>
                    }
                  </td>
                  <td>
                    <span className={`admin-badge ${loc.trangThai ? 'badge-active' : 'badge-ended'}`}>
                      {loc.trangThai ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="admin-icon-btn edit" onClick={() => openModal(loc)} title="Sửa"><Edit2 size={14} /></button>
                      <button className="admin-icon-btn delete" onClick={() => handleDelete(loc.diaDiemID)} title="Xóa"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editing ? 'Sửa địa điểm' : 'Thêm địa điểm mới'}</h2>
              <button className="admin-modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Tên địa điểm *</label>
                <input value={form.tenDiaDiem} onChange={e => setForm({ ...form, tenDiaDiem: e.target.value })}
                  placeholder="Ví dụ: Nhà thi đấu Quân khu 7" required autoFocus />
              </div>
              <div className="admin-form-group">
                <label>Địa chỉ</label>
                <input value={form.diaChi} onChange={e => setForm({ ...form, diaChi: e.target.value })}
                  placeholder="Số nhà, đường..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="admin-form-group">
                  <label>Thành phố</label>
                  <select value={form.thanhPho} onChange={e => setForm({ ...form, thanhPho: e.target.value })}>
                    <option value="">Chọn thành phố</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Quốc gia</label>
                  <input value={form.quocGia} onChange={e => setForm({ ...form, quocGia: e.target.value })} />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Sức chứa (người)</label>
                <input type="number" value={form.sucChua || ''}
                  onChange={e => setForm({ ...form, sucChua: parseInt(e.target.value) || 0 })}
                  placeholder="0" min="0" />
              </div>
              <div className="admin-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textTransform: 'none', fontSize: 13, color: '#c4ccdf' }}>
                  <input type="checkbox" checked={form.trangThai}
                    onChange={e => setForm({ ...form, trangThai: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
                  Đang hoạt động
                </label>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="admin-btn-primary" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
