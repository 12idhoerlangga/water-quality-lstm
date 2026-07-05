// src/pages/ManageUsersPage.jsx
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import AddUser from '../components/admin/AddUser';

const ManageUsersPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 🔥 Header responsif: stack di HP, horizontal di desktop */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Kelola User</h1>
          <span className="text-sm text-gray-500">Halo, {user?.username}</span>
        </div>

        <div className="max-w-6xl mx-auto">
          <AddUser />
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage;