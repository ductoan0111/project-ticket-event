using Models;

namespace Repositories.Interfaces
{
    public interface ISuKienYeuThichRepository
    {
        /// <summary>Thêm sự kiện vào danh sách yêu thích. Trả về ID mới tạo hoặc -1 nếu đã tồn tại.</summary>
        Task<int> AddAsync(int nguoiDungId, int suKienId);

        /// <summary>Xóa sự kiện khỏi danh sách yêu thích. Trả về true nếu xóa được.</summary>
        Task<bool> RemoveAsync(int nguoiDungId, int suKienId);

        /// <summary>Kiểm tra xem người dùng đã yêu thích sự kiện này chưa.</summary>
        Task<bool> ExistsAsync(int nguoiDungId, int suKienId);

        /// <summary>Lấy danh sách SuKienID mà người dùng đã yêu thích.</summary>
        Task<List<int>> GetFavoriteSuKienIdsAsync(int nguoiDungId);

        /// <summary>Lấy danh sách sự kiện yêu thích (join với SuKien để lấy đầy đủ thông tin).</summary>
        Task<List<SuKien>> GetFavoriteEventsAsync(int nguoiDungId);

        /// <summary>Đếm số người yêu thích của một sự kiện.</summary>
        Task<int> CountByEventAsync(int suKienId);
    }
}
