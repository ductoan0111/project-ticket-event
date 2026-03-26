using Microsoft.AspNetCore.Mvc;
using Models;
using Services.Interfaces;

namespace TicketEvent.Admin.Controllers
{
    [ApiController]
    [Route("api/admin/sukien")]
    public class SuKienController : ControllerBase
    {
        private readonly ISuKienService _service;

        public SuKienController(ISuKienService service)
        {
            _service = service;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SuKien>>> GetAll()
        {
            var suKiens = await _service.GetAllAsync();
            return Ok(suKiens);
        }

        [HttpGet("by-name")]
        public async Task<IActionResult> GetByName([FromQuery] string ten)
        {
            if (string.IsNullOrWhiteSpace(ten))
                return BadRequest(new { message = "Thiếu query parameter: ten" });

            var data = await _service.GetByNameAsync(ten);
            return Ok(data);
        }

        [HttpGet("by-category")]
        public async Task<IActionResult> GetByCategory([FromQuery] string? tenDanhMuc)
        {
            if (string.IsNullOrWhiteSpace(tenDanhMuc))
                return BadRequest(new { message = "Cần truyền tenDanhMuc" });

            var data = await _service.GetByDanhMucNameAsync(tenDanhMuc!);
            return Ok(data);
        }

        [HttpGet("pending")]
        public IActionResult GetPending()
        {
            var data = _service.GetPending();
            return Ok(data);
        }

        [HttpPut("{id:int}/approve")]
        public IActionResult Approve(int id)
        {
            var ok = _service.Approve(id);
            if (!ok)
                return Conflict(new
                {
                    message = "Duyệt thất bại. Sự kiện không tồn tại hoặc không còn ở trạng thái chờ duyệt (0)."
                });

            return Ok(new { message = "Duyệt sự kiện thành công (TrangThai = 1)." });
        }

        [HttpPut("{id:int}/cancel")]
        public IActionResult Cancel(int id)
        {
            var ok = _service.Cancel(id);
            if (!ok)
                return Conflict(new
                {
                    message = "Huỷ thất bại. Sự kiện không tồn tại hoặc không còn ở trạng thái chờ duyệt (0)."
                });

            return Ok(new { message = "Huỷ sự kiện thành công (TrangThai = 5)." });
        }
    }
}
