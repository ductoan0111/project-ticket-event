import { Users } from 'lucide-react';

export default function AdminUsers() {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
          Quản lý người dùng
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Quản lý tài khoản và phân quyền người dùng
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '400px',
        gap: '1rem',
        color: '#64748b'
      }}>
        <Users size={48} />
        <p>Tính năng đang phát triển</p>
      </div>
    </div>
  );
}
