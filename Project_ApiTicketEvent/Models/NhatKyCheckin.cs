using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class NhatKyCheckin
    {
        public int CheckinID { get; set; }

        public int VeID { get; set; }

        public int SuKienID { get; set; }

        public int? NhanVienID { get; set; }

        public DateTime ThoiGianCheckin { get; set; }

        public bool KetQua { get; set; }

        public string? GhiChu { get; set; }

        // Navigation properties (optional)
        // public Ve? Ve { get; set; }
        // public SuKien? SuKien { get; set; }
        // public NguoiDung? NhanVien { get; set; }
    }
}