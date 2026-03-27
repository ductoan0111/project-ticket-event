using Data;
using Microsoft.Data.SqlClient;
using Models.DTOs.Requests;
using Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implementations
{
    public class CheckInRepository : ICheckInRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public CheckInRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public object Checkin(CheckInRequest req)
        {
            var qrToken = (req.QrToken ?? "").Trim();
            var maVe = (req.MaVe ?? "").Trim();

            if (string.IsNullOrWhiteSpace(qrToken) && string.IsNullOrWhiteSpace(maVe))
                return new { success = false, message = "Thiếu QrToken hoặc MaVe." };

            if (req.NhanVienID <= 0)
                return new { success = false, message = "NhanVienID không hợp lệ." };

            using var raw = _connectionFactory.CreateConnection();
            var conn = (SqlConnection)raw;
            if (conn.State != ConnectionState.Open) conn.Open();

            using var tx = conn.BeginTransaction();

            try
            {
                // 1) Tìm vé + kiểm tra đơn hàng đã thanh toán + lấy thông tin sự kiện
                const string sqlFind = @"
SELECT TOP 1
    v.VeID, v.MaVe, v.QrToken, v.TrangThai AS VeTrangThai, v.NguoiSoHuuID,
    v.DonHangID, dh.TrangThai AS DonHangTrangThai,
    lv.LoaiVeID, lv.TenLoaiVe,
    sk.SuKienID, sk.TenSuKien, sk.ToChucID
FROM dbo.Ve v
JOIN dbo.DonHang dh ON dh.DonHangID = v.DonHangID
JOIN dbo.LoaiVe lv ON lv.LoaiVeID = v.LoaiVeID
JOIN dbo.SuKien sk ON sk.SuKienID = lv.SuKienID
WHERE (@QrToken IS NULL OR v.QrToken = @QrToken)
  AND (@MaVe IS NULL OR v.MaVe = @MaVe);";

                int veId, donHangId, suKienId, toChucId, nguoiSoHuuId;
                string maVeDb, qrTokenDb, tenLoaiVe, tenSuKien;
                byte veTrangThai, donHangTrangThai;

                using (var cmd = new SqlCommand(sqlFind, conn, tx))
                {
                    cmd.Parameters.AddWithValue("@QrToken", string.IsNullOrWhiteSpace(qrToken) ? (object)DBNull.Value : qrToken);
                    cmd.Parameters.AddWithValue("@MaVe", string.IsNullOrWhiteSpace(maVe) ? (object)DBNull.Value : maVe);

                    using var r = cmd.ExecuteReader();
                    if (!r.Read())
                    {
                        tx.Rollback();
                        return new { success = false, message = "Không tìm thấy vé theo QrToken/MaVe." };
                    }

                    veId = r.GetInt32(r.GetOrdinal("VeID"));
                    donHangId = r.GetInt32(r.GetOrdinal("DonHangID"));
                    suKienId = r.GetInt32(r.GetOrdinal("SuKienID"));
                    toChucId = r.GetInt32(r.GetOrdinal("ToChucID"));
                    nguoiSoHuuId = r.GetInt32(r.GetOrdinal("NguoiSoHuuID"));

                    maVeDb = r.GetString(r.GetOrdinal("MaVe"));
                    qrTokenDb = r.GetString(r.GetOrdinal("QrToken"));
                    tenLoaiVe = r.GetString(r.GetOrdinal("TenLoaiVe"));
                    tenSuKien = r.GetString(r.GetOrdinal("TenSuKien"));

                    veTrangThai = Convert.ToByte(r["VeTrangThai"]);
                    donHangTrangThai = Convert.ToByte(r["DonHangTrangThai"]);
                }

                // 2) Kiểm tra quyền: NhanVienID phải thuộc ban tổ chức của sự kiện
                // Giả sử: NhanVienID là NguoiDungID của người quét, cần kiểm tra xem người này có phải là ToChucID không
                // Hoặc kiểm tra trong bảng NguoiDung xem có VaiTro phù hợp không
                // Để đơn giản, ta kiểm tra NhanVienID == ToChucID (ban tổ chức)
                if (req.NhanVienID != toChucId)
                {
                    // Nếu cần kiểm tra phức tạp hơn (staff của tổ chức), thêm query kiểm tra
                    InsertNhatKyCheckin(conn, tx, veId, suKienId, req.NhanVienID, false, "Không có quyền check-in sự kiện này. " + req.GhiChu);
                    tx.Commit();
                    return new { success = false, message = "Bạn không có quyền check-in vé của sự kiện này." };
                }

                // 3) Đơn hàng phải đã thanh toán (TrangThai = 1)
                if (donHangTrangThai != 1)
                {
                    InsertNhatKyCheckin(conn, tx, veId, suKienId, req.NhanVienID, false, "Đơn hàng chưa thanh toán. " + req.GhiChu);
                    tx.Commit();
                    return new { success = false, message = "Đơn hàng chưa thanh toán, không thể check-in." };
                }

                // 4) Vé phải ở trạng thái 0 (Hợp lệ) mới được check-in
                if (veTrangThai != 0)
                {
                    string trangThaiText = veTrangThai switch
                    {
                        1 => "đã sử dụng",
                        2 => "đã hủy",
                        3 => "đã hoàn",
                        _ => "không hợp lệ"
                    };
                    InsertNhatKyCheckin(conn, tx, veId, suKienId, req.NhanVienID, false, $"Vé {trangThaiText}. " + req.GhiChu);
                    tx.Commit();
                    return new { success = false, message = $"Vé {trangThaiText}, không thể check-in." };
                }

                // 5) Update vé: TrangThai 0 -> 1 (Đã sử dụng)
                const string sqlUpdate = @"
UPDATE dbo.Ve
SET TrangThai = 1
WHERE VeID = @VeID AND TrangThai = 0;";

                int affected;
                using (var cmdUp = new SqlCommand(sqlUpdate, conn, tx))
                {
                    cmdUp.Parameters.AddWithValue("@VeID", veId);
                    affected = cmdUp.ExecuteNonQuery();
                }

                if (affected == 0)
                {
                    InsertNhatKyCheckin(conn, tx, veId, suKienId, req.NhanVienID, false, "Vé vừa bị thay đổi trạng thái (race condition). " + req.GhiChu);
                    tx.Commit();
                    return new { success = false, message = "Không thể check-in (vé có thể vừa được quét)." };
                }

                // 6) Insert vào bảng NhatKyCheckin (log check-in thành công)
                InsertNhatKyCheckin(conn, tx, veId, suKienId, req.NhanVienID, true, "Check-in thành công. " + req.GhiChu);

                tx.Commit();

                return new
                {
                    success = true,
                    message = "Check-in thành công.",
                    data = new
                    {
                        veId,
                        maVe = maVeDb,
                        qrToken = qrTokenDb,
                        donHangId,
                        suKienId,
                        tenSuKien,
                        tenLoaiVe,
                        nguoiSoHuuId,
                        trangThaiTruoc = 0,
                        trangThaiSau = 1,
                        thoiGianCheckIn = DateTime.Now
                    }
                };
            }
            catch (Exception ex)
            {
                tx.Rollback();
                return new { success = false, message = "Lỗi check-in: " + ex.Message };
            }
        }

        private static void InsertNhatKyCheckin(SqlConnection conn, SqlTransaction tx, int veId, int suKienId, int nhanVienId, bool ketQua, string? ghiChu)
        {
            const string sql = @"
INSERT INTO dbo.NhatKyCheckin (VeID, SuKienID, NhanVienID, ThoiGianCheckin, KetQua, GhiChu)
VALUES (@VeID, @SuKienID, @NhanVienID, SYSDATETIME(), @KetQua, @GhiChu);";

            using var cmd = new SqlCommand(sql, conn, tx);
            cmd.Parameters.AddWithValue("@VeID", veId);
            cmd.Parameters.AddWithValue("@SuKienID", suKienId);
            cmd.Parameters.AddWithValue("@NhanVienID", nhanVienId);
            cmd.Parameters.AddWithValue("@KetQua", ketQua);
            cmd.Parameters.AddWithValue("@GhiChu", (object?)ghiChu ?? DBNull.Value);
            cmd.ExecuteNonQuery();
        }
    }
}