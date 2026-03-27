using Models;
using Repositories.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Implementations
{
    public class ThongBaoService : IThongBaoService
    {
        private readonly IThongBaoRepository _repo;

        public ThongBaoService(IThongBaoRepository repo)
        {
            _repo = repo;
        }

        public Task<int> GuiThongBaoAsync(int suKienId, List<int> nguoiDungIds, string loaiThongBao, string tieuDe, string noiDung, string? ghiChu = null)
            => _repo.GuiThongBaoAsync(suKienId, nguoiDungIds, loaiThongBao, tieuDe, noiDung, ghiChu);

        public Task<int> GuiThongBaoTatCaAsync(int suKienId, string loaiThongBao, string tieuDe, string noiDung, string? ghiChu = null)
            => _repo.GuiThongBaoTatCaAsync(suKienId, loaiThongBao, tieuDe, noiDung, ghiChu);

        public Task<bool> GuiThongBaoTheoVeAsync(int veId, string loaiThongBao, string tieuDe, string noiDung, string? ghiChu = null)
            => _repo.GuiThongBaoTheoVeAsync(veId, loaiThongBao, tieuDe, noiDung, ghiChu);

        public Task<List<ThongBao>> GetBySuKienAsync(int suKienId, byte? trangThai = null)
            => _repo.GetBySuKienAsync(suKienId, trangThai);

        public Task<ThongBao?> GetByIdAsync(int thongBaoId)
            => _repo.GetByIdAsync(thongBaoId);

        public Task<List<ThongBao>> GetByNguoiDungIdAsync(int nguoiDungId, byte? trangThai = null)
            => _repo.GetByNguoiDungIdAsync(nguoiDungId, trangThai);

        public Task<bool> MarkAsReadAsync(int thongBaoId)
            => _repo.MarkAsReadAsync(thongBaoId);

        public Task<int> GetUnreadCountAsync(int nguoiDungId)
            => _repo.GetUnreadCountAsync(nguoiDungId);
    }
}
