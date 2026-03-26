using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.DTOs.Requests
{
    /// <summary>
    /// Request gửi thông báo cho người dùng
    /// </summary>
    public class GuiThongBaoRequest
    {
        public int SuKienID { get; set; }
        public List<int>? NguoiDungIDs { get; set; }  // Danh sách người nhận cụ thể (null = gửi tất cả)
        public string LoaiThongBao { get; set; } = "APP";  // EMAIL / SMS / APP
        public string TieuDe { get; set; } = string.Empty;
        public string NoiDung { get; set; } = string.Empty;
        public string? GhiChu { get; set; }
    }

    /// <summary>
    /// Request gửi thông báo cho người mua vé cụ thể
    /// </summary>
    public class GuiThongBaoTheoVeRequest
    {
        public int VeID { get; set; }
        public string LoaiThongBao { get; set; } = "APP";
        public string TieuDe { get; set; } = string.Empty;
        public string NoiDung { get; set; } = string.Empty;
        public string? GhiChu { get; set; }
    }
}
