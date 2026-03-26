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

        public Task<IEnumerable<SuKien>> GetAllAsync()
            => _repo.GetAllAsync();

        public Task<List<SuKienRequest>> GetByNameAsync(string tenSuKien)
            => _repo.GetByNameAsync(tenSuKien, trangThai: true);

        public Task<List<SuKienRequest>> GetByDanhMucNameAsync(string tenDanhMuc)
            => _repo.GetByDanhMucNameAsync(tenDanhMuc, trangThai: true);

        public Task<SuKien?> GetByIdAsync(int id)
            => _repo.GetByIdAsync(id);

        public Task<int> CreateAsync(SuKien suKien)
            => _repo.CreateAsync(suKien);

        public Task<bool> UpdateAsync(SuKien suKien)
            => _repo.UpdateAsync(suKien);

        public Task<bool> UpdateTrangThaiAsync(int id, byte trangThai)
            => _repo.UpdateTrangThaiAsync(id, trangThai);

        public Task<IEnumerable<SuKien>> GetExpiredEventsAsync()
            => _repo.GetExpiredEventsAsync();

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
