using Repositories.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Implementations
{
    public class BaoCaoService : IBaoCaoService
    {
        private readonly IBaoCaoRepository _repo;

        public BaoCaoService(IBaoCaoRepository repo)
        {
            _repo = repo;
        }

        public Task<Dictionary<string, object>> GetTongQuanAsync(int suKienId)
            => _repo.GetTongQuanAsync(suKienId);

        public Task<List<Dictionary<string, object>>> GetDoanhThuTheoNgayAsync(int suKienId, DateTime? fromDate = null, DateTime? toDate = null)
            => _repo.GetDoanhThuTheoNgayAsync(suKienId, fromDate, toDate);

        public Task<List<Dictionary<string, object>>> GetLoaiVeBanChayAsync(int suKienId)
            => _repo.GetLoaiVeBanChayAsync(suKienId);

        public Task<List<Dictionary<string, object>>> GetTopKhachHangAsync(int suKienId, int top = 10)
            => _repo.GetTopKhachHangAsync(suKienId, top);

        public Task<Dictionary<string, object>> GetThongKeCheckInAsync(int suKienId)
            => _repo.GetThongKeCheckInAsync(suKienId);

        public Task<List<Dictionary<string, object>>> GetCheckInTheoGioAsync(int suKienId)
            => _repo.GetCheckInTheoGioAsync(suKienId);
    }
}
