using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Models.DTOs.Requests;
using Services.Interfaces;

namespace TicketEvent.Organizer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThongBaoController : ControllerBase
    {
        private readonly IThongBaoService _service;
        private readonly IDonHangService _donHangService;
        private readonly IVeService _veService;

        public ThongBaoController(IThongBaoService service, IDonHangService donHangService, IVeService veService)
        {
            _service = service;
            _donHangService = donHangService;
            _veService = veService;
        }

        [HttpPost("gui")]
        public async Task<IActionResult> GuiThongBao([FromBody] GuiThongBaoRequest request)
        {
            if (request.SuKienID <= 0)
                return BadRequest(new { message = "SuKienID không hợp lệ." });

            if (string.IsNullOrWhiteSpace(request.TieuDe))
                return BadRequest(new { message = "Tiêu đề không được để trống." });

            if (string.IsNullOrWhiteSpace(request.NoiDung))
                return BadRequest(new { message = "Nội dung không được để trống." });

            // Validate loại thông báo
            var validTypes = new[] { "EMAIL", "SMS", "APP" };
            if (!validTypes.Contains(request.LoaiThongBao.ToUpper()))
                return BadRequest(new { message = "Loại thông báo phải là EMAIL, SMS hoặc APP." });

            int count;

            // Nếu không chỉ định người dùng cụ thể, gửi cho tất cả
            if (request.NguoiDungIDs == null || request.NguoiDungIDs.Count == 0)
            {
                count = await _service.GuiThongBaoTatCaAsync(
                    request.SuKienID,
                    request.LoaiThongBao.ToUpper(),
                    request.TieuDe,
                    request.NoiDung,
                    request.GhiChu
                );

                return Ok(new
                {
                    message = $"Đã gửi thông báo cho tất cả người mua vé của sự kiện.",
                    soLuongGui = count
                });
            }

            // Gửi cho danh sách người dùng cụ thể
            count = await _service.GuiThongBaoAsync(
                request.SuKienID,
                request.NguoiDungIDs,
                request.LoaiThongBao.ToUpper(),
                request.TieuDe,
                request.NoiDung,
                request.GhiChu
            );

            return Ok(new
            {
                message = "Đã gửi thông báo thành công.",
                soLuongGui = count
            });
        }

        [HttpPost("gui-theo-ve")]
        public async Task<IActionResult> GuiThongBaoTheoVe([FromBody] GuiThongBaoTheoVeRequest request)
        {
            if (request.VeID <= 0)
                return BadRequest(new { message = "VeID không hợp lệ." });

            if (string.IsNullOrWhiteSpace(request.TieuDe))
                return BadRequest(new { message = "Tiêu đề không được để trống." });

            if (string.IsNullOrWhiteSpace(request.NoiDung))
                return BadRequest(new { message = "Nội dung không được để trống." });

            // Validate loại thông báo
            var validTypes = new[] { "EMAIL", "SMS", "APP" };
            if (!validTypes.Contains(request.LoaiThongBao.ToUpper()))
                return BadRequest(new { message = "Loại thông báo phải là EMAIL, SMS hoặc APP." });

            // Kiểm tra vé có tồn tại không
            var ve = await _veService.GetByIdAsync(request.VeID);
            if (ve == null)
                return NotFound(new { message = "Không tìm thấy vé." });

            bool success = await _service.GuiThongBaoTheoVeAsync(
                request.VeID,
                request.LoaiThongBao.ToUpper(),
                request.TieuDe,
                request.NoiDung,
                request.GhiChu
            );

            if (!success)
                return BadRequest(new { message = "Gửi thông báo thất bại." });

            return Ok(new
            {
                message = "Đã gửi thông báo cho người sở hữu vé.",
                veId = request.VeID
            });
        }

        [HttpGet("sukien/{suKienId:int}")]
        public async Task<IActionResult> GetBySuKien(
            [FromRoute] int suKienId,
            [FromQuery] byte? trangThai = null)
        {
            if (suKienId <= 0)
                return BadRequest(new { message = "SuKienID không hợp lệ." });

            var list = await _service.GetBySuKienAsync(suKienId, trangThai);

            return Ok(new
            {
                suKienId,
                trangThai,
                count = list.Count,
                data = list
            });
        }

        [HttpGet("{thongBaoId:int}")]
        public async Task<IActionResult> GetById([FromRoute] int thongBaoId)
        {
            if (thongBaoId <= 0)
                return BadRequest(new { message = "ThongBaoID không hợp lệ." });

            var thongBao = await _service.GetByIdAsync(thongBaoId);

            if (thongBao == null)
                return NotFound(new { message = "Không tìm thấy thông báo." });

            return Ok(thongBao);
        }
    }
}
