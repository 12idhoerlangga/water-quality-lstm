// src/pages/HistoryPage.jsx
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import HistoryList from '../components/prediction/HistoryList';

const HistoryPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Data Historis</h1>
          <span className="text-sm text-gray-500">Halo, {user?.username}</span>
        </div>
        <HistoryList />
      </div>
    </div>
  );
};

export default HistoryPage;