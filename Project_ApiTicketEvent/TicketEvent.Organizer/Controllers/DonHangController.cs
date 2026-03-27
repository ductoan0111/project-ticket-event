using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace TicketEvent.Organizer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DonHangController : ControllerBase
    {
        private readonly IDonHangService _service;

        public DonHangController(IDonHangService service)
        {
            _service = service;
        }

        [HttpGet("sukien/{suKienId:int}")]
        public async Task<IActionResult> GetBySuKien([FromRoute] int suKienId, [FromQuery] byte? trangThai = null)
        {
            if (suKienId <= 0)
                return BadRequest(new { message = "SuKienId không hợp lệ." });

            var donHangs = await _service.GetBySuKienIdAsync(suKienId, trangThai);

            return Ok(new
            {
                suKienId,
                trangThai,
                count = donHangs.Count,
                data = donHangs
            });
        }

        [HttpGet("{donHangId:int}/sukien/{suKienId:int}")]
        public async Task<IActionResult> GetDetail([FromRoute] int donHangId, [FromRoute] int suKienId)
        {
            if (donHangId <= 0)
                return BadRequest(new { message = "DonHangId không hợp lệ." });

            if (suKienId <= 0)
                return BadRequest(new { message = "SuKienId không hợp lệ." });

            var detail = await _service.GetDetailBySuKienAsync(donHangId, suKienId);

            if (detail == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng hoặc đơn hàng không thuộc sự kiện này." });

            return Ok(detail);
        }

        [HttpGet("sukien/{suKienId:int}/thongke")]
        public async Task<IActionResult> GetThongKe([FromRoute] int suKienId)
        {
            if (suKienId <= 0)
                return BadRequest(new { message = "SuKienId không hợp lệ." });

            var thongKe = await _service.GetThongKeAsync(suKienId);

            return Ok(new
            {
                suKienId,
                thongKe
            });
        }
    }
}
