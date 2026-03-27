using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using static Models.DTOs.Requests.LoaiVeRequest;

namespace TicketEvent.Attendee.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoaiVeController : ControllerBase
    {
        private readonly ILoaiVeService _service;

        public LoaiVeController(ILoaiVeService service)
        {
            _service = service;
        }

        // GET: /api/LoaiVe
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        // GET: /api/LoaiVe/by-name?ten=VIP
        [HttpGet("by-name")]
        public async Task<IActionResult> GetByName([FromQuery] GetLoaiVeByNameRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Ten))
                return BadRequest(new { message = "Thiếu query parameter: ten" });

            var data = await _service.GetByNameAsync(req.Ten);
            return Ok(data);
        }

        // GET: /api/LoaiVe/by-event-name?tenSuKien=Concert
        [HttpGet("by-event-name")]
        public async Task<IActionResult> GetByTenSuKien([FromQuery] GetLoaiVeByEventRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.TenSuKien))
                return BadRequest(new { message = "Thiếu query parameter: tenSuKien" });

            var data = await _service.GetByTenSuKienAsync(req.TenSuKien);
            return Ok(data);
        }
    }
}
