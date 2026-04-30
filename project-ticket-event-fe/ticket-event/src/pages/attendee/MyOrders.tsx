import { useState, useEffect, type ReactNode } from 'react';
import {
  ShoppingBag, Calendar, CreditCard, X, Eye,
  Clock, CheckCircle, XCircle, RefreshCw,
  Package, ChevronRight, AlertTriangle, Banknote
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/order.service';
import type { Order, OrderDetail } from '../../services/order.service';
import './MyOrders.css';

/* ─── Constants ─────────────────────────────────────── */
const STATUS_MAP: Record<number, { label: string; cls: string; icon: ReactNode }> = {
  0: { label: 'Chờ thanh toán', cls: 'pending',   icon: <Clock size={12} /> },
  1: { label: 'Đã thanh toán',  cls: 'paid',      icon: <CheckCircle size={12} /> },
  2: { label: 'Đã hủy',         cls: 'cancelled', icon: <XCircle size={12} /> },
  3: { label: 'Hoàn tiền',      cls: 'refunded',  icon: <RefreshCw size={12} /> },
};

const ACCENT_MAP: Record<number, string> = { 0: 'pending', 1: 'paid', 2: 'cancelled', 3: 'refunded' };

const FILTERS = [
  { key: 'all', label: 'Tất cả',         icon: <ShoppingBag size={14} /> },
  { key: 0,     label: 'Chờ thanh toán', icon: <Clock size={14} /> },
  { key: 1,     label: 'Đã thanh toán',  icon: <CheckCircle size={14} /> },
  { key: 2,     label: 'Đã hủy',         icon: <XCircle size={14} /> },
];

/* ─── Helpers ────────────────────────────────────────── */
function fmt(n: number) { return n.toLocaleString('vi-VN') + ' ₫'; }
function fmtDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtTime(s: string) {
  const d = new Date(s);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

/* ─── Skeleton ───────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="mo-skel-card">
      <div className="mo-skel-line lg" />
      <div className="mo-skel-line" />
      <div className="mo-skel-line sm" />
    </div>
  );
}

/* ─── Order Detail Modal ─────────────────────────────── */
interface ModalProps {
  order: Order;
  detail: OrderDetail | null;
  loading: boolean;
  onClose: () => void;
  onCancel: () => void;
  cancelling: boolean;
}

function OrderDetailModal({ order, detail, loading, onClose, onCancel, cancelling }: ModalProps) {
  const st = STATUS_MAP[order.trangThai] ?? STATUS_MAP[0];
  return (
    <div className="mo-overlay" onClick={onClose}>
      <div className="mo-modal" onClick={e => e.stopPropagation()}>
        {/* Top bar */}
        <div className="mo-modal-top">
          <h2>Chi tiết đơn hàng</h2>
          <button className="mo-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="mo-modal-body">
          {/* Status row */}
          <div className="mo-modal-status-row">
            <span className="mo-modal-id">Đơn hàng #{order.donHangID}</span>
            <span className={`mo-status ${st.cls}`}>
              <span className="mo-status-dot" />
              {st.icon}
              {st.label}
            </span>
          </div>

          {/* Order info */}
          <div className="mo-detail-section">
            <div className="mo-detail-section-title">Thông tin đơn hàng</div>
            <div className="mo-detail-row">
              <span className="mo-detail-key">Mã đơn hàng</span>
              <span className="mo-detail-value">#{order.donHangID}</span>
            </div>
            <div className="mo-detail-row">
              <span className="mo-detail-key">Ngày đặt</span>
              <span className="mo-detail-value">{fmtDate(order.ngayDat)}</span>
            </div>
            <div className="mo-detail-row">
              <span className="mo-detail-key">Giờ đặt</span>
              <span className="mo-detail-value">{fmtTime(order.ngayDat)}</span>
            </div>
            <div className="mo-detail-row">
              <span className="mo-detail-key">Mã sự kiện</span>
              <span className="mo-detail-value">#{order.suKienID}</span>
            </div>
          </div>

          {/* Items */}
          <div className="mo-detail-section">
            <div className="mo-detail-section-title">Danh sách vé</div>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                <div className="mo-spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : detail?.items?.length ? (
              <table className="mo-items-table">
                <thead>
                  <tr>
                    <th>Loại vé</th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map(item => (
                    <tr key={item.chiTietID}>
                      <td>Vé #{item.loaiVeID}</td>
                      <td>×{item.soLuong}</td>
                      <td>{fmt(item.donGia)}</td>
                      <td>{fmt(item.thanhTien)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                Không có chi tiết vé
              </div>
            )}
          </div>

          {/* Total */}
          <div className="mo-modal-total">
            <span className="mo-modal-total-label">Tổng thanh toán</span>
            <span className="mo-modal-total-val">{fmt(order.tongTien)}</span>
          </div>

          {/* Actions */}
          <div className="mo-modal-actions">
            <button className="mo-modal-btn primary" onClick={onClose}>
              <ChevronRight size={16} /> Đóng
            </button>
            {order.trangThai === 0 && (
              <button
                className="mo-modal-btn danger"
                onClick={onCancel}
                disabled={cancelling}
              >
                {cancelling ? <RefreshCw size={14} className="spin" /> : <XCircle size={14} />}
                {cancelling ? 'Đang hủy...' : 'Hủy đơn'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<number | 'all'>('all');
  const [selectedOrder, setSelected]  = useState<Order | null>(null);
  const [detail, setDetail]           = useState<OrderDetail | null>(null);
  const [detailLoading, setDetLoading]= useState(false);
  const [cancelling, setCancelling]   = useState(false);

  useEffect(() => { loadOrders(); }, [user]);

  const loadOrders = async () => {
    if (!user?.nguoiDungId) return;
    try {
      setLoading(true);
      const data = await orderService.getMyOrders(user.nguoiDungId);
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (order: Order) => {
    setSelected(order);
    setDetail(null);
    if (!user?.nguoiDungId) return;
    try {
      setDetLoading(true);
      const d = await orderService.getOrderDetail(order.donHangID, user.nguoiDungId);
      setDetail(d);
    } catch (e) {
      console.error(e);
    } finally {
      setDetLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedOrder || !user?.nguoiDungId) return;
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      setCancelling(true);
      await orderService.cancelOrder(selectedOrder.donHangID, user.nguoiDungId);
      setSelected(null);
      await loadOrders();
    } catch (e) {
      alert('Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.trangThai === filter);

  /* Stats */
  const totalSpent = orders.filter(o => o.trangThai === 1).reduce((s, o) => s + o.tongTien, 0);
  const paidCount  = orders.filter(o => o.trangThai === 1).length;

  /* ── Render ── */
  return (
    <div className="mo-root">
      {/* ── HERO ── */}
      <div className="mo-hero">
        <div className="mo-hero-bg">
          <div className="mo-orb mo-orb-1" />
          <div className="mo-orb mo-orb-2" />
          <div className="mo-orb mo-orb-3" />
          <div className="mo-hero-grid" />
        </div>
        <div className="mo-hero-content">
          <h1 className="mo-hero-title">
            Đơn hàng <span className="mo-hero-accent">của tôi</span>
          </h1>
          <p className="mo-hero-sub">Theo dõi và quản lý toàn bộ đơn hàng của bạn tại một nơi</p>

          {/* Stats */}
          <div className="mo-stats-bar">
            <div className="mo-stat">
              <div className="mo-stat-icon"><ShoppingBag size={20} /></div>
              <div>
                <p className="mo-stat-val">{orders.length}</p>
                <p className="mo-stat-lbl">Tổng đơn</p>
              </div>
            </div>
            <div className="mo-stat-sep" />
            <div className="mo-stat">
              <div className="mo-stat-icon"><CheckCircle size={20} /></div>
              <div>
                <p className="mo-stat-val">{paidCount}</p>
                <p className="mo-stat-lbl">Đã thanh toán</p>
              </div>
            </div>
            <div className="mo-stat-sep" />
            <div className="mo-stat">
              <div className="mo-stat-icon"><Banknote size={20} /></div>
              <div>
                <p className="mo-stat-val">{totalSpent > 0 ? (totalSpent / 1000).toFixed(0) + 'K' : '0'}</p>
                <p className="mo-stat-lbl">Đã chi tiêu</p>
              </div>
            </div>
            <div className="mo-stat-sep" />
            <div className="mo-stat">
              <div className="mo-stat-icon"><Clock size={20} /></div>
              <div>
                <p className="mo-stat-val">{orders.filter(o => o.trangThai === 0).length}</p>
                <p className="mo-stat-lbl">Chờ thanh toán</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="mo-content">
        {/* Filter tabs */}
        <div className="mo-filters-card">
          {FILTERS.map(f => (
            <button
              key={String(f.key)}
              className={`mo-filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key as number | 'all')}
            >
              {f.icon}
              {f.label}
              <span className="mo-filter-count">
                {f.key === 'all' ? orders.length : orders.filter(o => o.trangThai === f.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="mo-skeleton">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mo-empty">
            <div className="mo-empty-icon"><Package size={40} /></div>
            <h3>Chưa có đơn hàng nào</h3>
            <p>{filter === 'all' ? 'Bạn chưa đặt đơn hàng nào.' : 'Không có đơn hàng nào trong danh mục này.'}</p>
            <button className="mo-empty-btn" onClick={() => setFilter('all')}>
              Xem tất cả đơn hàng
            </button>
          </div>
        ) : (
          <div className="mo-list">
            {filtered.map((order, idx) => {
              const st = STATUS_MAP[order.trangThai] ?? STATUS_MAP[0];
              const acc = ACCENT_MAP[order.trangThai] ?? 'pending';
              return (
                <div
                  key={order.donHangID}
                  className="mo-card"
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  {/* Accent */}
                  <div className={`mo-card-accent ${acc}`} />

                  <div className="mo-card-body">
                    {/* Header */}
                    <div className="mo-card-header">
                      <div className="mo-card-id">
                        <div className="mo-order-icon"><ShoppingBag size={18} /></div>
                        <div>
                          <p className="mo-order-label">Mã đơn hàng</p>
                          <p className="mo-order-num">#{order.donHangID}</p>
                        </div>
                      </div>
                      <span className={`mo-status ${st.cls}`}>
                        <span className="mo-status-dot" />
                        {st.icon}
                        {st.label}
                      </span>
                    </div>

                    {/* Info grid */}
                    <div className="mo-info-grid">
                      <div className="mo-info-item">
                        <div className="mo-info-icon"><Calendar size={16} /></div>
                        <div>
                          <p className="mo-info-label">Ngày đặt</p>
                          <p className="mo-info-val">{fmtDate(order.ngayDat)}</p>
                        </div>
                      </div>
                      <div className="mo-info-item">
                        <div className="mo-info-icon"><Clock size={16} /></div>
                        <div>
                          <p className="mo-info-label">Giờ đặt</p>
                          <p className="mo-info-val">{fmtTime(order.ngayDat)}</p>
                        </div>
                      </div>
                      <div className="mo-info-item">
                        <div className="mo-info-icon"><Package size={16} /></div>
                        <div>
                          <p className="mo-info-label">Sự kiện</p>
                          <p className="mo-info-val">#{order.suKienID}</p>
                        </div>
                      </div>
                      <div className="mo-info-item">
                        <div className="mo-info-icon"><CreditCard size={16} /></div>
                        <div>
                          <p className="mo-info-label">Thanh toán</p>
                          <p className="mo-info-val">{order.trangThai === 1 ? 'Hoàn thành' : order.trangThai === 0 ? 'Chưa TT' : '—'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="mo-total-row">
                      <span className="mo-total-label">💰 Tổng tiền</span>
                      <span className="mo-total-amount">
                        {fmt(order.tongTien)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mo-card-actions">
                      <button className="mo-btn mo-btn-view" onClick={() => openDetail(order)}>
                        <Eye size={15} /> Xem chi tiết
                      </button>
                      {order.trangThai === 0 && (
                        <>
                          <button className="mo-btn mo-btn-pay">
                            <CreditCard size={15} /> Thanh toán
                          </button>
                          <button
                            className="mo-btn mo-btn-cancel"
                            onClick={async () => {
                              if (!user?.nguoiDungId) return;
                              if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
                              try {
                                await orderService.cancelOrder(order.donHangID, user.nguoiDungId);
                                await loadOrders();
                              } catch {
                                alert('Không thể hủy đơn hàng');
                              }
                            }}
                          >
                            <AlertTriangle size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          detail={detail}
          loading={detailLoading}
          onClose={() => setSelected(null)}
          onCancel={handleCancel}
          cancelling={cancelling}
        />
      )}
    </div>
  );
}
