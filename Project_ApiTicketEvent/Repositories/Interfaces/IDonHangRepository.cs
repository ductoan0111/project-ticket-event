using Models.DTOs.Requests;
using System;
using Models;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interfaces
{
    public interface IDonHangRepository
    {
        Task<List<DonHang>> GetByNguoiMuaAsync(int nguoiMuaId);
        Task<DonHangDetail?> GetDetailAsync(int donHangId, int nguoiMuaId);

        Task<int> CreateAsync(TaoDonHangRequest req);              // trả DonHangID
        Task<bool> CancelAsync(int donHangId, int nguoiMuaId);     // đổi trạng thái
        
        // Organizer APIs
        Task<List<DonHang>> GetBySuKienIdAsync(int suKienId, byte? trangThai = null);
        Task<DonHangDetail?> GetDetailBySuKienAsync(int donHangId, int suKienId);
        Task<Dictionary<string, object>> GetThongKeAsync(int suKienId);
        Task<decimal> GetTongDoanhThuAsync();
    }
}
