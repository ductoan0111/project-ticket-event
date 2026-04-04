namespace Models.DTOs.Reponses
{
    /// <summary>
    /// Thông tin profile người dùng — KHÔNG bao gồm MatKhauHash
    /// </summary>
    public class UserProfileResponse
    {
        public int NguoiDungId { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string TenDangNhap { get; set; } = string.Empty;
        public string? SoDienThoai { get; set; }
        public int? VaiTroId { get; set; }
        public DateTime? NgayTao { get; set; }
        public bool? TrangThai { get; set; }
    }
}
