using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace TicketEvent.Login.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly IVaiTroService _service;

        public RolesController(IVaiTroService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var roles = _service.GetAll();
            return Ok(roles);
        }

        [HttpGet("{id:int}")]
        public IActionResult GetById(int id)
        {
            var role = _service.GetById(id);
            if (role == null) return NotFound();

            return Ok(role);
        }
    }
}
