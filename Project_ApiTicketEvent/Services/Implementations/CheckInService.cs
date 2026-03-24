using Models.DTOs.Requests;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class CheckInService : ICheckInService
    {
        private readonly ICheckInRepository _repo;

        public CheckInService(ICheckInRepository repo)
        {
            _repo = repo;
        }

        public object Checkin(CheckInRequest req)
            => _repo.Checkin(req);
    }
}
