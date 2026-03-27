using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Models;
using Models.DTOs.Requests;
using Services.Interfaces;

namespace TicketEvent.Organizer.Controllers
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

        [HttpGet("sukien/{suKienId:int}")]
        public async Task<IActionResult> GetBySuKien([FromRoute] int suKienId, [FromQuery] bool? trangThai = null)
        {
            if (suKienId <= 0)
                return BadRequest(new { message = "SuKienId không hợp lệ." });

            var loaiVes = await _service.GetBySuKienIdAsync(suKienId, trangThai);
            return Ok(new
            {
                suKienId,
                count = loaiVes.Count,
                data = loaiVes
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "LoaiVeId không hợp lệ." });

            var loaiVe = await _service.GetByIdAsync(id);
            if (loaiVe == null)
                return NotFound(new { message = "Không tìm thấy loại vé." });

            return Ok(loaiVe);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLoaiVeRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Request body không hợp lệ." });

            // Validation
            if (request.SuKienID <= 0)
                return BadRequest(new { message = "SuKienID không hợp lệ." });

            if (string.IsNullOrWhiteSpace(request.TenLoaiVe))
                return BadRequest(new { message = "TenLoaiVe không được để trống." });

            if (request.DonGia < 0)
                return BadRequest(new { message = "DonGia phải >= 0." });

            if (request.SoLuongToiDa <= 0)
                return BadRequest(new { message = "SoLuongToiDa phải > 0." });

            // Validate thời gian
            if (request.ThoiGianMoBan.HasValue && request.ThoiGianDongBan.HasValue)
            {
                if (request.ThoiGianDongBan <= request.ThoiGianMoBan)
                    return BadRequest(new { message = "ThoiGianDongBan phải sau ThoiGianMoBan." });
            }

            var loaiVe = new LoaiVe
            {
                SuKienID = request.SuKienID,
                TenLoaiVe = request.TenLoaiVe,
                MoTa = request.MoTa,
                DonGia = request.DonGia,
                SoLuongToiDa = request.SoLuongToiDa,
                GioiHanMoiKhach = request.GioiHanMoiKhach,
                ThoiGianMoBan = request.ThoiGianMoBan,
                ThoiGianDongBan = request.ThoiGianDongBan
            };

            var newId = await _service.CreateAsync(loaiVe);

            return CreatedAtAction(nameof(GetById), new { id = newId }, new
            {
                message = "Tạo loại vé thành công.",
                loaiVeId = newId
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateLoaiVeRequest request)
        {
            if (id <= 0)
                return BadRequest(new { message = "LoaiVeId không hợp lệ." });

            if (request == null)
                return BadRequest(new { message = "Request body không hợp lệ." });

            // Kiểm tra tồn tại
            var existing = await _service.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = "Không tìm thấy loại vé." });

            // Validation
            if (string.IsNullOrWhiteSpace(request.TenLoaiVe))
                return BadRequest(new { message = "TenLoaiVe không được để trống." });

            if (request.DonGia < 0)
                return BadRequest(new { message = "DonGia phải >= 0." });

            if (request.SoLuongToiDa <= 0)
                return BadRequest(new { message = "SoLuongToiDa phải > 0." });

            // Không cho phép giảm SoLuongToiDa xuống dưới SoLuongDaBan
            if (request.SoLuongToiDa < existing.SoLuongDaBan)
                return BadRequest(new { message = $"SoLuongToiDa không thể nhỏ hơn SoLuongDaBan ({existing.SoLuongDaBan})." });

            // Validate thời gian
            if (request.ThoiGianMoBan.HasValue && request.ThoiGianDongBan.HasValue)
            {
                if (request.ThoiGianDongBan <= request.ThoiGianMoBan)
                    return BadRequest(new { message = "ThoiGianDongBan phải sau ThoiGianMoBan." });
            }

            // Update
            existing.TenLoaiVe = request.TenLoaiVe;
            existing.MoTa = request.MoTa;
            existing.DonGia = request.DonGia;
            existing.SoLuongToiDa = request.SoLuongToiDa;
            existing.GioiHanMoiKhach = request.GioiHanMoiKhach;
            existing.ThoiGianMoBan = request.ThoiGianMoBan;
            existing.ThoiGianDongBan = request.ThoiGianDongBan;
            existing.TrangThai = request.TrangThai;

            var success = await _service.UpdateAsync(existing);

            if (!success)
                return StatusCode(500, new { message = "Không thể cập nhật loại vé." });

            return Ok(new
            {
                message = "Cập nhật loại vé thành công.",
                data = existing
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "LoaiVeId không hợp lệ." });

            // Kiểm tra tồn tại
            var existing = await _service.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = "Không tìm thấy loại vé." });

            // Kiểm tra đã có vé bán chưa
            if (existing.SoLuongDaBan > 0)
                return BadRequest(new { message = $"Không thể xóa loại vé đã bán {existing.SoLuongDaBan} vé." });

            var success = await _service.DeleteAsync(id);

            if (!success)
                return StatusCode(500, new { message = "Không thể xóa loại vé." });

            return Ok(new { message = "Xóa loại vé thành công." });
        }
    }
}
