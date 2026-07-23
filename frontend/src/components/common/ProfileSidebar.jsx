// src/components/common/ProfileSidebar.jsx
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, User, LogOut, Droplet, Info } from 'lucide-react';

const ProfileSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`profile_avatar_${user?.id}`);
    if (saved) setAvatar(saved);
  }, [user?.id]);

  const handleLogout = () => {
    onClose();
    logout();
  };

  const isActive = (path) => location.pathname === path;

  // REVISI: Menghapus objek 'Pengaturan' karena fiturnya sudah digabung ke halaman Profil
  const menuItems = [
    {
      label: 'Kelola Akun ', 
      icon: User,
      path: user?.role === 'admin' ? '/admin/profile' : '/user/profile',
    },
    {
      label: 'Informasi & Panduan',
      icon: Info,
      path: user?.role === 'admin' ? '/admin/info' : '/user/info',
    },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="pt-8 pb-5 px-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white text-lg font-bold overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h4 className="text-base font-semibold text-gray-800">{user?.username}</h4>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  onClose();
                  window.location.href = item.path;
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-blue-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* LOGOUT */}
        <div className="border-t border-gray-100 px-3 py-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg hover:bg-red-50 transition text-red-600 font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 text-center">
          <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1.5">
            <Droplet className="w-3 h-3" /> Water Quality LSTM v1.0
          </p>
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;
