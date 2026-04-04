using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.DTOs.Requests;
using Models.DTOs.Reponses;
using Services.Interfaces;
using Services.Security;
using System.Security.Claims;

namespace TicketEvent.Attendee.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly INguoiDungService _service;

        public UserController(INguoiDungService service)
        {
            _service = service;
        }

        // -----------------------------------------------------------------------
        // Lấy userId từ JWT token
        // -----------------------------------------------------------------------
        private int? GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                return null;

            return id;
        }

        // -----------------------------------------------------------------------
        // GET /api/User/profile
        // Lấy thông tin cá nhân của user đang đăng nhập (từ JWT)
        // -----------------------------------------------------------------------
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Không xác định được người dùng." });

            var user = _service.GetById(userId.Value);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            // Trả về profile (KHÔNG bao gồm MatKhauHash)
            var profile = new UserProfileResponse
            {
                NguoiDungId = user.NguoiDungId,
                HoTen       = user.HoTen,
                Email       = user.Email,
                TenDangNhap = user.TenDangNhap,
                SoDienThoai = user.SoDienThoai,
                VaiTroId    = user.VaiTroId,
                NgayTao     = user.NgayTao,
                TrangThai   = user.TrangThai
            };

            return Ok(new { success = true, data = profile });
        }

        // -----------------------------------------------------------------------
        // PUT /api/User/profile
        // Cập nhật thông tin cá nhân (HoTen, SoDienThoai, TenDangNhap)
        // -----------------------------------------------------------------------
        [HttpPut("profile")]
        public IActionResult UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Không xác định được người dùng." });

            var user = _service.GetById(userId.Value);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            // Chỉ cập nhật những trường được phép
            if (!string.IsNullOrWhiteSpace(request.HoTen))
                user.HoTen = request.HoTen.Trim();

            if (!string.IsNullOrWhiteSpace(request.SoDienThoai))
                user.SoDienThoai = request.SoDienThoai.Trim();

            if (!string.IsNullOrWhiteSpace(request.TenDangNhap))
                user.TenDangNhap = request.TenDangNhap.Trim();

            var ok = _service.Update(user);
            if (!ok)
                return StatusCode(500, new { message = "Không thể cập nhật thông tin." });

            // Trả về profile đã cập nhật
            var updated = _service.GetById(userId.Value);
            var profile = new UserProfileResponse
            {
                NguoiDungId = updated!.NguoiDungId,
                HoTen       = updated.HoTen,
                Email       = updated.Email,
                TenDangNhap = updated.TenDangNhap,
                SoDienThoai = updated.SoDienThoai,
                VaiTroId    = updated.VaiTroId,
                NgayTao     = updated.NgayTao,
                TrangThai   = updated.TrangThai
            };

            return Ok(new { success = true, message = "Cập nhật thành công.", data = profile });
        }

        // -----------------------------------------------------------------------
        // PUT /api/User/change-password
        // Đổi mật khẩu — xác minh mật khẩu cũ trước khi đổi
        // -----------------------------------------------------------------------
        [HttpPut("change-password")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Không xác định được người dùng." });

            if (string.IsNullOrWhiteSpace(request.MatKhauCu))
                return BadRequest(new { message = "Mật khẩu cũ không được để trống." });

            if (string.IsNullOrWhiteSpace(request.MatKhauMoi) || request.MatKhauMoi.Length < 6)
                return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự." });

            var user = _service.GetById(userId.Value);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            // Xác minh mật khẩu cũ
            bool isOldPasswordCorrect = PasswordHasher.Verify(request.MatKhauCu, user.MatKhauHash);
            if (!isOldPasswordCorrect)
                return BadRequest(new { message = "Mật khẩu cũ không đúng." });

            // Hash mật khẩu mới và lưu
            user.MatKhauHash = PasswordHasher.Hash(request.MatKhauMoi);

            var ok = _service.Update(user);
            if (!ok)
                return StatusCode(500, new { message = "Không thể đổi mật khẩu." });

            return Ok(new { success = true, message = "Đổi mật khẩu thành công." });
        }
    }
}
