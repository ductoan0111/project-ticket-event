using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interfaces
{
    public interface ILoaiVeRepository
    {
        Task<List<LoaiVe>> GetAllAsync(bool? trangThai = true);
        Task<List<LoaiVe>> GetByNameAsync(string tenLoaiVe, bool? trangThai = true);
        Task<List<LoaiVe>> GetByTenSuKienAsync(string tenSuKien, bool? trangThai = true);
        Task<List<LoaiVe>> GetBySuKienIdAsync(int suKienId, bool? trangThai = null);
        Task<LoaiVe?> GetByIdAsync(int loaiVeId);
        Task<int> CreateAsync(LoaiVe loaiVe);
        Task<bool> UpdateAsync(LoaiVe loaiVe);
        Task<bool> DeleteAsync(int loaiVeId);
    }
}
