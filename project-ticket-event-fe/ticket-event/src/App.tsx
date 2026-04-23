import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import AttendeeHome from './pages/AttendeeHome';
import EventDetailPage from './pages/EventDetail';
import Profile from './pages/Profile';
import MyTickets from './pages/MyTickets';
import MyOrders from './pages/MyOrders';
import Favorites from './pages/Favorites';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import OrganizerLayout from './pages/OrganizerLayout.tsx';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerEvents from './pages/OrganizerEvents';
import OrganizerEventDetail from './pages/OrganizerEventDetail';
import OrganizerReports from './pages/OrganizerReports';
import OrganizerOrders from './pages/OrganizerOrders';
import OrganizerCheckIn from './pages/OrganizerCheckIn';
import OrganizerNotifications from './pages/OrganizerNotifications';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminEvents from './pages/AdminEvents';
import AdminCategories from './pages/AdminCategories';
import AdminLocations from './pages/AdminLocations';
import AdminUsers from './pages/AdminUsers';
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
