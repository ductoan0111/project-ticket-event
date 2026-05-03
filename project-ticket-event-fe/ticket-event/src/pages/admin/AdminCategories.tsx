import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { Category } from '../../services/admin.service';
import '../admin/admin.shared.css';

const EMOJI_SUGGESTIONS = ['🎵', '🏀', '🎭', '🎨', '🍕', '🎮', '🏋️', '💼', '🌍', '🎉', '🔬', '📚'];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ tenDanhMuc: '', moTa: '', icon: '' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? categories.filter(c => c.tenDanhMuc.toLowerCase().includes(q)) : categories);
  }, [categories, search]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllCategories().catch(() => []);
      setCategories(data);
    } finally { setLoading(false); }
  };

  const openModal = (cat?: Category) => {
    setEditing(cat || null);
    setForm(cat ? { tenDanhMuc: cat.tenDanhMuc, moTa: cat.moTa || '', icon: cat.icon || '' } : { tenDanhMuc: '', moTa: '', icon: '' });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tenDanhMuc.trim()) return;
    try {
      setSubmitting(true);
      if (editing) await adminService.updateCategory(editing.danhMucID, form);
      else await adminService.createCategory(form);
      await load();
      closeModal();
    } catch { alert('Không thể lưu danh mục'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa danh mục này?')) return;
    try { await adminService.deleteCategory(id); await load(); }
    catch { alert('Không thể xóa danh mục'); }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-top">
        <div>
          <h1>Danh mục sự kiện</h1>
          <p>Quản lý các danh mục để phân loại sự kiện</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="admin-count-chip"><Tag size={13} />{categories.length} danh mục</span>
          <button className="admin-btn-primary" onClick={() => openModal()}>
            <Plus size={16} /> Thêm danh mục
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div className="admin-search-bar">
          <Search size={15} className="search-icon" />
          <input
            placeholder="Tìm danh mục..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="admin-page-loading"><div className="spinner" /><p>Đang tải...</p></div>
      ) : filtered.length === 0 ? (
        <div className="admin-page-empty"><Tag size={40} /><p>Chưa có danh mục nào</p></div>
      ) : (
        <div className="admin-cards-grid">
          {filtered.map(cat => (
            <div key={cat.danhMucID} className="admin-item-card">
              <div className="admin-item-icon">
                {cat.icon ? cat.icon : <Tag size={20} />}
              </div>
              <div className="admin-item-body">
                <div className="admin-item-title">{cat.tenDanhMuc}</div>
                <div className="admin-item-desc">{cat.moTa || 'Không có mô tả'}</div>
                <div style={{ marginTop: 8 }}>
                  <span className="admin-badge badge-info">ID #{cat.danhMucID}</span>
                </div>
              </div>
              <div className="admin-item-actions">
                <button className="admin-icon-btn edit" onClick={() => openModal(cat)} title="Sửa">
                  <Edit2 size={14} />
                </button>
                <button className="admin-icon-btn delete" onClick={() => handleDelete(cat.danhMucID)} title="Xóa">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editing ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <button className="admin-modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Tên danh mục *</label>
                <input
                  value={form.tenDanhMuc}
                  onChange={e => setForm({ ...form, tenDanhMuc: e.target.value })}
                  placeholder="Ví dụ: Âm nhạc, Thể thao..."
                  required
                  autoFocus
                />
              </div>

              <div className="admin-form-group">
                <label>Icon (emoji)</label>
                <input
                  value={form.icon}
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                  placeholder="Chọn hoặc nhập emoji..."
                  maxLength={4}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {EMOJI_SUGGESTIONS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setForm({ ...form, icon: em })}
                      style={{
                        background: form.icon === em ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                        border: form.icon === em ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 8, padding: '6px 8px', cursor: 'pointer', fontSize: 18,
                        transition: 'all 0.15s'
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-form-group">
                <label>Mô tả</label>
                <textarea
                  value={form.moTa}
                  onChange={e => setForm({ ...form, moTa: e.target.value })}
                  placeholder="Mô tả ngắn về danh mục..."
                  rows={3}
                />
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
