using Models;
using Models.DTOs.Reponses;

namespace Services.Interfaces
{
    public interface IVeService
    {
        IEnumerable<VeResponse> GetMyTickets(int nguoiSoHuuId);
        VeResponse? GetMyTicketByMaVe(int nguoiSoHuuId, string maVe);
        Task<bool> HuyVeAsync(int nguoiSoHuuId, string maVe, string? lyDo);
        Task<HoanVeResponse> HoanVeAsync(int nguoiSoHuuId, string maVe, string? lyDo, string? phuongThuc, string? rawResponse);
        IEnumerable<VeResponse> GetBySuKienId(int suKienId, byte? trangThai = null);
        Task<Ve?> GetByIdAsync(int veId);
    }
}
