using Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class NguoiDungService : INguoiDungService
    {
        private readonly INguoiDungRepository _repo;

        public NguoiDungService(INguoiDungRepository repo)
        {
            _repo = repo;
        }

        public List<NguoiDung> GetAll()
            => _repo.GetAll();

        public NguoiDung? GetById(int id)
            => _repo.GetById(id);

        public List<NguoiDung> GetByMaVaiTro(string maVaiTro)
            => _repo.GetByMaVaiTro(maVaiTro);

        public bool Update(NguoiDung user)
            => _repo.Update(user);

        public bool SoftDelete(int id)
            => _repo.SoftDelete(id);
    }
}
