import { useState, useEffect } from 'react';
import { Calendar, MapPin, Check, X, Clock } from 'lucide-react';
import { adminService } from '../services/admin.service';
import type { OrgEvent } from '../services/organizer.service';
import './AdminEvents.css';

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: 'Chờ duyệt', className: 'pending' },
  1: { label: 'Đang mở bán', className: 'active' },
  2: { label: 'Đã kết thúc', className: 'ended' },
  3: { label: 'Đã huỷ', className: 'cancelled' },
  5: { label: 'Bị từ chối', className: 'rejected' },
};

export default function AdminEvents() {
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadEvents();
  }, [filter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = filter === 'pending' 
        ? await adminService.getPendingEvents()
        : await adminService.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Bạn có chắc muốn duyệt sự kiện này?')) return;
    
    try {
      setProcessingId(id);
      await adminService.approveEvent(id);
      await loadEvents();
    } catch (error) {
      console.error('Failed to approve event:', error);
      alert('Không thể duyệt sự kiện');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Bạn có chắc muốn từ chối sự kiện này?')) return;
    
    try {
      setProcessingId(id);
      await adminService.rejectEvent(id);
      await loadEvents();
    } catch (error) {
      console.error('Failed to reject event:', error);
      alert('Không thể từ chối sự kiện');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-events-loading">
        <div className="spinner"></div>
        <p>Đang tải sự kiện...</p>
      </div>
    );
  }

  return (
    <div className="admin-events">
      <div className="admin-events-header">
        <div>
          <h1>Quản lý sự kiện</h1>
          <p>Duyệt và quản lý các sự kiện</p>
        </div>
        <div className="admin-events-filters">
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <Clock size={16} />
            Chờ duyệt
          </button>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <Calendar size={16} />
            Tất cả
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="admin-events-empty">
          <Calendar size={48} />
          <p>Không có sự kiện nào</p>
        </div>
      ) : (
        <div className="admin-events-list">
          {events.map((event) => (
            <div key={event.suKienID} className="admin-event-card">
              <div className="admin-event-image">
                {event.anhBiaUrl ? (
                  <img src={event.anhBiaUrl} alt={event.tenSuKien} />
                ) : (
                  <div className="admin-event-placeholder">
                    <Calendar size={32} />
                  </div>
                )}
              </div>
              
              <div className="admin-event-content">
                <div className="admin-event-header">
                  <h3>{event.tenSuKien}</h3>
                  <span className={`admin-event-status ${STATUS_MAP[event.trangThai]?.className || ''}`}>
                    {STATUS_MAP[event.trangThai]?.label || 'Không xác định'}
                  </span>
                </div>
                
                <p className="admin-event-description">{event.moTa || 'Không có mô tả'}</p>
                
                <div className="admin-event-meta">
                  <div className="admin-event-meta-item">
                    <Calendar size={16} />
                    <span>{new Date(event.thoiGianBatDau).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {event.diaDiemID && (
                    <div className="admin-event-meta-item">
                      <MapPin size={16} />
                      <span>Địa điểm #{event.diaDiemID}</span>
                    </div>
                  )}
                </div>

                {event.trangThai === 0 && (
                  <div className="admin-event-actions">
                    <button
                      className="admin-btn approve"
                      onClick={() => handleApprove(event.suKienID)}
                      disabled={processingId === event.suKienID}
                    >
                      <Check size={16} />
                      Duyệt
                    </button>
                    <button
                      className="admin-btn reject"
                      onClick={() => handleReject(event.suKienID)}
                      disabled={processingId === event.suKienID}
                    >
                      <X size={16} />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
