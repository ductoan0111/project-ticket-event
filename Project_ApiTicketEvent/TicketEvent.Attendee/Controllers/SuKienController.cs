using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Models;
using Services.Interfaces;

namespace TicketEvent.Attendee.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuKienController : ControllerBase
    {
        private readonly ISuKienService _service;
        private readonly ILoaiVeService _loaiVeService;

        public SuKienController(ISuKienService service, ILoaiVeService loaiVeService)
        {
            _service = service;
            _loaiVeService = loaiVeService;
        }

        // GET: api/sukien
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SuKien>>> GetAll()
        {
            var suKiens = await _service.GetAllAsync();
            return Ok(suKiens);
        }

        // GET: api/sukien/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<SuKien>> GetById(int id)
        {
            var suKien = await _service.GetByIdAsync(id);
            if (suKien == null)
            {
                return NotFound(new { message = $"Không tìm thấy sự kiện với ID: {id}" });
            }
            return Ok(suKien);
        }

        // GET: /api/SuKien/by-name?ten=Concert
        [HttpGet("by-name")]
        public async Task<IActionResult> GetByName([FromQuery] string ten)
        {
            if (string.IsNullOrWhiteSpace(ten))
                return BadRequest(new { message = "Thiếu query parameter: ten" });

            var data = await _service.GetByNameAsync(ten);
            return Ok(data);
        }

        // GET: /api/SuKien/by-category?tenDanhMuc=Workshop
        [HttpGet("by-category")]
        public async Task<IActionResult> GetByCategory([FromQuery] string? tenDanhMuc)
        {
            if (string.IsNullOrWhiteSpace(tenDanhMuc))
                return BadRequest(new { message = "Cần truyền tenDanhMuc" });

            var data = await _service.GetByDanhMucNameAsync(tenDanhMuc!);
            return Ok(data);
        }

        // GET: /api/SuKien/filter - Lọc và tìm kiếm 
        [HttpGet("filter")]
        public async Task<IActionResult> Filter(
            [FromQuery] string? keyword,
            [FromQuery] int? danhMucId,
            [FromQuery] int? diaDiemId,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] int? trangThai,
            [FromQuery] string? sortBy = "ThoiGianBatDau",
            [FromQuery] string? sortOrder = "asc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                // Validate
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                // Lấy tất cả sự kiện
                var allSuKiens = await _service.GetAllAsync();
                var query = allSuKiens.AsQueryable();

                // Filter by keyword (tìm trong tên và mô tả)
                if (!string.IsNullOrWhiteSpace(keyword))
                {
                    keyword = keyword.ToLower();
                    query = query.Where(s =>
                        s.TenSuKien.ToLower().Contains(keyword) ||
                        (s.MoTa != null && s.MoTa.ToLower().Contains(keyword))
                    );
                }

                // Filter by danh mục
                if (danhMucId.HasValue && danhMucId.Value > 0)
                {
                    query = query.Where(s => s.DanhMucID == danhMucId.Value);
                }

                // Filter by địa điểm
                if (diaDiemId.HasValue && diaDiemId.Value > 0)
                {
                    query = query.Where(s => s.DiaDiemID == diaDiemId.Value);
                }

                // Filter by date range
                if (fromDate.HasValue)
                {
                    query = query.Where(s => s.ThoiGianBatDau >= fromDate.Value);
                }

                if (toDate.HasValue)
                {
                    query = query.Where(s => s.ThoiGianBatDau <= toDate.Value);
                }

                // Filter by trạng thái
                if (trangThai.HasValue)
                {
                    query = query.Where(s => s.TrangThai == trangThai.Value);
                }

                // Sorting
                query = sortBy?.ToLower() switch
                {
                    "tensukien" => sortOrder?.ToLower() == "desc"
                        ? query.OrderByDescending(s => s.TenSuKien)
                        : query.OrderBy(s => s.TenSuKien),
                    "thoigianketthuc" => sortOrder?.ToLower() == "desc"
                        ? query.OrderByDescending(s => s.ThoiGianKetThuc)
                        : query.OrderBy(s => s.ThoiGianKetThuc),
                    "ngaytao" => sortOrder?.ToLower() == "desc"
                        ? query.OrderByDescending(s => s.NgayTao)
                        : query.OrderBy(s => s.NgayTao),
                    _ => sortOrder?.ToLower() == "desc"
                        ? query.OrderByDescending(s => s.ThoiGianBatDau)
                        : query.OrderBy(s => s.ThoiGianBatDau)
                };

                // Count total before pagination
                var totalItems = query.Count();
                var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

                // Pagination
                var items = query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                return Ok(new
                {
                    success = true,
                    data = items,
                    pagination = new
                    {
                        currentPage = page,
                        pageSize,
                        totalItems,
                        totalPages,
                        hasNextPage = page < totalPages,
                        hasPreviousPage = page > 1
                    },
                    filters = new
                    {
                        keyword,
                        danhMucId,
                        diaDiemId,
                        fromDate,
                        toDate,
                        minPrice,
                        maxPrice,
                        trangThai,
                        sortBy,
                        sortOrder
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi lọc sự kiện",
                    error = ex.Message
                });
            }
        }

        // GET: /api/SuKien/upcoming - Sự kiện sắp diễn ra
        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcoming([FromQuery] int limit = 10)
        {
            try
            {
                if (limit < 1 || limit > 50) limit = 10;

                var allSuKiens = await _service.GetAllAsync();
                var upcomingEvents = allSuKiens
                    .Where(s => s.ThoiGianBatDau > DateTime.Now && s.TrangThai == 1) // Đã duyệt
                    .OrderBy(s => s.ThoiGianBatDau)
                    .Take(limit)
                    .ToList();

                return Ok(new
                {
                    success = true,
                    count = upcomingEvents.Count,
                    data = upcomingEvents
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi lấy sự kiện sắp diễn ra",
                    error = ex.Message
                });
            }
        }

        // GET: /api/SuKien/{id}/detail - Chi tiết sự kiện kèm danh sách loại vé
        // Đây là endpoint chính cho trang chi tiết sự kiện
        [HttpGet("{id:int}/detail")]
        public async Task<IActionResult> GetDetail([FromRoute] int id)
        {
            try
            {
                var suKien = await _service.GetByIdAsync(id);
                if (suKien == null)
                    return NotFound(new { message = $"Không tìm thấy sự kiện với ID: {id}" });

                // Lấy tất cả loại vé của sự kiện này
                var loaiVes = await _loaiVeService.GetBySuKienIdAsync(id, trangThai: null);

                var now = DateTime.Now;
                var loaiVeData = loaiVes.Select(lv =>
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

                // Tính giá thấp nhất / cao nhất từ loại vé đang mở bán
                var veConBan = loaiVeData.Where(v => v.DangMoBan && v.ConVe).ToList();
                decimal giaThapNhat = veConBan.Any() ? veConBan.Min(v => v.DonGia) : 0;
                decimal giaCaoNhat = loaiVeData.Any() ? loaiVeData.Max(v => v.DonGia) : 0;
                int tongVeConLai = loaiVeData.Sum(v => v.SoLuongCon);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        // Thông tin sự kiện
                        suKien.SuKienID,
                        suKien.TenSuKien,
                        suKien.MoTa,
                        suKien.ThoiGianBatDau,
                        suKien.ThoiGianKetThuc,
                        suKien.AnhBiaUrl,
                        suKien.TrangThai,
                        suKien.DanhMucID,
                        suKien.DiaDiemID,
                        suKien.ToChucID,
                        suKien.NgayTao,
                        // Danh sách loại vé
                        LoaiVes = loaiVeData,
                        // Tổng hợp
                        GiaThapNhat = giaThapNhat,
                        GiaCaoNhat = giaCaoNhat,
                        TongVeConLai = tongVeConLai,
                        ConVe = tongVeConLai > 0
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi lấy chi tiết sự kiện",
                    error = ex.Message
                });
            }
        }

        // GET: /api/SuKien/popular - Sự kiện phổ biến
        [HttpGet("popular")]
        public async Task<IActionResult> GetPopular([FromQuery] int limit = 10)
        {
            try
            {
                if (limit < 1 || limit > 50) limit = 10;

                var allSuKiens = await _service.GetAllAsync();
                
                // TODO: Sắp xếp theo số lượng vé đã bán (cần join với Ve hoặc DonHang)
                // Tạm thời sắp xếp theo ngày tạo mới nhất
                var popularEvents = allSuKiens
                    .Where(s => s.TrangThai == 1 || s.TrangThai == 2) // Đã duyệt hoặc đang diễn ra
                    .OrderByDescending(s => s.NgayTao)
                    .Take(limit)
                    .ToList();

                return Ok(new
                {
                    success = true,
                    count = popularEvents.Count,
                    data = popularEvents,
                    note = "Hiện tại sắp xếp theo ngày tạo. Cần implement logic dựa trên số vé bán được."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi lấy sự kiện phổ biến",
                    error = ex.Message
                });
            }
        }

        // GET: /api/SuKien/search - Tìm kiếm toàn văn
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] int limit = 20)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(q))
                    return BadRequest(new { message = "Thiếu từ khóa tìm kiếm (q)" });

                if (limit < 1 || limit > 100) limit = 20;

                q = q.ToLower();
                var allSuKiens = await _service.GetAllAsync();

                var results = allSuKiens
                    .Where(s =>
                        s.TenSuKien.ToLower().Contains(q) ||
                        (s.MoTa != null && s.MoTa.ToLower().Contains(q))
                    )
                    .Take(limit)
                    .Select(s => new
                    {
                        s.SuKienID,
                        s.TenSuKien,
                        s.MoTa,
                        s.ThoiGianBatDau,
                        s.ThoiGianKetThuc,
                        s.DiaDiemID,
                        s.DanhMucID,
                        s.TrangThai,
                        relevance = CalculateRelevance(s, q)
                    })
                    .OrderByDescending(s => s.relevance)
                    .ToList();

                return Ok(new
                {
                    success = true,
                    query = q,
                    count = results.Count,
                    data = results
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi tìm kiếm",
                    error = ex.Message
                });
            }
        }

        // Helper method để tính độ liên quan
        private int CalculateRelevance(SuKien suKien, string keyword)
        {
            int score = 0;
            keyword = keyword.ToLower();

            // Tên sự kiện chứa từ khóa
            if (suKien.TenSuKien.ToLower().Contains(keyword))
            {
                score += 10;
                // Bonus nếu từ khóa ở đầu tên
                if (suKien.TenSuKien.ToLower().StartsWith(keyword))
                    score += 5;
            }

            // Mô tả chứa từ khóa
            if (suKien.MoTa != null && suKien.MoTa.ToLower().Contains(keyword))
                score += 3;

            // Bonus cho sự kiện sắp diễn ra
            if (suKien.ThoiGianBatDau > DateTime.Now)
                score += 2;

            // Bonus cho sự kiện đã duyệt
            if (suKien.TrangThai == 1)
                score += 1;

            return score;
        }
    }
}
