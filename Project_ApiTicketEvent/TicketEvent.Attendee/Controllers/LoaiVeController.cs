using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using static Models.DTOs.Requests.LoaiVeRequest;

namespace TicketEvent.Attendee.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoaiVeController : ControllerBase
    {
        private readonly ILoaiVeService _service;

        public LoaiVeController(ILoaiVeService service)
        {
            _service = service;
        }

        // GET: /api/LoaiVe
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        // GET: /api/LoaiVe/by-name?ten=VIP
        [HttpGet("by-name")]
        public async Task<IActionResult> GetByName([FromQuery] GetLoaiVeByNameRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Ten))
                return BadRequest(new { message = "Thiếu query parameter: ten" });

            var data = await _service.GetByNameAsync(req.Ten);
            return Ok(data);
        }

        // GET: /api/LoaiVe/by-event-name?tenSuKien=Concert
        [HttpGet("by-event-name")]
        public async Task<IActionResult> GetByTenSuKien([FromQuery] GetLoaiVeByEventRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.TenSuKien))
                return BadRequest(new { message = "Thiếu query parameter: tenSuKien" });

            var data = await _service.GetByTenSuKienAsync(req.TenSuKien);
            return Ok(data);
        }

        // -----------------------------------------------------------------------
        // GET: /api/LoaiVe/sukien/{suKienId}
        // Lấy danh sách loại vé của một sự kiện (dùng cho trang chi tiết & chọn vé)
        // Query: ?chiBanDang=true  → chỉ trả về loại vé đang active
        // -----------------------------------------------------------------------
        [HttpGet("sukien/{suKienId:int}")]
        public async Task<IActionResult> GetBySuKienId(
            [FromRoute] int suKienId,
            [FromQuery] bool? chiBanDang = null)
        {
            if (suKienId <= 0)
                return BadRequest(new { message = "suKienId không hợp lệ." });

            bool? filterTrangThai = chiBanDang == true ? true : null;
            var loaiVes = await _service.GetBySuKienIdAsync(suKienId, filterTrangThai);

            var now = DateTime.Now;
            var result = loaiVes.Select(lv =>
            {
                int soLuongCon = lv.SoLuongToiDa - lv.SoLuongDaBan;

                bool dangMoBan = lv.TrangThai
                    && (!lv.ThoiGianMoBan.HasValue || lv.ThoiGianMoBan.Value <= now)
                    && (!lv.ThoiGianDongBan.HasValue || lv.ThoiGianDongBan.Value >= now);

                string trangThaiMoBan =
                    !lv.TrangThai ? "Ngừng bán" :
                    lv.ThoiGianMoBan.HasValue && lv.ThoiGianMoBan.Value > now ? "Chưa mở bán" :
                    lv.ThoiGianDongBan.HasValue && lv.ThoiGianDongBan.Value < now ? "Đã kết thúc" :
                    soLuongCon <= 0 ? "Hết vé" : "Đang mở bán";

                return new
                {
                    lv.LoaiVeID,
                    lv.SuKienID,
                    lv.TenLoaiVe,
                    lv.MoTa,
                    lv.DonGia,
                    lv.SoLuongToiDa,
                    lv.SoLuongDaBan,
                    SoLuongCon = soLuongCon,
                    lv.GioiHanMoiKhach,
                    lv.ThoiGianMoBan,
                    lv.ThoiGianDongBan,
                    lv.TrangThai,
                    ConVe = soLuongCon > 0,
                    DangMoBan = dangMoBan,
                    TrangThaiMoBan = trangThaiMoBan,
                    PhanTramDaBan = lv.SoLuongToiDa > 0
                        ? Math.Round((double)lv.SoLuongDaBan / lv.SoLuongToiDa * 100, 1)
                        : 0.0
                };
            }).ToList();

            return Ok(new
            {
                success = true,
                suKienId,
                count = result.Count,
                data = result
            });
        }

        // -----------------------------------------------------------------------
        // GET: /api/LoaiVe/{id}/availability
        // Kiểm tra tồn kho & trạng thái mở bán của một loại vé cụ thể
        // -----------------------------------------------------------------------
        [HttpGet("{id:int}/availability")]
        public async Task<IActionResult> GetAvailability([FromRoute] int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "loaiVeId không hợp lệ." });

            var lv = await _service.GetByIdAsync(id);
            if (lv == null)
                return NotFound(new { message = $"Không tìm thấy loại vé với ID: {id}" });

            var now = DateTime.Now;
            int soLuongCon = lv.SoLuongToiDa - lv.SoLuongDaBan;
            bool conVe = soLuongCon > 0;
            bool dangMoBan = lv.TrangThai
                && (!lv.ThoiGianMoBan.HasValue || lv.ThoiGianMoBan.Value <= now)
                && (!lv.ThoiGianDongBan.HasValue || lv.ThoiGianDongBan.Value >= now);

            string trangThaiMoBan =
                !lv.TrangThai ? "Ngừng bán" :
                lv.ThoiGianMoBan.HasValue && lv.ThoiGianMoBan.Value > now ? "Chưa mở bán" :
                lv.ThoiGianDongBan.HasValue && lv.ThoiGianDongBan.Value < now ? "Đã kết thúc" :
                soLuongCon <= 0 ? "Hết vé" : "Đang mở bán";

            return Ok(new
            {
                success = true,
                data = new
                {
                    lv.LoaiVeID,
                    lv.TenLoaiVe,
                    lv.DonGia,
                    lv.SoLuongToiDa,
                    lv.SoLuongDaBan,
                    SoLuongCon = soLuongCon,
                    ConVe = conVe,
                    DangMoBan = dangMoBan,
                    TrangThaiMoBan = trangThaiMoBan,
                    lv.GioiHanMoiKhach
                }
            });
        }
    }
}
