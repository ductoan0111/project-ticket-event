using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Models.DTOs.Requests;
using Services.Interfaces;

namespace TicketEvent.Organizer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckInController : ControllerBase
    {
        private readonly ICheckInService _service;

        public CheckInController(ICheckInService service)
        {
            _service = service;
        }
        [HttpPost]
        public IActionResult CheckIn([FromBody] CheckInRequest request)
        {
            if (request == null)
                return BadRequest(new { success = false, message = "Request body không hợp lệ." });

            if (string.IsNullOrWhiteSpace(request.QrToken) && string.IsNullOrWhiteSpace(request.MaVe))
                return BadRequest(new { success = false, message = "Cần cung cấp QrToken hoặc MaVe." });

            if (request.NhanVienID <= 0)
                return BadRequest(new { success = false, message = "NhanVienID không hợp lệ." });

            var result = _service.Checkin(request);
            
            // result là dynamic object từ repository
            var resultDict = result as IDictionary<string, object>;
            if (resultDict != null && resultDict.ContainsKey("success"))
            {
                var success = (bool)resultDict["success"];
                if (!success)
                    return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
