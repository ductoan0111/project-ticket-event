using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace TicketEvent.Attendee.Controllers
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
        /// Lấy danh sách vé của người dùng
        /// GET: /api/Ve/me?nguoiSoHuuId=1
        /// </summary>
        [HttpGet("me")]
        public IActionResult GetMyTickets([FromQuery] int nguoiSoHuuId)
        {
            if (nguoiSoHuuId <= 0)
                return BadRequest(new { message = "nguoiSoHuuId không hợp lệ." });

            var tickets = _service.GetMyTickets(nguoiSoHuuId);
            return Ok(new
            {
                nguoiSoHuuId,
                count = tickets.Count(),
                data = tickets
            });
        }

        /// <summary>
        /// Lấy chi tiết một vé theo mã vé
        /// GET: /api/Ve/{maVe}?nguoiSoHuuId=1
        /// </summary>
        [HttpGet("{maVe}")]
        public IActionResult GetMyTicketByMaVe([FromRoute] string maVe, [FromQuery] int nguoiSoHuuId)
        {
            if (nguoiSoHuuId <= 0)
                return BadRequest(new { message = "nguoiSoHuuId không hợp lệ." });

            if (string.IsNullOrWhiteSpace(maVe))
                return BadRequest(new { message = "maVe không được để trống." });

            var ticket = _service.GetMyTicketByMaVe(nguoiSoHuuId, maVe);
            if (ticket == null)
                return NotFound(new { message = "Không tìm thấy vé hoặc vé không thuộc về bạn." });

            return Ok(ticket);
        }

        /// <summary>
        /// Hủy vé (chuyển trạng thái sang 2)
        /// PATCH: /api/Ve/{maVe}/cancel?nguoiSoHuuId=1
        /// </summary>
        [HttpPatch("{maVe}/cancel")]
        public async Task<IActionResult> CancelTicket(
            [FromRoute] string maVe,
            [FromQuery] int nguoiSoHuuId,
            [FromBody] CancelTicketRequest? request)
        {
            if (nguoiSoHuuId <= 0)
                return BadRequest(new { message = "nguoiSoHuuId không hợp lệ." });

            if (string.IsNullOrWhiteSpace(maVe))
                return BadRequest(new { message = "maVe không được để trống." });

            var lyDo = request?.LyDo;
            var success = await _service.HuyVeAsync(nguoiSoHuuId, maVe, lyDo);

            if (!success)
                return BadRequest(new
                {
                    message = "Không thể hủy vé. Vé có thể không tồn tại, không thuộc về bạn, hoặc đã được sử dụng."
                });

            return Ok(new
            {
                message = "Hủy vé thành công.",
                maVe,
                trangThaiMoi = 2
            });
        }

        /// <summary>
        /// Hoàn vé (hoàn tiền + chuyển trạng thái sang 3)
        /// POST: /api/Ve/{maVe}/refund?nguoiSoHuuId=1
        /// </summary>
        [HttpPost("{maVe}/refund")]
        public async Task<IActionResult> RefundTicket(
            [FromRoute] string maVe,
            [FromQuery] int nguoiSoHuuId,
            [FromBody] RefundTicketRequest? request)
        {
            if (nguoiSoHuuId <= 0)
                return BadRequest(new { message = "nguoiSoHuuId không hợp lệ." });

            if (string.IsNullOrWhiteSpace(maVe))
                return BadRequest(new { message = "maVe không được để trống." });

            var lyDo = request?.LyDo;
            var phuongThuc = request?.PhuongThuc ?? "REFUND_MOCK";
            var rawResponse = request?.RawResponse;

            var result = await _service.HoanVeAsync(nguoiSoHuuId, maVe, lyDo, phuongThuc, rawResponse);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }

    // Request DTOs cho controller này
    public class CancelTicketRequest
    {
        public string? LyDo { get; set; }
    }

    public class RefundTicketRequest
    {
        public string? LyDo { get; set; }
        public string? PhuongThuc { get; set; }
        public string? RawResponse { get; set; }
    }
}
