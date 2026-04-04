using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Security.Claims;

namespace TicketEvent.Attendee.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SuKienYeuThichController : ControllerBase
    {
        private readonly ISuKienYeuThichService _service;

        public SuKienYeuThichController(ISuKienYeuThichService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy danh sách sự kiện yêu thích của người dùng hiện tại
        /// </summary>
        /// <returns>Danh sách sự kiện yêu thích</returns>
        [HttpGet]
        public async Task<IActionResult> GetMyFavorites()
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
                return Unauthorized(new { message = "Không xác định được người dùng" });

            var events = await _service.GetFavoriteEventsAsync(nguoiDungId);
            return Ok(new
            {
                success = true,
                count = events.Count,
                data = events
            });
        }

        /// <summary>
        /// Lấy danh sách ID sự kiện yêu thích (dùng để check trạng thái favorite)
        /// </summary>
        /// <returns>Danh sách SuKienID</returns>
        [HttpGet("ids")]
        public async Task<IActionResult> GetMyFavoriteIds()
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
                return Unauthorized(new { message = "Không xác định được người dùng" });

            var ids = await _service.GetFavoriteIdsAsync(nguoiDungId);
            return Ok(new
            {
                success = true,
                count = ids.Count,
                data = ids
            });
        }

        /// <summary>
        /// Kiểm tra xem sự kiện có trong danh sách yêu thích không
        /// </summary>
        /// <param name="suKienId">ID sự kiện</param>
        /// <returns>True nếu đã yêu thích</returns>
        [HttpGet("check/{suKienId}")]
        public async Task<IActionResult> CheckFavorite(int suKienId)
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
                return Unauthorized(new { message = "Không xác định được người dùng" });

            var isFavorite = await _service.IsFavoriteAsync(nguoiDungId, suKienId);
            return Ok(new
            {
                success = true,
                isFavorite = isFavorite
            });
        }

        /// <summary>
        /// Thêm sự kiện vào danh sách yêu thích
        /// </summary>
        /// <param name="suKienId">ID sự kiện</param>
        /// <returns>Kết quả thêm</returns>
        [HttpPost("{suKienId}")]
        public async Task<IActionResult> AddFavorite(int suKienId)
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
                return Unauthorized(new { message = "Không xác định được người dùng" });

            var (success, message) = await _service.AddFavoriteAsync(nguoiDungId, suKienId);

            if (!success)
                return BadRequest(new { success = false, message });

            return Ok(new { success = true, message });
        }

        /// <summary>
        /// Xóa sự kiện khỏi danh sách yêu thích
        /// </summary>
        /// <param name="suKienId">ID sự kiện</param>
        /// <returns>Kết quả xóa</returns>
        [HttpDelete("{suKienId}")]
        public async Task<IActionResult> RemoveFavorite(int suKienId)
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
                return Unauthorized(new { message = "Không xác định được người dùng" });

            var (success, message) = await _service.RemoveFavoriteAsync(nguoiDungId, suKienId);

            if (!success)
                return BadRequest(new { success = false, message });

            return Ok(new { success = true, message });
        }

        /// <summary>
        /// Toggle trạng thái yêu thích (thêm nếu chưa có, xóa nếu đã có)
        /// </summary>
        /// <param name="suKienId">ID sự kiện</param>
        /// <returns>Kết quả và trạng thái mới</returns>
        [HttpPut("toggle/{suKienId}")]
        public async Task<IActionResult> ToggleFavorite(int suKienId)
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
                return Unauthorized(new { message = "Không xác định được người dùng" });

            var isFavorite = await _service.IsFavoriteAsync(nguoiDungId, suKienId);

            if (isFavorite)
            {
                var (success, message) = await _service.RemoveFavoriteAsync(nguoiDungId, suKienId);
                return Ok(new
                {
                    success = success,
                    message = message,
                    isFavorite = false
                });
            }
            else
            {
                var (success, message) = await _service.AddFavoriteAsync(nguoiDungId, suKienId);
                return Ok(new
                {
                    success = success,
                    message = message,
                    isFavorite = true
                });
            }
        }

        /// <summary>
        /// Lấy số lượng người yêu thích của một sự kiện
        /// </summary>
        /// <param name="suKienId">ID sự kiện</param>
        /// <returns>Số lượng người yêu thích</returns>
        [HttpGet("count/{suKienId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFavoriteCount(int suKienId)
        {
            var count = await _service.GetFavoriteCountAsync(suKienId);
            return Ok(new
            {
                success = true,
                suKienId = suKienId,
                count = count
            });
        }

        // Helper method để lấy NguoiDungID từ JWT token
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("NguoiDungID")?.Value;

            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }
    }
}
