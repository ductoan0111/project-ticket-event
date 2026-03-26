using Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class LoaiVeService : ILoaiVeService
    {
        private readonly ILoaiVeRepository _repo;

        public LoaiVeService(ILoaiVeRepository repo)
        {
            _repo = repo;
        }

        public Task<List<LoaiVe>> GetAllAsync()
            => _repo.GetAllAsync(trangThai: true);

        public Task<List<LoaiVe>> GetByNameAsync(string tenLoaiVe)
            => _repo.GetByNameAsync(tenLoaiVe, trangThai: true);

        public Task<List<LoaiVe>> GetByTenSuKienAsync(string tenSuKien)
            => _repo.GetByTenSuKienAsync(tenSuKien, trangThai: true);

        public Task<List<LoaiVe>> GetBySuKienIdAsync(int suKienId, bool? trangThai = null)
            => _repo.GetBySuKienIdAsync(suKienId, trangThai);

        public Task<LoaiVe?> GetByIdAsync(int loaiVeId)
            => _repo.GetByIdAsync(loaiVeId);

        public Task<int> CreateAsync(LoaiVe loaiVe)
        {
            // Set default values
            loaiVe.SoLuongDaBan = 0;
            loaiVe.TrangThai = true;
            return _repo.CreateAsync(loaiVe);
        }

        public Task<bool> UpdateAsync(LoaiVe loaiVe)
            => _repo.UpdateAsync(loaiVe);

        public Task<bool> DeleteAsync(int loaiVeId)
            => _repo.DeleteAsync(loaiVeId);
    }
}
