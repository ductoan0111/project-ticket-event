using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace TicketEvent.Organizer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiaDiemController : ControllerBase
    {
        private readonly IDiaDiemService _service;

        public DiaDiemController(IDiaDiemService service)
        {
            _service = service;
        }

        // GET: /api/DiaDiem
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

    }
}
