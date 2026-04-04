using Models;

namespace Services.Interfaces
{
    public interface ISuKienYeuThichService
    {
        Task<(bool Success, string Message)> AddFavoriteAsync(int nguoiDungId, int suKienId);
        Task<(bool Success, string Message)> RemoveFavoriteAsync(int nguoiDungId, int suKienId);
        Task<bool> IsFavoriteAsync(int nguoiDungId, int suKienId);
        Task<List<SuKien>> GetFavoriteEventsAsync(int nguoiDungId);
        Task<List<int>> GetFavoriteIdsAsync(int nguoiDungId);
        Task<int> GetFavoriteCountAsync(int suKienId);
    }
}
