using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class ThongBao
    {
        public int ThongBaoID { get; set; }
        public int NguoiDungID { get; set; }
        public int? DonHangID { get; set; }
        public int? VeID { get; set; }
        public string LoaiThongBao { get; set; } = string.Empty;
        public string TieuDe { get; set; } = string.Empty;
        public string NoiDung { get; set; } = string.Empty;
        public byte TrangThai { get; set; }
        public DateTime ThoiGianTao { get; set; }
        public DateTime? ThoiGianGui { get; set; }
        public string? GhiChu { get; set; }
    }
}
