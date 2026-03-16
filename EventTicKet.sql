CREATE DATABASE QL_SKVE;
USE QL_SKVE;
/* =======================
   1) VAI TRO (Roles)
   ======================= */
    CREATE TABLE dbo.VaiTro(
        VaiTroId   INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        MaVaiTro   NVARCHAR(50)  NOT NULL,
        TenVaiTro  NVARCHAR(100) NOT NULL,
        NgayTao    DATETIME NULL
    );


/* =======================
   2) NGUOI DUNG (Users)
   ======================= */
    CREATE TABLE dbo.NguoiDung(
        NguoiDungId   INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        HoTen         NVARCHAR(200) NOT NULL,
        Email         NVARCHAR(200) NOT NULL,
        MatKhauHash   NVARCHAR(MAX) NOT NULL,      
        VaiTroId      INT NULL,                    
        NgayTao       DATETIME NULL,
        TrangThai     BIT NULL,
        TenDangNhap   NVARCHAR(60) NOT NULL,       
        SoDienThoai   NVARCHAR(20) NULL,

        CONSTRAINT FK_NguoiDung_VaiTro
            FOREIGN KEY (VaiTroId) REFERENCES dbo.VaiTro(VaiTroId)
    );

	 CREATE TABLE dbo.RefreshToken(
        RefreshTokenId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserId         INT NOT NULL,               -- FK, not null (đúng ảnh)
        Token          NVARCHAR(512) NOT NULL,
        JwtId          NVARCHAR(100) NOT NULL,
        ExpiresAt      DATETIME NOT NULL,
        CreatedAt      DATETIME NOT NULL,
        RevokedAt      DATETIME NULL,
        IsRevoked      BIT NOT NULL,
        IsUsed         BIT NOT NULL,

        CONSTRAINT FK_RefreshToken_NguoiDung
            FOREIGN KEY (UserId) REFERENCES dbo.NguoiDung(NguoiDungId)
    );
/* =======================
   3) DIA DIEM (Venues)
   ======================= */
CREATE TABLE dbo.DiaDiem
(
    DiaDiemID     INT IDENTITY(1,1) PRIMARY KEY,
    TenDiaDiem    NVARCHAR(150) NOT NULL,
    DiaChi        NVARCHAR(255) NOT NULL,
    SucChua       INT NULL,
    MoTa          NVARCHAR(255) NULL,
    TrangThai     BIT NOT NULL DEFAULT 1,

    CONSTRAINT CK_DiaDiem_SucChua CHECK (SucChua IS NULL OR SucChua >= 0)
);
GO


/* =======================
   4) DANH MUC SU KIEN (Categories)
   ======================= */
CREATE TABLE dbo.DanhMucSuKien
(
    DanhMucID      INT IDENTITY(1,1) PRIMARY KEY,
    TenDanhMuc     NVARCHAR(100) NOT NULL,
    MoTa           NVARCHAR(255) NULL,
    ThuTuHienThi   INT NULL,
    TrangThai      BIT NOT NULL DEFAULT 1,

    CONSTRAINT UQ_DanhMuc_Ten UNIQUE (TenDanhMuc)
);
GO


/* =======================
   5) SU KIEN (Events)
   - TrangThai: 0=Nháp, 1=Đang mở bán, 2=Đã kết thúc, 3=Đã huỷ
   ======================= */
CREATE TABLE dbo.SuKien
(
    SuKienID         INT IDENTITY(1,1) PRIMARY KEY,
    DanhMucID        INT NOT NULL,
    DiaDiemID        INT NOT NULL,
    ToChucID         INT NOT NULL,                  -- NguoiDung (Organizer)
    TenSuKien        NVARCHAR(200) NOT NULL,
    MoTa             NVARCHAR(MAX) NULL,
    ThoiGianBatDau   DATETIME2(0) NOT NULL,
    ThoiGianKetThuc  DATETIME2(0) NOT NULL,
    AnhBiaUrl        NVARCHAR(500) NULL,
    TrangThai        TINYINT NOT NULL DEFAULT 0,
    NgayTao          DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT CK_SuKien_ThoiGian CHECK (ThoiGianKetThuc > ThoiGianBatDau),
    CONSTRAINT CK_SuKien_TrangThai CHECK (TrangThai IN (0,1,2,3)),

    CONSTRAINT FK_SuKien_DanhMuc FOREIGN KEY (DanhMucID) REFERENCES dbo.DanhMucSuKien(DanhMucID),
    CONSTRAINT FK_SuKien_DiaDiem FOREIGN KEY (DiaDiemID) REFERENCES dbo.DiaDiem(DiaDiemID),
    CONSTRAINT FK_SuKien_ToChuc  FOREIGN KEY (ToChucID)  REFERENCES dbo.NguoiDung(NguoiDungID)
);
GO


