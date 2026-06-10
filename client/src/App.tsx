import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import VehiclesPage from './pages/VehiclesPage';
import VehicleNewPage from './pages/VehicleNewPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import ProblemReportsPage from './pages/ProblemReportsPage';
import ProblemReportNewPage from './pages/ProblemReportNewPage';
import ProblemReportDetailPage from './pages/ProblemReportDetailPage';
import ServiceCentersPage from './pages/ServiceCentersPage';
import ServiceCenterDetailPage from './pages/ServiceCenterDetailPage';
import ServiceCenterApplyPage from './pages/ServiceCenterApplyPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import BookingsPage from './pages/BookingsPage';
import BookingNewPage from './pages/BookingNewPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/vehicles" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
          <Route path="/vehicles/new" element={<ProtectedRoute><VehicleNewPage /></ProtectedRoute>} />
          <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetailPage /></ProtectedRoute>} />

          <Route path="/problem-reports" element={<ProtectedRoute><ProblemReportsPage /></ProtectedRoute>} />
          <Route path="/problem-reports/new" element={<ProtectedRoute><ProblemReportNewPage /></ProtectedRoute>} />
          <Route path="/problem-reports/:id" element={<ProtectedRoute><ProblemReportDetailPage /></ProtectedRoute>} />

          <Route path="/service-centers" element={<ServiceCentersPage />} />
          <Route path="/service-centers/:id" element={<ServiceCenterDetailPage />} />
          <Route path="/become-partner" element={<ServiceCenterApplyPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
          <Route path="/bookings/new" element={<ProtectedRoute><BookingNewPage /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
