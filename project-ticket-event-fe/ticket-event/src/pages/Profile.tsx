import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Shield, Edit2, Save, X, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import userService from '../services/user.service';
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../services/user.service';
import './Profile.css';

export default function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    hoTen: '',
    soDienThoai: '',
    tenDangNhap: '',
  });

  const [passwordData, setPasswordData] = useState({
    matKhauCu: '',
    matKhauMoi: '',
    xacNhanMatKhau: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({
        hoTen: data.hoTen,
        soDienThoai: data.soDienThoai || '',
        tenDangNhap: data.tenDangNhap,
      });
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      if (error.response?.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        hoTen: profile.hoTen,
        soDienThoai: profile.soDienThoai || '',
        tenDangNhap: profile.tenDangNhap,
      });
    }
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData: UpdateProfileRequest = {
        hoTen: formData.hoTen,
        soDienThoai: formData.soDienThoai,
        tenDangNhap: formData.tenDangNhap,
      };
      const updated = await userService.updateProfile(updateData);
      setProfile(updated);
      setEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (passwordData.matKhauMoi !== passwordData.xacNhanMatKhau) {
      alert('Mật khẩu mới không khớp!');
      return;
    }

    if (passwordData.matKhauMoi.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      setSaving(true);
      const changeData: ChangePasswordRequest = {
        matKhauCu: passwordData.matKhauCu,
        matKhauMoi: passwordData.matKhauMoi,
      };
      await userService.changePassword(changeData);
      alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      setShowChangePassword(false);
      setPasswordData({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
      logout();
    } catch (error: any) {
      console.error('Failed to change password:', error);
      alert(error.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <AlertCircle size={48} />
        <h2>Không thể tải thông tin</h2>
        <p>Vui lòng đăng nhập lại để tiếp tục</p>
        <button onClick={() => navigate('/login')} className="btn-back-login">
          Đăng nhập
        </button>
      </div>
    );
  }

  const ROLE_MAP: Record<number, string> = {
    1: 'Admin',
    2: 'Organizer',
    3: 'Attendee',
    4: 'Staff',
    5: 'Check-in',
  };

  return (
    <div className="profile">
      {/* Header với nút quay lại */}
      <div className="profile-top-bar">
        <button onClick={() => navigate(-1)} className="btn-back-nav">
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <h1 className="profile-page-title">Thông tin cá nhân</h1>
        <div></div>
      </div>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-header-info">
            <h1>{profile.hoTen}</h1>
            <p className="profile-email">{profile.email}</p>
          </div>
          {!editing && (
            <button onClick={handleEdit} className="btn-edit">
              <Edit2 size={18} />
              Chỉnh sửa
            </button>
          )}
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>Thông tin cá nhân</h2>
            <div className="profile-fields">
              <div className="profile-field">
                <label>
                  <User size={18} />
                  Họ tên
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.hoTen}
                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                  />
                ) : (
                  <span>{profile.hoTen}</span>
                )}
              </div>

              <div className="profile-field">
                <label>
                  <User size={18} />
                  Tên đăng nhập
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.tenDangNhap}
                    onChange={(e) => setFormData({ ...formData, tenDangNhap: e.target.value })}
                  />
                ) : (
                  <span>{profile.tenDangNhap}</span>
                )}
              </div>

              <div className="profile-field">
                <label>
                  <Mail size={18} />
                  Email
                </label>
                <span>{profile.email}</span>
              </div>

              <div className="profile-field">
                <label>
                  <Phone size={18} />
                  Số điện thoại
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <span>{profile.soDienThoai || 'Chưa cập nhật'}</span>
                )}
              </div>

              <div className="profile-field">
                <label>
                  <Shield size={18} />
                  Vai trò
                </label>
                <span className="profile-role">{ROLE_MAP[profile.vaiTroId] || 'User'}</span>
              </div>

              <div className="profile-field">
                <label>
                  <Calendar size={18} />
                  Ngày tạo
                </label>
                <span>{new Date(profile.ngayTao).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {editing && (
              <div className="profile-actions">
                <button onClick={handleCancel} className="btn-cancel" disabled={saving}>
                  <X size={18} />
                  Hủy
                </button>
                <button onClick={handleSave} className="btn-save" disabled={saving}>
                  <Save size={18} />
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>Bảo mật</h2>
            {!showChangePassword ? (
              <button onClick={() => setShowChangePassword(true)} className="btn-change-password">
                <Lock size={18} />
                Đổi mật khẩu
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="change-password-form">
                <div className="form-group">
                  <label>Mật khẩu cũ</label>
                  <input
                    type="password"
                    value={passwordData.matKhauCu}
                    onChange={(e) => setPasswordData({ ...passwordData, matKhauCu: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordData.matKhauMoi}
                    onChange={(e) => setPasswordData({ ...passwordData, matKhauMoi: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordData.xacNhanMatKhau}
                    onChange={(e) => setPasswordData({ ...passwordData, xacNhanMatKhau: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
                    }}
                    className="btn-cancel"
                    disabled={saving}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
