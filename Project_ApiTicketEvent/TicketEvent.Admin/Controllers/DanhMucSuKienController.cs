using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Models;
using Services.Interfaces;

namespace TicketEvent.Admin.Controllers
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
        [HttpGet("{id:int}")]
        public IActionResult GetById(int id)
        {
            var item = _service.GetById(id);
            if (item == null)
                return Ok(new { success = false, message = "Không tìm thấy danh mục" });

            return Ok(new { success = true, data = item });
        }

        [HttpGet("by-name")]
        public async Task<IActionResult> GetByName([FromQuery] string ten)
        {
            if (string.IsNullOrWhiteSpace(ten))
                return BadRequest(new { message = "Thiếu query parameter: ten" });

            var item = await _service.GetByNameAsync(ten);
            if (item == null)
                return NotFound(new { message = "Không tìm thấy danh mục phù hợp." });

            return Ok(item);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(new { success = true, data });
        }

        [HttpPost]
        public IActionResult Create(DanhMucSuKien model)
        {
            var id = _service.Create(model);
            return Ok(new { success = true, id });
        }

        [HttpPut("{id:int}")]
        public IActionResult Update(int id, DanhMucSuKien model)
        {
            model.DanhMucID = id;
            return Ok(new { success = _service.Update(model) });
        }

        [HttpDelete("{id:int}")]
        public IActionResult Delete(int id)
        {
            return Ok(new { success = _service.Delete(id) });
        }
    }
}
