using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Models;
using Services.Interfaces;

namespace TicketEvent.Attendee.Controllers
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

        // GET: /api/SuKien/by-name?ten=Concert
        [HttpGet("by-name")]
        public async Task<IActionResult> GetByName([FromQuery] string ten)
        {
            if (string.IsNullOrWhiteSpace(ten))
                return BadRequest(new { message = "Thiếu query parameter: ten" });

            var data = await _service.GetByNameAsync(ten);
            return Ok(data);
        }

        // GET: /api/SuKien/by-category?tenDanhMuc=Workshop
        [HttpGet("by-category")]
        public async Task<IActionResult> GetByCategory([FromQuery] string? tenDanhMuc)
        {
            if (string.IsNullOrWhiteSpace(tenDanhMuc))
                return BadRequest(new { message = "Cần truyền tenDanhMuc" });

            var data = await _service.GetByDanhMucNameAsync(tenDanhMuc!);
            return Ok(data);
        }
    }
}
