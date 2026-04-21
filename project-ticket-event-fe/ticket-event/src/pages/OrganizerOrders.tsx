import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizerService } from '../services/organizer.service';
import type { OrgEvent, OrgDonHang, OrgDonHangDetail, ThongKeDonHang } from '../services/organizer.service';
import './OrganizerOrders.css';

const TRANG_THAI_MAP: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Chờ thanh toán', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  1: { label: 'Đã thanh toán', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  2: { label: 'Đã hủy', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  3: { label: 'Hoàn tiền', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
};

export default function OrganizerOrders() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number>(0);
  const [orders, setOrders] = useState<OrgDonHang[]>([]);
  const [thongKe, setThongKe] = useState<ThongKeDonHang | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrgDonHangDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId > 0) loadOrders();
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const data = await organizerService.getMyEvents();
      setEvents(data);
      if (data.length > 0) setSelectedEventId(data[0].suKienID);
    } catch { /* silent */ }
  };

  const loadOrders = async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      const [ords, tk] = await Promise.all([
        organizerService.getDonHangBySuKien(selectedEventId).catch(() => []),
        organizerService.getThongKeDonHang(selectedEventId).catch(() => null),
      ]);
      setOrders(Array.isArray(ords) ? ords : []);
      setThongKe(tk);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const openDetail = async (dh: OrgDonHang) => {
    try {
      setDetailLoading(true);
      const detail = await organizerService.getDonHangDetail(dh.donHangID, selectedEventId);
      setSelectedOrder(detail);
    } catch { /* silent */ }
    finally { setDetailLoading(false); }
  };

  const filteredOrders = orders.filter(o => {
    const matchStatus = filterStatus === undefined || o.trangThai === filterStatus;
    const matchSearch = !searchText ||
      o.donHangID.toString().includes(searchText) ||
      (o.tenNguoiDung ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
      (o.email ?? '').toLowerCase().includes(searchText.toLowerCase());
    return matchStatus && matchSearch;
  });

  const formatCurrency = (n: number) =>
    n?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) ?? '0 ₫';

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return s; }
  };

  return (
    <div className="org-orders">
      <div className="ord-header">
        <div>
          <h1 className="ord-title">📋 Quản lý Đơn hàng</h1>
          <p className="ord-subtitle">Theo dõi tất cả đơn hàng của sự kiện</p>
        </div>
        <button className="ord-back-btn" onClick={() => navigate('/organizer')}>
          ← Dashboard
        </button>
      </div>

      {/* Event selector */}
      <div className="ord-event-selector">
        <label>Sự kiện:</label>
        <select
          value={selectedEventId}
          onChange={e => setSelectedEventId(Number(e.target.value))}
          className="ord-select"
        >
          <option value={0}>-- Chọn sự kiện --</option>
          {events.map(ev => (
            <option key={ev.suKienID} value={ev.suKienID}>{ev.tenSuKien}</option>
          ))}
        </select>
      </div>

      {/* Thống kê */}
      {thongKe && (
        <div className="ord-stats">
          <div className="ord-stat-card">
            <span className="ord-stat-icon">📋</span>
            <span className="ord-stat-value">{thongKe.tongDonHang}</span>
            <span className="ord-stat-label">Tổng đơn</span>
          </div>
          <div className="ord-stat-card success">
            <span className="ord-stat-icon">✅</span>
            <span className="ord-stat-value">{thongKe.donHangThanhCong}</span>
            <span className="ord-stat-label">Thành công</span>
          </div>
          <div className="ord-stat-card cancel">
            <span className="ord-stat-icon">❌</span>
            <span className="ord-stat-value">{thongKe.donHangHuy}</span>
            <span className="ord-stat-label">Đã hủy</span>
          </div>
          <div className="ord-stat-card revenue">
            <span className="ord-stat-icon">💰</span>
            <span className="ord-stat-value">{formatCurrency(thongKe.tongDoanhThu)}</span>
            <span className="ord-stat-label">Doanh thu</span>
          </div>
        </div>
      )}

      {/* Filters */}
      {selectedEventId > 0 && (
        <div className="ord-filters">
          <input
            type="text"
            className="ord-search"
            placeholder="🔍 Tìm theo mã đơn, tên, email..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <div className="ord-status-filters">
            <button
              className={`ord-filter-btn ${filterStatus === undefined ? 'active' : ''}`}
              onClick={() => setFilterStatus(undefined)}
            >
              Tất cả ({orders.length})
            </button>
            {Object.entries(TRANG_THAI_MAP).map(([key, s]) => (
              <button
                key={key}
                className={`ord-filter-btn ${filterStatus === Number(key) ? 'active' : ''}`}
                style={filterStatus === Number(key) ? { borderColor: s.color, color: s.color } : {}}
                onClick={() => setFilterStatus(filterStatus === Number(key) ? undefined : Number(key))}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="ord-loading">
          <div className="ord-spinner" />
          <p>Đang tải đơn hàng...</p>
        </div>
      ) : selectedEventId === 0 ? (
        <div className="ord-placeholder">
          <span>📋</span>
          <p>Chọn sự kiện để xem đơn hàng</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="ord-empty">
          <span>📭</span>
          <p>Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="ord-table-wrapper">
          <table className="ord-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => {
                const s = TRANG_THAI_MAP[o.trangThai] ?? TRANG_THAI_MAP[0];
                return (
                  <tr key={o.donHangID}>
                    <td className="ord-td-id">#{o.donHangID}</td>
                    <td className="ord-td-name">
                      <div className="ord-customer">
                        <span className="ord-customer-avatar">
                          {(o.tenNguoiDung ?? 'K').charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p>{o.tenNguoiDung ?? 'Không rõ'}</p>
                          <small>{o.email ?? '—'}</small>
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(o.ngayDat)}</td>
                    <td className="ord-td-money">{formatCurrency(o.tongTien)}</td>
                    <td>{o.phuongThucThanhToan ?? '—'}</td>
                    <td>
                      <span
                        className="ord-status-badge"
                        style={{ color: s.color, background: s.bg }}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td>
                      <button
                        className="ord-btn-detail"
                        onClick={() => openDetail(o)}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {(selectedOrder || detailLoading) && (
        <div className="ord-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="ord-modal" onClick={e => e.stopPropagation()}>
            <div className="ord-modal-header">
              <h2>Chi tiết đơn hàng {selectedOrder ? `#${selectedOrder.donHangID}` : ''}</h2>
              <button className="ord-modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            {detailLoading ? (
              <div className="ord-modal-loading"><div className="ord-spinner" /></div>
            ) : selectedOrder ? (
              <div className="ord-modal-body">
                <div className="ord-detail-grid">
                  <div className="ord-detail-item">
                    <label>Mã đơn hàng</label>
                    <span>#{selectedOrder.donHangID}</span>
                  </div>
                  <div className="ord-detail-item">
                    <label>Khách hàng</label>
                    <span>{selectedOrder.tenNguoiDung ?? 'Không rõ'}</span>
                  </div>
                  <div className="ord-detail-item">
                    <label>Email</label>
                    <span>{selectedOrder.email ?? '—'}</span>
                  </div>
                  <div className="ord-detail-item">
                    <label>Ngày đặt</label>
                    <span>{formatDate(selectedOrder.ngayDat)}</span>
                  </div>
                  <div className="ord-detail-item">
                    <label>Tổng tiền</label>
                    <span className="ord-detail-money">{formatCurrency(selectedOrder.tongTien)}</span>
                  </div>
                  <div className="ord-detail-item">
                    <label>Trạng thái</label>
                    <span
                      className="ord-status-badge"
                      style={{
                        color: TRANG_THAI_MAP[selectedOrder.trangThai]?.color,
                        background: TRANG_THAI_MAP[selectedOrder.trangThai]?.bg
                      }}
                    >
                      {TRANG_THAI_MAP[selectedOrder.trangThai]?.label ?? 'Không rõ'}
                    </span>
                  </div>
                </div>
                {selectedOrder.chiTiet && (selectedOrder.chiTiet as unknown[]).length > 0 && (
                  <div className="ord-detail-section">
                    <h3>Chi tiết vé</h3>
                    <pre className="ord-detail-json">
                      {JSON.stringify(selectedOrder.chiTiet, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
