using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models;
namespace Services.Interfaces
{
    public interface IDanhMucSuKienService
    {
        Task<List<DanhMucSuKien>> GetAllAsync();
        Task<DanhMucSuKien?> GetByNameAsync(string tenDanhMuc);
        DanhMucSuKien? GetById(int id);
        int Create(DanhMucSuKien entity);
        bool Update(DanhMucSuKien entity);
        bool Delete(int id);
    }
}
