using Data;
using Models;
using Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implementations
{
    public class ThongBaoRepository : IThongBaoRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public ThongBaoRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<int> GuiThongBaoAsync(int suKienId, List<int> nguoiDungIds, string loaiThongBao, string tieuDe, string noiDung, string? ghiChu = null)
        {
            if (nguoiDungIds == null || nguoiDungIds.Count == 0)
                return 0;

            const string sql = @"
INSERT INTO dbo.ThongBao (NguoiDungID, DonHangID, VeID, LoaiThongBao, TieuDe, NoiDung, TrangThai, ThoiGianTao, ThoiGianGui, GhiChu)
VALUES (@NguoiDungID, NULL, NULL, @LoaiThongBao, @TieuDe, @NoiDung, 1, SYSDATETIME(), SYSDATETIME(), @GhiChu);";

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            int count = 0;
            foreach (var nguoiDungId in nguoiDungIds)
            {
                using var cmd = conn.CreateCommand();
                cmd.CommandText = sql;

                var p1 = cmd.CreateParameter();
                p1.ParameterName = "@NguoiDungID";
                p1.Value = nguoiDungId;
                cmd.Parameters.Add(p1);

                var p2 = cmd.CreateParameter();
                p2.ParameterName = "@LoaiThongBao";
                p2.Value = loaiThongBao;
                cmd.Parameters.Add(p2);

                var p3 = cmd.CreateParameter();
                p3.ParameterName = "@TieuDe";
                p3.Value = tieuDe;
                cmd.Parameters.Add(p3);

                var p4 = cmd.CreateParameter();
                p4.ParameterName = "@NoiDung";
                p4.Value = noiDung;
                cmd.Parameters.Add(p4);

                var p5 = cmd.CreateParameter();
                p5.ParameterName = "@GhiChu";
                p5.Value = (object?)ghiChu ?? DBNull.Value;
                cmd.Parameters.Add(p5);

                count += cmd.ExecuteNonQuery();
            }

            return await Task.FromResult(count);
        }

        public async Task<int> GuiThongBaoTatCaAsync(int suKienId, string loaiThongBao, string tieuDe, string noiDung, string? ghiChu = null)
        {
            const string sql = @"
INSERT INTO dbo.ThongBao (NguoiDungID, DonHangID, VeID, LoaiThongBao, TieuDe, NoiDung, TrangThai, ThoiGianTao, ThoiGianGui, GhiChu)
SELECT DISTINCT 
    dh.NguoiMuaID,
    NULL,
    NULL,
    @LoaiThongBao,
    @TieuDe,
    @NoiDung,
    1,
    SYSDATETIME(),
    SYSDATETIME(),
    @GhiChu
FROM dbo.DonHang dh
WHERE dh.SuKienID = @SuKienID
  AND dh.TrangThai = 1;";

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;

            var p1 = cmd.CreateParameter();
            p1.ParameterName = "@SuKienID";
            p1.Value = suKienId;
            cmd.Parameters.Add(p1);

            var p2 = cmd.CreateParameter();
            p2.ParameterName = "@LoaiThongBao";
            p2.Value = loaiThongBao;
            cmd.Parameters.Add(p2);

            var p3 = cmd.CreateParameter();
            p3.ParameterName = "@TieuDe";
            p3.Value = tieuDe;
            cmd.Parameters.Add(p3);

            var p4 = cmd.CreateParameter();
            p4.ParameterName = "@NoiDung";
            p4.Value = noiDung;
            cmd.Parameters.Add(p4);

            var p5 = cmd.CreateParameter();
            p5.ParameterName = "@GhiChu";
            p5.Value = (object?)ghiChu ?? DBNull.Value;
            cmd.Parameters.Add(p5);

            int count = cmd.ExecuteNonQuery();
            return await Task.FromResult(count);
        }

        public async Task<bool> GuiThongBaoTheoVeAsync(int veId, string loaiThongBao, string tieuDe, string noiDung, string? ghiChu = null)
        {
            const string sql = @"
INSERT INTO dbo.ThongBao (NguoiDungID, DonHangID, VeID, LoaiThongBao, TieuDe, NoiDung, TrangThai, ThoiGianTao, ThoiGianGui, GhiChu)
SELECT 
    dh.NguoiMuaID,
    v.DonHangID,
    v.VeID,
    @LoaiThongBao,
    @TieuDe,
    @NoiDung,
    1,
    SYSDATETIME(),
    SYSDATETIME(),
    @GhiChu
FROM dbo.Ve v
JOIN dbo.DonHang dh ON dh.DonHangID = v.DonHangID
WHERE v.VeID = @VeID;";

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;

            var p1 = cmd.CreateParameter();
            p1.ParameterName = "@VeID";
            p1.Value = veId;
            cmd.Parameters.Add(p1);

            var p2 = cmd.CreateParameter();
            p2.ParameterName = "@LoaiThongBao";
            p2.Value = loaiThongBao;
            cmd.Parameters.Add(p2);

            var p3 = cmd.CreateParameter();
            p3.ParameterName = "@TieuDe";
            p3.Value = tieuDe;
            cmd.Parameters.Add(p3);

            var p4 = cmd.CreateParameter();
            p4.ParameterName = "@NoiDung";
            p4.Value = noiDung;
            cmd.Parameters.Add(p4);

            var p5 = cmd.CreateParameter();
            p5.ParameterName = "@GhiChu";
            p5.Value = (object?)ghiChu ?? DBNull.Value;
            cmd.Parameters.Add(p5);

            int count = cmd.ExecuteNonQuery();
            return await Task.FromResult(count > 0);
        }

        public async Task<List<ThongBao>> GetBySuKienAsync(int suKienId, byte? trangThai = null)
        {
            const string sql = @"
SELECT DISTINCT
    tb.ThongBaoID,
    tb.NguoiDungID,
    tb.DonHangID,
    tb.VeID,
    tb.LoaiThongBao,
    tb.TieuDe,
    tb.NoiDung,
    tb.TrangThai,
    tb.ThoiGianTao,
    tb.ThoiGianGui,
    tb.GhiChu
FROM dbo.ThongBao tb
LEFT JOIN dbo.DonHang dh ON dh.NguoiMuaID = tb.NguoiDungID
WHERE dh.SuKienID = @SuKienID
  AND (@TrangThai IS NULL OR tb.TrangThai = @TrangThai)
ORDER BY tb.ThoiGianTao DESC;";

            var result = new List<ThongBao>();

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;

            var p1 = cmd.CreateParameter();
            p1.ParameterName = "@SuKienID";
            p1.Value = suKienId;
            cmd.Parameters.Add(p1);

            var p2 = cmd.CreateParameter();
            p2.ParameterName = "@TrangThai";
            p2.Value = (object?)trangThai ?? DBNull.Value;
            cmd.Parameters.Add(p2);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                result.Add(new ThongBao
                {
                    ThongBaoID = reader.GetInt32(reader.GetOrdinal("ThongBaoID")),
                    NguoiDungID = reader.GetInt32(reader.GetOrdinal("NguoiDungID")),
                    DonHangID = reader.IsDBNull(reader.GetOrdinal("DonHangID")) ? null : reader.GetInt32(reader.GetOrdinal("DonHangID")),
                    VeID = reader.IsDBNull(reader.GetOrdinal("VeID")) ? null : reader.GetInt32(reader.GetOrdinal("VeID")),
                    LoaiThongBao = reader.GetString(reader.GetOrdinal("LoaiThongBao")),
                    TieuDe = reader.GetString(reader.GetOrdinal("TieuDe")),
                    NoiDung = reader.GetString(reader.GetOrdinal("NoiDung")),
                    TrangThai = reader.GetByte(reader.GetOrdinal("TrangThai")),
                    ThoiGianTao = reader.GetDateTime(reader.GetOrdinal("ThoiGianTao")),
                    ThoiGianGui = reader.IsDBNull(reader.GetOrdinal("ThoiGianGui")) ? null : reader.GetDateTime(reader.GetOrdinal("ThoiGianGui")),
                    GhiChu = reader.IsDBNull(reader.GetOrdinal("GhiChu")) ? null : reader.GetString(reader.GetOrdinal("GhiChu"))
                });
            }

            return await Task.FromResult(result);
        }

        public async Task<ThongBao?> GetByIdAsync(int thongBaoId)
        {
            const string sql = @"
SELECT 
    ThongBaoID,
    NguoiDungID,
    DonHangID,
    VeID,
    LoaiThongBao,
    TieuDe,
    NoiDung,
    TrangThai,
    ThoiGianTao,
    ThoiGianGui,
    GhiChu
FROM dbo.ThongBao
WHERE ThongBaoID = @ThongBaoID;";

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;

            var p = cmd.CreateParameter();
            p.ParameterName = "@ThongBaoID";
            p.Value = thongBaoId;
            cmd.Parameters.Add(p);

            using var reader = cmd.ExecuteReader();
            if (!reader.Read())
                return await Task.FromResult<ThongBao?>(null);

            return await Task.FromResult(new ThongBao
            {
                ThongBaoID = reader.GetInt32(reader.GetOrdinal("ThongBaoID")),
                NguoiDungID = reader.GetInt32(reader.GetOrdinal("NguoiDungID")),
                DonHangID = reader.IsDBNull(reader.GetOrdinal("DonHangID")) ? null : reader.GetInt32(reader.GetOrdinal("DonHangID")),
                VeID = reader.IsDBNull(reader.GetOrdinal("VeID")) ? null : reader.GetInt32(reader.GetOrdinal("VeID")),
                LoaiThongBao = reader.GetString(reader.GetOrdinal("LoaiThongBao")),
                TieuDe = reader.GetString(reader.GetOrdinal("TieuDe")),
                NoiDung = reader.GetString(reader.GetOrdinal("NoiDung")),
                TrangThai = reader.GetByte(reader.GetOrdinal("TrangThai")),
                ThoiGianTao = reader.GetDateTime(reader.GetOrdinal("ThoiGianTao")),
                ThoiGianGui = reader.IsDBNull(reader.GetOrdinal("ThoiGianGui")) ? null : reader.GetDateTime(reader.GetOrdinal("ThoiGianGui")),
                GhiChu = reader.IsDBNull(reader.GetOrdinal("GhiChu")) ? null : reader.GetString(reader.GetOrdinal("GhiChu"))
            });
        }

        public async Task<List<ThongBao>> GetByNguoiDungIdAsync(int nguoiDungId, byte? trangThai = null)
        {
            const string sql = @"
SELECT 
    ThongBaoID,
    NguoiDungID,
    DonHangID,
    VeID,
    LoaiThongBao,
    TieuDe,
    NoiDung,
    TrangThai,
    ThoiGianTao,
    ThoiGianGui,
    GhiChu
FROM dbo.ThongBao
WHERE NguoiDungID = @NguoiDungID
  AND (@TrangThai IS NULL OR TrangThai = @TrangThai)
ORDER BY ThoiGianTao DESC;";

            var result = new List<ThongBao>();

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;

            var p1 = cmd.CreateParameter();
            p1.ParameterName = "@NguoiDungID";
            p1.Value = nguoiDungId;
            cmd.Parameters.Add(p1);

            var p2 = cmd.CreateParameter();
            p2.ParameterName = "@TrangThai";
            p2.Value = (object?)trangThai ?? DBNull.Value;
            cmd.Parameters.Add(p2);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                result.Add(new ThongBao
                {
                    ThongBaoID = reader.GetInt32(reader.GetOrdinal("ThongBaoID")),
                    NguoiDungID = reader.GetInt32(reader.GetOrdinal("NguoiDungID")),
                    DonHangID = reader.IsDBNull(reader.GetOrdinal("DonHangID")) ? null : reader.GetInt32(reader.GetOrdinal("DonHangID")),
                    VeID = reader.IsDBNull(reader.GetOrdinal("VeID")) ? null : reader.GetInt32(reader.GetOrdinal("VeID")),
                    LoaiThongBao = reader.GetString(reader.GetOrdinal("LoaiThongBao")),
                    TieuDe = reader.GetString(reader.GetOrdinal("TieuDe")),
                    NoiDung = reader.GetString(reader.GetOrdinal("NoiDung")),
                    TrangThai = reader.GetByte(reader.GetOrdinal("TrangThai")),
                    ThoiGianTao = reader.GetDateTime(reader.GetOrdinal("ThoiGianTao")),
                    ThoiGianGui = reader.IsDBNull(reader.GetOrdinal("ThoiGianGui")) ? null : reader.GetDateTime(reader.GetOrdinal("ThoiGianGui")),
                    GhiChu = reader.IsDBNull(reader.GetOrdinal("GhiChu")) ? null : reader.GetString(reader.GetOrdinal("GhiChu"))
                });
            }

            return await Task.FromResult(result);
        }

        public async Task<bool> MarkAsReadAsync(int thongBaoId)
        {
            const string sql = @"
UPDATE dbo.ThongBao
SET TrangThai = 1
WHERE ThongBaoID = @ThongBaoID;";

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;

            var p = cmd.CreateParameter();
            p.ParameterName = "@ThongBaoID";
            p.Value = thongBaoId;
            cmd.Parameters.Add(p);

            int affected = cmd.ExecuteNonQuery();
            return await Task.FromResult(affected > 0);
        }

        public async Task<int> GetUnreadCountAsync(int nguoiDungId)
        {
            const string sql = @"
SELECT COUNT(*)
FROM dbo.ThongBao
WHERE NguoiDungID = @NguoiDungID
  AND TrangThai = 0;";

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;

            var p = cmd.CreateParameter();
            p.ParameterName = "@NguoiDungID";
            p.Value = nguoiDungId;
            cmd.Parameters.Add(p);

            var result = cmd.ExecuteScalar();
            return await Task.FromResult(Convert.ToInt32(result));
        }
    }
}
