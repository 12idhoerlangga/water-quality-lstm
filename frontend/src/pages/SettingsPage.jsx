// src/pages/SettingsPage.jsx
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Lock, Save } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    try {
      await api.put('/api/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password berhasil diubah!', { id: 'password-update-success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal ubah password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pengaturan</h1>
        <p className="text-gray-500 mb-6">Kelola keamanan akun Anda</p>

        {/* 🔥 Card padding responsif */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1 w-full">
              <h3 className="text-lg font-semibold text-gray-800">Ubah Password</h3>
              <p className="text-sm text-gray-500 mb-4">Ganti password akun Anda untuk keamanan.</p>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-full md:max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Saat Ini
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] outline-none transition"
                    required
                  />
                </div>
                {/* 🔥 Tombol full width di HP */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-lg transition disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Menyimpan...' : 'Ubah Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;