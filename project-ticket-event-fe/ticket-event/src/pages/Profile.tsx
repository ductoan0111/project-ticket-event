import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Phone, Shield, Calendar, Edit2, 
  Save, X, ArrowLeft, Camera, Lock
} from 'lucide-react';
import userService from '../services/user.service';
import type { UserProfile } from '../services/user.service';
import './Profile.css';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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
    confirmPassword: '',
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
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProfile = await userService.updateProfile({
        hoTen: formData.hoTen,
        soDienThoai: formData.soDienThoai,
        tenDangNhap: formData.tenDangNhap,
      });
      setProfile(updatedProfile);
      alert('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.matKhauMoi !== passwordData.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }

    if (passwordData.matKhauMoi.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      await userService.changePassword({
        matKhauCu: passwordData.matKhauCu,
        matKhauMoi: passwordData.matKhauMoi,
      });
      alert('Đổi mật khẩu thành công!');
      setShowChangePassword(false);
      setPasswordData({
        matKhauCu: '',
        matKhauMoi: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
      alert(message);
    }
  };

  const handleCancel = () => {
    setFormData({
      hoTen: profile?.hoTen || '',
      soDienThoai: profile?.soDienThoai || '',
      tenDangNhap: profile?.tenDangNhap || '',
    });
    setIsEditing(false);
  };

  const getRoleName = (roleId?: number) => {
    switch (roleId) {
      case 1: return 'Quản trị viên';
      case 2: return 'Ban tổ chức';
      case 3: return 'Người tham dự';
      case 4: return 'Nhân viên';
      case 5: return 'Check-in';
      default: return 'Chưa xác định';
    }
  };

  const getRoleColor = (roleId?: number) => {
    switch (roleId) {
      case 1: return '#ef4444'; // Admin - Red
      case 2: return '#8b5cf6'; // Organizer - Purple
      case 3: return '#3b82f6'; // Attendee - Blue
      case 4: return '#10b981'; // Staff - Green
      case 5: return '#f59e0b'; // Checkin - Orange
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <p>Không thể tải thông tin cá nhân</p>
          <button onClick={() => navigate('/attendee')} className="btn-back">
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <h1>Thông tin cá nhân</h1>
      </div>

      <div className="profile-container">
        {/* Profile Card */}
        <div className="profile-card">
          {/* Avatar Section */}
          <div className="profile-avatar-section">
            <div className="avatar-wrapper">
              <div className="avatar-circle">
                <User size={48} />
              </div>
              <button className="avatar-upload-btn">
                <Camera size={16} />
              </button>
            </div>
            <div className="profile-name-section">
              <h2>{profile.hoTen}</h2>
              <p className="profile-username">@{profile.tenDangNhap}</p>
              <div 
                className="profile-role-badge"
                style={{ background: `${getRoleColor(profile.vaiTroId)}15`, color: getRoleColor(profile.vaiTroId) }}
              >
                <Shield size={14} />
                <span>{getRoleName(profile.vaiTroId)}</span>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="profile-info-section">
            <div className="section-header-profile">
              <h3>Thông tin chi tiết</h3>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="btn-edit">
                  <Edit2 size={16} />
                  <span>Chỉnh sửa</span>
                </button>
              ) : (
                <div className="edit-actions">
                  <button onClick={handleCancel} className="btn-cancel">
                    <X size={16} />
                    <span>Hủy</span>
                  </button>
                  <button onClick={handleSave} className="btn-save" disabled={saving}>
                    <Save size={16} />
                    <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>
                  <User size={18} />
                  <span>Họ và tên</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="hoTen"
                    value={formData.hoTen}
                    onChange={handleInputChange}
                    className="info-input"
                  />
                ) : (
                  <p>{profile.hoTen}</p>
                )}
              </div>

              <div className="info-item">
                <label>
                  <Mail size={18} />
                  <span>Email</span>
                </label>
                <p>{profile.email}</p>
              </div>

              <div className="info-item">
                <label>
                  <Phone size={18} />
                  <span>Số điện thoại</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="soDienThoai"
                    value={formData.soDienThoai}
                    onChange={handleInputChange}
                    className="info-input"
                    placeholder="Chưa cập nhật"
                  />
                ) : (
                  <p>{profile.soDienThoai || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div className="info-item">
                <label>
                  <Calendar size={18} />
                  <span>Ngày tham gia</span>
                </label>
                <p>{formatDate(profile.ngayTao)}</p>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="profile-security-section">
            <div className="section-header-profile">
              <h3>Bảo mật</h3>
            </div>

            {!showChangePassword ? (
              <button 
                onClick={() => setShowChangePassword(true)} 
                className="btn-change-password"
              >
                <Lock size={18} />
                <span>Đổi mật khẩu</span>
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="password-form">
                <div className="form-group">
                  <label>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    name="matKhauCu"
                    value={passwordData.matKhauCu}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    name="matKhauMoi"
                    value={passwordData.matKhauMoi}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="form-input"
                  />
                </div>

                <div className="password-actions">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({
                        matKhauCu: '',
                        matKhauMoi: '',
                        confirmPassword: '',
                      });
                    }} 
                    className="btn-cancel"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-submit">
                    Đổi mật khẩu
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Danger Zone */}
          <div className="profile-danger-section">
            <div className="section-header-profile">
              <h3>Vùng nguy hiểm</h3>
            </div>
            <button onClick={logout} className="btn-logout-danger">
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="profile-stats-card">
          <h3>Thống kê</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-value">12</p>
                <p className="stat-label">Sự kiện đã tham gia</p>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                <User size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-value">24</p>
                <p className="stat-label">Vé đã mua</p>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon" style={{ background: '#fecaca', color: '#ef4444' }}>
                <User size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-value">8</p>
                <p className="stat-label">Yêu thích</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
