-- ================================================
-- SCRIPT INSERT 10 SỰ KIỆN MẪU ĐẦY ĐỦ
-- Database: QL_SKVE  
-- Phù hợp với Frontend & Backend
-- ================================================

USE QL_SKVE;
GO

PRINT '📝 Bắt đầu insert dữ liệu mẫu...';
GO

-- ================================================
-- 1. VAI TRO (Roles)
-- ================================================
INSERT INTO dbo.VaiTro (MaVaiTro, TenVaiTro, NgayTao) VALUES
(N'ADMIN',     N'Quản trị hệ thống', GETDATE()),
(N'ORGANIZER', N'Ban tổ chức sự kiện', GETDATE()),
(N'USER',      N'Người dùng/Khách hàng', GETDATE()),
(N'STAFF',     N'Nhân viên hỗ trợ', GETDATE()),
(N'CHECKIN',   N'Nhân viên check-in', GETDATE());
PRINT '✓ Đã insert VaiTro (5 records)';
GO

-- ================================================
-- 2. NGUOI DUNG (Users)
-- Mật khẩu: "123456" (cần hash thực tế qua API Register)
-- ================================================
INSERT INTO dbo.NguoiDung (VaiTroID, HoTen, Email, SoDienThoai, TenDangNhap, MatKhauHash, TrangThai, NgayTao) VALUES
-- Admin
(1, N'Nguyễn Văn Admin', 'admin@ticketevent.vn', '0901234567', 'admin', 'AQAAAAIAAYagAAAAEDummyHashForTesting123456', 1, GETDATE()),

-- Organizers  
(2, N'Trần Thị Mai', 'mai.tran@organizer.vn', '0902345678', 'organizer1', 'AQAAAAIAAYagAAAAEDummyHashForTesting123456', 1, GETDATE()),
(2, N'Lê Văn Hùng', 'hung.le@organizer.vn', '0903456789', 'organizer2', 'AQAAAAIAAYagAAAAEDummyHashForTesting123456', 1, GETDATE()),

-- Attendees/Users
(3, N'Phạm Thị Lan', 'lan.pham@gmail.com', '0904567890', 'attendee1', 'AQAAAAIAAYagAAAAEDummyHashForTesting123456', 1, GETDATE()),
(3, N'Hoàng Văn Nam', 'nam.hoang@gmail.com', '0905678901', 'attendee2', 'AQAAAAIAAYagAAAAEDummyHashForTesting123456', 1, GETDATE()),
(3, N'Vũ Thị Hương', 'huong.vu@gmail.com', '0906789012', 'attendee3', 'AQAAAAIAAYagAAAAEDummyHashForTesting123456', 1, GETDATE()),

-- Staff
(4, N'Đỗ Văn Tùng', 'tung.do@staff.vn', '0907890123', 'staff1', 'AQAAAAIAAYagAAAAEDummyHashForTesting123456', 1, GETDATE()),
(5, N'Bùi Thị Nga', 'nga.bui@checkin.vn', '0908901234', 'checkin1', 'AQAAAAIAAYagAAAAEDummyHashForTesting123456', 1, GETDATE());
PRINT '✓ Đã insert NguoiDung (8 records)';
GO

