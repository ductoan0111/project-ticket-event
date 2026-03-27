using Models;
using Models.DTOs.Requests;

namespace Services.Interfaces
{
    public interface IDonHangService
    {
        Task<List<DonHang>> GetByNguoiMuaAsync(int nguoiMuaId);
        Task<DonHangDetail?> GetDetailAsync(int donHangId, int nguoiMuaId);
        Task<int> CreateAsync(TaoDonHangRequest req);
        Task<bool> CancelAsync(int donHangId, int nguoiMuaId);
        
        // Organizer APIs
        Task<List<DonHang>> GetBySuKienIdAsync(int suKienId, byte? trangThai = null);
        Task<DonHangDetail?> GetDetailBySuKienAsync(int donHangId, int suKienId);
        Task<Dictionary<string, object>> GetThongKeAsync(int suKienId);
    }
}
