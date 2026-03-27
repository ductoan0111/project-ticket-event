using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace TicketEvent.Organizer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaoCaoController : ControllerBase
    {
        private readonly IBaoCaoService _service;

        public BaoCaoController(IBaoCaoService service)
        {
            _service = service;
        }

        [HttpGet("sukien/{suKienId:int}/tongquan")]
        public async Task<IActionResult> GetTongQuan([FromRoute] int suKienId)
        {
            if (suKienId <= 0)
                return BadRequest(new { message = "SuKienId không hợp lệ." });

            var data = await _service.GetTongQuanAsync(suKienId);

            return Ok(new
            {
                suKienId,
                data
            });
        }

        [HttpGet("sukien/{suKienId:int}/doanhthu")]
        public async Task<IActionResult> GetDoanhThuTheoNgay(
            [FromRoute] int suKienId,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            if (suKienId <= 0)
                return BadRequest(new { message = "SuKienId không hợp lệ." });

            var data = await _service.GetDoanhThuTheoNgayAsync(suKienId, fromDate, toDate);

            return Ok(new
            {
                suKienId,
                fromDate,
                toDate,
                count = data.Count,
                data
            });
        }

        [HttpGet("sukien/{suKienId:int}/loaive")]
        public async Task<IActionResult> GetLoaiVeBanChay([FromRoute] int suKienId)
        {
            if (suKienId <= 0)
                return BadRequest(new { message = "SuKienId không hợp lệ." });

            var data = await _service.GetLoaiVeBanChayAsync(suKienId);

            return Ok(new
            {
                suKienId,
                count = data.Count,
                data
            });
        }

        [HttpGet("sukien/{suKienId:int}/topkhachhang")]
        public async Task<IActionResult> GetTopKhachHang(
            [FromRoute] int suKienId,
            [FromQuery] int top = 10)
        {
            if (suKienId <= 0)
                return BadRequest(new { message = "SuKienId không hợp lệ." });

            if (top <= 0 || top > 100)
                return BadRequest(new { message = "Top phải từ 1 đến 100." });

            var data = await _service.GetTopKhachHangAsync(suKienId, top);

            return Ok(new
            {
                suKienId,
                top,
                count = data.Count,
                data
            });
        }

        [HttpGet("sukien/{suKienId:int}/checkin")]
        public async Task<IActionResult> GetThongKeCheckIn([FromRoute] int suKienId)
        {
            if (suKienId <= 0)
                return BadRequest(new { message = "SuKienId không hợp lệ." });

            var data = await _service.GetThongKeCheckInAsync(suKienId);

            return Ok(new
            {
                suKienId,
                data
            });
        }

        [HttpGet("sukien/{suKienId:int}/checkin-theo-gio")]
        public async Task<IActionResult> GetCheckInTheoGio([FromRoute] int suKienId)
        {
            if (suKienId <= 0)
                return BadRequest(new { message = "SuKienId không hợp lệ." });

            var data = await _service.GetCheckInTheoGioAsync(suKienId);

            return Ok(new
            {
                suKienId,
                count = data.Count,
                data
            });
        }
    }
}
