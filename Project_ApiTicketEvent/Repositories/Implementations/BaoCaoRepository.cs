using Data;
using Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implementations
{
    public class BaoCaoRepository : IBaoCaoRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public BaoCaoRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<Dictionary<string, object>> GetTongQuanAsync(int suKienId)
        {
            const string sql = @"
-- Thống kê đơn hàng
SELECT 
    COUNT(DISTINCT dh.DonHangID) AS TongDonHang,
    SUM(CASE WHEN dh.TrangThai = 1 THEN 1 ELSE 0 END) AS DonDaThanhToan,
    SUM(CASE WHEN dh.TrangThai = 1 THEN dh.TongTien ELSE 0 END) AS TongDoanhThu,
    
    -- Thống kê vé
    COUNT(DISTINCT v.VeID) AS TongVeDaBan,
    SUM(CASE WHEN v.TrangThai = 1 THEN 1 ELSE 0 END) AS VeDaSuDung,
    SUM(CASE WHEN v.TrangThai = 0 THEN 1 ELSE 0 END) AS VeChuaSuDung,
    
    -- Thống kê loại vé
    SUM(lv.SoLuongToiDa) AS TongSoLuongVe,
    SUM(lv.SoLuongDaBan) AS TongVeDaBan2,
    SUM(lv.SoLuongToiDa - lv.SoLuongDaBan) AS SoVeConLai,
    
    -- Thống kê check-in
    COUNT(DISTINCT nk.CheckinID) AS TongLanQuet,
    SUM(CASE WHEN nk.KetQua = 1 THEN 1 ELSE 0 END) AS CheckInThanhCong,
    SUM(CASE WHEN nk.KetQua = 0 THEN 1 ELSE 0 END) AS CheckInThatBai
    
FROM dbo.SuKien sk
LEFT JOIN dbo.DonHang dh ON dh.SuKienID = sk.SuKienID
LEFT JOIN dbo.Ve v ON v.DonHangID = dh.DonHangID
LEFT JOIN dbo.LoaiVe lv ON lv.SuKienID = sk.SuKienID
LEFT JOIN dbo.NhatKyCheckin nk ON nk.SuKienID = sk.SuKienID
WHERE sk.SuKienID = @SuKienID
GROUP BY sk.SuKienID;";

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;

            var p = cmd.CreateParameter();
            p.ParameterName = "@SuKienID";
            p.Value = suKienId;
            cmd.Parameters.Add(p);

            using var reader = cmd.ExecuteReader();
            if (!reader.Read())
            {
                return new Dictionary<string, object>
                {
                    ["tongDonHang"] = 0,
                    ["donDaThanhToan"] = 0,
                    ["tongDoanhThu"] = 0m,
                    ["tongVeDaBan"] = 0,
                    ["veDaSuDung"] = 0,
                    ["veChuaSuDung"] = 0,
                    ["tongSoLuongVe"] = 0,
                    ["soVeConLai"] = 0,
                    ["tongLanQuet"] = 0,
                    ["checkInThanhCong"] = 0,
                    ["checkInThatBai"] = 0
                };
            }

            return await Task.FromResult(new Dictionary<string, object>
            {
                ["tongDonHang"] = reader.GetInt32(reader.GetOrdinal("TongDonHang")),
                ["donDaThanhToan"] = reader.GetInt32(reader.GetOrdinal("DonDaThanhToan")),
                ["tongDoanhThu"] = reader.GetDecimal(reader.GetOrdinal("TongDoanhThu")),
                ["tongVeDaBan"] = reader.GetInt32(reader.GetOrdinal("TongVeDaBan")),
                ["veDaSuDung"] = reader.GetInt32(reader.GetOrdinal("VeDaSuDung")),
                ["veChuaSuDung"] = reader.GetInt32(reader.GetOrdinal("VeChuaSuDung")),
                ["tongSoLuongVe"] = reader.GetInt32(reader.GetOrdinal("TongSoLuongVe")),
                ["soVeConLai"] = reader.GetInt32(reader.GetOrdinal("SoVeConLai")),
                ["tongLanQuet"] = reader.GetInt32(reader.GetOrdinal("TongLanQuet")),
                ["checkInThanhCong"] = reader.GetInt32(reader.GetOrdinal("CheckInThanhCong")),
                ["checkInThatBai"] = reader.GetInt32(reader.GetOrdinal("CheckInThatBai"))
            });
        }

        public async Task<List<Dictionary<string, object>>> GetDoanhThuTheoNgayAsync(int suKienId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            const string sql = @"
SELECT 
    CAST(dh.NgayDat AS DATE) AS Ngay,
    COUNT(*) AS SoDonHang,
    SUM(dh.TongTien) AS DoanhThu,
    COUNT(DISTINCT dh.NguoiMuaID) AS SoKhachHang
FROM dbo.DonHang dh
WHERE dh.SuKienID = @SuKienID
  AND dh.TrangThai = 1
  AND (@FromDate IS NULL OR dh.NgayDat >= @FromDate)
  AND (@ToDate IS NULL OR dh.NgayDat <= @ToDate)
GROUP BY CAST(dh.NgayDat AS DATE)
ORDER BY Ngay DESC;";

            var result = new List<Dictionary<string, object>>();

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;

            var p1 = cmd.CreateParameter();
            p1.ParameterName = "@SuKienID";
            p1.Value = suKienId;
            cmd.Parameters.Add(p1);

            var p2 = cmd.CreateParameter();
            p2.ParameterName = "@FromDate";
            p2.Value = (object?)fromDate ?? DBNull.Value;
            cmd.Parameters.Add(p2);

            var p3 = cmd.CreateParameter();
            p3.ParameterName = "@ToDate";
            p3.Value = (object?)toDate ?? DBNull.Value;
            cmd.Parameters.Add(p3);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                result.Add(new Dictionary<string, object>
                {
                    ["ngay"] = reader.GetDateTime(reader.GetOrdinal("Ngay")),
                    ["soDonHang"] = reader.GetInt32(reader.GetOrdinal("SoDonHang")),
                    ["doanhThu"] = reader.GetDecimal(reader.GetOrdinal("DoanhThu")),
                    ["soKhachHang"] = reader.GetInt32(reader.GetOrdinal("SoKhachHang"))
                });
            }

            return await Task.FromResult(result);
        }

        public async Task<List<Dictionary<string, object>>> GetLoaiVeBanChayAsync(int suKienId)
        {
            const string sql = @"
SELECT 
    lv.LoaiVeID,
    lv.TenLoaiVe,
    lv.DonGia,
    lv.SoLuongToiDa,
    lv.SoLuongDaBan,
    (lv.SoLuongToiDa - lv.SoLuongDaBan) AS SoLuongConLai,
    (lv.SoLuongDaBan * lv.DonGia) AS DoanhThu,
    CAST(lv.SoLuongDaBan * 100.0 / NULLIF(lv.SoLuongToiDa, 0) AS DECIMAL(5,2)) AS TyLeBan
FROM dbo.LoaiVe lv
WHERE lv.SuKienID = @SuKienID
ORDER BY lv.SoLuongDaBan DESC;";

            var result = new List<Dictionary<string, object>>();

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;

            var p = cmd.CreateParameter();
            p.ParameterName = "@SuKienID";
            p.Value = suKienId;
            cmd.Parameters.Add(p);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                result.Add(new Dictionary<string, object>
                {
                    ["loaiVeID"] = reader.GetInt32(reader.GetOrdinal("LoaiVeID")),
                    ["tenLoaiVe"] = reader.GetString(reader.GetOrdinal("TenLoaiVe")),
                    ["donGia"] = reader.GetDecimal(reader.GetOrdinal("DonGia")),
                    ["soLuongToiDa"] = reader.GetInt32(reader.GetOrdinal("SoLuongToiDa")),
                    ["soLuongDaBan"] = reader.GetInt32(reader.GetOrdinal("SoLuongDaBan")),
                    ["soLuongConLai"] = reader.GetInt32(reader.GetOrdinal("SoLuongConLai")),
                    ["doanhThu"] = reader.GetDecimal(reader.GetOrdinal("DoanhThu")),
                    ["tyLeBan"] = reader.GetDecimal(reader.GetOrdinal("TyLeBan"))
                });
            }

            return await Task.FromResult(result);
        }

        public async Task<List<Dictionary<string, object>>> GetTopKhachHangAsync(int suKienId, int top = 10)
        {
            string sql = $@"
SELECT TOP {top}
    nd.NguoiDungID,
    nd.HoTen,
    nd.Email,
    nd.SoDienThoai,
    COUNT(DISTINCT dh.DonHangID) AS SoDonHang,
    SUM(dh.TongTien) AS TongChiTieu,
    COUNT(DISTINCT v.VeID) AS SoVeMua
FROM dbo.DonHang dh
JOIN dbo.NguoiDung nd ON nd.NguoiDungID = dh.NguoiMuaID
LEFT JOIN dbo.Ve v ON v.DonHangID = dh.DonHangID
WHERE dh.SuKienID = @SuKienID
  AND dh.TrangThai = 1
GROUP BY nd.NguoiDungID, nd.HoTen, nd.Email, nd.SoDienThoai
ORDER BY TongChiTieu DESC;";

            var result = new List<Dictionary<string, object>>();

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;

            var p = cmd.CreateParameter();
            p.ParameterName = "@SuKienID";
            p.Value = suKienId;
            cmd.Parameters.Add(p);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                result.Add(new Dictionary<string, object>
                {
                    ["nguoiDungID"] = reader.GetInt32(reader.GetOrdinal("NguoiDungID")),
                    ["hoTen"] = reader.GetString(reader.GetOrdinal("HoTen")),
                    ["email"] = reader.GetString(reader.GetOrdinal("Email")),
                    ["soDienThoai"] = reader.IsDBNull(reader.GetOrdinal("SoDienThoai")) ? null : reader.GetString(reader.GetOrdinal("SoDienThoai")),
                    ["soDonHang"] = reader.GetInt32(reader.GetOrdinal("SoDonHang")),
                    ["tongChiTieu"] = reader.GetDecimal(reader.GetOrdinal("TongChiTieu")),
                    ["soVeMua"] = reader.GetInt32(reader.GetOrdinal("SoVeMua"))
                });
            }

            return await Task.FromResult(result);
        }

        public async Task<Dictionary<string, object>> GetThongKeCheckInAsync(int suKienId)
        {
            const string sql = @"
SELECT 
    COUNT(*) AS TongLanQuet,
    SUM(CASE WHEN KetQua = 1 THEN 1 ELSE 0 END) AS ThanhCong,
    SUM(CASE WHEN KetQua = 0 THEN 1 ELSE 0 END) AS ThatBai,
    COUNT(DISTINCT VeID) AS SoVeDuocQuet,
    COUNT(DISTINCT NhanVienID) AS SoNhanVien
FROM dbo.NhatKyCheckin
WHERE SuKienID = @SuKienID;";

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;

            var p = cmd.CreateParameter();
            p.ParameterName = "@SuKienID";
            p.Value = suKienId;
            cmd.Parameters.Add(p);

            using var reader = cmd.ExecuteReader();
            if (!reader.Read())
            {
                return new Dictionary<string, object>
                {
                    ["tongLanQuet"] = 0,
                    ["thanhCong"] = 0,
                    ["thatBai"] = 0,
                    ["soVeDuocQuet"] = 0,
                    ["soNhanVien"] = 0
                };
            }

            return await Task.FromResult(new Dictionary<string, object>
            {
                ["tongLanQuet"] = reader.GetInt32(reader.GetOrdinal("TongLanQuet")),
                ["thanhCong"] = reader.GetInt32(reader.GetOrdinal("ThanhCong")),
                ["thatBai"] = reader.GetInt32(reader.GetOrdinal("ThatBai")),
                ["soVeDuocQuet"] = reader.GetInt32(reader.GetOrdinal("SoVeDuocQuet")),
                ["soNhanVien"] = reader.GetInt32(reader.GetOrdinal("SoNhanVien"))
            });
        }

        public async Task<List<Dictionary<string, object>>> GetCheckInTheoGioAsync(int suKienId)
        {
            const string sql = @"
SELECT 
    DATEPART(HOUR, ThoiGianCheckin) AS Gio,
    COUNT(*) AS SoLanQuet,
    SUM(CASE WHEN KetQua = 1 THEN 1 ELSE 0 END) AS ThanhCong,
    SUM(CASE WHEN KetQua = 0 THEN 1 ELSE 0 END) AS ThatBai
FROM dbo.NhatKyCheckin
WHERE SuKienID = @SuKienID
  AND KetQua = 1
GROUP BY DATEPART(HOUR, ThoiGianCheckin)
ORDER BY Gio;";

            var result = new List<Dictionary<string, object>>();

            using var conn = _connectionFactory.CreateConnection();
            if (conn.State != ConnectionState.Open) conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;

            var p = cmd.CreateParameter();
            p.ParameterName = "@SuKienID";
            p.Value = suKienId;
            cmd.Parameters.Add(p);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                result.Add(new Dictionary<string, object>
                {
                    ["gio"] = reader.GetInt32(reader.GetOrdinal("Gio")),
                    ["soLanQuet"] = reader.GetInt32(reader.GetOrdinal("SoLanQuet")),
                    ["thanhCong"] = reader.GetInt32(reader.GetOrdinal("ThanhCong")),
                    ["thatBai"] = reader.GetInt32(reader.GetOrdinal("ThatBai"))
                });
            }

            return await Task.FromResult(result);
        }
    }
}
