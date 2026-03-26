using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.DTOs.Requests
{
    public class LoaiVeRequest
    {
        public class GetLoaiVeByNameRequest
        {
            public string Ten { get; set; } = string.Empty;
        }

        public class GetLoaiVeByEventRequest
        {
            public string TenSuKien { get; set; } = string.Empty;
        }
    }

    public class CreateLoaiVeRequest
    {
        public int SuKienID { get; set; }
        public string TenLoaiVe { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public decimal DonGia { get; set; }
        public int SoLuongToiDa { get; set; }
        public int? GioiHanMoiKhach { get; set; }
        public DateTime? ThoiGianMoBan { get; set; }
        public DateTime? ThoiGianDongBan { get; set; }
    }

    public class UpdateLoaiVeRequest
    {
        public string TenLoaiVe { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public decimal DonGia { get; set; }
        public int SoLuongToiDa { get; set; }
        public int? GioiHanMoiKhach { get; set; }
        public DateTime? ThoiGianMoBan { get; set; }
        public DateTime? ThoiGianDongBan { get; set; }
        public bool TrangThai { get; set; }
    }
}
