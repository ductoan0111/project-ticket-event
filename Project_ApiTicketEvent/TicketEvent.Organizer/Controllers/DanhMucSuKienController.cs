using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace TicketEvent.Organizer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DanhMucSuKienController : ControllerBase
    {
        private readonly IDanhMucSuKienService _service;

        public DanhMucSuKienController(IDanhMucSuKienService service)
        {
            _service = service;
        }

        // GET: /api/DanhMucSuKien
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        // GET: /api/DanhMucSuKien/{id}
        [HttpGet("{id:int}")]
        public IActionResult GetById(int id)
        {
            var item = _service.GetById(id);
            if (item == null)
                return NotFound(new { message = $"Không tìm thấy danh mục ID: {id}" });
            return Ok(item);
        }
    }
}
