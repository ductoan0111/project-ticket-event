using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interfaces
{
    public interface IThongBaoRepository
    {
        Task<int> GuiThongBaoAsync(int suKienId, List<int> nguoiDungIds, string loaiThongBao, string tieuDe, string noiDung, string? ghiChu = null);

        Task<int> GuiThongBaoTatCaAsync(int suKienId, string loaiThongBao, string tieuDe, string noiDung, string? ghiChu = null);

        Task<bool> GuiThongBaoTheoVeAsync(int veId, string loaiThongBao, string tieuDe, string noiDung, string? ghiChu = null);

        Task<List<ThongBao>> GetBySuKienAsync(int suKienId, byte? trangThai = null);

        Task<ThongBao?> GetByIdAsync(int thongBaoId);

        Task<List<ThongBao>> GetByNguoiDungIdAsync(int nguoiDungId, byte? trangThai = null);

        Task<bool> MarkAsReadAsync(int thongBaoId);

        Task<int> GetUnreadCountAsync(int nguoiDungId);
    }
}
