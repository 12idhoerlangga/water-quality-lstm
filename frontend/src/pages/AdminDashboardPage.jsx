// src/pages/AdminDashboardPage.jsx
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import DashboardStats from '../components/admin/DashboardStats';
import ParameterStatus from '../components/admin/ParameterStatus';
import TrendChart from '../components/admin/TrendChart';
import LocationQualityList from '../components/admin/LocationQualityList';

const AdminDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <span className="text-sm text-gray-500">Halo, {user?.username}</span>
        </div>
        <DashboardStats />
        <LocationQualityList />
        <ParameterStatus />
        <TrendChart />
      </div>
    </div>
  );
};

export default AdminDashboardPage;