/* =======================
   6) LOAI VE (Ticket Types)
   - TrangThai: 1=Đang bán, 0=Ngưng bán
   ======================= */
CREATE TABLE dbo.LoaiVe
(
    LoaiVeID         INT IDENTITY(1,1) PRIMARY KEY,
    SuKienID         INT NOT NULL,
    TenLoaiVe        NVARCHAR(120) NOT NULL,
    MoTa             NVARCHAR(255) NULL,
    DonGia           DECIMAL(18,2) NOT NULL,
    SoLuongToiDa     INT NOT NULL,
    SoLuongDaBan     INT NOT NULL DEFAULT 0,
    GioiHanMoiKhach  INT NULL,                       -- optional
    ThoiGianMoBan    DATETIME2(0) NULL,
    ThoiGianDongBan  DATETIME2(0) NULL,
    TrangThai        BIT NOT NULL DEFAULT 1,

    CONSTRAINT CK_LoaiVe_Gia CHECK (DonGia >= 0),
    CONSTRAINT CK_LoaiVe_SoLuong CHECK (SoLuongToiDa >= 0 AND SoLuongDaBan >= 0 AND SoLuongDaBan <= SoLuongToiDa),
    CONSTRAINT CK_LoaiVe_Time CHECK (
        ThoiGianMoBan IS NULL OR ThoiGianDongBan IS NULL OR ThoiGianDongBan > ThoiGianMoBan
    ),

    CONSTRAINT FK_LoaiVe_SuKien FOREIGN KEY (SuKienID) REFERENCES dbo.SuKien(SuKienID),

    CONSTRAINT UQ_LoaiVe_SuKien_Ten UNIQUE (SuKienID, TenLoaiVe)
);
GO


/* =======================
   7) DON HANG (Orders/Invoices)
   - TrangThai: 0=Chờ thanh toán, 1=Đã thanh toán, 2=Đã hủy, 3=Đã hoàn tiền
   ======================= */
CREATE TABLE dbo.DonHang
(
    DonHangID      INT IDENTITY(1,1) PRIMARY KEY,
    NguoiMuaID     INT NOT NULL,                     -- buyer/attendee user
    SuKienID       INT NOT NULL,                     -- giúp báo cáo nhanh (có thể suy từ LoaiVe)
    NgayDat        DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    TongTien       DECIMAL(18,2) NOT NULL DEFAULT 0,
    TrangThai      TINYINT NOT NULL DEFAULT 0,

    CONSTRAINT CK_DonHang_TrangThai CHECK (TrangThai IN (0,1,2,3)),
    CONSTRAINT CK_DonHang_TongTien CHECK (TongTien >= 0),

    CONSTRAINT FK_DonHang_NguoiMua FOREIGN KEY (NguoiMuaID) REFERENCES dbo.NguoiDung(NguoiDungID),
    CONSTRAINT FK_DonHang_SuKien   FOREIGN KEY (SuKienID)   REFERENCES dbo.SuKien(SuKienID)
);
GO


/* =======================
   8) CHI TIET DON HANG (Order Items)
   ======================= */
CREATE TABLE dbo.ChiTietDonHang
(
    ChiTietID     INT IDENTITY(1,1) PRIMARY KEY,
    DonHangID     INT NOT NULL,
    LoaiVeID      INT NOT NULL,
    SoLuong       INT NOT NULL,
    DonGia        DECIMAL(18,2) NOT NULL,
    ThanhTien     AS (SoLuong * DonGia) PERSISTED,

    CONSTRAINT CK_CT_SoLuong CHECK (SoLuong > 0),
    CONSTRAINT CK_CT_DonGia  CHECK (DonGia >= 0),

    CONSTRAINT FK_CT_DonHang FOREIGN KEY (DonHangID) REFERENCES dbo.DonHang(DonHangID),
    CONSTRAINT FK_CT_LoaiVe  FOREIGN KEY (LoaiVeID)  REFERENCES dbo.LoaiVe(LoaiVeID),

    CONSTRAINT UQ_CT_DonHang_LoaiVe UNIQUE (DonHangID, LoaiVeID)
);
GO


/* =======================
   9) VE (Tickets - QR)
   - TrangThai: 0=Chưa sử dụng, 1=Đã check-in, 2=Đã hủy, 3=Đã hoàn
   ======================= */
