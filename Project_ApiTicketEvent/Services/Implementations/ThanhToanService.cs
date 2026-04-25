using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Models;
using Models.DTOs.Requests;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class ThanhToanService : IThanhToanService
    {
        private readonly IThanhToanRepository _repo;
        private readonly IConfiguration _config;

        public ThanhToanService(IThanhToanRepository repo, IConfiguration config)
        {
            _repo = repo;
            _config = config;
        }

        public async Task<IEnumerable<ThanhToan>> GetHistoryAsync(int nguoiMuaId)
        {
            return await _repo.GetHistoryAsync(nguoiMuaId);
        }

        public async Task<IEnumerable<ThanhToan>> GetHistoryByDonHangAsync(int nguoiMuaId, int donHangId)
        {
            return await _repo.GetHistoryByDonHangAsync(nguoiMuaId, donHangId);
        }

        public int Insert(ThanhToan thanhToan, SqlConnection conn, SqlTransaction tran)
        {
            return _repo.Insert(thanhToan, conn, tran);
        }

        public async Task<object> MockThanhToanAsync(int donHangId, int nguoiMuaId, ThanhToanRequest req)
        {
            var cs = _config.GetConnectionString("TicketDb");
            if (string.IsNullOrWhiteSpace(cs))
                throw new InvalidOperationException("Missing connection string: TicketDb");

            using var conn = new SqlConnection(cs);
            await conn.OpenAsync();

            using var tran = conn.BeginTransaction();

            try
            {
                // 1) kiểm tra đơn hàng thuộc về attendee + lấy tổng tiền + trạng thái
                const string sqlGetDon = @"
SELECT TongTien, TrangThai, SuKienID
FROM dbo.DonHang
WHERE DonHangID = @DonHangID AND NguoiMuaID = @NguoiMuaID;";

                decimal tongTien;
                byte trangThaiDon;
                int suKienIdDon;

                using (var cmd = new SqlCommand(sqlGetDon, conn, tran))
                {
                    cmd.Parameters.AddWithValue("@DonHangID", donHangId);
                    cmd.Parameters.AddWithValue("@NguoiMuaID", nguoiMuaId);

                    using var r = await cmd.ExecuteReaderAsync();
                    if (!await r.ReadAsync())
                        throw new InvalidOperationException("Không tìm thấy đơn hàng hoặc đơn không thuộc về bạn.");

                    tongTien = r.GetDecimal(r.GetOrdinal("TongTien"));
                    trangThaiDon = Convert.ToByte(r["TrangThai"]);
                    suKienIdDon = r.GetInt32(r.GetOrdinal("SuKienID"));
                }

                // chỉ cho thanh toán khi đơn đang chờ (0)
                if (trangThaiDon != 0)
                    throw new InvalidOperationException($"Đơn hàng không ở trạng thái chờ thanh toán (TrangThai={trangThaiDon}).");

                // 1.1) Validate: LoaiVe trong đơn phải thuộc đúng SuKienID của đơn
                const string sqlMismatch = @"
SELECT TOP 1 lv.LoaiVeID, lv.SuKienID
FROM dbo.ChiTietDonHang ct
JOIN dbo.LoaiVe lv ON lv.LoaiVeID = ct.LoaiVeID
WHERE ct.DonHangID = @DonHangID
  AND lv.SuKienID <> @SuKienID;";

                using (var cmdMis = new SqlCommand(sqlMismatch, conn, tran))
                {
                    cmdMis.Parameters.AddWithValue("@DonHangID", donHangId);
                    cmdMis.Parameters.AddWithValue("@SuKienID", suKienIdDon);

                    using var rMis = await cmdMis.ExecuteReaderAsync();
                    if (await rMis.ReadAsync())
                    {
                        var loaiVeId = rMis.GetInt32(rMis.GetOrdinal("LoaiVeID"));
                        var suKienIdLoaiVe = rMis.GetInt32(rMis.GetOrdinal("SuKienID"));

                        throw new InvalidOperationException(
                            $"Dữ liệu đơn hàng bị lệch: Loại vé không thuộc sự kiện của đơn hàng. " +
                            $"DonHang_SuKienID={suKienIdDon}, LoaiVeID_BiLech={loaiVeId}, LoaiVe_SuKienID={suKienIdLoaiVe}");
                    }
                }

                // 1.2) Chặn gọi thanh toán lại gây sinh vé trùng
                const string sqlVeExists = @"SELECT COUNT(1) FROM dbo.Ve WHERE DonHangID = @DonHangID;";
                using (var cmdVe = new SqlCommand(sqlVeExists, conn, tran))
                {
                    cmdVe.Parameters.AddWithValue("@DonHangID", donHangId);
                    var countVe = Convert.ToInt32(await cmdVe.ExecuteScalarAsync());
                    if (countVe > 0)
                        throw new InvalidOperationException("Đơn hàng này đã được sinh vé trước đó.");
                }

                const string sqlGetOrderItems = @"
SELECT LoaiVeID, SoLuong
FROM dbo.ChiTietDonHang
WHERE DonHangID = @DonHangID;";

                var orderItems = new List<(int loaiVeId, int soLuong)>();

                using (var cmdItems = new SqlCommand(sqlGetOrderItems, conn, tran))
                {
                    cmdItems.Parameters.AddWithValue("@DonHangID", donHangId);

                    using var rItems = await cmdItems.ExecuteReaderAsync();
                    while (await rItems.ReadAsync())
                    {
                        var loaiVeId = rItems.GetInt32(rItems.GetOrdinal("LoaiVeID"));
                        var soLuong = rItems.GetInt32(rItems.GetOrdinal("SoLuong"));
                        orderItems.Add((loaiVeId, soLuong));
                    }
                }

                if (orderItems.Count == 0)
                    throw new InvalidOperationException("Đơn hàng không có chi tiết, không thể sinh vé.");

                const string sqlReserveStock = @"
UPDATE dbo.LoaiVe
SET SoLuongDaBan = SoLuongDaBan + @SoLuong
WHERE LoaiVeID = @LoaiVeID
  AND SuKienID = @SuKienID
  AND TrangThai = 1
  AND (ThoiGianMoBan IS NULL OR ThoiGianMoBan <= SYSDATETIME())
  AND (ThoiGianDongBan IS NULL OR ThoiGianDongBan >= SYSDATETIME())
  AND SoLuongDaBan + @SoLuong <= SoLuongToiDa;";

                foreach (var (loaiVeId, soLuong) in orderItems)
                {
                    if (soLuong <= 0)
                        throw new InvalidOperationException($"Số lượng vé không hợp lệ cho LoaiVeID={loaiVeId}.");

                    using var cmdStock = new SqlCommand(sqlReserveStock, conn, tran);
                    cmdStock.Parameters.AddWithValue("@LoaiVeID", loaiVeId);
                    cmdStock.Parameters.AddWithValue("@SuKienID", suKienIdDon);
                    cmdStock.Parameters.AddWithValue("@SoLuong", soLuong);

                    var affected = await cmdStock.ExecuteNonQueryAsync();
                    if (affected == 0)
                        throw new InvalidOperationException($"Loại vé {loaiVeId} đã hết, ngừng bán hoặc không đủ số lượng.");
                }

                // 2) insert ThanhToan
                var thanhToan = new ThanhToan
                {
                    DonHangID = donHangId,
                    MaGiaoDich = $"MOCK_{Guid.NewGuid():N}",
                    PhuongThuc = string.IsNullOrWhiteSpace(req?.PhuongThuc) ? "MOCK" : req!.PhuongThuc!,
                    SoTien = tongTien,
                    TrangThai = 1, // 1=ThanhCong
                    ThoiGianThanhToan = DateTime.Now,
                    RawResponse = req?.RawResponse
                };

                var thanhToanId = _repo.Insert(thanhToan, conn, tran);

                // 3) update DonHang => paid
                const string sqlUpdateDon = @"
UPDATE dbo.DonHang
SET TrangThai = 1
WHERE DonHangID = @DonHangID AND NguoiMuaID = @NguoiMuaID AND TrangThai = 0;";

                using (var cmdUp = new SqlCommand(sqlUpdateDon, conn, tran))
                {
                    cmdUp.Parameters.AddWithValue("@DonHangID", donHangId);
                    cmdUp.Parameters.AddWithValue("@NguoiMuaID", nguoiMuaId);

                    var affected = await cmdUp.ExecuteNonQueryAsync();
                    if (affected == 0)
                        throw new InvalidOperationException("Không thể cập nhật trạng thái đơn hàng (có thể đã thay đổi trạng thái).");
                }

                // 4) SINH VÉ
                const string sqlGetItems = @"
SELECT LoaiVeID, SoLuong
FROM dbo.ChiTietDonHang
WHERE DonHangID = @DonHangID;";

                var items = new List<(int loaiVeId, int soLuong)>();

                using (var cmdItems = new SqlCommand(sqlGetItems, conn, tran))
                {
                    cmdItems.Parameters.AddWithValue("@DonHangID", donHangId);

                    using var rItems = await cmdItems.ExecuteReaderAsync();
                    while (await rItems.ReadAsync())
                    {
                        var loaiVeId = rItems.GetInt32(rItems.GetOrdinal("LoaiVeID"));
                        var soLuong = rItems.GetInt32(rItems.GetOrdinal("SoLuong"));
                        items.Add((loaiVeId, soLuong));
                    }
                }

                if (items.Count == 0)
                    throw new InvalidOperationException("Đơn hàng không có chi tiết, không thể sinh vé.");

                const string sqlInsertVe = @"
INSERT INTO dbo.Ve (DonHangID, LoaiVeID, NguoiSoHuuID, MaVe, QrToken, TrangThai)
VALUES (@DonHangID, @LoaiVeID, @NguoiSoHuuID, @MaVe, @QrToken, @TrangThai);";

                foreach (var (loaiVeId, soLuong) in items)
                {
                    if (soLuong <= 0) continue;

                    for (int i = 1; i <= soLuong; i++)
                    {
                        var maVe = $"DH{donHangId}-LV{loaiVeId}-{Guid.NewGuid():N}".ToUpper();
                        var qrToken = Guid.NewGuid().ToString("N");

                        using var cmdIns = new SqlCommand(sqlInsertVe, conn, tran);
                        cmdIns.Parameters.AddWithValue("@DonHangID", donHangId);
                        cmdIns.Parameters.AddWithValue("@LoaiVeID", loaiVeId);
                        cmdIns.Parameters.AddWithValue("@NguoiSoHuuID", nguoiMuaId);
                        cmdIns.Parameters.AddWithValue("@MaVe", maVe);
                        cmdIns.Parameters.AddWithValue("@QrToken", qrToken);
                        cmdIns.Parameters.AddWithValue("@TrangThai", (byte)0);

                        await cmdIns.ExecuteNonQueryAsync();
                    }
                }

                await tran.CommitAsync();

                return new
                {
                    message = "Thanh toán (MOCK) thành công.",
                    ThanhToanID = thanhToanId,
                    DonHangID = donHangId,
                    MaGiaoDich = thanhToan.MaGiaoDich,
                    SoTien = tongTien,
                    PhuongThuc = thanhToan.PhuongThuc
                };
            }
            catch
            {
                await tran.RollbackAsync();
                throw;
            }
        }
    }
}
