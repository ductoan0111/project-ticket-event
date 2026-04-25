import { Settings } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
          Cài đặt hệ thống
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Cấu hình và tùy chỉnh hệ thống
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
        <Settings size={48} />
        <p>Tính năng đang phát triển</p>
      </div>
    </div>
  );
}