CREATE TABLE dbo.Ve
(
    VeID          INT IDENTITY(1,1) PRIMARY KEY,
    DonHangID     INT NOT NULL,
    LoaiVeID      INT NOT NULL,
    NguoiSoHuuID  INT NOT NULL,                      -- attendee/owner
    MaVe          VARCHAR(50) NOT NULL,              -- mã vé hiển thị
    QrToken       VARCHAR(128) NOT NULL,             -- token encode into QR
    NgayPhatHanh  DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    TrangThai     TINYINT NOT NULL DEFAULT 0,

    CONSTRAINT CK_Ve_TrangThai CHECK (TrangThai IN (0,1,2,3)),
    CONSTRAINT UQ_Ve_MaVe UNIQUE (MaVe),
    CONSTRAINT UQ_Ve_QrToken UNIQUE (QrToken),

    CONSTRAINT FK_Ve_DonHang    FOREIGN KEY (DonHangID) REFERENCES dbo.DonHang(DonHangID),
    CONSTRAINT FK_Ve_LoaiVe     FOREIGN KEY (LoaiVeID)  REFERENCES dbo.LoaiVe(LoaiVeID),
    CONSTRAINT FK_Ve_NguoiSoHuu FOREIGN KEY (NguoiSoHuuID) REFERENCES dbo.NguoiDung(NguoiDungID)
);
GO


/* =======================
   10) THANH TOAN (Payments)
   - TrangThai: 0=Khởi tạo, 1=Thành công, 2=Thất bại, 3=Hoàn tiền
   ======================= */
CREATE TABLE dbo.ThanhToan
(
    ThanhToanID       INT IDENTITY(1,1) PRIMARY KEY,
    DonHangID         INT NOT NULL,
    MaGiaoDich        VARCHAR(100) NULL,             -- mã giao dịch cổng thanh toán
    PhuongThuc        NVARCHAR(50) NOT NULL,         -- VNPAY, MOMO, CASH...
    SoTien            DECIMAL(18,2) NOT NULL,
    TrangThai         TINYINT NOT NULL DEFAULT 0,
    ThoiGianThanhToan DATETIME2(0) NULL,
    RawResponse       NVARCHAR(MAX) NULL,            -- lưu response/debug (optional)

    CONSTRAINT CK_TT_SoTien CHECK (SoTien >= 0),
    CONSTRAINT CK_TT_TrangThai CHECK (TrangThai IN (0,1,2,3)),

    CONSTRAINT FK_ThanhToan_DonHang FOREIGN KEY (DonHangID) REFERENCES dbo.DonHang(DonHangID),
    CONSTRAINT UQ_ThanhToan_MaGD UNIQUE (MaGiaoDich)
);
GO


/* =======================
   11) THONG BAO (Notifications)
   - TrangThai: 0=Chờ gửi, 1=Đã gửi, 2=Gửi thất bại
   ======================= */
CREATE TABLE dbo.ThongBao
(
    ThongBaoID     INT IDENTITY(1,1) PRIMARY KEY,
    NguoiDungID    INT NOT NULL,
    DonHangID      INT NULL,
    VeID           INT NULL,
    LoaiThongBao   NVARCHAR(30) NOT NULL,            -- EMAIL / SMS / APP
    TieuDe         NVARCHAR(200) NOT NULL,
    NoiDung        NVARCHAR(MAX) NOT NULL,
    TrangThai      TINYINT NOT NULL DEFAULT 0,
    ThoiGianTao    DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    ThoiGianGui    DATETIME2(0) NULL,
    GhiChu         NVARCHAR(255) NULL,

    CONSTRAINT CK_ThongBao_TrangThai CHECK (TrangThai IN (0,1,2)),

    CONSTRAINT FK_ThongBao_NguoiDung FOREIGN KEY (NguoiDungID) REFERENCES dbo.NguoiDung(NguoiDungID),
    CONSTRAINT FK_ThongBao_DonHang   FOREIGN KEY (DonHangID)   REFERENCES dbo.DonHang(DonHangID),
    CONSTRAINT FK_ThongBao_Ve        FOREIGN KEY (VeID)        REFERENCES dbo.Ve(VeID)
);
GO


/* =======================
   12) NHAT KY CHECK-IN (Check-in Logs)
   ======================= */
