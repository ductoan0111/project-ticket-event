import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, X } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { Category } from '../../services/admin.service';
import './AdminCategories.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ tenDanhMuc: '', moTa: '', icon: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        tenDanhMuc: category.tenDanhMuc,
        moTa: category.moTa || '',
        icon: category.icon || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({ tenDanhMuc: '', moTa: '', icon: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ tenDanhMuc: '', moTa: '', icon: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenDanhMuc.trim()) return;

    try {
      setSubmitting(true);
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.danhMucID, formData);
      } else {
        await adminService.createCategory(formData);
      }
      await loadCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Không thể lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      await adminService.deleteCategory(id);
      await loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Không thể xóa danh mục');
    }
  };

  if (loading) {
    return (
      <div className="admin-categories-loading">
        <div className="spinner"></div>
        <p>Đang tải danh mục...</p>
      </div>
    );
  }

  return (
    <div className="admin-categories">
      <div className="admin-categories-header">
        <div>
          <h1>Quản lý danh mục</h1>
          <p>Quản lý danh mục sự kiện</p>
        </div>
        <button className="admin-btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Thêm danh mục
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="admin-categories-empty">
          <Tag size={48} />
          <p>Chưa có danh mục nào</p>
        </div>
      ) : (
        <div className="admin-categories-grid">
          {categories.map((category) => (
            <div key={category.danhMucID} className="admin-category-card">
              <div className="admin-category-icon">
                {category.icon ? <span>{category.icon}</span> : <Tag size={24} />}
              </div>
              <div className="admin-category-content">
                <h3>{category.tenDanhMuc}</h3>
                {category.moTa && <p>{category.moTa}</p>}
              </div>
              <div className="admin-category-actions">
                <button
                  className="admin-icon-btn edit"
                  onClick={() => handleOpenModal(category)}
                  title="Sửa"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="admin-icon-btn delete"
                  onClick={() => handleDelete(category.danhMucID)}
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
              <h2>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
              <button className="admin-modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Tên danh mục *</label>
                <input
                  type="text"
                  value={formData.tenDanhMuc}
                  onChange={(e) => setFormData({ ...formData, tenDanhMuc: e.target.value })}
                  placeholder="Ví dụ: Âm nhạc, Thể thao..."
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.moTa}
                  onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                  placeholder="Mô tả về danh mục..."
                  rows={3}
                />
              </div>
              <div className="admin-form-group">
                <label>Icon (emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🎵 🏀 🎭 ..."
                  maxLength={2}
                />
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
