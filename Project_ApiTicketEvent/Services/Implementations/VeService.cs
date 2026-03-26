using Models;
using Models.DTOs.Reponses;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class VeService : IVeService
    {
        private readonly IVeRepository _repo;

        public VeService(IVeRepository repo)
        {
            _repo = repo;
        }

        public IEnumerable<VeResponse> GetMyTickets(int nguoiSoHuuId)
        {
            return _repo.GetMyTickets(nguoiSoHuuId);
        }

        public VeResponse? GetMyTicketByMaVe(int nguoiSoHuuId, string maVe)
        {
            return _repo.GetMyTicketByMaVe(nguoiSoHuuId, maVe);
        }

        public async Task<bool> HuyVeAsync(int nguoiSoHuuId, string maVe, string? lyDo)
        {
            return await _repo.HuyVeAsync(nguoiSoHuuId, maVe, lyDo);
        }

        public async Task<HoanVeResponse> HoanVeAsync(int nguoiSoHuuId, string maVe, string? lyDo, string? phuongThuc, string? rawResponse)
        {
            return await _repo.HoanVeAsync(nguoiSoHuuId, maVe, lyDo, phuongThuc, rawResponse);
        }

        public IEnumerable<VeResponse> GetBySuKienId(int suKienId, byte? trangThai = null)
        {
            return _repo.GetBySuKienId(suKienId, trangThai);
        }

        public async Task<Ve?> GetByIdAsync(int veId)
        {
            return await _repo.GetByIdAsync(veId);
        }
    }
}