-- ================================================
-- 3. DIA DIEM (Venues) - 10 địa điểm
-- ================================================
INSERT INTO dbo.DiaDiem (TenDiaDiem, DiaChi, SucChua, MoTa, TrangThai) VALUES
(N'Trung tâm Hội nghị Quốc gia', N'Mỹ Đình, Nam Từ Liêm, Hà Nội', 2000, N'Địa điểm tổ chức sự kiện lớn, hiện đại', 1),
(N'Nhà hát Lớn Hà Nội', N'1 Tràng Tiền, Hoàn Kiếm, Hà Nội', 600, N'Biểu diễn nghệ thuật, hòa nhạc', 1),
(N'Sân vận động Mỹ Đình', N'Đường Lê Đức Thọ, Nam Từ Liêm, Hà Nội', 40000, N'Sự kiện thể thao, âm nhạc quy mô lớn', 1),
(N'Khách sạn Metropole', N'15 Ngô Quyền, Hoàn Kiếm, Hà Nội', 300, N'Hội thảo, sự kiện cao cấp', 1),
(N'Trung tâm Hội nghị FPT', N'Khu Công nghệ cao Hòa Lạc, Hà Nội', 500, N'Sự kiện công nghệ, startup', 1),
(N'Vinpearl Phú Quốc', N'Bãi Dài, Gành Dầu, Phú Quốc', 1000, N'Sự kiện ngoài trời, resort', 1),
(N'Trung tâm Hội nghị Gem Center', N'8 Nguyễn Bỉnh Khiêm, Q1, TP.HCM', 800, N'Hội nghị, triển lãm', 1),
(N'Nhà hát Hòa Bình', N'240 Ba Tháng Hai, Q10, TP.HCM', 450, N'Biểu diễn nghệ thuật', 1),
(N'Công viên Thống Nhất', N'Lê Duẩn, Hai Bà Trưng, Hà Nội', 5000, N'Sự kiện ngoài trời, lễ hội', 1),
(N'Trung tâm Triển lãm Giảng Võ', N'Giảng Võ, Ba Đình, Hà Nội', 1500, N'Triển lãm, hội chợ', 1);
PRINT '✓ Đã insert DiaDiem (10 records)';
GO

-- ================================================
-- 4. DANH MUC SU KIEN (Categories) - 8 danh mục
-- ================================================
INSERT INTO dbo.DanhMucSuKien (TenDanhMuc, MoTa, ThuTuHienThi, TrangThai) VALUES
(N'Hội thảo', N'Sự kiện học thuật, chuyên môn', 1, 1),
(N'Âm nhạc', N'Buổi hòa nhạc, concert, liveshow', 2, 1),
(N'Thể thao', N'Sự kiện thể thao, giải đấu', 3, 1),
(N'Giải trí', N'Sự kiện giải trí, vui chơi', 4, 1),
(N'Công nghệ', N'Sự kiện công nghệ, IT, startup', 5, 1),
(N'Nghệ thuật', N'Triển lãm, biểu diễn nghệ thuật', 6, 1),
(N'Ẩm thực', N'Lễ hội ẩm thực, food festival', 7, 1),
(N'Du lịch', N'Sự kiện du lịch, khám phá', 8, 1);
PRINT '✓ Đã insert DanhMucSuKien (8 records)';
GO

-- ================================================
-- 5. SU KIEN (Events) - 10 sự kiện
-- TrangThai: 0=Nháp, 1=Đang mở bán, 2=Kết thúc, 3=Hủy
-- ================================================
INSERT INTO dbo.SuKien (DanhMucID, DiaDiemID, ToChucID, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, AnhBiaUrl, TrangThai, NgayTao) VALUES
-- Sự kiện 1: Công nghệ
(5, 5, 2, N'Hội thảo AI & Machine Learning 2026', 
 N'Sự kiện công nghệ lớn nhất năm về trí tuệ nhân tạo và học máy. Diễn giả quốc tế, workshop thực hành, networking với chuyên gia hàng đầu.',
 '2026-06-15 09:00:00', '2026-06-15 17:00:00',
 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 1, GETDATE()),

