import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import AttendeeHome from './pages/AttendeeHome';
import EventDetailPage from './pages/EventDetail';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Mặc định vào thẳng trang chủ AttendeeHome */}
          <Route path="/" element={<Navigate to="/attendee" replace />} />
          <Route path="/attendee" element={<AttendeeHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/profile" element={<Profile />} />
          {/* Fallback: mọi route không khớp đều về trang chủ */}
          <Route path="*" element={<Navigate to="/attendee" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
