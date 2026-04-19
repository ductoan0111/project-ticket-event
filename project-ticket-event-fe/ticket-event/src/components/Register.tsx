import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, Mail, Lock, User, Phone, UserPlus, AlertCircle, CheckCircle2, Users, Briefcase } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [formData, setFormData] = useState({
    hoTen: '',
    tenDangNhap: '',
    email: '',
    matKhau: '',
    xacNhanMatKhau: '',
    soDienThoai: '',
    vaiTroId: 3, // Mặc định là Khách tham dự
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, matKhau: password });
    setPasswordStrength(checkPasswordStrength(password));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.matKhau !== formData.xacNhanMatKhau) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.matKhau.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const { xacNhanMatKhau, ...registerData } = formData;
      await register(registerData);
      
      // Tự động đăng nhập sau khi đăng ký thành công
      const loginResponse = await login({
        tenDangNhap: formData.tenDangNhap,
        email: formData.email,
        matKhau: formData.matKhau,
      });
      
      // Redirect dựa trên vai trò
      if (loginResponse.vaiTroId === 1) {
        navigate('/admin');
      } else if (loginResponse.vaiTroId === 2) {
        navigate('/organizer');
      } else if (loginResponse.vaiTroId === 3) {
        navigate('/attendee');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Yếu';
    if (passwordStrength <= 3) return 'Trung bình';
    return 'Mạnh';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return '#ff4444';
    if (passwordStrength <= 3) return '#ffaa00';
    return '#00cc66';
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-ticket ticket-1">🎫</div>
        <div className="floating-ticket ticket-2">🎟️</div>
        <div className="floating-ticket ticket-3">🎪</div>
        <div className="floating-ticket ticket-4">🎭</div>
      </div>

      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="logo-container">
            <Ticket className="logo-icon" size={40} />
          </div>
          <h1 className="auth-title">Tạo tài khoản mới</h1>
          <p className="auth-subtitle">Bắt đầu quản lý sự kiện của bạn ngay hôm nay</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Chọn vai trò */}
          <div className="role-selector">
            <label className="role-label">Bạn là:</label>
            <div className="role-options">
              <button
                type="button"
                className={`role-option ${formData.vaiTroId === 3 ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, vaiTroId: 3 })}
              >
                <Users size={24} />
                <span className="role-title">Khách tham dự</span>
                <span className="role-desc">Tìm và đặt vé sự kiện</span>
              </button>
              
              <button
                type="button"
                className={`role-option ${formData.vaiTroId === 2 ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, vaiTroId: 2 })}
              >
                <Briefcase size={24} />
                <span className="role-title">Ban tổ chức</span>
                <span className="role-desc">Tạo và quản lý sự kiện</span>
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="hoTen" className="form-label">
                <User size={18} />
                Họ và tên
              </label>
              <input
                type="text"
                id="hoTen"
                className="form-input"
                placeholder="Nguyễn Văn A"
                value={formData.hoTen}
                onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tenDangNhap" className="form-label">
                <User size={18} />
                Tên đăng nhập
              </label>
              <input
                type="text"
                id="tenDangNhap"
                className="form-input"
                placeholder="username"
                value={formData.tenDangNhap}
                onChange={(e) => setFormData({ ...formData, tenDangNhap: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="soDienThoai" className="form-label">
                <Phone size={18} />
                Số điện thoại
              </label>
              <input
                type="tel"
                id="soDienThoai"
                className="form-input"
                placeholder="0123456789"
                value={formData.soDienThoai}
                onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="matKhau" className="form-label">
              <Lock size={18} />
              Mật khẩu
            </label>
            <div className="input-wrapper password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="matKhau"
                className="form-input"
                placeholder="Tối thiểu 6 ký tự"
                value={formData.matKhau}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formData.matKhau && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor(),
                    }}
                  />
                </div>
                <span style={{ color: getPasswordStrengthColor() }}>
                  {getPasswordStrengthLabel()}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="xacNhanMatKhau" className="form-label">
              <Lock size={18} />
              Xác nhận mật khẩu
            </label>
            <div className="input-wrapper password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="xacNhanMatKhau"
                className="form-input"
                placeholder="Nhập lại mật khẩu"
                value={formData.xacNhanMatKhau}
                onChange={(e) => setFormData({ ...formData, xacNhanMatKhau: e.target.value })}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formData.xacNhanMatKhau && formData.matKhau === formData.xacNhanMatKhau && (
              <div className="password-match">
                <CheckCircle2 size={16} />
                <span>Mật khẩu khớp</span>
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Đang đăng ký...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Đăng ký tài khoản
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>hoặc</span>
        </div>

        <p className="auth-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>

        <div className="auth-footer">
          <p>Hệ thống quản lý sự kiện & bán vé trực tuyến</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
