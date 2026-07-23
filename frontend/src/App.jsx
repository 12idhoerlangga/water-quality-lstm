// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserDashboardPage from './pages/UserDashboardPage';
import BaselineComparePage from './pages/BaselineComparePage';
import SetBaseline from './components/admin/SetBaseline';
import Compare from './components/admin/Compare';
import LocationPage from './pages/LocationPage';
import ManageUsersPage from './pages/ManageUsersPage';
import PredictPage from './pages/PredictPage';
import HistoryPage from './pages/HistoryPage';
import NotFoundPage from './pages/NotFoundPage';
import InfoPage from './pages/InfoPage';
import ProfilePage from './pages/ProfilePage';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ===== ADMIN ROUTES ===== */}
          <Route path="/admin" element={<PrivateRoute requiredRole="admin"><AdminDashboardPage /></PrivateRoute>} />
          <Route path="/admin/dashboard" element={<PrivateRoute requiredRole="admin"><AdminDashboardPage /></PrivateRoute>} />
          
          {/* Baseline & Perbandingan */}
          <Route path="/admin/baseline-compare" element={<PrivateRoute requiredRole="admin"><BaselineComparePage /></PrivateRoute>} />
          <Route path="/admin/baseline" element={<PrivateRoute requiredRole="admin"><SetBaseline /></PrivateRoute>} />
          <Route path="/admin/compare" element={<PrivateRoute requiredRole="admin"><Compare /></PrivateRoute>} />

          {/* Fitur Admin */}
          {/* 🔥 ROUTE INI PAKAI LocationPage (dengan Navbar) */}
          <Route path="/admin/locations" element={<PrivateRoute requiredRole="admin"><LocationPage /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute requiredRole="admin"><ManageUsersPage /></PrivateRoute>} />
          
          {/* Prediksi & Riwayat (dengan Navbar) */}
          <Route path="/admin/predict" element={<PrivateRoute requiredRole="admin"><PredictPage /></PrivateRoute>} />
          <Route path="/admin/history" element={<PrivateRoute requiredRole="admin"><HistoryPage /></PrivateRoute>} />

          <Route path="/admin/info" element={<PrivateRoute requiredRole="admin"><InfoPage /></PrivateRoute>} />
          <Route path="/admin/profile" element={<PrivateRoute requiredRole="admin"><ProfilePage /></PrivateRoute>} />
        


          {/* ===== USER ROUTES ===== */}
          <Route path="/user" element={<PrivateRoute requiredRole="user"><UserDashboardPage /></PrivateRoute>} />
          <Route path="/user/dashboard" element={<PrivateRoute requiredRole="user"><UserDashboardPage /></PrivateRoute>} />
          
          <Route path="/user/predict" element={<PrivateRoute requiredRole="user"><PredictPage /></PrivateRoute>} />
          <Route path="/user/history" element={<PrivateRoute requiredRole="user"><HistoryPage /></PrivateRoute>} />

          <Route path="/user/profile" element={<PrivateRoute requiredRole="user"><ProfilePage /></PrivateRoute>} />
     

          <Route path="/user/info" element={<PrivateRoute requiredRole="user"><InfoPage /></PrivateRoute>} />
          {/* ===== 404 ===== */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;