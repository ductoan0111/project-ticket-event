import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizerService } from '../../services/organizer.service';
import type { OrgEvent, TongQuanBaoCao, DoanhThuTheoNgay, LoaiVeBanChay } from '../../services/organizer.service';
import './OrganizerReports.css';

export default function OrganizerReports() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number>(0);
  const [tongQuan, setTongQuan] = useState<TongQuanBaoCao | null>(null);
  const [doanhThu, setDoanhThu] = useState<DoanhThuTheoNgay[]>([]);
  const [loaiVeBanChay, setLoaiVeBanChay] = useState<LoaiVeBanChay[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId > 0) loadReport();
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      const data = await organizerService.getMyEvents();
      setEvents(data);
      if (data.length > 0) setSelectedEventId(data[0].suKienID);
    } catch {
      setError('Không thể tải danh sách sự kiện');
    } finally {
      setEventsLoading(false);
    }
  };

  const loadReport = async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      setError(null);
      const [tq, dt, lv] = await Promise.all([
        organizerService.getTongQuan(selectedEventId).catch(() => null),
        organizerService.getDoanhThuTheoNgay(selectedEventId).catch(() => []),
        organizerService.getLoaiVeBanChay(selectedEventId).catch(() => []),
      ]);
      setTongQuan(tq);
      setDoanhThu(Array.isArray(dt) ? dt : []);
      setLoaiVeBanChay(Array.isArray(lv) ? lv : []);
    } catch {
      setError('Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) =>
    n?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) ?? '0 ₫';

  const formatDate = (s: string) => {
    try { return new Date(s).toLocaleDateString('vi-VN'); } catch { return s; }
  };

  const maxDoanhThu = Math.max(...doanhThu.map(d => d.doanhThu), 1);

  return (
    <div className="org-reports">
      <div className="rpt-header">
        <div>
          <h1 className="rpt-title">📊 Báo cáo & Thống kê</h1>
          <p className="rpt-subtitle">Phân tích doanh thu và hiệu quả sự kiện</p>
        </div>
        <button className="rpt-back-btn" onClick={() => navigate('/organizer')}>
          ← Dashboard
        </button>
      </div>

      {/* Event Selector */}
      <div className="rpt-event-selector">
        <label>Chọn sự kiện:</label>
        {eventsLoading ? (
          <div className="rpt-select-loading">Đang tải sự kiện...</div>
        ) : (
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(Number(e.target.value))}
            className="rpt-select"
          >
            <option value={0}>-- Chọn sự kiện --</option>
            {events.map(ev => (
              <option key={ev.suKienID} value={ev.suKienID}>{ev.tenSuKien}</option>
            ))}
          </select>
        )}
      </div>

      {error && <div className="rpt-error">⚠️ {error}</div>}

      {loading && (
        <div className="rpt-loading">
          <div className="rpt-spinner" />
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {!loading && selectedEventId > 0 && (
        <>
          {/* Tổng quan */}
          <div className="rpt-section">
            <h2 className="rpt-section-title">Tổng quan</h2>
            {tongQuan ? (
              <div className="rpt-stats-grid">
                <div className="rpt-stat-card revenue">
                  <div className="rpt-stat-icon">💰</div>
                  <div className="rpt-stat-info">
                    <span className="rpt-stat-value">{formatCurrency(tongQuan.tongDoanhThu)}</span>
                    <span className="rpt-stat-label">Tổng doanh thu</span>
                  </div>
                </div>
                <div className="rpt-stat-card tickets">
                  <div className="rpt-stat-icon">🎫</div>
                  <div className="rpt-stat-info">
                    <span className="rpt-stat-value">{tongQuan.tongVeDaBan}</span>
                    <span className="rpt-stat-label">Vé đã bán</span>
                  </div>
                </div>
                <div className="rpt-stat-card orders">
                  <div className="rpt-stat-icon">📋</div>
                  <div className="rpt-stat-info">
                    <span className="rpt-stat-value">{tongQuan.tongDonHang}</span>
                    <span className="rpt-stat-label">Đơn hàng</span>
                  </div>
                </div>
                <div className="rpt-stat-card buyers">
                  <div className="rpt-stat-icon">👥</div>
                  <div className="rpt-stat-info">
                    <span className="rpt-stat-value">{tongQuan.tongNguoiMua}</span>
                    <span className="rpt-stat-label">Người mua</span>
                  </div>
                </div>
                <div className="rpt-stat-card checkin">
                  <div className="rpt-stat-icon">✅</div>
                  <div className="rpt-stat-info">
                    <span className="rpt-stat-value">{tongQuan.tongCheckIn}</span>
                    <span className="rpt-stat-label">Check-in</span>
                  </div>
                </div>
                <div className="rpt-stat-card rate">
                  <div className="rpt-stat-icon">📈</div>
                  <div className="rpt-stat-info">
                    <span className="rpt-stat-value">{tongQuan.tyLeCheckIn?.toFixed(1)}%</span>
                    <span className="rpt-stat-label">Tỷ lệ check-in</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rpt-no-data">Chưa có dữ liệu tổng quan</div>
            )}
          </div>

          {/* Biểu đồ doanh thu */}
          <div className="rpt-section">
            <h2 className="rpt-section-title">Doanh thu theo ngày</h2>
            {doanhThu.length === 0 ? (
              <div className="rpt-no-data">Chưa có dữ liệu doanh thu</div>
            ) : (
              <div className="rpt-chart-container">
                <div className="rpt-bar-chart">
                  {doanhThu.slice(-14).map((d, i) => (
                    <div key={i} className="rpt-bar-col">
                      <div className="rpt-bar-value">{formatCurrency(d.doanhThu)}</div>
                      <div
                        className="rpt-bar"
                        style={{ height: `${(d.doanhThu / maxDoanhThu) * 200}px` }}
                        title={`${formatDate(d.ngay)}: ${formatCurrency(d.doanhThu)}`}
                      />
                      <div className="rpt-bar-label">{formatDate(d.ngay)}</div>
                    </div>
                  ))}
                </div>
                <div className="rpt-chart-summary">
                  <div className="rpt-chart-row">
                    <span>Tổng doanh thu (hiển thị):</span>
                    <strong>{formatCurrency(doanhThu.reduce((s, d) => s + d.doanhThu, 0))}</strong>
                  </div>
                  <div className="rpt-chart-row">
                    <span>Tổng vé bán (hiển thị):</span>
                    <strong>{doanhThu.reduce((s, d) => s + d.soVe, 0)} vé</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loại vé bán chạy */}
          <div className="rpt-section">
            <h2 className="rpt-section-title">Phân tích loại vé</h2>
            {loaiVeBanChay.length === 0 ? (
              <div className="rpt-no-data">Chưa có dữ liệu loại vé</div>
            ) : (
              <div className="rpt-table-wrapper">
                <table className="rpt-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Loại vé</th>
                      <th>Số lượng bán</th>
                      <th>Doanh thu</th>
                      <th>Tỷ lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaiVeBanChay.map((lv, i) => (
                      <tr key={lv.loaiVeID}>
                        <td className="rpt-td-center">{i + 1}</td>
                        <td className="rpt-td-name">{lv.tenLoaiVe}</td>
                        <td className="rpt-td-center">{lv.soLuongBan}</td>
                        <td className="rpt-td-money">{formatCurrency(lv.doanhThu)}</td>
                        <td className="rpt-td-percent">
                          <div className="rpt-percent-bar">
                            <div
                              className="rpt-percent-fill"
                              style={{ width: `${Math.min(lv.phanTram, 100)}%` }}
                            />
                          </div>
                          <span>{lv.phanTram?.toFixed(1)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!loading && selectedEventId === 0 && (
        <div className="rpt-placeholder">
          <span>📊</span>
          <p>Chọn một sự kiện để xem báo cáo chi tiết</p>
        </div>
      )}
    </div>
  );
}
