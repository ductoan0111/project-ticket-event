using Microsoft.Data.SqlClient;
using Models;
using Models.DTOs.Requests;

namespace Services.Interfaces
{
    public interface IThanhToanService
    {
        Task<IEnumerable<ThanhToan>> GetHistoryAsync(int nguoiMuaId);
        Task<IEnumerable<ThanhToan>> GetHistoryByDonHangAsync(int nguoiMuaId, int donHangId);
        int Insert(ThanhToan thanhToan, SqlConnection conn, SqlTransaction tran);
        Task<object> MockThanhToanAsync(int donHangId, int nguoiMuaId, ThanhToanRequest req);
    }
}
