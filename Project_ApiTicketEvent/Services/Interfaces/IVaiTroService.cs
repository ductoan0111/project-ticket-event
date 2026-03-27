using Models;

namespace Services.Interfaces
{
    public interface IVaiTroService
    {
        List<VaiTro> GetAll();
        VaiTro? GetById(int id);
        VaiTro? GetByMa(string maVaiTro);
    }
}
