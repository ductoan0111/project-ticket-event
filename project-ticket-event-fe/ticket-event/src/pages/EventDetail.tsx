import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Ticket, Heart, Share2, 
  ArrowLeft, Users, AlertCircle, CheckCircle,
  X, ShoppingCart
} from 'lucide-react';
import eventService from '../services/event.service';
import favoriteService from '../services/favorite.service';
import type { EventDetail } from '../services/event.service';
import './EventDetail.css';

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [selectedTickets, setSelectedTickets] = useState<Map<number, number>>(new Map());
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadEventDetail(parseInt(id));
    }
  }, [id]);

  const loadEventDetail = async (eventId: number) => {
    try {
      setLoading(true);
      const [detail, isFav, count] = await Promise.all([
        eventService.getEventDetail(eventId),
        favoriteService.checkFavorite(eventId).catch(() => false),
        favoriteService.getFavoriteCount(eventId).catch(() => 0),
      ]);

      setEvent(detail);
      setIsFavorite(isFav);
      setFavoriteCount(count);
    } catch (error) {
      console.error('Error loading event detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!id) return;
    
    try {
      const isNowFavorite = await favoriteService.toggleFavorite(parseInt(id));
      setIsFavorite(isNowFavorite);
      
      const newCount = await favoriteService.getFavoriteCount(parseInt(id));
      setFavoriteCount(newCount);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.tenSuKien,
          text: event?.moTa || '',
          url: url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Đã copy link vào clipboard!');
    }
  };

  const handleTicketQuantityChange = (loaiVeId: number, quantity: number) => {
    const newSelected = new Map(selectedTickets);
    if (quantity <= 0) {
      newSelected.delete(loaiVeId);
    } else {
      newSelected.set(loaiVeId, quantity);
    }
    setSelectedTickets(newSelected);
  };

  const handleBookTickets = () => {
    if (selectedTickets.size === 0) {
      alert('Vui lòng chọn ít nhất 1 loại vé');
      return;
    }
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    // TODO: Navigate to checkout page with selected tickets
    const ticketData = Array.from(selectedTickets.entries()).map(([loaiVeId, quantity]) => ({
      loaiVeId,
      quantity,
    }));
    
    console.log('Booking tickets:', ticketData);
    navigate(`/checkout/${id}`, { state: { tickets: ticketData } });
  };

  const calculateTotal = () => {
    if (!event) return 0;
    
    let total = 0;
    selectedTickets.forEach((quantity, loaiVeId) => {
      const loaiVe = event.loaiVes.find(lv => lv.loaiVeID === loaiVeId);
      if (loaiVe) {
        total += loaiVe.donGia * quantity;
      }
    });
    return total;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="event-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin sự kiện...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-detail-error">
        <AlertCircle size={48} />
        <h2>Không tìm thấy sự kiện</h2>
        <button onClick={() => navigate('/attendee')} className="btn-back">
          Quay về trang chủ
        </button>
      </div>
    );
  }

  const totalTicketsSelected = Array.from(selectedTickets.values()).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="event-detail">
      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn-back-header">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="header-actions">
          <button 
            onClick={handleToggleFavorite} 
            className={`btn-icon ${isFavorite ? 'active' : ''}`}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            <span>{favoriteCount}</span>
          </button>
          <button onClick={handleShare} className="btn-icon">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="detail-hero">
        <img 
          src={event.anhBiaUrl || 'https://via.placeholder.com/1200x600?text=Event+Image'} 
          alt={event.tenSuKien}
          className="hero-image"
        />
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="event-title">{event.tenSuKien}</h1>
            <div className="event-meta">
              <div className="meta-item">
                <Calendar size={18} />
                <span>{formatDate(event.thoiGianBatDau)}</span>
              </div>
              <div className="meta-item">
                <Clock size={18} />
                <span>{formatTime(event.thoiGianBatDau)} - {formatTime(event.thoiGianKetThuc)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="detail-container">
        <div className="detail-main">
          {/* Event Info */}
          <section className="detail-section">
            <h2 className="section-title">Thông tin sự kiện</h2>
            <div className="event-info">
              <p className="event-description">{event.moTa || 'Chưa có mô tả'}</p>
            </div>
          </section>

          {/* Ticket Types */}
          <section className="detail-section">
            <h2 className="section-title">
              <Ticket size={24} />
              Loại vé
            </h2>
            <div className="ticket-list">
              {event.loaiVes.length === 0 ? (
                <div className="no-tickets">
                  <AlertCircle size={32} />
                  <p>Chưa có loại vé nào</p>
                </div>
              ) : (
                event.loaiVes.map((loaiVe) => (
                  <div key={loaiVe.loaiVeID} className="ticket-card">
                    <div className="ticket-info">
                      <div className="ticket-header">
                        <h3 className="ticket-name">{loaiVe.tenLoaiVe}</h3>
                        <span className={`ticket-status ${loaiVe.dangMoBan ? 'available' : 'unavailable'}`}>
                          {loaiVe.trangThaiMoBan}
                        </span>
                      </div>
                      {loaiVe.moTa && <p className="ticket-description">{loaiVe.moTa}</p>}
                      
                      <div className="ticket-details">
                        <div className="ticket-price">{formatCurrency(loaiVe.donGia)}</div>
                        <div className="ticket-availability">
                          <Users size={16} />
                          <span>Còn {loaiVe.soLuongCon}/{loaiVe.soLuongToiDa} vé</span>
                        </div>
                      </div>

                      {loaiVe.soLuongCon > 0 && (
                        <div className="ticket-progress">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${loaiVe.phanTramDaBan}%` }}
                          ></div>
                        </div>
                      )}
                    </div>

                    <div className="ticket-actions">
                      {loaiVe.dangMoBan && loaiVe.conVe ? (
                        <div className="quantity-selector">
                          <button 
                            onClick={() => handleTicketQuantityChange(
                              loaiVe.loaiVeID, 
                              (selectedTickets.get(loaiVe.loaiVeID) || 0) - 1
                            )}
                            disabled={!selectedTickets.has(loaiVe.loaiVeID)}
                            className="qty-btn"
                          >
                            -
                          </button>
                          <span className="qty-display">
                            {selectedTickets.get(loaiVe.loaiVeID) || 0}
                          </span>
                          <button 
                            onClick={() => handleTicketQuantityChange(
                              loaiVe.loaiVeID, 
                              (selectedTickets.get(loaiVe.loaiVeID) || 0) + 1
                            )}
                            disabled={
                              (selectedTickets.get(loaiVe.loaiVeID) || 0) >= loaiVe.soLuongCon ||
                              (selectedTickets.get(loaiVe.loaiVeID) || 0) >= (loaiVe.gioiHanMoiKhach || 999)
                            }
                            className="qty-btn"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div className="ticket-unavailable">
                          <AlertCircle size={16} />
                          <span>{loaiVe.trangThaiMoBan}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="detail-sidebar">
          <div className="sidebar-sticky">
            {/* Price Summary */}
            <div className="price-summary">
              <h3>Tổng quan giá vé</h3>
              {event.giaThapNhat > 0 && (
                <div className="price-range">
                  <span className="price-label">Giá từ:</span>
                  <span className="price-value">{formatCurrency(event.giaThapNhat)}</span>
                </div>
              )}
              {event.tongVeConLai > 0 ? (
                <div className="tickets-remaining">
                  <CheckCircle size={16} />
                  <span>Còn {event.tongVeConLai} vé</span>
                </div>
              ) : (
                <div className="tickets-sold-out">
                  <AlertCircle size={16} />
                  <span>Đã hết vé</span>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            {totalTicketsSelected > 0 && (
              <div className="booking-summary">
                <h3>Đơn hàng của bạn</h3>
                <div className="summary-items">
                  {Array.from(selectedTickets.entries()).map(([loaiVeId, quantity]) => {
                    const loaiVe = event.loaiVes.find(lv => lv.loaiVeID === loaiVeId);
                    if (!loaiVe) return null;
                    
                    return (
                      <div key={loaiVeId} className="summary-item">
                        <div className="item-info">
                          <span className="item-name">{loaiVe.tenLoaiVe}</span>
                          <span className="item-qty">x{quantity}</span>
                        </div>
                        <span className="item-price">
                          {formatCurrency(loaiVe.donGia * quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="summary-total">
                  <span>Tổng cộng:</span>
                  <span className="total-amount">{formatCurrency(calculateTotal())}</span>
                </div>
                <button onClick={handleBookTickets} className="btn-book">
                  <ShoppingCart size={20} />
                  Đặt vé ngay
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBookingModal(false)}>
              <X size={24} />
            </button>
            <h2>Xác nhận đặt vé</h2>
            <div className="modal-body">
              <p>Bạn đang đặt {totalTicketsSelected} vé cho sự kiện:</p>
              <h3>{event.tenSuKien}</h3>
              <div className="modal-summary">
                {Array.from(selectedTickets.entries()).map(([loaiVeId, quantity]) => {
                  const loaiVe = event.loaiVes.find(lv => lv.loaiVeID === loaiVeId);
                  if (!loaiVe) return null;
                  
                  return (
                    <div key={loaiVeId} className="modal-item">
                      <span>{loaiVe.tenLoaiVe} x{quantity}</span>
                      <span>{formatCurrency(loaiVe.donGia * quantity)}</span>
                    </div>
                  );
                })}
                <div className="modal-total">
                  <strong>Tổng cộng:</strong>
                  <strong>{formatCurrency(calculateTotal())}</strong>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowBookingModal(false)} className="btn-cancel">
                Hủy
              </button>
              <button onClick={handleConfirmBooking} className="btn-confirm">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
