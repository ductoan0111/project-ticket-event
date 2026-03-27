using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Security.Claims;

namespace TicketEvent.Attendee.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ThongBaoController : ControllerBase
    {
        private readonly IThongBaoService _service;

        public ThongBaoController(IThongBaoService service)
        {
            _service = service;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyNotifications([FromQuery] byte? trangThai = null)
        {
            // Lấy user ID từ JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Không xác định được người dùng." });

            var notifications = await _service.GetByNguoiDungIdAsync(userId, trangThai);

            return Ok(new
            {
                userId,
                trangThai,
                count = notifications.Count,
                data = notifications
            });
        }

        [HttpGet("{thongBaoId:int}")]
        public async Task<IActionResult> GetById([FromRoute] int thongBaoId)
        {
            if (thongBaoId <= 0)
                return BadRequest(new { message = "ThongBaoID không hợp lệ." });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Không xác định được người dùng." });

            var thongBao = await _service.GetByIdAsync(thongBaoId);

            if (thongBao == null)
                return NotFound(new { message = "Không tìm thấy thông báo." });

            // Kiểm tra thông báo có thuộc về user này không
            if (thongBao.NguoiDungID != userId)
                return Forbid();

            return Ok(thongBao);
        }

        [HttpPut("{thongBaoId:int}/mark-read")]
        public async Task<IActionResult> MarkAsRead([FromRoute] int thongBaoId)
        {
            if (thongBaoId <= 0)
                return BadRequest(new { message = "ThongBaoID không hợp lệ." });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Không xác định được người dùng." });

            var thongBao = await _service.GetByIdAsync(thongBaoId);

            if (thongBao == null)
                return NotFound(new { message = "Không tìm thấy thông báo." });

            // Kiểm tra quyền sở hữu
            if (thongBao.NguoiDungID != userId)
                return Forbid();

            var success = await _service.MarkAsReadAsync(thongBaoId);

            if (!success)
                return BadRequest(new { message = "Không thể đánh dấu đã đọc." });

            return Ok(new { message = "Đã đánh dấu thông báo là đã đọc." });
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Không xác định được người dùng." });

            var count = await _service.GetUnreadCountAsync(userId);

            return Ok(new
            {
                userId,
                unreadCount = count
            });
        }
    }
}
