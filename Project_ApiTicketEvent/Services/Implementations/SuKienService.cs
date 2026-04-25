using Models;
using Models.DTOs.Requests;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class SuKienService : ISuKienService
    {
        private readonly ISuKienRepository _repo;

        public SuKienService(ISuKienRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<SuKien>> GetAllAsync()
        {
            await _repo.SyncTrangThaiTheoThoiGianAsync();
            return await _repo.GetAllAsync();
        }

        public async Task<List<SuKienRequest>> GetByNameAsync(string tenSuKien)
        {
            await _repo.SyncTrangThaiTheoThoiGianAsync();
            return await _repo.GetByNameAsync(tenSuKien, trangThai: true);
        }

        public async Task<List<SuKienRequest>> GetByDanhMucNameAsync(string tenDanhMuc)
        {
            await _repo.SyncTrangThaiTheoThoiGianAsync();
            return await _repo.GetByDanhMucNameAsync(tenDanhMuc, trangThai: true);
        }

        public async Task<SuKien?> GetByIdAsync(int id)
        {
            await _repo.SyncTrangThaiTheoThoiGianAsync();
            return await _repo.GetByIdAsync(id);
        }

        public Task<int> CreateAsync(SuKien suKien)
            => _repo.CreateAsync(suKien);

        public Task<bool> UpdateAsync(SuKien suKien)
            => _repo.UpdateAsync(suKien);

        public Task<bool> UpdateTrangThaiAsync(int id, byte trangThai)
            => _repo.UpdateTrangThaiAsync(id, trangThai);

        public Task<int> SyncTrangThaiTheoThoiGianAsync()
            => _repo.SyncTrangThaiTheoThoiGianAsync();

        public async Task<IEnumerable<SuKien>> GetExpiredEventsAsync()
        {
            await _repo.SyncTrangThaiTheoThoiGianAsync();
            return await _repo.GetExpiredEventsAsync();
        }

        public List<SuKien> GetPending()
            => _repo.GetPending();

        public bool Approve(int suKienId)
            => _repo.Approve(suKienId);

        public bool Cancel(int suKienId)
            => _repo.Cancel(suKienId);

        public Task<bool> DeleteAsync(int suKienId)
            => _repo.DeleteAsync(suKienId);
    }
}
