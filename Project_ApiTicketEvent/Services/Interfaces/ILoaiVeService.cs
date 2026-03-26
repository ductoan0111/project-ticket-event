using Models;

namespace Services.Interfaces
{
    public interface ILoaiVeService
    {
        Task<List<LoaiVe>> GetAllAsync();
        Task<List<LoaiVe>> GetByNameAsync(string tenLoaiVe);
        Task<List<LoaiVe>> GetByTenSuKienAsync(string tenSuKien);
        Task<List<LoaiVe>> GetBySuKienIdAsync(int suKienId, bool? trangThai = null);
        Task<LoaiVe?> GetByIdAsync(int loaiVeId);
        Task<int> CreateAsync(LoaiVe loaiVe);
        Task<bool> UpdateAsync(LoaiVe loaiVe);
        Task<bool> DeleteAsync(int loaiVeId);
    }
}
