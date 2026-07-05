// src/pages/LocationPage.jsx
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import AddLocation from '../components/admin/AddLocation';

const LocationPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* 🔥 Header responsif: stack di HP, horizontal di desktop */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Tambah Lokasi</h1>
          <span className="text-sm text-gray-500">Halo, {user?.username}</span>
        </div>
        <AddLocation />
      </div>
    </div>
  );
};

export default LocationPage;