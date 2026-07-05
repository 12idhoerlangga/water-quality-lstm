// src/components/common/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔥 Jika requiredRole tidak sesuai, redirect ke dashboard yang sesuai
  if (requiredRole && user.role !== requiredRole) {
    // Redirect ke dashboard sesuai role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'user') {
      return <Navigate to="/user" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;