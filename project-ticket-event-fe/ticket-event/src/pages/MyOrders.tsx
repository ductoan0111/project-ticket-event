import { useState, useEffect } from 'react';
import { Package, Calendar, DollarSign, X, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/order.service';
import type { Order } from '../services/order.service';
import './MyOrders.css';

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: 'Chờ thanh toán', className: 'pending' },
  1: { label: 'Đã thanh toán', className: 'paid' },
  2: { label: 'Đã hủy', className: 'cancelled' },
  3: { label: 'Hoàn tiền', className: 'refunded' },
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user?.nguoiDungId) return;
    
    try {
      setLoading(true);
      const data = await orderService.getMyOrders(user.nguoiDungId);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (donHangId: number) => {
    if (!user?.nguoiDungId) return;
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    try {
      await orderService.cancelOrder(donHangId, user.nguoiDungId);
      await loadOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Không thể hủy đơn hàng');
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.trangThai === filter);

  if (loading) {
    return (
      <div className="my-orders-loading">
        <div className="spinner"></div>
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <div className="my-orders-header">
        <div>
          <h1>Đơn hàng của tôi</h1>
          <p>Quản lý và theo dõi đơn hàng</p>
        </div>
      </div>

      <div className="my-orders-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả ({orders.length})
        </button>
        <button
          className={`filter-btn ${filter === 0 ? 'active' : ''}`}
          onClick={() => setFilter(0)}
        >
          Chờ thanh toán ({orders.filter(o => o.trangThai === 0).length})
        </button>
        <button
          className={`filter-btn ${filter === 1 ? 'active' : ''}`}
          onClick={() => setFilter(1)}
        >
          Đã thanh toán ({orders.filter(o => o.trangThai === 1).length})
        </button>
        <button
          className={`filter-btn ${filter === 2 ? 'active' : ''}`}
          onClick={() => setFilter(2)}
        >
          Đã hủy ({orders.filter(o => o.trangThai === 2).length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="my-orders-empty">
          <Package size={64} />
          <h3>Chưa có đơn hàng nào</h3>
          <p>Các đơn hàng của bạn sẽ hiển thị ở đây</p>
        </div>
      ) : (
        <div className="my-orders-list">
          {filteredOrders.map((order) => (
            <div key={order.donHangID} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <Package size={18} />
                  <span>Đơn hàng #{order.donHangID}</span>
                </div>
                <span className={`order-status ${STATUS_MAP[order.trangThai]?.className || ''}`}>
                  {STATUS_MAP[order.trangThai]?.label || 'Không xác định'}
                </span>
              </div>

              <div className="order-info">
                <div className="order-info-item">
                  <Calendar size={16} />
                  <span>{new Date(order.ngayDat).toLocaleString('vi-VN')}</span>
                </div>
                <div className="order-info-item">
                  <DollarSign size={16} />
                  <span className="order-total">{order.tongTien.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <div className="order-actions">
                <button className="order-btn view">
                  <Eye size={16} />
                  Xem chi tiết
                </button>
                {order.trangThai === 0 && (
                  <button 
                    className="order-btn cancel"
                    onClick={() => handleCancelOrder(order.donHangID)}
                  >
                    <X size={16} />
                    Hủy đơn
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
