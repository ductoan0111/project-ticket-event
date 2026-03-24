using Models.DTOs.Requests;

namespace Services.Interfaces
{
    public interface ICheckInService
    {
        object Checkin(CheckInRequest req);
    }
}
