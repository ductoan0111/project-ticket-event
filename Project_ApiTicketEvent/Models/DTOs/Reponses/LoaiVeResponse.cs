namespace Models.DTOs.Reponses
{
    /// <summary>
    /// Response đầy đủ thông tin loại vé cho trang chọn vé
    /// </summary>
    public class LoaiVeResponse
    {
        public int LoaiVeID { get; set; }
        public int SuKienID { get; set; }
        public string TenLoaiVe { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public decimal DonGia { get; set; }
        public int SoLuongToiDa { get; set; }
        public int SoLuongDaBan { get; set; }
        public int SoLuongCon { get; set; }
        public int? GioiHanMoiKhach { get; set; }
        public DateTime? ThoiGianMoBan { get; set; }
        public DateTime? ThoiGianDongBan { get; set; }
        public bool TrangThai { get; set; }

        // Trạng thái bán vé
        public bool ConVe => SoLuongCon > 0;
        public bool DangMoBan => TrangThai
            && (!ThoiGianMoBan.HasValue || ThoiGianMoBan.Value <= DateTime.Now)
            && (!ThoiGianDongBan.HasValue || ThoiGianDongBan.Value >= DateTime.Now);
        public string TrangThaiMoBan =>
            !TrangThai ? "Ngừng bán" :
            ThoiGianMoBan.HasValue && ThoiGianMoBan.Value > DateTime.Now ? "Chưa mở bán" :
            ThoiGianDongBan.HasValue && ThoiGianDongBan.Value < DateTime.Now ? "Đã kết thúc" :
            SoLuongCon <= 0 ? "Hết vé" : "Đang mở bán";

        public double PhanTramDaBan =>
            SoLuongToiDa > 0 ? Math.Round((double)SoLuongDaBan / SoLuongToiDa * 100, 1) : 0;
    }

    /// <summary>
    /// Response kiểm tra tồn kho vé (availability)
    /// </summary>
    public class LoaiVeAvailabilityResponse
    {
        public int LoaiVeID { get; set; }
        public string TenLoaiVe { get; set; } = string.Empty;
        public decimal DonGia { get; set; }
        public int SoLuongToiDa { get; set; }
        public int SoLuongDaBan { get; set; }
        public int SoLuongCon { get; set; }
        public bool ConVe { get; set; }
        public bool DangMoBan { get; set; }
        public string TrangThaiMoBan { get; set; } = string.Empty;
        public int? GioiHanMoiKhach { get; set; }
    }

    /// <summary>
    /// Response chi tiết sự kiện kèm danh sách loại vé
    /// </summary>
    public class SuKienDetailResponse
    {
        // Thông tin sự kiện
        public int SuKienID { get; set; }
        public string TenSuKien { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public DateTime ThoiGianBatDau { get; set; }
        public DateTime ThoiGianKetThuc { get; set; }
        public string? AnhBiaUrl { get; set; }
        public byte TrangThai { get; set; }
        public int DanhMucID { get; set; }
        public int DiaDiemID { get; set; }
        public int ToChucID { get; set; }

        // Danh sách loại vé của sự kiện
        public List<LoaiVeResponse> LoaiVes { get; set; } = new();

        // Tổng hợp
        public decimal GiaThapNhat => LoaiVes.Any() ? LoaiVes.Where(v => v.DangMoBan && v.ConVe).Select(v => v.DonGia).DefaultIfEmpty(0).Min() : 0;
        public decimal GiaCaoNhat => LoaiVes.Any() ? LoaiVes.Max(v => v.DonGia) : 0;
        public int TongVeConLai => LoaiVes.Sum(v => v.SoLuongCon);
        public bool ConVe => TongVeConLai > 0;
    }
}
