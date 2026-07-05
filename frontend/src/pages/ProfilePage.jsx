// src/pages/ProfilePage.jsx
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { User, MapPin, Shield, Calendar, Save, Camera } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    username: '',
    location_id: 1,
  });
  const [joinDate, setJoinDate] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarKey, setAvatarKey] = useState(0);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAvatar = () => {
    const savedAvatar = localStorage.getItem(`profile_avatar_${user?.id}`);
    if (savedAvatar) {
      setAvatar(savedAvatar);
    } else {
      setAvatar(null);
    }
  };

  useEffect(() => {
    loadAvatar();
  }, [user?.id, avatarKey]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/users/me');
      setForm({
        username: res.data.username,
        location_id: res.data.location_id || 1,
      });
      setJoinDate(res.data.created_at);
    } catch (err) {
      console.error('Gagal fetch profil:', err);
      setForm({
        username: user?.username || '',
        location_id: 1,
      });
      setJoinDate(null);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get('/api/locations');
      setLocations(res.data);
    } catch (err) {
      console.error('Gagal ambil lokasi');
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setAvatar(base64);
      localStorage.setItem(`profile_avatar_${user?.id}`, base64);
      setAvatarKey(prev => prev + 1);
      toast.success('Foto profil berhasil diupdate!', { id: 'avatar-update-success' });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
      };

      if (!isAdmin) {
        const locId = parseInt(form.location_id);
        if (!isNaN(locId) && locId > 0) {
          payload.location_id = locId;
        }
      }

      await api.put('/api/users/me', payload);
      toast.success('Profil berhasil diperbarui!', { id: 'profile-update-success' });
      await fetchProfile();
    } catch (err) {
      const msg = err.response?.data?.error || 'Gagal memperbarui profil';
      toast.error(msg);
      console.error('Error update profil:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Profil Saya</h1>
        <p className="text-gray-500 mb-6">Kelola informasi akun Anda</p>

        {/* 🔥 Card padding responsif */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
          {/* Avatar & Upload */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-4 border-blue-100">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[#1a3a5c] hover:bg-[#0f2a44] text-white p-1.5 rounded-full border-2 border-white transition"
                title="Ubah Foto Profil"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-gray-800">{user?.username}</h2>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              <p className="text-xs text-gray-400 mt-1">Klik ikon kamera untuk ganti foto</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] outline-none transition"
                  required
                />
              </div>
            </div>

            {!isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="location_id"
                    value={form.location_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] outline-none transition bg-white"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Role: <span className="font-medium capitalize text-gray-700">{user?.role}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Bergabung: {formatDate(joinDate)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              {/* 🔥 Tombol full width di HP */}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1a3a5c] hover:bg-[#0f2a44] text-white font-medium py-2.5 px-6 rounded-lg transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;