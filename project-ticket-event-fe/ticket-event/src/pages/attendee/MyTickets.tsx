import { useState, useEffect, useRef } from 'react';
import {
  Ticket as TicketIcon, Calendar, MapPin,
  X, Download, Search, ChevronDown
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import type { Ticket } from '../../services/ticket.service';
import './MyTickets.css';

const STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Chưa sử dụng', color: '#6c63ff', bg: 'rgba(108,99,255,0.1)' },
  1: { label: 'Đã check-in',   color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  2: { label: 'Đã hủy',        color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
};

export default function MyTickets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadTickets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadTickets = async () => {
    if (!user?.nguoiDungId) return;
    try {
      setLoading(true);
      const response = await ticketService.getMyTickets(user.nguoiDungId);
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (maVe: string) => {
    if (!user?.nguoiDungId) return;
    if (!confirm('Bạn có chắc muốn hủy vé này? Hành động này không thể hoàn tác.')) return;
    try {
      setCancelling(maVe);
      await ticketService.cancelTicket(maVe, user.nguoiDungId);
      await loadTickets();
      if (selectedTicket?.maVe === maVe) setSelectedTicket(null);
    } catch {
      alert('Không thể hủy vé. Vui lòng thử lại.');
    } finally {
      setCancelling(null);
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current || !selectedTicket) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement('a');
      link.download = `ve-${selectedTicket.maVe}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Filter + search
  const filtered = tickets
    .filter(t => filter === 'all' || t.trangThai === filter)
    .filter(t =>
      search === '' ||
      t.maVe.toLowerCase().includes(search.toLowerCase()) ||
      String(t.donHangID).includes(search)
    );

  const counts = {
    all: tickets.length,
    0: tickets.filter(t => t.trangThai === 0).length,
    1: tickets.filter(t => t.trangThai === 1).length,
    2: tickets.filter(t => t.trangThai === 2).length,
  };

  if (loading) {
    return (
      <div className="mt-loading">
        <div className="mt-spinner" />
        <p>Đang tải vé của bạn...</p>
      </div>
    );
  }

  return (
    <div className="mt-root">
      {/* Header */}
      <div className="mt-header">
        <div>
          <h1 className="mt-title">🎫 Vé của tôi</h1>
          <p className="mt-subtitle">{tickets.length} vé đã mua</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-controls">
        {/* Search */}
        <div className="mt-search-wrap">
          <Search size={16} className="mt-search-icon" />
          <input
            type="text"
            className="mt-search"
            placeholder="Tìm theo mã vé, đơn hàng..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="mt-tabs">
          {(['all', 0, 1, 2] as const).map(key => {
            const label = key === 'all' ? 'Tất cả' : STATUS_MAP[key].label;
            return (
              <button
                key={key}
                className={`mt-tab ${filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key)}
                style={filter === key && key !== 'all'
                  ? { color: STATUS_MAP[key].color, borderColor: STATUS_MAP[key].color }
                  : {}}
              >
                {label}
                <span className="mt-count">{counts[key === 'all' ? 'all' : key]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="mt-empty">
          <TicketIcon size={64} />
          <h3>{search ? 'Không tìm thấy vé phù hợp' : 'Chưa có vé nào'}</h3>
          <p>{search ? 'Thử tìm kiếm với từ khóa khác' : 'Đặt vé ngay để khám phá các sự kiện hấp dẫn!'}</p>
          {!search && (
            <button className="mt-btn-explore" onClick={() => navigate('/attendee')}>
              Khám phá sự kiện
            </button>
          )}
        </div>
      ) : (
        <div className="mt-grid">
          {filtered.map(ticket => {
            const status = STATUS_MAP[ticket.trangThai] ?? STATUS_MAP[0];
            return (
              <div
                key={ticket.veID}
                className="mt-card"
                onClick={() => setSelectedTicket(ticket)}
              >
                {/* Card header strip */}
                <div className="mt-card-strip" style={{ background: status.color }} />

                <div className="mt-card-body">
                  {/* Top row */}
                  <div className="mt-card-top">
                    <div>
                      <div className="mt-card-code">
                        <TicketIcon size={14} />
                        <span>{ticket.maVe}</span>
                      </div>
                      <div className="mt-card-order">Đơn hàng #{ticket.donHangID}</div>
                    </div>
                    <span className="mt-status-pill" style={{ color: status.color, background: status.bg }}>
                      {status.label}
                    </span>
                  </div>

                  {/* QR Preview */}
                  <div className="mt-qr-wrap">
                    <QRCodeSVG
                      value={ticket.qrToken}
                      size={100}
                      level="M"
                      fgColor={ticket.trangThai === 2 ? '#94a3b8' : '#1e293b'}
                    />
                    {ticket.trangThai === 1 && <div className="mt-qr-used-overlay">ĐÃ DÙNG</div>}
                    {ticket.trangThai === 2 && <div className="mt-qr-cancelled-overlay">HỦY</div>}
                  </div>

                  {/* Info */}
                  <div className="mt-card-info">
                    <div className="mt-card-info-row">
                      <Calendar size={13} />
                      <span>Đơn hàng #{ticket.donHangID}</span>
                    </div>
                    <div className="mt-card-info-row">
                      <MapPin size={13} />
                      <span>Loại vé #{ticket.loaiVeID}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-card-actions">
                    <button className="mt-btn-detail" onClick={e => { e.stopPropagation(); setSelectedTicket(ticket); }}>
                      Xem QR <ChevronDown size={14} />
                    </button>
                    {ticket.trangThai === 0 && (
                      <button
                        className="mt-btn-cancel"
                        disabled={cancelling === ticket.maVe}
                        onClick={e => { e.stopPropagation(); handleCancelTicket(ticket.maVe); }}
                      >
                        <X size={13} />
                        {cancelling === ticket.maVe ? 'Đang hủy...' : 'Hủy vé'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Modal */}
      {selectedTicket && (
        <div className="mt-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="mt-modal" onClick={e => e.stopPropagation()}>
            <div className="mt-modal-header">
              <h2>Mã QR vé</h2>
              <button className="mt-modal-close" onClick={() => setSelectedTicket(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="mt-modal-body">
              {/* Status */}
              <div
                className="mt-modal-status"
                style={{
                  color: STATUS_MAP[selectedTicket.trangThai]?.color,
                  background: STATUS_MAP[selectedTicket.trangThai]?.bg,
                }}
              >
                {STATUS_MAP[selectedTicket.trangThai]?.label}
              </div>

              {/* QR Code */}
              <div className="mt-qr-large" ref={qrRef}>
                <QRCodeSVG
                  value={selectedTicket.qrToken}
                  size={220}
                  level="H"
                  includeMargin
                  fgColor={selectedTicket.trangThai === 2 ? '#94a3b8' : '#1e293b'}
                />
              </div>

              {/* Token */}
              <div className="mt-qr-token">
                <code>{selectedTicket.qrToken}</code>
              </div>

              {/* Details */}
              <div className="mt-modal-details">
                <div className="mt-modal-detail-row">
                  <span>Mã vé</span>
                  <strong>{selectedTicket.maVe}</strong>
                </div>
                <div className="mt-modal-detail-row">
                  <span>Đơn hàng</span>
                  <strong>#{selectedTicket.donHangID}</strong>
                </div>
                <div className="mt-modal-detail-row">
                  <span>Trạng thái</span>
                  <strong style={{ color: STATUS_MAP[selectedTicket.trangThai]?.color }}>
                    {STATUS_MAP[selectedTicket.trangThai]?.label}
                  </strong>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-modal-actions">
                <button className="mt-modal-btn download" onClick={handleDownloadQR}>
                  <Download size={16} /> Tải QR Code
                </button>
                {selectedTicket.trangThai === 0 && (
                  <button
                    className="mt-modal-btn cancel"
                    disabled={cancelling === selectedTicket.maVe}
                    onClick={() => handleCancelTicket(selectedTicket.maVe)}
                  >
                    <X size={16} />
                    {cancelling === selectedTicket.maVe ? 'Đang hủy...' : 'Hủy vé'}
                  </button>
                )}
              </div>

              {selectedTicket.trangThai === 0 && (
                <p className="mt-modal-note">
                  📌 Xuất trình mã QR này tại cửa vào để check-in
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
