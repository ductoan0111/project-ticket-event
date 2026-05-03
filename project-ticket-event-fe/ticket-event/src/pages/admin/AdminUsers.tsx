import { useState, useEffect } from 'react';
import { Users, Search, UserCheck, UserX, Shield, Phone, Mail, Calendar } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { AdminUser } from '../../services/admin.service';
import '../admin/admin.shared.css';

const ROLE_MAP: Record<number, { label: string; cls: string; color: string }> = {
  1: { label: 'Admin',        cls: 'badge-pending', color: '#fbbf24' },
  2: { label: 'Ban tổ chức',  cls: 'badge-info',    color: '#a5b4fc' },
  3: { label: 'Người dùng',   cls: 'badge-blue',    color: '#93c5fd' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.hoTen.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.tenDangNhap.toLowerCase().includes(q)
      );
    }
    if (statusFilter === 'active') result = result.filter(u => u.trangThai !== false);
    else if (statusFilter === 'inactive') result = result.filter(u => u.trangThai === false);
    setFiltered(result);
  }, [users, search, statusFilter]);

  const load = async () => {
    try { setLoading(true); setUsers(await adminService.getAllUsers().catch(() => [])); }
    finally { setLoading(false); }
  };

  const handleDisable = async (id: number) => {
    if (!confirm('Vô hiệu hóa tài khoản này?')) return;
    try {
      setProcessingId(id);
      await adminService.disableUser(id);
      await load();
    } catch { alert('Không thể vô hiệu hóa tài khoản'); }
    finally { setProcessingId(null); }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase();

  const activeCount   = users.filter(u => u.trangThai !== false).length;
  const inactiveCount = users.filter(u => u.trangThai === false).length;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-top">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Xem và quản lý tất cả tài khoản người dùng</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="admin-count-chip"><Users size={13} />{users.length} tổng</span>
          <span className="admin-badge badge-active"><UserCheck size={11} />{activeCount} hoạt động</span>
          {inactiveCount > 0 && <span className="admin-badge badge-rejected"><UserX size={11} />{inactiveCount} bị khóa</span>}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="admin-search-bar">
          <Search size={15} className="search-icon" />
          <input
            placeholder="Tìm theo tên, email, tên đăng nhập..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-filter-tabs">
          {(['all', 'active', 'inactive'] as const).map(tab => (
            <button
              key={tab}
              className={`filter-tab ${statusFilter === tab ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab === 'all' ? 'Tất cả' : tab === 'active' ? 'Hoạt động' : 'Bị khóa'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="admin-page-loading"><div className="spinner" /><p>Đang tải người dùng...</p></div>
      ) : filtered.length === 0 ? (
        <div className="admin-page-empty"><Users size={40} /><p>{search ? 'Không tìm thấy người dùng' : 'Không có người dùng'}</p></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Liên hệ</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.nguoiDungId} style={{ opacity: user.trangThai === false ? 0.55 : 1 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white', fontWeight: 700, fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {getInitials(user.hoTen)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13.5 }}>{user.hoTen}</div>
                        <div style={{ fontSize: 12, color: '#6b7694' }}>@{user.tenDangNhap}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#8892aa' }}>
                        <Mail size={12} /> {user.email}
                      </span>
                      {user.soDienThoai && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7694' }}>
                          <Phone size={11} /> {user.soDienThoai}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      className={`admin-badge ${ROLE_MAP[user.vaiTroId ?? 3]?.cls}`}>
                      {user.vaiTroId === 1 && <Shield size={10} />}
                      {ROLE_MAP[user.vaiTroId ?? 3]?.label}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#8892aa' }}>
                      <Calendar size={12} />
                      {user.ngayTao ? new Date(user.ngayTao).toLocaleDateString('vi-VN') : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${user.trangThai !== false ? 'badge-active' : 'badge-rejected'}`}>
                      {user.trangThai !== false ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td>
                    {user.trangThai !== false && user.vaiTroId !== 1 && (
                      <button
                        className="admin-icon-btn delete"
                        title="Vô hiệu hóa"
                        onClick={() => handleDisable(user.nguoiDungId)}
                        disabled={processingId === user.nguoiDungId}
                      >
                        <UserX size={15} />
                      </button>
                    )}
                    {user.vaiTroId === 1 && (
                      <span style={{ fontSize: 11, color: '#4a5270' }}>Bảo hộ</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
