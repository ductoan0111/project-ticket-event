import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { ticketTypeService } from '../services/ticketType.service';
import type { TicketType } from '../services/ticketType.service';
import './Checkout.css';

interface TicketSelection {
  loaiVeId: number;
  quantity: number;
}

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState<TicketSelection[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('MOCK');

  useEffect(() => {
    const ticketData = location.state?.tickets as TicketSelection[];
    if (!ticketData || ticketData.length === 0) {
      navigate(-1);
      return;
    }
    setTickets(ticketData);
    loadTicketTypes(ticketData);
  }, [location, navigate]);

  const loadTicketTypes = async (ticketData: TicketSelection[]) => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await ticketTypeService.getByEventId(parseInt(id));
      const types = response.data.filter(t => 
        ticketData.some(td => td.loaiVeId === t.loaiVeID)
      );
      setTicketTypes(types);
    } catch (error) {
      console.error('Failed to load ticket types:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return tickets.reduce((sum, ticket) => {
      const type = ticketTypes.find(t => t.loaiVeID === ticket.loaiVeId);
      return sum + (type?.donGia || 0) * ticket.quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    if (!user?.nguoiDungId || !id) {
      alert('Vui lòng đăng nhập để tiếp tục');
      navigate('/login');
      return;
    }

    try {
      setProcessing(true);

      // 1. Tạo đơn hàng
      const orderData = {
        nguoiMuaID: user.nguoiDungId,
        suKienID: parseInt(id),
        items: tickets.map(t => ({
          loaiVeID: t.loaiVeId,
          soLuong: t.quantity,
        })),
      };

      const { donHangId } = await orderService.createOrder(orderData);

      // 2. Thanh toán mock
      await paymentService.mockPayment(donHangId, user.nguoiDungId, {
        phuongThuc: paymentMethod,
        ghiChu: 'Thanh toán qua web',
      });

      // 3. Chuyển đến trang thành công
      navigate('/checkout/success', { 
        state: { donHangId, total: calculateTotal() } 
      });
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Đặt vé thất bại. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="checkout-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <h1>Thanh toán</h1>
      </div>

      <div className="checkout-container">
        <div className="checkout-main">
          {/* Order Summary */}
          <section className="checkout-section">
            <h2>
              <ShoppingCart size={24} />
              Đơn hàng của bạn
            </h2>
            <div className="order-items">
              {tickets.map((ticket) => {
                const type = ticketTypes.find(t => t.loaiVeID === ticket.loaiVeId);
                if (!type) return null;

                return (
                  <div key={ticket.loaiVeId} className="order-item">
                    <div className="item-info">
                      <h3>{type.tenLoaiVe}</h3>
                      <p>Số lượng: {ticket.quantity}</p>
                    </div>
                    <div className="item-price">
                      {(type.donGia * ticket.quantity).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Payment Method */}
          <section className="checkout-section">
            <h2>
              <CreditCard size={24} />
              Phương thức thanh toán
            </h2>
            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="MOCK"
                  checked={paymentMethod === 'MOCK'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Thanh toán giả lập (Mock)</span>
              </label>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="checkout-sidebar">
          <div className="checkout-summary">
            <h3>Tổng cộng</h3>
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{calculateTotal().toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="summary-row">
              <span>Phí dịch vụ:</span>
              <span>0 đ</span>
            </div>
            <div className="summary-total">
              <strong>Tổng:</strong>
              <strong>{calculateTotal().toLocaleString('vi-VN')} đ</strong>
            </div>
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="btn-checkout"
            >
              {processing ? (
                <>
                  <div className="spinner-small"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Xác nhận thanh toán
                </>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
