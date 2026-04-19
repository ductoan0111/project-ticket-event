import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, Mail, Lock, User, LogIn, AlertCircle } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    tenDangNhap: '',
    email: '',
    matKhau: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData);
      
      console.log('Login response:', response);
      console.log('VaiTroId:', response.vaiTroId);
      
      // Redirect based on role
      if (response.vaiTroId === 1) {
        // Admin
        console.log('Redirecting to /admin');
        navigate('/admin');
      } else if (response.vaiTroId === 2) {
        // Organizer
        console.log('Redirecting to /organizer');
        navigate('/organizer');
      } else if (response.vaiTroId === 3) {
        // Attendee
        console.log('Redirecting to /attendee');
        navigate('/attendee');
      } else {
        // Default
        console.log('VaiTroId not recognized, redirecting to /login');
        navigate('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-ticket ticket-1">🎫</div>
        <div className="floating-ticket ticket-2">🎟️</div>
        <div className="floating-ticket ticket-3">🎪</div>
        <div className="floating-ticket ticket-4">🎭</div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-container">
            <Ticket className="logo-icon" size={40} />
          </div>
          <h1 className="auth-title">Chào mừng trở lại!</h1>
          <p className="auth-subtitle">Đăng nhập để quản lý sự kiện của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="tenDangNhap" className="form-label">
              <User size={18} />
              Tên đăng nhập
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="tenDangNhap"
                className="form-input"
                placeholder="Nhập tên đăng nhập"
                value={formData.tenDangNhap}
                onChange={(e) => setFormData({ ...formData, tenDangNhap: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={18} />
              Email
            </label>
            <div className="input-wrapper">
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
                placeholder="Nhập mật khẩu"
                value={formData.matKhau}
                onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
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
                Đang đăng nhập...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Đăng nhập
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>hoặc</span>
        </div>

        <p className="auth-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>

        <div className="auth-footer">
          <p>Hệ thống quản lý sự kiện & bán vé trực tuyến</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
