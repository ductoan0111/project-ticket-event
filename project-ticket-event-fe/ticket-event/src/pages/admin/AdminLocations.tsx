import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, X } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { Location } from '../../services/admin.service';
import './AdminLocations.css';

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    tenDiaDiem: '',
    diaChi: '',
    thanhPho: '',
    quocGia: '',
    sucChua: 0,
    trangThai: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllLocations();
      setLocations(data);
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        tenDiaDiem: location.tenDiaDiem,
        diaChi: location.diaChi || '',
        thanhPho: location.thanhPho || '',
        quocGia: location.quocGia || '',
        sucChua: location.sucChua || 0,
        trangThai: location.trangThai,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        tenDiaDiem: '',
        diaChi: '',
        thanhPho: '',
        quocGia: '',
        sucChua: 0,
        trangThai: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLocation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenDiaDiem.trim()) return;

    try {
      setSubmitting(true);
      if (editingLocation) {
        await adminService.updateLocation(editingLocation.diaDiemID, formData);
      } else {
        await adminService.createLocation(formData);
      }
      await loadLocations();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save location:', error);
      alert('Không thể lưu địa điểm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa địa điểm này?')) return;

    try {
      await adminService.deleteLocation(id);
      await loadLocations();
    } catch (error) {
      console.error('Failed to delete location:', error);
      alert('Không thể xóa địa điểm');
    }
  };

  if (loading) {
    return (
      <div className="admin-locations-loading">
        <div className="spinner"></div>
        <p>Đang tải địa điểm...</p>
      </div>
    );
  }

  return (
    <div className="admin-locations">
      <div className="admin-locations-header">
        <div>
          <h1>Quản lý địa điểm</h1>
          <p>Quản lý địa điểm tổ chức sự kiện</p>
        </div>
        <button className="admin-btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Thêm địa điểm
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="admin-locations-empty">
          <MapPin size={48} />
          <p>Chưa có địa điểm nào</p>
        </div>
      ) : (
        <div className="admin-locations-list">
          {locations.map((location) => (
            <div key={location.diaDiemID} className="admin-location-card">
              <div className="admin-location-icon">
                <MapPin size={24} />
              </div>
              <div className="admin-location-content">
                <div className="admin-location-header">
                  <h3>{location.tenDiaDiem}</h3>
                  <span className={`admin-location-status ${location.trangThai ? 'active' : 'inactive'}`}>
                    {location.trangThai ? 'Hoạt động' : 'Ngừng'}
                  </span>
                </div>
                {location.diaChi && <p className="admin-location-address">{location.diaChi}</p>}
                <div className="admin-location-meta">
                  {location.thanhPho && <span>{location.thanhPho}</span>}
                  {location.quocGia && <span>{location.quocGia}</span>}
                  {location.sucChua && location.sucChua > 0 && (
                    <span>Sức chứa: {location.sucChua.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="admin-location-actions">
                <button
                  className="admin-icon-btn edit"
                  onClick={() => handleOpenModal(location)}
                  title="Sửa"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="admin-icon-btn delete"
                  onClick={() => handleDelete(location.diaDiemID)}
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingLocation ? 'Sửa địa điểm' : 'Thêm địa điểm'}</h2>
              <button className="admin-modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Tên địa điểm *</label>
                <input
                  type="text"
                  value={formData.tenDiaDiem}
                  onChange={(e) => setFormData({ ...formData, tenDiaDiem: e.target.value })}
                  placeholder="Ví dụ: Nhà thi đấu Quân khu 7"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  value={formData.diaChi}
                  onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                  placeholder="Số nhà, đường..."
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Thành phố</label>
                  <input
                    type="text"
                    value={formData.thanhPho}
                    onChange={(e) => setFormData({ ...formData, thanhPho: e.target.value })}
                    placeholder="Hồ Chí Minh"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Quốc gia</label>
                  <input
                    type="text"
                    value={formData.quocGia}
                    onChange={(e) => setFormData({ ...formData, quocGia: e.target.value })}
                    placeholder="Việt Nam"
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Sức chứa</label>
                <input
                  type="number"
                  value={formData.sucChua}
                  onChange={(e) => setFormData({ ...formData, sucChua: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.trangThai}
                    onChange={(e) => setFormData({ ...formData, trangThai: e.target.checked })}
                  />
                  <span>Hoạt động</span>
                </label>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
