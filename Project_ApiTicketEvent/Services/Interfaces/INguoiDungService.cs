using Models;
using Models.DTOs.Requests;

namespace Services.Interfaces
{
    public interface INguoiDungService
    {
        List<NguoiDung> GetAll();
        NguoiDung? GetById(int id);
        List<NguoiDung> GetByMaVaiTro(string maVaiTro);
        bool Update(NguoiDung user);
        bool SoftDelete(int id);
    }
}
