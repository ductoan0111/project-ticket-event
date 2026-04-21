import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizerService } from '../services/organizer.service';
import type { OrgEvent, CheckInRequest } from '../services/organizer.service';
import './OrganizerCheckIn.css';

export default function OrganizerCheckIn() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number>(0);
  const [qrToken, setQrToken] = useState('');
  const [maVe, setMaVe] = useState('');
  const [nhanVienID, setNhanVienID] = useState(1);
  const [checkInMode, setCheckInMode] = useState<'qr' | 'maVe'>('maVe');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [history, setHistory] = useState<{ time: string; input: string; success: boolean; message: string }[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await organizerService.getMyEvents();
      setEvents(data);
      if (data.length > 0) setSelectedEventId(data[0].suKienID);
    } catch { /* silent */ }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nhanVienID || nhanVienID <= 0) {
      setResult({ success: false, message: 'Vui lòng nhập ID nhân viên hợp lệ.' });
      return;
    }
    const inputVal = checkInMode === 'qr' ? qrToken.trim() : maVe.trim();
    if (!inputVal) {
      setResult({ success: false, message: `Vui lòng nhập ${checkInMode === 'qr' ? 'QR Token' : 'mã vé'}.` });
      return;
    }
    try {
      setLoading(true);
      setResult(null);
      const req: CheckInRequest = {
        nhanVienID,
        ...(checkInMode === 'qr' ? { qrToken: inputVal } : { maVe: inputVal }),
      };
      const res = await organizerService.checkIn(req);
      const successResult = { success: true, message: (res as { message?: string })?.message ?? 'Check-in thành công!' };
      setResult(successResult);
      setHistory(prev => [{ time: new Date().toLocaleTimeString('vi-VN'), input: inputVal, ...successResult }, ...prev.slice(0, 19)]);
      // Clear input
      if (checkInMode === 'qr') setQrToken('');
      else setMaVe('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Check-in thất bại. Vui lòng kiểm tra lại.';
      const failResult = { success: false, message: msg };
      setResult(failResult);
      setHistory(prev => [{ time: new Date().toLocaleTimeString('vi-VN'), input: inputVal, ...failResult }, ...prev.slice(0, 19)]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="org-checkin">
      <div className="ci-header">
        <div>
          <h1 className="ci-title">✅ Check-in Vé</h1>
          <p className="ci-subtitle">Quét và xác nhận vé vào cổng sự kiện</p>
        </div>
        <button className="ci-back-btn" onClick={() => navigate('/organizer')}>
          ← Dashboard
        </button>
      </div>

      <div className="ci-layout">
        {/* Left: Form */}
        <div className="ci-form-card">
          <div className="ci-event-selector">
            <label>Sự kiện đang diễn ra:</label>
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(Number(e.target.value))}
              className="ci-select"
            >
              <option value={0}>-- Chọn sự kiện --</option>
              {events.map(ev => (
                <option key={ev.suKienID} value={ev.suKienID}>{ev.tenSuKien}</option>
              ))}
            </select>
          </div>

          <div className="ci-mode-tabs">
            <button
              className={`ci-mode-tab ${checkInMode === 'maVe' ? 'active' : ''}`}
              onClick={() => setCheckInMode('maVe')}
            >
              🎫 Mã vé
            </button>
            <button
              className={`ci-mode-tab ${checkInMode === 'qr' ? 'active' : ''}`}
              onClick={() => setCheckInMode('qr')}
            >
              📱 QR Token
            </button>
          </div>

          <form onSubmit={handleCheckIn} className="ci-form">
            <div className="ci-form-group">
              <label>ID Nhân viên *</label>
              <input
                type="number"
                value={nhanVienID}
                onChange={e => setNhanVienID(Number(e.target.value))}
                min={1}
                required
                className="ci-input"
                placeholder="Nhập ID nhân viên..."
              />
            </div>

            <div className="ci-form-group">
              <label>{checkInMode === 'qr' ? 'QR Token *' : 'Mã vé *'}</label>
              {checkInMode === 'qr' ? (
                <textarea
                  value={qrToken}
                  onChange={e => setQrToken(e.target.value)}
                  placeholder="Dán QR token vào đây..."
                  rows={4}
                  className="ci-textarea"
                  autoFocus
                />
              ) : (
                <input
                  type="text"
                  value={maVe}
                  onChange={e => setMaVe(e.target.value)}
                  placeholder="Nhập hoặc quét mã vé..."
                  className="ci-input ci-input-large"
                  autoFocus
                />
              )}
            </div>

            <button
              type="submit"
              className="ci-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="ci-btn-loading"><div className="ci-spinner" /> Đang xử lý...</span>
              ) : (
                '✅ Xác nhận Check-in'
              )}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className={`ci-result ${result.success ? 'success' : 'error'}`}>
              <span className="ci-result-icon">{result.success ? '✅' : '❌'}</span>
              <span>{result.message}</span>
            </div>
          )}
        </div>

        {/* Right: History */}
        <div className="ci-history-card">
          <div className="ci-history-header">
            <h3>Lịch sử check-in ({history.length})</h3>
            {history.length > 0 && (
              <button className="ci-clear-btn" onClick={clearHistory}>Xóa lịch sử</button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="ci-history-empty">
              <span>📋</span>
              <p>Chưa có check-in nào trong phiên này</p>
            </div>
          ) : (
            <div className="ci-history-list">
              {history.map((h, i) => (
                <div key={i} className={`ci-history-item ${h.success ? 'success' : 'error'}`}>
                  <div className="ci-history-icon">{h.success ? '✅' : '❌'}</div>
                  <div className="ci-history-info">
                    <p className="ci-history-input">{h.input}</p>
                    <p className="ci-history-msg">{h.message}</p>
                  </div>
                  <div className="ci-history-time">{h.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
