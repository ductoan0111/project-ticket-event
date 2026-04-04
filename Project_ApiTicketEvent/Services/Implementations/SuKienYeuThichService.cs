using Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class SuKienYeuThichService : ISuKienYeuThichService
    {
        private readonly ISuKienYeuThichRepository _repo;

        public SuKienYeuThichService(ISuKienYeuThichRepository repo)
        {
            _repo = repo;
        }

        public async Task<(bool Success, string Message)> AddFavoriteAsync(int nguoiDungId, int suKienId)
        {
            var result = await _repo.AddAsync(nguoiDungId, suKienId);

            if (result == -1)
                return (false, "Sự kiện này đã có trong danh sách yêu thích của bạn.");

            if (result == 0)
                return (false, "Không thể thêm vào danh sách yêu thích.");

            return (true, "Đã thêm vào danh sách yêu thích.");
        }

        public async Task<(bool Success, string Message)> RemoveFavoriteAsync(int nguoiDungId, int suKienId)
        {
            var removed = await _repo.RemoveAsync(nguoiDungId, suKienId);

            if (!removed)
                return (false, "Sự kiện này không có trong danh sách yêu thích của bạn.");

            return (true, "Đã xóa khỏi danh sách yêu thích.");
        }

        public Task<bool> IsFavoriteAsync(int nguoiDungId, int suKienId)
            => _repo.ExistsAsync(nguoiDungId, suKienId);

        public Task<List<SuKien>> GetFavoriteEventsAsync(int nguoiDungId)
            => _repo.GetFavoriteEventsAsync(nguoiDungId);

        public Task<List<int>> GetFavoriteIdsAsync(int nguoiDungId)
            => _repo.GetFavoriteSuKienIdsAsync(nguoiDungId);

        public Task<int> GetFavoriteCountAsync(int suKienId)
            => _repo.CountByEventAsync(suKienId);
    }
}
