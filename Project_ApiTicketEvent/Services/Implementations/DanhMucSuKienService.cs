using Repositories.Implementations;
using Services.Interfaces;
using Repositories.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Implementations
{
    public class DanhMucSuKienService:IDanhMucSuKienService
    {
        private readonly IDanhMucSuKienRepository _repo;

        public DanhMucSuKienService(IDanhMucSuKienRepository repo)
        {
            _repo = repo;
        }

        public Task<List<DanhMucSuKien>> GetAllAsync()
            => _repo.GetAllAsync(trangThai: true);

        public Task<DanhMucSuKien?> GetByNameAsync(string tenDanhMuc)
            => _repo.GetByNameAsync(tenDanhMuc, trangThai: true);

        public DanhMucSuKien? GetById(int id)
            => _repo.GetById(id);

        public int Create(DanhMucSuKien entity)
        {
            entity.TrangThai = true;
            return _repo.Create(entity);
        }

        public bool Update(DanhMucSuKien entity)
            => _repo.Update(entity);

        public bool Delete(int id)
            => _repo.Delete(id);
    }
}
