import { useState, useEffect } from 'react';
import { Calendar, MapPin, Check, X, Clock, Search, Eye } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { OrgEvent } from '../../services/organizer.service';
import '../admin/admin.shared.css';

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  0: { label: 'Chờ duyệt',   cls: 'badge-pending'  },
  1: { label: 'Đang mở bán', cls: 'badge-active'   },
  2: { label: 'Đã kết thúc', cls: 'badge-ended'    },
  3: { label: 'Đã huỷ',      cls: 'badge-ended'    },
  5: { label: 'Bị từ chối',  cls: 'badge-rejected' },
};

export default function AdminEvents() {
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [filtered, setFiltered] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => { load(); }, [tab]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? events.filter(e => e.tenSuKien.toLowerCase().includes(q)) : events);
  }, [events, search]);

  const load = async () => {
    try {
      setLoading(true);
      const data = tab === 'pending'
        ? await adminService.getPendingEvents().catch(() => [])
        : await adminService.getAllEvents().catch(() => []);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Duyệt sự kiện này?')) return;
    try { setProcessingId(id); await adminService.approveEvent(id); await load(); }
    catch { alert('Không thể duyệt sự kiện'); }
    finally { setProcessingId(null); }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Từ chối sự kiện này?')) return;
    try { setProcessingId(id); await adminService.rejectEvent(id); await load(); }
    catch { alert('Không thể từ chối sự kiện'); }
    finally { setProcessingId(null); }
  };

  const pendingCount = events.filter(e => e.trangThai === 0).length;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-top">
        <div>
          <h1>Quản lý sự kiện</h1>
          <p>Duyệt và quản lý tất cả sự kiện trên hệ thống</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="admin-count-chip">
            <Calendar size={13} />
            {events.length} sự kiện
          </div>
          {pendingCount > 0 && (
            <span className="admin-badge badge-pending">
              <Clock size={11} /> {pendingCount} chờ duyệt
            </span>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="admin-filter-tabs">
          <button
            className={`filter-tab ${tab === 'pending' ? 'active' : ''}`}
            onClick={() => setTab('pending')}
          >
            <Clock size={14} /> Chờ duyệt
            {pendingCount > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 99, marginLeft: 2 }}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            className={`filter-tab ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            <Calendar size={14} /> Tất cả
          </button>
        </div>

        <div className="admin-search-bar">
          <Search size={15} className="search-icon" />
          <input
            placeholder="Tìm kiếm sự kiện..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="admin-page-loading">
          <div className="spinner" />
          <p>Đang tải sự kiện...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-page-empty">
          <Calendar size={48} />
          <p>{search ? 'Không tìm thấy sự kiện' : 'Không có sự kiện nào'}</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sự kiện</th>
                <th>Thời gian</th>
                <th>Địa điểm</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ev => (
                <tr key={ev.suKienID}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 10, overflow: 'hidden',
                        background: 'rgba(99,102,241,0.12)', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.15)'
                      }}>
                        {ev.anhBiaUrl
                          ? <img src={ev.anhBiaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Calendar size={18} />
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13.5, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.tenSuKien}
                        </div>
                        {ev.moTa && (
                          <div style={{ fontSize: 12, color: '#6b7694', marginTop: 2, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ev.moTa}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: '#c4ccdf' }}>
                      {new Date(ev.thoiGianBatDau).toLocaleDateString('vi-VN')}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#6b7694', marginTop: 2 }}>
                      → {new Date(ev.thoiGianKetThuc).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td>
                    {ev.diaDiemID ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#8892aa' }}>
                        <MapPin size={12} /> #{ev.diaDiemID}
                      </span>
                    ) : <span style={{ color: '#4a5270', fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    <span className={`admin-badge ${STATUS_MAP[ev.trangThai]?.cls}`}>
                      {STATUS_MAP[ev.trangThai]?.label}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {ev.trangThai === 0 && (
                        <>
                          <button
                            className="admin-icon-btn edit"
                            title="Duyệt"
                            onClick={() => handleApprove(ev.suKienID)}
                            disabled={processingId === ev.suKienID}
                          >
                            <Check size={15} />
                          </button>
                          <button
                            className="admin-icon-btn delete"
                            title="Từ chối"
                            onClick={() => handleReject(ev.suKienID)}
                            disabled={processingId === ev.suKienID}
                          >
                            <X size={15} />
                          </button>
                        </>
                      )}
                      {ev.trangThai !== 0 && (
                        <button className="admin-icon-btn edit" title="Xem" style={{ opacity: 0.5, cursor: 'default' }}>
                          <Eye size={15} />
                        </button>
                      )}
                    </div>
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
