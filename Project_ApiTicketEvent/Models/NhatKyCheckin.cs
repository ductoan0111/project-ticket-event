using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    /// <summary>
    /// Nhật ký Check-in - Log tất cả các lần quét vé (thành công và thất bại)
    /// </summary>
    public class NhatKyCheckin
    {
        /// <summary>
        /// ID nhật ký check-in (Primary Key, Identity)
        /// </summary>
        public int CheckinID { get; set; }

        /// <summary>
        /// ID vé được quét (Foreign Key -> Ve)
        /// </summary>
        public int VeID { get; set; }

        /// <summary>
        /// ID sự kiện (Foreign Key -> SuKien, lưu dư thừa để báo cáo nhanh)
        /// </summary>
        public int SuKienID { get; set; }

        /// <summary>
        /// ID nhân viên quét/duyệt vé (Foreign Key -> NguoiDung, nullable)
        /// Admin hoặc Organizer staff
        /// </summary>
        public int? NhanVienID { get; set; }

        /// <summary>
        /// Thời gian quét (Default: SYSDATETIME())
        /// </summary>
        public DateTime ThoiGianCheckin { get; set; }

        /// <summary>
        /// Kết quả quét
        /// 1 = Thành công, 0 = Thất bại
        /// Default: 1
        /// </summary>
        public bool KetQua { get; set; }

        /// <summary>
        /// Ghi chú/Lý do thất bại (nullable)
        /// </summary>
        public string? GhiChu { get; set; }

        // Navigation properties (optional)
        // public Ve? Ve { get; set; }
        // public SuKien? SuKien { get; set; }
        // public NguoiDung? NhanVien { get; set; }
    }
}