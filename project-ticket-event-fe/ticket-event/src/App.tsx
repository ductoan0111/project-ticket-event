import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import AttendeeHome from './pages/attendee/AttendeeHome';
import EventDetailPage from './pages/attendee/EventDetail';
import Profile from './pages/attendee/Profile';
import MyTickets from './pages/attendee/MyTickets';
import MyOrders from './pages/attendee/MyOrders';
import Favorites from './pages/attendee/Favorites';
import Checkout from './pages/attendee/Checkout';
import MyNotifications from './pages/attendee/MyNotifications';
import CheckoutSuccess from './pages/attendee/CheckoutSuccess';
import OrganizerLayout from './pages/organizer/OrganizerLayout.tsx';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerEvents from './pages/organizer/OrganizerEvents';
import OrganizerEventDetail from './pages/organizer/OrganizerEventDetail';
import OrganizerReports from './pages/organizer/OrganizerReports';
import OrganizerOrders from './pages/organizer/OrganizerOrders';
import OrganizerCheckIn from './pages/organizer/OrganizerCheckIn';
import OrganizerNotifications from './pages/organizer/OrganizerNotifications';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminCategories from './pages/admin/AdminCategories';
import AdminLocations from './pages/admin/AdminLocations';
import AdminUsers from './pages/admin/AdminUsers';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          {/* Attendee routes */}
          <Route path="/attendee" element={<AttendeeHome />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/notifications" element={<MyNotifications />} />

          {/* Organizer routes */}
          <Route path="/organizer" element={<OrganizerLayout />}>
            <Route index element={<OrganizerDashboard />} />
            <Route path="events" element={<OrganizerEvents />} />
            <Route path="events/:id" element={<OrganizerEventDetail />} />
            <Route path="reports" element={<OrganizerReports />} />
            <Route path="orders" element={<OrganizerOrders />} />
            <Route path="checkin" element={<OrganizerCheckIn />} />
            <Route path="notifications" element={<OrganizerNotifications />} />
          </Route>

          {/* Default route */}
          <Route path="/" element={<AttendeeHome />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