CREATE TABLE dbo.NhatKyCheckin
(
    CheckinID       INT IDENTITY(1,1) PRIMARY KEY,
    VeID            INT NOT NULL,
    SuKienID         INT NOT NULL,                   -- lưu dư thừa để báo cáo nhanh
    NhanVienID      INT NULL,                        -- người quét/duyệt (admin/organizer staff)
    ThoiGianCheckin DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    KetQua          BIT NOT NULL DEFAULT 1,          -- 1=thành công, 0=thất bại
    GhiChu          NVARCHAR(255) NULL,

    CONSTRAINT FK_Checkin_Ve       FOREIGN KEY (VeID)     REFERENCES dbo.Ve(VeID),
    CONSTRAINT FK_Checkin_SuKien   FOREIGN KEY (SuKienID) REFERENCES dbo.SuKien(SuKienID),
    CONSTRAINT FK_Checkin_NhanVien FOREIGN KEY (NhanVienID) REFERENCES dbo.NguoiDung(NguoiDungID)
);
GO
/* 1) VaiTro */
INSERT INTO dbo.VaiTro (MaVaiTro, TenVaiTro, NgayTao)
VALUES
(N'ADMIN',     N'Quản trị hệ thống', GETDATE()),
(N'ORGANIZER', N'Ban tổ chức sự kiện', GETDATE()),
(N'USER',      N'Người dùng', GETDATE()),
(N'STAFF',     N'Nhân viên hỗ trợ', GETDATE()),
(N'CHECKIN',   N'Nhân viên check-in',GETDATE());

/* 2) NguoiDung */
INSERT INTO dbo.NguoiDung (VaiTroID, HoTen, Email, SoDienThoai, TenDangNhap, MatKhauHash) VALUES
(1, N'Nguyễn Văn Admin', 'admin@skve.com', '0901111111', 'admin', 'hash_admin'),
(2, N'Trần Thị Tổ Chức', 'organizer@skve.com', '0902222222', 'organizer', 'hash_org'),
(3, N'Lê Văn Khách', 'attendee@skve.com', '0903333333', 'attendee', 'hash_att'),
(4, N'Phạm Thị Nhân Viên', 'staff@skve.com', '0904444444', 'staff', 'hash_staff'),
(5, N'Hoàng Văn Khách Mời', 'guest@skve.com', '0905555555', 'guest', 'hash_guest');

/* 3) DiaDiem */
INSERT INTO dbo.DiaDiem (TenDiaDiem, DiaChi, SucChua, MoTa) VALUES
(N'Trung tâm Hội nghị Quốc gia', N'Hà Nội', 2000, N'Địa điểm lớn'),
(N'Nhà hát Lớn Hà Nội', N'Hà Nội', 600, N'Biểu diễn nghệ thuật'),
(N'Sân vận động Mỹ Đình', N'Hà Nội', 40000, N'Sự kiện thể thao/âm nhạc'),
(N'Khách sạn Metropole', N'Hà Nội', 300, N'Hội thảo cao cấp'),
(N'Vinpearl Hội An', N'Quảng Nam', 1000, N'Sự kiện ngoài trời');

/* 4) DanhMucSuKien */
INSERT INTO dbo.DanhMucSuKien (TenDanhMuc, MoTa, ThuTuHienThi) VALUES
(N'Hội thảo', N'Sự kiện học thuật', 1),
(N'Âm nhạc', N'Buổi hòa nhạc', 2),
(N'Thể thao', N'Sự kiện thể thao', 3),
(N'Giải trí', N'Sự kiện giải trí', 4),
(N'Công nghệ', N'Sự kiện công nghệ', 5);

/* 5) SuKien */
INSERT INTO dbo.SuKien (DanhMucID, DiaDiemID, ToChucID, TenSuKien, MoTa, ThoiGianBatDau, ThoiGianKetThuc, TrangThai) VALUES
(1, 1, 2, N'Hội thảo AI 2025', N'Sự kiện về trí tuệ nhân tạo', '2025-12-20 09:00', '2025-12-20 17:00', 1),
(2, 2, 2, N'Concert Mùa Đông', N'Buổi hòa nhạc cuối năm', '2025-12-25 19:00', '2025-12-25 22:00', 1),
(3, 3, 2, N'Giải bóng đá giao hữu', N'Sự kiện thể thao cộng đồng', '2026-01-05 15:00', '2026-01-05 18:00', 1),
(4, 4, 2, N'Hội nghị khách hàng', N'Sự kiện doanh nghiệp', '2026-02-10 09:00', '2026-02-10 12:00', 1),
(5, 5, 2, N'Festival Công nghệ', N'Sự kiện công nghệ toàn quốc', '2026-03-01 08:00', '2026-03-01 20:00', 1);

/* 6) LoaiVe */
INSERT INTO dbo.LoaiVe (SuKienID, TenLoaiVe, MoTa, DonGia, SoLuongToiDa) VALUES
(1, N'Ve thường', N'Vé phổ thông', 200000, 500),
(1, N'Ve VIP', N'Vé ưu tiên', 500000, 100),
(2, N'Ve thường', N'Vé phổ thông', 300000, 400),
(2, N'Ve VIP', N'Ghế gần sân khấu', 800000, 50),
(3, N'Ve miễn phí', N'Dành cho cộng đồng', 0, 1000);

