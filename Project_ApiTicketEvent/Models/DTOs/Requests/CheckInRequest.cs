using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.DTOs.Requests
{
    public class CheckInRequest
    {
        public string? QrToken { get; set; }
        public string? MaVe { get; set; }
        public int NhanVienID { get; set; }
        public int SuKienID { get; set; }
        public string? GhiChu { get; set; }
    }
}