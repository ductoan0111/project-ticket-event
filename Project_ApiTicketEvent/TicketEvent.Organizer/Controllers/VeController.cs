using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace TicketEvent.Organizer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VeController : ControllerBase
    {
        private readonly IVeService _service;

        public VeController(IVeService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy danh sách vé theo sự kiện (cho ban tổ chức)
        /// GET: /api/Ve/sukien/{suKienId}?trangThai={0|1|2|3}
        /// TrangThai: 0=Hợp lệ, 1=Đã sử dụng, 2=Đã hủy, 3=Đã hoàn
        /// </summary>
        [HttpGet("sukien/{suKienId:int}")]
        public IActionResult GetBySuKien([FromRoute] int suKienId, [FromQuery] byte? trangThai = null)
        {
            if (suKienId <= 0)
                return BadRequest(new { message = "SuKienId không hợp lệ." });

            var tickets = _service.GetBySuKienId(suKienId, trangThai);
            var list = tickets.ToList();

            return Ok(new
            {
                suKienId,
                trangThai,
                count = list.Count,
                data = list
            });
        }
    }
}
