import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock } from 'lucide-react';
import { adminService } from '../services/admin.service';
import type { AdminStats } from '../services/admin.service';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Use mock data if API not available
      setStats({
        tongSuKien: 0,
        suKienChoDuyet: 0,
        tongNguoiDung: 0,
        tongDoanhThu: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Đang tải thống kê...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Dashboard</h1>
        <p>Tổng quan hệ thống</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon calendar">
            <Calendar size={24} />
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Tổng sự kiện</p>
            <h3 className="admin-stat-value">{stats?.tongSuKien || 0}</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Chờ duyệt</p>
            <h3 className="admin-stat-value">{stats?.suKienChoDuyet || 0}</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon users">
            <Users size={24} />
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Người dùng</p>
            <h3 className="admin-stat-value">{stats?.tongNguoiDung || 0}</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Doanh thu</p>
            <h3 className="admin-stat-value">
              {(stats?.tongDoanhThu || 0).toLocaleString('vi-VN')} đ
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
