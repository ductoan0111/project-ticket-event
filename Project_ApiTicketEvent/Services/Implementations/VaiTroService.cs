using Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class VaiTroService : IVaiTroService
    {
        private readonly IVaiTroRepository _repo;

        public VaiTroService(IVaiTroRepository repo)
        {
            _repo = repo;
        }

        public List<VaiTro> GetAll()
            => _repo.GetAll();

        public VaiTro? GetById(int id)
            => _repo.GetById(id);

        public VaiTro? GetByMa(string maVaiTro)
            => _repo.GetByMa(maVaiTro);
    }
}
