using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Models;

namespace TicketEvent.Organizer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuKienController : ControllerBase
    {
        private readonly ISuKienService _service;

        public SuKienController(ISuKienService service)
        {
            _service = service;
        }

        // GET: api/sukien
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SuKien>>> GetAll()
        {
            var suKiens = await _service.GetAllAsync();
            return Ok(suKiens);
        }

        // GET: api/sukien/my-events?status=0
        // Lấy sự kiện của Organizer theo trạng thái
        [HttpGet("my-events")]
        public async Task<ActionResult<IEnumerable<SuKien>>> GetMyEvents([FromQuery] byte? status)
        {
            var allEvents = await _service.GetAllAsync();
            
            // TODO: Lọc theo ToChucID của user đang đăng nhập
            // Hiện tại trả về tất cả, sau này cần thêm authentication
            
            if (status.HasValue)
            {
                allEvents = allEvents.Where(e => e.TrangThai == status.Value);
            }
            
            return Ok(allEvents);
        }

        // GET: api/sukien/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SuKien>> GetById(int id)
        {
            var suKien = await _service.GetByIdAsync(id);

            if (suKien == null)
            {
                return NotFound(new { message = $"Không tìm thấy sự kiện với ID: {id}" });
            }

            return Ok(suKien);
        }

        // POST: api/sukien
        [HttpPost]
        public async Task<ActionResult<SuKien>> Create([FromBody] SuKien suKien)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate thời gian
            if (suKien.ThoiGianKetThuc <= suKien.ThoiGianBatDau)
            {
                return BadRequest(new { message = "Thời gian kết thúc phải sau thời gian bắt đầu" });
            }

            // QUAN TRỌNG: Tự động set trạng thái = 0 (Chờ duyệt)
            // Organizer không thể tự duyệt sự kiện, phải chờ Admin duyệt
            suKien.TrangThai = 0;
            
            // Set ngày tạo
            suKien.NgayTao = DateTime.Now;

            var newId = await _service.CreateAsync(suKien);
            suKien.SuKienID = newId;

            return CreatedAtAction(nameof(GetById), new { id = newId }, new 
            { 
                suKien,
                message = "Tạo sự kiện thành công. Sự kiện đang chờ Admin duyệt."
            });
        }

        // PUT: api/sukien/5
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] SuKien suKien)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != suKien.SuKienID)
            {
                return BadRequest(new { message = "ID không khớp" });
            }

            // Kiểm tra tồn tại
            var existingSuKien = await _service.GetByIdAsync(id);
            if (existingSuKien == null)
            {
                return NotFound(new { message = $"Không tìm thấy sự kiện với ID: {id}" });
            }

            // QUAN TRỌNG: Organizer không được phép thay đổi trạng thái
            // Chỉ Admin mới có quyền duyệt (TrangThai = 1)
            if (suKien.TrangThai != existingSuKien.TrangThai)
            {
                return Forbid("Bạn không có quyền thay đổi trạng thái sự kiện. Chỉ Admin mới có quyền duyệt.");
            }

            // Không cho phép sửa sự kiện đã được duyệt (TrangThai = 1) hoặc đã kết thúc
            if (existingSuKien.TrangThai == 1)
            {
                return BadRequest(new { message = "Không thể sửa sự kiện đã được duyệt. Vui lòng liên hệ Admin." });
            }

            if (existingSuKien.TrangThai >= 2)
            {
                return BadRequest(new { message = "Không thể sửa sự kiện đã kết thúc hoặc đã hủy." });
            }

            // Validate thời gian
            if (suKien.ThoiGianKetThuc <= suKien.ThoiGianBatDau)
            {
                return BadRequest(new { message = "Thời gian kết thúc phải sau thời gian bắt đầu" });
            }

            var success = await _service.UpdateAsync(suKien);

            if (!success)
            {
                return StatusCode(500, new { message = "Không thể cập nhật sự kiện" });
            }

            return Ok(new { message = "Cập nhật sự kiện thành công" });
        }

        // DELETE: api/sukien/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "ID không hợp lệ" });
            }

            // Kiểm tra tồn tại
            var existingSuKien = await _service.GetByIdAsync(id);
            if (existingSuKien == null)
            {
                return NotFound(new { message = $"Không tìm thấy sự kiện với ID: {id}" });
            }

            // Kiểm tra trạng thái - không cho xóa sự kiện đã bắt đầu hoặc đang diễn ra
            if (existingSuKien.TrangThai == 2) // Đang diễn ra
            {
                return BadRequest(new { message = "Không thể xóa sự kiện đang diễn ra" });
            }

            if (existingSuKien.TrangThai == 3) // Đã kết thúc
            {
                return BadRequest(new { message = "Không thể xóa sự kiện đã kết thúc" });
            }

            // Kiểm tra thời gian - không cho xóa nếu sự kiện đã bắt đầu
            if (existingSuKien.ThoiGianBatDau <= DateTime.Now)
            {
                return BadRequest(new { message = "Không thể xóa sự kiện đã bắt đầu hoặc đang diễn ra" });
            }

            var success = await _service.DeleteAsync(id);

            if (!success)
            {
                return StatusCode(500, new { message = "Không thể xóa sự kiện" });
            }

            return Ok(new { message = "Xóa sự kiện thành công" });
        }
    }
}
