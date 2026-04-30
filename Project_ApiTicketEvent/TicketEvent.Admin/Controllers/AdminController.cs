using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace TicketEvent.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly ISuKienService _suKienService;
        private readonly INguoiDungService _nguoiDungService;
        private readonly IDonHangService _donHangService;

        public AdminController(
            ISuKienService suKienService,
            INguoiDungService nguoiDungService,
            IDonHangService donHangService)
        {
            _suKienService = suKienService;
            _nguoiDungService = nguoiDungService;
            _donHangService = donHangService;
        }

        /// <summary>
        /// Trả về thống kê tổng quan cho Admin Dashboard
        /// GET /api/Admin/stats
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var allEvents = await _suKienService.GetAllAsync();
            var tongSuKien = allEvents.Count();
            var suKienChoDuyet = _suKienService.GetPending().Count;
            var tongNguoiDung = _nguoiDungService.GetAll().Count;
            var tongDoanhThu = await _donHangService.GetTongDoanhThuAsync();

            return Ok(new
            {
                tongSuKien,
                suKienChoDuyet,
                tongNguoiDung,
                tongDoanhThu
            });
        }
    }
}
