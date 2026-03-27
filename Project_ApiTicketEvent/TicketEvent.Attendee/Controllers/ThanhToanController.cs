using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Models.DTOs.Requests;
using Services.Interfaces;

namespace TicketEvent.Attendee.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThanhToanController : ControllerBase
    {
        private readonly IThanhToanService _service;

        public ThanhToanController(IThanhToanService service)
        {
            _service = service;
        }
        // GET: /api/ThanhToan/history?nguoiMuaId=1
        [HttpGet("history")]
        public async Task<IActionResult> History([FromQuery] int nguoiMuaId)
        {
            if (nguoiMuaId <= 0) return BadRequest(new { message = "nguoiMuaId invalid" });

            var data = await _service.GetHistoryAsync(nguoiMuaId);
            return Ok(data);
        }

        // GET: /api/ThanhToan/history/by-donhang?nguoiMuaId=1&donHangId=10
        [HttpGet("history/by-donhang")]
        public async Task<IActionResult> HistoryByDonHang([FromQuery] int nguoiMuaId, [FromQuery] int donHangId)
        {
            if (nguoiMuaId <= 0 || donHangId <= 0)
                return BadRequest(new { message = "nguoiMuaId/donHangId invalid" });

            var data = await _service.GetHistoryByDonHangAsync(nguoiMuaId, donHangId);
            return Ok(data);
        }

        [HttpPost("mock/{donHangId:int}")]
        public async Task<IActionResult> MockThanhToan(
            [FromRoute] int donHangId,
            [FromQuery] int nguoiMuaId,
            [FromBody] ThanhToanRequest req)
        {
            if (donHangId <= 0) return BadRequest(new { message = "donHangId invalid" });
            if (nguoiMuaId <= 0) return BadRequest(new { message = "nguoiMuaId invalid" });

            try
            {
                var result = await _service.MockThanhToanAsync(donHangId, nguoiMuaId, req);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server Error", detail = ex.Message });
            }
        }
    }
}
