using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class ChiTietDonHang
    {
        public int ChiTietID { get; set; }
        public int DonHangID { get; set; }
        public int LoaiVeID { get; set; }
        public int SoLuong { get; set; }
        public decimal DonGia { get; set; }
        public decimal ThanhTien { get; set; }
    }
}
