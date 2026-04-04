using Data;
using Models;
using Repositories.Interfaces;
using System.Data;

namespace Repositories.Implementations
{
    public class SuKienYeuThichRepository : ISuKienYeuThichRepository
    {
        private readonly IDbConnectionFactory _factory;

        public SuKienYeuThichRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        // Thêm yêu thích — trả về YeuThichID mới hoặc -1 nếu đã tồn tại
        public async Task<int> AddAsync(int nguoiDungId, int suKienId)
        {
            const string checkSql = @"
SELECT COUNT(1) FROM dbo.SuKienYeuThich
WHERE NguoiDungID = @NguoiDungID AND SuKienID = @SuKienID;";

            const string insertSql = @"
INSERT INTO dbo.SuKienYeuThich (NguoiDungID, SuKienID, NgayThem)
VALUES (@NguoiDungID, @SuKienID, SYSDATETIME());
SELECT CAST(SCOPE_IDENTITY() AS INT);";

            using var conn = _factory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            // Kiểm tra đã tồn tại
            using var checkCmd = conn.CreateCommand();
            checkCmd.CommandText = checkSql;
            AddParam(checkCmd, "@NguoiDungID", nguoiDungId);
            AddParam(checkCmd, "@SuKienID", suKienId);

            var count = Convert.ToInt32(checkCmd.ExecuteScalar());
            if (count > 0) return -1; // Đã yêu thích rồi

            // Thêm mới
            using var insertCmd = conn.CreateCommand();
            insertCmd.CommandText = insertSql;
            AddParam(insertCmd, "@NguoiDungID", nguoiDungId);
            AddParam(insertCmd, "@SuKienID", suKienId);

            var newId = insertCmd.ExecuteScalar();
            return newId != null ? Convert.ToInt32(newId) : 0;
        }

        // Xóa yêu thích
        public async Task<bool> RemoveAsync(int nguoiDungId, int suKienId)
        {
            const string sql = @"
DELETE FROM dbo.SuKienYeuThich
WHERE NguoiDungID = @NguoiDungID AND SuKienID = @SuKienID;";

            using var conn = _factory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            AddParam(cmd, "@NguoiDungID", nguoiDungId);
            AddParam(cmd, "@SuKienID", suKienId);

            return cmd.ExecuteNonQuery() > 0;
        }

        // Kiểm tra đã yêu thích chưa
        public async Task<bool> ExistsAsync(int nguoiDungId, int suKienId)
        {
            const string sql = @"
SELECT COUNT(1) FROM dbo.SuKienYeuThich
WHERE NguoiDungID = @NguoiDungID AND SuKienID = @SuKienID;";

            using var conn = _factory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            AddParam(cmd, "@NguoiDungID", nguoiDungId);
            AddParam(cmd, "@SuKienID", suKienId);

            return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
        }

        // Lấy danh sách SuKienID yêu thích của người dùng
        public async Task<List<int>> GetFavoriteSuKienIdsAsync(int nguoiDungId)
        {
            const string sql = @"
SELECT SuKienID FROM dbo.SuKienYeuThich
WHERE NguoiDungID = @NguoiDungID
ORDER BY NgayThem DESC;";

            var ids = new List<int>();

            using var conn = _factory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            AddParam(cmd, "@NguoiDungID", nguoiDungId);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
                ids.Add(reader.GetInt32(0));

            return ids;
        }

        // Lấy danh sách sự kiện yêu thích (JOIN với SuKien)
        public async Task<List<SuKien>> GetFavoriteEventsAsync(int nguoiDungId)
        {
            const string sql = @"
SELECT sk.SuKienID, sk.DanhMucID, sk.DiaDiemID, sk.ToChucID,
       sk.TenSuKien, sk.MoTa, sk.ThoiGianBatDau, sk.ThoiGianKetThuc,
       sk.AnhBiaUrl, sk.TrangThai, sk.NgayTao
FROM dbo.SuKien sk
INNER JOIN dbo.SuKienYeuThich yt ON yt.SuKienID = sk.SuKienID
WHERE yt.NguoiDungID = @NguoiDungID
ORDER BY yt.NgayThem DESC;";

            var result = new List<SuKien>();

            using var conn = _factory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            AddParam(cmd, "@NguoiDungID", nguoiDungId);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                result.Add(new SuKien
                {
                    SuKienID        = reader.GetInt32(reader.GetOrdinal("SuKienID")),
                    DanhMucID       = reader.GetInt32(reader.GetOrdinal("DanhMucID")),
                    DiaDiemID       = reader.GetInt32(reader.GetOrdinal("DiaDiemID")),
                    ToChucID        = reader.GetInt32(reader.GetOrdinal("ToChucID")),
                    TenSuKien       = reader.GetString(reader.GetOrdinal("TenSuKien")),
                    MoTa            = reader.IsDBNull(reader.GetOrdinal("MoTa")) ? null : reader.GetString(reader.GetOrdinal("MoTa")),
                    ThoiGianBatDau  = reader.GetDateTime(reader.GetOrdinal("ThoiGianBatDau")),
                    ThoiGianKetThuc = reader.GetDateTime(reader.GetOrdinal("ThoiGianKetThuc")),
                    AnhBiaUrl       = reader.IsDBNull(reader.GetOrdinal("AnhBiaUrl")) ? null : reader.GetString(reader.GetOrdinal("AnhBiaUrl")),
                    TrangThai       = reader.GetByte(reader.GetOrdinal("TrangThai")),
                    NgayTao         = reader.GetDateTime(reader.GetOrdinal("NgayTao"))
                });
            }

            return result;
        }

        // Đếm số người yêu thích của 1 sự kiện
        public async Task<int> CountByEventAsync(int suKienId)
        {
            const string sql = @"
SELECT COUNT(1) FROM dbo.SuKienYeuThich WHERE SuKienID = @SuKienID;";

            using var conn = _factory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            AddParam(cmd, "@SuKienID", suKienId);

            return Convert.ToInt32(cmd.ExecuteScalar());
        }

        private static void AddParam(IDbCommand cmd, string name, object value)
        {
            var p = cmd.CreateParameter();
            p.ParameterName = name;
            p.Value = value;
            cmd.Parameters.Add(p);
        }
    }
}
