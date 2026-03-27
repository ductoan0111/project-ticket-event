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

            // Set ngày tạo
            suKien.NgayTao = DateTime.Now;

            var newId = await _service.CreateAsync(suKien);
            suKien.SuKienID = newId;

            return CreatedAtAction(nameof(GetById), new { id = newId }, suKien);
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