-- Sự kiện 2: Âm nhạc
(2, 2, 2, N'Concert Mùa Hè 2026', 
 N'Đêm nhạc đặc sắc với sự tham gia của các ca sĩ hàng đầu Việt Nam. Âm thanh ánh sáng đỉnh cao, không gian lãng mạn.',
 '2026-07-20 19:00:00', '2026-07-20 22:00:00',
 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', 1, GETDATE()),

-- Sự kiện 3: Thể thao
(3, 3, 3, N'Giải Marathon Hà Nội 2026', 
 N'Giải chạy marathon quốc tế, cự ly 5km, 10km, 21km, 42km. Mở đăng ký cho mọi lứa tuổi. Giải thưởng hấp dẫn.',
 '2026-08-10 06:00:00', '2026-08-10 12:00:00',
 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800', 1, GETDATE()),

-- Sự kiện 4: Hội thảo
(1, 4, 2, N'Hội nghị Khởi nghiệp Đổi mới 2026', 
 N'Kết nối startup, nhà đầu tư và chuyên gia. Cơ hội gọi vốn, pitching, networking. Diễn giả từ các quỹ đầu tư hàng đầu.',
 '2026-09-05 08:00:00', '2026-09-05 18:00:00',
 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800', 1, GETDATE()),

-- Sự kiện 5: Ẩm thực
(7, 6, 3, N'Lễ hội Ẩm thực Quốc tế Phú Quốc', 
 N'Trải nghiệm hơn 100 món ăn từ 30 quốc gia. Cooking show, talkshow với đầu bếp nổi tiếng. Không gian biển đảo tuyệt đẹp.',
 '2026-10-01 10:00:00', '2026-10-03 22:00:00',
 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', 1, GETDATE()),

-- Sự kiện 6: Nghệ thuật (Miễn phí)
(6, 8, 2, N'Triển lãm Nghệ thuật Đương đại 2026', 
 N'Trưng bày tác phẩm của 50 nghệ sĩ trong và ngoài nước. Miễn phí tham quan. Gặp gỡ nghệ sĩ, workshop sáng tạo.',
 '2026-11-15 09:00:00', '2026-11-30 20:00:00',
 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800', 1, GETDATE()),

-- Sự kiện 7: Giải trí
(4, 9, 3, N'Festival Âm nhạc Điện tử EDM Việt Nam', 
 N'Đêm nhạc EDM với DJ quốc tế. Âm thanh ánh sáng đỉnh cao. Không gian ngoài trời sôi động. 18+',
 '2026-12-25 18:00:00', '2026-12-26 02:00:00',
 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', 1, GETDATE()),

-- Sự kiện 8: Công nghệ
(5, 1, 2, N'Diễn đàn Blockchain & Web3 Việt Nam', 
 N'Khám phá công nghệ blockchain, NFT, metaverse. Chuyên gia hàng đầu chia sẻ. Demo dự án thực tế.',
 '2027-01-20 09:00:00', '2027-01-20 17:00:00',
 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800', 1, GETDATE()),

-- Sự kiện 9: Du lịch
(8, 10, 3, N'Hội chợ Du lịch Quốc tế Việt Nam 2027', 
 N'Giới thiệu điểm đến du lịch trong và ngoài nước. Ưu đãi tour, vé máy bay. Gặp gỡ đại diện các công ty du lịch.',
 '2027-02-10 09:00:00', '2027-02-12 18:00:00',
 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', 1, GETDATE()),

-- Sự kiện 10: Âm nhạc
(2, 7, 2, N'Liveshow Nhạc Trẻ Việt Nam 2027', 
 N'Đêm nhạc với các ca sĩ trẻ hot nhất hiện nay. Sân khấu hoành tráng, âm thanh đỉnh cao. Fan meeting sau show.',
 '2027-03-15 19:30:00', '2027-03-15 23:00:00',
 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', 1, GETDATE());
PRINT '✓ Đã insert SuKien (10 records)';
GO

-- ================================================
-- 6. LOAI VE (Ticket Types) - Cho 10 sự kiện
-- ================================================

-- Sự kiện 1: Hội thảo AI (3 loại vé)
INSERT INTO dbo.LoaiVe (SuKienID, TenLoaiVe, MoTa, DonGia, SoLuongToiDa, SoLuongDaBan, GioiHanMoiKhach, ThoiGianMoBan, ThoiGianDongBan, TrangThai) VALUES
(1, N'Vé Early Bird', N'Giá ưu đãi đặt sớm, bao gồm tài liệu và ăn trưa', 500000, 100, 45, 2, '2026-03-01 00:00:00', '2026-05-31 23:59:59', 1),
(1, N'Vé Thường', N'Vé tham dự tiêu chuẩn, bao gồm tài liệu', 800000, 300, 120, 5, '2026-03-01 00:00:00', '2026-06-14 23:59:59', 1),
(1, N'Vé VIP', N'Ghế hàng đầu, gặp gỡ diễn giả, quà tặng đặc biệt', 1500000, 50, 18, 2, '2026-03-01 00:00:00', '2026-06-14 23:59:59', 1);

-- Sự kiện 2: Concert (3 loại vé)
INSERT INTO dbo.LoaiVe (SuKienID, TenLoaiVe, MoTa, DonGia, SoLuongToiDa, SoLuongDaBan, GioiHanMoiKhach, TrangThai) VALUES
(2, N'Vé Phổ thông', N'Khu vực đứng, tầm nhìn tốt', 300000, 400, 180, 10, 1),
(2, N'Vé VIP', N'Ghế ngồi gần sân khấu, đồ uống miễn phí', 800000, 100, 42, 4, 1),
(2, N'Vé SVIP', N'Ghế hàng đầu, meet & greet ca sĩ, ảnh ký tặng', 1500000, 30, 12, 2, 1);

-- Sự kiện 3: Marathon (4 loại vé)
INSERT INTO dbo.LoaiVe (SuKienID, TenLoaiVe, MoTa, DonGia, SoLuongToiDa, SoLuongDaBan, GioiHanMoiKhach, TrangThai) VALUES
(3, N'Vé 5km', N'Cự ly 5km, phù hợp mọi lứa tuổi', 150000, 500, 230, 10, 1),
(3, N'Vé 10km', N'Cự ly 10km, runner trung bình', 200000, 400, 180, 10, 1),
(3, N'Vé 21km', N'Half Marathon, runner có kinh nghiệm', 300000, 300, 95, 5, 1),
(3, N'Vé 42km', N'Full Marathon, runner chuyên nghiệp', 500000, 200, 68, 3, 1);

-- Sự kiện 4: Hội nghị Khởi nghiệp (2 loại vé)
INSERT INTO dbo.LoaiVe (SuKienID, TenLoaiVe, MoTa, DonGia, SoLuongToiDa, SoLuongDaBan, TrangThai) VALUES
(4, N'Vé Startup', N'Dành cho founder, co-founder', 200000, 200, 85, 1),
(4, N'Vé Investor', N'Dành cho nhà đầu tư, quỹ đầu tư', 500000, 50, 22, 1);

-- Sự kiện 5: Lễ hội Ẩm thực (2 loại vé)
INSERT INTO dbo.LoaiVe (SuKienID, TenLoaiVe, MoTa, DonGia, SoLuongToiDa, SoLuongDaBan, TrangThai) VALUES
(5, N'Vé 1 ngày', N'Tham gia 1 ngày bất kỳ', 100000, 500, 245, 1),
(5, N'Vé 3 ngày', N'Trọn gói 3 ngày, tiết kiệm 20%', 240000, 300, 128, 1);

-- Sự kiện 6: Triển lãm (Miễn phí)
INSERT INTO dbo.LoaiVe (SuKienID, TenLoaiVe, MoTa, DonGia, SoLuongToiDa, SoLuongDaBan, TrangThai) VALUES
(6, N'Vé Miễn phí', N'Đăng ký để nhận vé tham quan miễn phí', 0, 1000, 342, 1);

-- Sự kiện 7: Festival EDM (3 loại vé)
INSERT INTO dbo.LoaiVe (SuKienID, TenLoaiVe, MoTa, DonGia, SoLuongToiDa, SoLuongDaBan, TrangThai) VALUES
(7, N'Vé Thường', N'Khu vực đứng, không giới hạn', 400000, 1000, 456, 1),
(7, N'Vé VIP', N'Khu vực gần sân khấu, đồ uống free', 800000, 200, 89, 1),
(7, N'Vé SVIP', N'Khu vực đặc biệt, all inclusive', 1500000, 50, 23, 1);

-- Sự kiện 8: Blockchain (2 loại vé)
INSERT INTO dbo.LoaiVe (SuKienID, TenLoaiVe, MoTa, DonGia, SoLuongToiDa, SoLuongDaBan, TrangThai) VALUES
(8, N'Vé Thường', N'Tham dự diễn đàn, tài liệu', 300000, 300, 145, 1),
(8, N'Vé VIP', N'Ghế đầu, networking lunch, quà tặng', 800000, 100, 38, 1);

-- Sự kiện 9: Hội chợ Du lịch (2 loại vé)
INSERT INTO dbo.LoaiVe (SuKienID, TenLoaiVe, MoTa, DonGia, SoLuongToiDa, SoLuongDaBan, TrangThai) VALUES
(9, N'Vé 1 ngày', N'Tham quan 1 ngày', 50000, 1000, 523, 1),
(9, N'Vé 3 ngày', N'Trọn gói 3 ngày', 120000, 500, 267, 1);

-- Sự kiện 10: Liveshow (3 loại vé)
INSERT INTO dbo.LoaiVe (SuKienID, TenLoaiVe, MoTa, DonGia, SoLuongToiDa, SoLuongDaBan, TrangThai) VALUES
(10, N'Vé Phổ thông', N'Khu vực đứng', 350000, 500, 234, 1),
(10, N'Vé VIP', N'Ghế ngồi gần sân khấu', 700000, 150, 67, 1),
(10, N'Vé SVIP', N'Ghế hàng đầu, fan meeting', 1200000, 50, 28, 1);

PRINT '✓ Đã insert LoaiVe (27 records)';
GO

-- ================================================
-- 7. SU KIEN YEU THICH (Favorites)
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SuKienYeuThich')
BEGIN
    CREATE TABLE dbo.SuKienYeuThich (
        YeuThichID INT IDENTITY(1,1) PRIMARY KEY,
        NguoiDungID INT NOT NULL,
        SuKienID INT NOT NULL,
        NgayThem DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_YeuThich_NguoiDung FOREIGN KEY (NguoiDungID) REFERENCES dbo.NguoiDung(NguoiDungID),
        CONSTRAINT FK_YeuThich_SuKien FOREIGN KEY (SuKienID) REFERENCES dbo.SuKien(SuKienID),
        CONSTRAINT UQ_YeuThich_User_Event UNIQUE (NguoiDungID, SuKienID)
    );
    PRINT '✓ Đã tạo bảng SuKienYeuThich';
END
GO

INSERT INTO dbo.SuKienYeuThich (NguoiDungID, SuKienID, NgayThem) VALUES
(4, 1, '2026-03-10 10:00:00'),
(4, 2, '2026-04-05 15:30:00'),
(4, 5, '2026-07-01 09:00:00'),
(4, 7, '2026-08-15 14:20:00'),
(5, 1, '2026-03-15 11:20:00'),
(5, 3, '2026-05-20 14:00:00'),
(5, 8, '2026-09-10 16:30:00'),
(6, 2, '2026-04-10 16:45:00'),
(6, 4, '2026-06-15 10:30:00'),
(6, 6, '2026-08-01 12:00:00'),
(6, 9, '2026-10-05 09:15:00');
PRINT '✓ Đã insert SuKienYeuThich (11 records)';
GO

-- ================================================
-- HOÀN TẤT
-- ================================================
PRINT '';
PRINT '✅ Đã insert dữ liệu mẫu thành công!';
PRINT '';
PRINT '📊 Tổng kết:';
PRINT '- Vai trò: 5';
PRINT '- Người dùng: 8 (1 Admin, 2 Organizer, 3 Attendee, 2 Staff)';
PRINT '- Địa điểm: 10';
PRINT '- Danh mục: 8';
PRINT '- Sự kiện: 10 (tất cả đang mở bán)';
PRINT '- Loại vé: 27';
PRINT '- Yêu thích: 11';
PRINT '';
PRINT '🔐 Tài khoản test (mật khẩu cần đăng ký qua API):';
PRINT 'Admin: admin@ticketevent.vn';
PRINT 'Organizer: organizer1 / organizer2';
PRINT 'Attendee: attendee1 / attendee2 / attendee3';
PRINT '';
PRINT '💡 Lưu ý: Mật khẩu trong DB là hash giả, cần đăng ký qua API Register để có hash thực.';
GO
