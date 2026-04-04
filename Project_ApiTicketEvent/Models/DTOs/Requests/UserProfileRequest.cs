namespace Models.DTOs.Requests
{
    /// <summary>
    /// Request cập nhật thông tin cá nhân (dành cho user tự cập nhật, không cho đổi role/status)
    /// </summary>
    public class UpdateProfileRequest
    {
        public string? HoTen { get; set; }
        public string? SoDienThoai { get; set; }
        public string? TenDangNhap { get; set; }
    }

    /// <summary>
    /// Request đổi mật khẩu
    /// </summary>
    public class ChangePasswordRequest
    {
        public string MatKhauCu { get; set; } = string.Empty;
        public string MatKhauMoi { get; set; } = string.Empty;
    }
}
