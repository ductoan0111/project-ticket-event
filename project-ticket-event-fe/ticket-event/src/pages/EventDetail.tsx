import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Ticket, Heart, Share2,
  ArrowLeft, Users, AlertCircle, CheckCircle,
  X, ShoppingCart, Tag, Info, ExternalLink
} from 'lucide-react';
import eventService from '../services/event.service';
import favoriteService from '../services/favorite.service';
import { ticketTypeService } from '../services/ticketType.service';
import { useAuth } from '../context/AuthContext';
import type { EventDetail } from '../services/event.service';
import type { TicketType } from '../services/ticketType.service';
import './EventDetail.css';

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [selectedTickets, setSelectedTickets] = useState<Map<number, number>>(new Map());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'tickets'>('info');

  useEffect(() => {
    if (id) loadEventDetail(parseInt(id));
  }, [id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadEventDetail = async (eventId: number) => {
    try {
      setLoading(true);
      const [detail, ticketTypesResponse, isFav, count] = await Promise.all([
        eventService.getEventDetail(eventId),
        ticketTypeService.getByEventId(eventId, true),
        favoriteService.checkFavorite(eventId).catch(() => false),
        favoriteService.getFavoriteCount(eventId).catch(() => 0),
      ]);
      setEvent(detail);
      setTicketTypes(ticketTypesResponse.data);
      setIsFavorite(isFav);
      setFavoriteCount(count);
    } catch (error) {
      console.error('Error loading event detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      showToast('Vui lòng đăng nhập để yêu thích sự kiện');
      return;
    }
    if (!id) return;
    try {
      const isNowFavorite = await favoriteService.toggleFavorite(parseInt(id));
      setIsFavorite(isNowFavorite);
      const newCount = await favoriteService.getFavoriteCount(parseInt(id));
      setFavoriteCount(newCount);
      showToast(isNowFavorite ? '❤️ Đã thêm vào yêu thích' : 'Đã bỏ yêu thích');
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event?.tenSuKien, text: event?.moTa || '', url });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(url);
      showToast('✅ Đã copy link sự kiện!');
    }
  };

  const handleTicketQuantityChange = (loaiVeId: number, quantity: number) => {
    if (!user) {
      showToast('Vui lòng đăng nhập để đặt vé');
      navigate('/login');
      return;
    }
    const newSelected = new Map(selectedTickets);
    if (quantity <= 0) newSelected.delete(loaiVeId);
    else newSelected.set(loaiVeId, quantity);
    setSelectedTickets(newSelected);
  };

  const handleBookTickets = () => {
    if (!user) {
      showToast('Vui lòng đăng nhập để đặt vé');
      navigate('/login');
      return;
    }
    if (selectedTickets.size === 0) {
      showToast('Vui lòng chọn ít nhất 1 loại vé');
      return;
    }
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    const ticketData = Array.from(selectedTickets.entries()).map(([loaiVeId, quantity]) => ({
      loaiVeId,
      quantity,
    }));
    navigate(`/checkout/${id}`, { state: { tickets: ticketData } });
  };

  const calculateTotal = () => {
    let total = 0;
    selectedTickets.forEach((quantity, loaiVeId) => {
      const loaiVe = ticketTypes.find(lv => lv.loaiVeID === loaiVeId);
      if (loaiVe) total += loaiVe.donGia * quantity;
    });
    return total;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const getDuration = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0 && mins > 0) return `${hours}h ${mins}p`;
    if (hours > 0) return `${hours} giờ`;
    return `${mins} phút`;
  };

  if (loading) {
    return (
      <div className="ed-loading">
        <div className="ed-spinner" />
        <p>Đang tải thông tin sự kiện...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="ed-not-found">
        <AlertCircle size={64} />
        <h2>Không tìm thấy sự kiện</h2>
        <p>Sự kiện này có thể đã bị xóa hoặc không tồn tại.</p>
        <button onClick={() => navigate('/attendee')} className="ed-btn-back">
          ← Về trang chủ
        </button>
      </div>
    );
  }

  const totalTicketsSelected = Array.from(selectedTickets.values()).reduce((s, q) => s + q, 0);
  const minPrice = ticketTypes.length > 0 ? Math.min(...ticketTypes.map(t => t.donGia)) : 0;
  const totalAvailable = ticketTypes.reduce((s, t) => s + t.soLuongCon, 0);
  const isSoldOut = totalAvailable === 0 && ticketTypes.length > 0;

  return (
    <div className="ed-root">
      {/* Toast */}
      {toast && <div className="ed-toast">{toast}</div>}

      {/* Top Bar */}
      <div className="ed-topbar">
        <button onClick={() => navigate(-1)} className="ed-btn-nav">
          <ArrowLeft size={18} /> Quay lại
        </button>
        <div className="ed-topbar-actions">
          <button
            onClick={handleToggleFavorite}
            className={`ed-btn-icon ${isFavorite ? 'active' : ''}`}
            title="Yêu thích"
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            <span>{favoriteCount}</span>
          </button>
          <button onClick={handleShare} className="ed-btn-icon" title="Chia sẻ">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="ed-hero">
        <img
          src={event.anhBiaUrl || `https://picsum.photos/seed/${event.suKienID}/1200/500`}
          alt={event.tenSuKien}
          className="ed-hero-img"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${event.suKienID}/1200/500`;
          }}
        />
        <div className="ed-hero-overlay">
          <div className="ed-hero-content">
            {event.tenDanhMuc && (
              <span className="ed-category-badge">
                <Tag size={13} /> {event.tenDanhMuc}
              </span>
            )}
            <h1 className="ed-title">{event.tenSuKien}</h1>
            <div className="ed-hero-meta">
              <span><Calendar size={15} /> {formatDate(event.thoiGianBatDau)}</span>
              <span><Clock size={15} /> {formatTime(event.thoiGianBatDau)}</span>
              {event.tenDiaDiem && <span><MapPin size={15} /> {event.tenDiaDiem}</span>}
            </div>
          </div>
        </div>
        {isSoldOut && <div className="ed-sold-out-ribbon">HẾT VÉ</div>}
      </div>

      {/* Quick Info Bar */}
      <div className="ed-info-bar">
        <div className="ed-info-item">
          <Calendar size={18} />
          <div>
            <span className="ed-info-label">Ngày diễn ra</span>
            <span className="ed-info-value">{formatDate(event.thoiGianBatDau)}</span>
          </div>
        </div>
        <div className="ed-info-divider" />
        <div className="ed-info-item">
          <Clock size={18} />
          <div>
            <span className="ed-info-label">Thời gian</span>
            <span className="ed-info-value">
              {formatTime(event.thoiGianBatDau)} – {formatTime(event.thoiGianKetThuc)}
              {event.thoiGianKetThuc && (
                <em> ({getDuration(event.thoiGianBatDau, event.thoiGianKetThuc)})</em>
              )}
            </span>
          </div>
        </div>
        <div className="ed-info-divider" />
        <div className="ed-info-item">
          <MapPin size={18} />
          <div>
            <span className="ed-info-label">Địa điểm</span>
            <span className="ed-info-value">{event.tenDiaDiem || 'Chưa xác định'}</span>
          </div>
        </div>
        {minPrice > 0 && (
          <>
            <div className="ed-info-divider" />
            <div className="ed-info-item">
              <Ticket size={18} />
              <div>
                <span className="ed-info-label">Giá từ</span>
                <span className="ed-info-value highlight">{formatCurrency(minPrice)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Layout */}
      <div className="ed-layout">
        {/* Left: Content */}
        <div className="ed-content">
          {/* Tabs */}
          <div className="ed-tabs">
            <button
              className={`ed-tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <Info size={16} /> Thông tin
            </button>
            <button
              className={`ed-tab ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              <Ticket size={16} /> Đặt vé
              {ticketTypes.length > 0 && <span className="ed-tab-badge">{ticketTypes.length}</span>}
            </button>
          </div>

          {/* Tab: Info */}
          {activeTab === 'info' && (
            <div className="ed-tab-content">
              {/* Mô tả */}
              <section className="ed-section">
                <h2 className="ed-section-title">📝 Mô tả sự kiện</h2>
                <p className="ed-description">{event.moTa || 'Chưa có mô tả cho sự kiện này.'}</p>
              </section>

              {/* Địa điểm */}
              {event.tenDiaDiem && (
                <section className="ed-section">
                  <h2 className="ed-section-title">📍 Địa điểm</h2>
                  <div className="ed-location-card">
                    <div className="ed-location-info">
                      <h3>{event.tenDiaDiem}</h3>
                      {(event as EventDetail & { diaChi?: string }).diaChi && (
                        <p><MapPin size={14} /> {(event as EventDetail & { diaChi?: string }).diaChi}</p>
                      )}
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(event.tenDiaDiem)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ed-btn-map"
                    >
                      <ExternalLink size={14} /> Xem bản đồ
                    </a>
                  </div>
                </section>
              )}

              {/* Thống kê vé */}
              {ticketTypes.length > 0 && (
                <section className="ed-section">
                  <h2 className="ed-section-title">🎫 Tình trạng vé</h2>
                  <div className="ed-ticket-summary">
                    <div className={`ed-ticket-status-badge ${isSoldOut ? 'sold-out' : 'available'}`}>
                      {isSoldOut ? (
                        <><AlertCircle size={16} /> Hết vé</>
                      ) : (
                        <><CheckCircle size={16} /> Còn {totalAvailable} vé</>
                      )}
                    </div>
                    <button
                      className="ed-btn-go-tickets"
                      onClick={() => setActiveTab('tickets')}
                    >
                      <Ticket size={16} /> Chọn vé ngay →
                    </button>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Tab: Tickets */}
          {activeTab === 'tickets' && (
            <div className="ed-tab-content">
              {!user && (
                <div className="ed-login-notice">
                  <AlertCircle size={20} />
                  <span>Vui lòng <button onClick={() => navigate('/login')}>đăng nhập</button> để đặt vé</span>
                </div>
              )}
              
              {/* So sánh loại vé */}
              {ticketTypes.length > 1 && (
                <div className="ed-ticket-compare">
                  <h3 className="ed-compare-title">📊 So sánh loại vé</h3>
                  <div className="ed-compare-table">
                    <div className="ed-compare-row header">
                      <div className="ed-compare-cell">Loại vé</div>
                      <div className="ed-compare-cell">Giá</div>
                      <div className="ed-compare-cell">Còn lại</div>
                      <div className="ed-compare-cell">Giới hạn</div>
                    </div>
                    {ticketTypes.map(lv => (
                      <div key={lv.loaiVeID} className="ed-compare-row">
                        <div className="ed-compare-cell name">
                          <strong>{lv.tenLoaiVe}</strong>
                          {lv.moTa && <small>{lv.moTa}</small>}
                        </div>
                        <div className="ed-compare-cell price">{formatCurrency(lv.donGia)}</div>
                        <div className="ed-compare-cell stock">
                          {lv.soLuongCon}/{lv.soLuongToiDa}
                          <span className={`ed-compare-badge ${lv.soLuongCon > 0 ? 'ok' : 'out'}`}>
                            {lv.soLuongCon > 0 ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="ed-compare-cell limit">
                          {lv.gioiHanMoiKhach ? `${lv.gioiHanMoiKhach} vé/người` : 'Không giới hạn'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="ed-ticket-list">
                {ticketTypes.length === 0 ? (
                  <div className="ed-no-tickets">
                    <Ticket size={48} />
                    <p>Chưa có loại vé nào được mở bán</p>
                  </div>
                ) : (
                  ticketTypes.map((lv) => {
                    const qty = selectedTickets.get(lv.loaiVeID) || 0;
                    const pct = lv.soLuongToiDa > 0
                      ? Math.round((lv.soLuongToiDa - lv.soLuongCon) / lv.soLuongToiDa * 100)
                      : 0;
                    
                    // Tính toán badges
                    const isAlmostSoldOut = lv.soLuongCon > 0 && lv.soLuongCon <= lv.soLuongToiDa * 0.1; // Còn <= 10%
                    const isHotSelling = pct >= 50 && pct < 90; // Đã bán 50-90%
                    const isEarlyBird = lv.tenLoaiVe.toLowerCase().includes('early') || lv.tenLoaiVe.toLowerCase().includes('sớm');
                    
                    // Countdown timer
                    const now = new Date();
                    const saleStart = lv.thoiGianMoBan ? new Date(lv.thoiGianMoBan) : null;
                    const saleEnd = lv.thoiGianDongBan ? new Date(lv.thoiGianDongBan) : null;
                    const isBeforeSale = saleStart && now < saleStart;
                    const isAfterSale = saleEnd && now > saleEnd;
                    
                    const getTimeRemaining = (targetDate: Date) => {
                      const diff = targetDate.getTime() - now.getTime();
                      if (diff <= 0) return null;
                      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                      if (days > 0) return `${days} ngày ${hours}h`;
                      if (hours > 0) return `${hours}h ${mins}p`;
                      return `${mins} phút`;
                    };

                    return (
                      <div key={lv.loaiVeID} className={`ed-ticket-card ${!lv.dangMoBan || !lv.conVe ? 'disabled' : ''}`}>
                        <div className="ed-ticket-left">
                          <div className="ed-ticket-deco" />
                        </div>
                        <div className="ed-ticket-body">
                          <div className="ed-ticket-top">
                            <div>
                              <div className="ed-ticket-name-row">
                                <h3 className="ed-ticket-name">{lv.tenLoaiVe}</h3>
                                <div className="ed-ticket-badges">
                                  {isEarlyBird && <span className="ed-mini-badge early">🎉 Early Bird</span>}
                                  {isHotSelling && <span className="ed-mini-badge hot">🔥 Bán chạy</span>}
                                  {isAlmostSoldOut && <span className="ed-mini-badge almost">⚠️ Sắp hết</span>}
                                </div>
                              </div>
                              {lv.moTa && <p className="ed-ticket-desc">{lv.moTa}</p>}
                              
                              {/* Countdown timer */}
                              {isBeforeSale && saleStart && (
                                <div className="ed-ticket-countdown">
                                  <Clock size={12} /> Mở bán sau: <strong>{getTimeRemaining(saleStart)}</strong>
                                </div>
                              )}
                              {!isBeforeSale && !isAfterSale && saleEnd && (
                                <div className="ed-ticket-countdown warning">
                                  <Clock size={12} /> Đóng bán sau: <strong>{getTimeRemaining(saleEnd)}</strong>
                                </div>
                              )}
                            </div>
                            <span className={`ed-ticket-badge ${lv.dangMoBan && lv.conVe ? 'sale' : 'stop'}`}>
                              {lv.trangThaiMoBan}
                            </span>
                          </div>

                          <div className="ed-ticket-stats">
                            <span className="ed-ticket-price">{formatCurrency(lv.donGia)}</span>
                            <span className="ed-ticket-remain">
                              <Users size={13} /> Còn {lv.soLuongCon}/{lv.soLuongToiDa} vé
                            </span>
                          </div>

                          {/* Progress */}
                          <div className="ed-ticket-progress">
                            <div 
                              className="ed-ticket-progress-bar" 
                              style={{ 
                                width: `${pct}%`,
                                background: isAlmostSoldOut ? 'linear-gradient(90deg, #ef4444, #f97316)' : undefined
                              }} 
                            />
                          </div>
                          <div className="ed-ticket-pct-row">
                            <span>{pct}% đã bán</span>
                            {lv.gioiHanMoiKhach && (
                              <span className="ed-ticket-limit">
                                <AlertCircle size={11} /> Tối đa {lv.gioiHanMoiKhach} vé/người
                              </span>
                            )}
                          </div>

                          {/* Quantity */}
                          {lv.dangMoBan && lv.conVe && !isBeforeSale && !isAfterSale ? (
                            <div className="ed-qty-row">
                              <button
                                className="ed-qty-btn"
                                onClick={() => handleTicketQuantityChange(lv.loaiVeID, qty - 1)}
                                disabled={qty === 0}
                              >−</button>
                              <span className="ed-qty-val">{qty}</span>
                              <button
                                className="ed-qty-btn"
                                onClick={() => handleTicketQuantityChange(lv.loaiVeID, qty + 1)}
                                disabled={qty >= lv.soLuongCon || qty >= (lv.gioiHanMoiKhach || 999)}
                              >+</button>
                              {qty > 0 && (
                                <span className="ed-qty-subtotal">
                                  = {formatCurrency(lv.donGia * qty)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="ed-ticket-unavail">
                              <AlertCircle size={14} /> 
                              {isBeforeSale ? 'Chưa mở bán' : isAfterSale ? 'Đã đóng bán' : lv.trangThaiMoBan}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <aside className="ed-sidebar">
          <div className="ed-sidebar-sticky">
            {/* Price card */}
            <div className="ed-price-card">
              <div className="ed-price-header">
                {minPrice === 0 ? (
                  <span className="ed-price-free">Miễn phí</span>
                ) : (
                  <>
                    <span className="ed-price-from">Từ</span>
                    <span className="ed-price-val">{formatCurrency(minPrice)}</span>
                  </>
                )}
              </div>

              {totalAvailable > 0 ? (
                <div className="ed-avail-good">
                  <CheckCircle size={15} /> Còn {totalAvailable} vé
                </div>
              ) : ticketTypes.length > 0 ? (
                <div className="ed-avail-out">
                  <AlertCircle size={15} /> Hết vé
                </div>
              ) : null}

              {/* Order summary */}
              {totalTicketsSelected > 0 && (
                <div className="ed-order-summary">
                  <h4>Đơn hàng của bạn</h4>
                  {Array.from(selectedTickets.entries()).map(([loaiVeId, qty]) => {
                    const lv = ticketTypes.find(t => t.loaiVeID === loaiVeId);
                    if (!lv) return null;
                    return (
                      <div key={loaiVeId} className="ed-order-row">
                        <span>{lv.tenLoaiVe} × {qty}</span>
                        <span>{formatCurrency(lv.donGia * qty)}</span>
                      </div>
                    );
                  })}
                  <div className="ed-order-total">
                    <strong>Tổng cộng</strong>
                    <strong>{formatCurrency(calculateTotal())}</strong>
                  </div>
                </div>
              )}

              <button
                className="ed-btn-book"
                onClick={totalTicketsSelected > 0 ? handleBookTickets : () => setActiveTab('tickets')}
                disabled={isSoldOut}
              >
                <ShoppingCart size={18} />
                {isSoldOut
                  ? 'Đã hết vé'
                  : totalTicketsSelected > 0
                    ? `Đặt ${totalTicketsSelected} vé — ${formatCurrency(calculateTotal())}`
                    : 'Chọn vé ngay'}
              </button>

              {!user && (
                <p className="ed-login-hint">
                  <AlertCircle size={13} />
                  <button onClick={() => navigate('/login')}>Đăng nhập</button> để đặt vé
                </p>
              )}
            </div>

            {/* Event summary */}
            <div className="ed-sidebar-info">
              <div className="ed-sidebar-row">
                <Calendar size={15} />
                <span>{formatDate(event.thoiGianBatDau)}</span>
              </div>
              <div className="ed-sidebar-row">
                <Clock size={15} />
                <span>{formatTime(event.thoiGianBatDau)} – {formatTime(event.thoiGianKetThuc)}</span>
              </div>
              {event.tenDiaDiem && (
                <div className="ed-sidebar-row">
                  <MapPin size={15} />
                  <span>{event.tenDiaDiem}</span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="ed-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="ed-modal" onClick={e => e.stopPropagation()}>
            <div className="ed-modal-header">
              <h2>🎫 Xác nhận đặt vé</h2>
              <button className="ed-modal-close" onClick={() => setShowBookingModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="ed-modal-body">
              <div className="ed-modal-event">
                <h3>{event.tenSuKien}</h3>
                <p><Calendar size={14} /> {formatDate(event.thoiGianBatDau)}</p>
                {event.tenDiaDiem && <p><MapPin size={14} /> {event.tenDiaDiem}</p>}
              </div>
              <div className="ed-modal-items">
                {Array.from(selectedTickets.entries()).map(([loaiVeId, qty]) => {
                  const lv = ticketTypes.find(t => t.loaiVeID === loaiVeId);
                  if (!lv) return null;
                  return (
                    <div key={loaiVeId} className="ed-modal-row">
                      <span>{lv.tenLoaiVe} × {qty}</span>
                      <strong>{formatCurrency(lv.donGia * qty)}</strong>
                    </div>
                  );
                })}
              </div>
              <div className="ed-modal-total">
                <span>Tổng thanh toán</span>
                <strong className="ed-modal-total-val">{formatCurrency(calculateTotal())}</strong>
              </div>
            </div>
            <div className="ed-modal-footer">
              <button className="ed-modal-btn cancel" onClick={() => setShowBookingModal(false)}>
                Hủy
              </button>
              <button className="ed-modal-btn confirm" onClick={handleConfirmBooking}>
                <ShoppingCart size={16} /> Tiến hành thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
