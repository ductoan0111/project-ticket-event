using Microsoft.AspNetCore.Mvc;
using Models;
using Services.Interfaces;

namespace TicketEvent.Admin.Controllers
{
    [ApiController]
    [Route("api/admin/nguoidung")]
    public class NguoiDungAdminController : ControllerBase
    {
        private readonly INguoiDungService _service;

        public NguoiDungAdminController(INguoiDungService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy tất cả người dùng
        /// GET /api/admin/nguoidung
        /// </summary>
        [HttpGet]
        public IActionResult GetAll()
        {
            var data = _service.GetAll();
            // Không trả mật khẩu ra ngoài
            var result = data.Select(u => new
            {
                u.NguoiDungId,
                u.HoTen,
                u.Email,
                u.TenDangNhap,
                u.SoDienThoai,
                u.VaiTroId,
                u.NgayTao,
                u.TrangThai
            });
            return Ok(result);
        }

        /// <summary>
        /// Lấy thông tin người dùng theo ID
        /// GET /api/admin/nguoidung/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public IActionResult GetById(int id)
        {
            var user = _service.GetById(id);
            if (user == null)
                return NotFound(new { success = false, message = "Không tìm thấy người dùng" });

            return Ok(new
            {
                user.NguoiDungId,
                user.HoTen,
                user.Email,
                user.TenDangNhap,
                user.SoDienThoai,
                user.VaiTroId,
                user.NgayTao,
                user.TrangThai
            });
        }

        /// <summary>
        /// Lấy người dùng theo vai trò
        /// GET /api/admin/nguoidung/by-role?maVaiTro=ATTENDEE
        /// </summary>
        [HttpGet("by-role")]
        public IActionResult GetByRole([FromQuery] string maVaiTro)
        {
            if (string.IsNullOrWhiteSpace(maVaiTro))
                return BadRequest(new { message = "Thiếu query parameter: maVaiTro" });

            var data = _service.GetByMaVaiTro(maVaiTro);
            var result = data.Select(u => new
            {
                u.NguoiDungId,
                u.HoTen,
                u.Email,
                u.TenDangNhap,
                u.SoDienThoai,
                u.VaiTroId,
                u.NgayTao,
                u.TrangThai
            });
            return Ok(result);
        }

        /// <summary>
        /// Cập nhật thông tin người dùng
        /// PUT /api/admin/nguoidung/{id}
        /// </summary>
        [HttpPut("{id:int}")]
        public IActionResult Update(int id, [FromBody] NguoiDung model)
        {
            if (model == null)
                return BadRequest(new { success = false, message = "Body rỗng." });

            model.NguoiDungId = id;
            var ok = _service.Update(model);
            if (!ok)
                return NotFound(new { success = false, message = "Không tìm thấy người dùng để cập nhật." });

            return Ok(new { success = true, message = "Cập nhật thành công" });
        }

        /// <summary>
        /// Vô hiệu hóa tài khoản người dùng (soft delete)
        /// DELETE /api/admin/nguoidung/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        public IActionResult SoftDelete(int id)
        {
            var ok = _service.SoftDelete(id);
            if (!ok)
                return NotFound(new { success = false, message = "Không tìm thấy người dùng để vô hiệu hóa." });

            return Ok(new { success = true, message = "Đã vô hiệu hóa tài khoản" });
        }
    }
}
