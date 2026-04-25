using Models;
using Models.DTOs.Requests;

namespace Services.Interfaces
{
    public interface ISuKienService
    {
        Task<IEnumerable<SuKien>> GetAllAsync();
        Task<List<SuKienRequest>> GetByNameAsync(string tenSuKien);
        Task<List<SuKienRequest>> GetByDanhMucNameAsync(string tenDanhMuc);
        Task<SuKien?> GetByIdAsync(int id);
        Task<int> CreateAsync(SuKien suKien);
        Task<bool> UpdateAsync(SuKien suKien);
        Task<bool> UpdateTrangThaiAsync(int id, byte trangThai);
        Task<int> SyncTrangThaiTheoThoiGianAsync();
        Task<IEnumerable<SuKien>> GetExpiredEventsAsync();
        List<SuKien> GetPending();
        bool Approve(int suKienId);
        bool Cancel(int suKienId);
        Task<bool> DeleteAsync(int suKienId);
    }
}
