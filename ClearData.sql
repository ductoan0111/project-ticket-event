-- ================================================
-- SCRIPT XÓA DỮ LIỆU TẤT CẢ CÁC BẢNG
-- Database: QL_SKVE
-- Thứ tự xóa: Từ bảng con → bảng cha (theo Foreign Key)
-- ================================================

USE QL_SKVE;
GO

PRINT '🗑️ Bắt đầu xóa dữ liệu...';
GO

-- ================================================
-- Xóa theo thứ tự ngược với Foreign Key
-- ================================================

-- 1. Xóa NhatKyCheckin (phụ thuộc Ve, SuKien, NguoiDung)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'NhatKyCheckin')
BEGIN
    DELETE FROM dbo.NhatKyCheckin;
    DBCC CHECKIDENT ('dbo.NhatKyCheckin', RESEED, 0);
    PRINT '✓ Đã xóa NhatKyCheckin';
END
GO

-- 2. Xóa ThongBao (phụ thuộc NguoiDung, DonHang, Ve)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ThongBao')
BEGIN
    DELETE FROM dbo.ThongBao;
    DBCC CHECKIDENT ('dbo.ThongBao', RESEED, 0);
    PRINT '✓ Đã xóa ThongBao';
END
GO

-- 3. Xóa ThanhToan (phụ thuộc DonHang)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ThanhToan')
BEGIN
    DELETE FROM dbo.ThanhToan;
    DBCC CHECKIDENT ('dbo.ThanhToan', RESEED, 0);
    PRINT '✓ Đã xóa ThanhToan';
END
GO

-- 4. Xóa Ve (phụ thuộc DonHang, LoaiVe, NguoiDung)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Ve')
BEGIN
    DELETE FROM dbo.Ve;
    DBCC CHECKIDENT ('dbo.Ve', RESEED, 0);
    PRINT '✓ Đã xóa Ve';
END
GO

-- 5. Xóa ChiTietDonHang (phụ thuộc DonHang, LoaiVe)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ChiTietDonHang')
BEGIN
    DELETE FROM dbo.ChiTietDonHang;
    DBCC CHECKIDENT ('dbo.ChiTietDonHang', RESEED, 0);
    PRINT '✓ Đã xóa ChiTietDonHang';
END
GO

-- 6. Xóa DonHang (phụ thuộc NguoiDung, SuKien)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'DonHang')
BEGIN
    DELETE FROM dbo.DonHang;
    DBCC CHECKIDENT ('dbo.DonHang', RESEED, 0);
    PRINT '✓ Đã xóa DonHang';
END
GO

-- 7. Xóa LoaiVe (phụ thuộc SuKien)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'LoaiVe')
BEGIN
    DELETE FROM dbo.LoaiVe;
    DBCC CHECKIDENT ('dbo.LoaiVe', RESEED, 0);
    PRINT '✓ Đã xóa LoaiVe';
END
GO

-- 8. Xóa SuKienYeuThich (phụ thuộc NguoiDung, SuKien)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'SuKienYeuThich')
BEGIN
    DELETE FROM dbo.SuKienYeuThich;
    DBCC CHECKIDENT ('dbo.SuKienYeuThich', RESEED, 0);
    PRINT '✓ Đã xóa SuKienYeuThich';
END
GO

-- 9. Xóa SuKien (phụ thuộc DanhMucSuKien, DiaDiem, NguoiDung)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'SuKien')
BEGIN
    DELETE FROM dbo.SuKien;
    DBCC CHECKIDENT ('dbo.SuKien', RESEED, 0);
    PRINT '✓ Đã xóa SuKien';
END
GO

-- 10. Xóa DanhMucSuKien
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'DanhMucSuKien')
BEGIN
    DELETE FROM dbo.DanhMucSuKien;
    DBCC CHECKIDENT ('dbo.DanhMucSuKien', RESEED, 0);
    PRINT '✓ Đã xóa DanhMucSuKien';
END
GO

-- 11. Xóa DiaDiem
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'DiaDiem')
BEGIN
    DELETE FROM dbo.DiaDiem;
    DBCC CHECKIDENT ('dbo.DiaDiem', RESEED, 0);
    PRINT '✓ Đã xóa DiaDiem';
END
GO

-- 12. Xóa RefreshToken (phụ thuộc NguoiDung)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'RefreshToken')
BEGIN
    DELETE FROM dbo.RefreshToken;
    DBCC CHECKIDENT ('dbo.RefreshToken', RESEED, 0);
    PRINT '✓ Đã xóa RefreshToken';
END
GO

-- 13. Xóa NguoiDung (phụ thuộc VaiTro)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'NguoiDung')
BEGIN
    DELETE FROM dbo.NguoiDung;
    DBCC CHECKIDENT ('dbo.NguoiDung', RESEED, 0);
    PRINT '✓ Đã xóa NguoiDung';
END
GO

-- 14. Xóa VaiTro (bảng gốc)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'VaiTro')
BEGIN
    DELETE FROM dbo.VaiTro;
    DBCC CHECKIDENT ('dbo.VaiTro', RESEED, 0);
    PRINT '✓ Đã xóa VaiTro';
END
GO

-- ================================================
-- HOÀN TẤT
-- ================================================
PRINT '';
PRINT '✅ Đã xóa toàn bộ dữ liệu thành công!';
PRINT '💡 Bây giờ bạn có thể chạy script insert dữ liệu mới.';
GO
