using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IBaoCaoService
    {
        Task<Dictionary<string, object>> GetTongQuanAsync(int suKienId);
        Task<List<Dictionary<string, object>>> GetDoanhThuTheoNgayAsync(int suKienId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<List<Dictionary<string, object>>> GetLoaiVeBanChayAsync(int suKienId);
        Task<List<Dictionary<string, object>>> GetTopKhachHangAsync(int suKienId, int top = 10);
        Task<Dictionary<string, object>> GetThongKeCheckInAsync(int suKienId);
        Task<List<Dictionary<string, object>>> GetCheckInTheoGioAsync(int suKienId);
    }
}
