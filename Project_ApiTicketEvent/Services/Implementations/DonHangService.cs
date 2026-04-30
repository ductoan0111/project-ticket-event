using Models;
using Models.DTOs.Requests;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class DonHangService : IDonHangService
    {
        private readonly IDonHangRepository _repo;

        public DonHangService(IDonHangRepository repo)
        {
            _repo = repo;
        }

        public Task<List<DonHang>> GetByNguoiMuaAsync(int nguoiMuaId)
            => _repo.GetByNguoiMuaAsync(nguoiMuaId);

        public Task<DonHangDetail?> GetDetailAsync(int donHangId, int nguoiMuaId)
            => _repo.GetDetailAsync(donHangId, nguoiMuaId);

        public Task<int> CreateAsync(TaoDonHangRequest req)
            => _repo.CreateAsync(req);

        public Task<bool> CancelAsync(int donHangId, int nguoiMuaId)
            => _repo.CancelAsync(donHangId, nguoiMuaId);

        // Organizer APIs
        public Task<List<DonHang>> GetBySuKienIdAsync(int suKienId, byte? trangThai = null)
            => _repo.GetBySuKienIdAsync(suKienId, trangThai);

        public Task<DonHangDetail?> GetDetailBySuKienAsync(int donHangId, int suKienId)
            => _repo.GetDetailBySuKienAsync(donHangId, suKienId);

        public Task<Dictionary<string, object>> GetThongKeAsync(int suKienId)
            => _repo.GetThongKeAsync(suKienId);

        public Task<decimal> GetTongDoanhThuAsync()
            => _repo.GetTongDoanhThuAsync();
    }
}
