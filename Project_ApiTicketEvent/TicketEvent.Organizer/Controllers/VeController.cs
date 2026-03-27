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
