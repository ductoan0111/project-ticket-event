import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Ticket, ArrowRight } from 'lucide-react';
import './CheckoutSuccess.css';

export default function CheckoutSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { donHangId, total } = location.state || {};

  useEffect(() => {
    if (!donHangId) {
      navigate('/attendee');
    }
  }, [donHangId, navigate]);

  return (
    <div className="checkout-success">
      <div className="success-container">
        <div className="success-icon">
          <CheckCircle size={80} />
        </div>
        
        <h1>Đặt vé thành công!</h1>
        <p className="success-message">
          Cảm ơn bạn đã đặt vé. Đơn hàng của bạn đã được xác nhận.
        </p>

        <div className="order-info">
          <div className="info-row">
            <span>Mã đơn hàng:</span>
            <strong>#{donHangId}</strong>
          </div>
          <div className="info-row">
            <span>Tổng tiền:</span>
            <strong>{total?.toLocaleString('vi-VN')} đ</strong>
          </div>
        </div>

        <div className="success-actions">
          <button 
            onClick={() => navigate('/my-tickets')}
            className="btn-primary"
          >
            <Ticket size={20} />
            Xem vé của tôi
          </button>
          <button 
            onClick={() => navigate('/my-orders')}
            className="btn-secondary"
          >
            Xem đơn hàng
            <ArrowRight size={20} />
          </button>
        </div>

        <button 
          onClick={() => navigate('/attendee')}
          className="btn-back-home"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