/* 7) DonHang */
INSERT INTO dbo.DonHang (NguoiMuaID, SuKienID, TongTien, TrangThai) VALUES
(3, 1, 200000, 1),
(3, 2, 300000, 0),
(5, 2, 800000, 1),
(4, 3, 0, 1),
(3, 5, 200000, 1);

/* 8) ChiTietDonHang */
INSERT INTO dbo.ChiTietDonHang (DonHangID, LoaiVeID, SoLuong, DonGia) VALUES
(1, 1, 1, 200000),
(2, 3, 1, 300000),
(3, 4, 1, 800000),
(4, 5, 2, 0),
(5, 2, 1, 500000);

/* 9) Ve */
INSERT INTO dbo.Ve (DonHangID, LoaiVeID, NguoiSoHuuID, MaVe, QrToken) VALUES
(1, 1, 3, 'VE001', 'QR001'),
(2, 3, 3, 'VE002', 'QR002'),
(3, 4, 5, 'VE003', 'QR003'),
(4, 5, 4, 'VE004', 'QR004'),
(5, 2, 3, 'VE005', 'QR005');

/* 10) ThanhToan */
INSERT INTO dbo.ThanhToan (DonHangID, MaGiaoDich, PhuongThuc, SoTien, TrangThai, ThoiGianThanhToan) VALUES
(1, 'GD001', N'VNPAY', 200000, 1, SYSDATETIME()),
(2, 'GD002', N'MOMO', 300000, 0, NULL),
(3, 'GD003', N'Tiền mặt', 800000, 1, SYSDATETIME()),
(4, 'GD004', N'Miễn phí', 0, 1, SYSDATETIME()),
(5, 'GD005', N'VNPAY', 200000, 1, SYSDATETIME());

/* 11) ThongBao */
INSERT INTO dbo.ThongBao (NguoiDungID, DonHangID, VeID, LoaiThongBao, TieuDe, NoiDung, TrangThai) VALUES
(3, 1, 1, N'EMAIL', N'Xác nhận đơn hàng', N'Bạn đã mua vé thành công', 1),
(3, 2, 2, N'SMS', N'Chờ thanh toán', N'Đơn hàng của bạn đang chờ thanh toán', 0),
(5, 3, 3, N'EMAIL', N'Xác nhận vé VIP', N'Bạn đã mua vé VIP', 1),
(4, 4, 4, N'APP', N'Check-in thành công', N'Bạn đã check-in sự kiện', 1),
(3, 5, 5, N'EMAIL', N'Xác nhận Festival', N'Bạn đã mua vé Festival', 1);

/* 12) NhatKyCheckin */
INSERT INTO dbo.NhatKyCheckin (VeID, SuKienID, NhanVienID, KetQua, GhiChu) VALUES
(1, 1, 4, 1, N'Check-in thành công'),
(2, 2, 4, 1, N'Check-in thành công'),
(3, 2, 4, 1, N'Check-in VIP'),
(4, 3, 4, 1, N'Check-in miễn phí'),
(5, 5, 4, 1, N'Check-in Festival');
SELECT SuKienID, TenSuKien FROM dbo.SuKien ORDER BY SuKienID;
-- 2) Xóa dữ liệu phụ thuộc trước (tùy bạn có bảng nào khác FK tới LoaiVe/SuKien thì xóa trước nữa)
DELETE FROM dbo.LoaiVe;
DELETE FROM dbo.SuKien;
DELETE FROM dbo.ChiTietDonHang;
DELETE FROM dbo.DonHang;
DELETE FROM dbo.ThanhToan;
DELETE FROM dbo.Ve;
DELETE FROM dbo.NhatKyCheckin;
-- 3) Reset identity về 0 để insert mới sẽ bắt đầu từ 1
DBCC CHECKIDENT ('dbo.SuKien', RESEED, 0);
DBCC CHECKIDENT ('dbo.LoaiVe', RESEED, 0);
DBCC CHECKIDENT ('dbo.DonHang', RESEED, 0);
DBCC CHECKIDENT ('dbo.ChiTietDonHang', RESEED, 0);
DBCC CHECKIDENT ('dbo.ThanhToan', RESEED, 0);
DBCC CHECKIDENT ('dbo.Ve', RESEED, 0);
DBCC CHECKIDENT ('dbo.NhatKyCheckin', RESEED, 0);
