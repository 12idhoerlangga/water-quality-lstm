// src/components/common/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import {
  Droplet,
  LayoutDashboard,
  GitCompare,
  BrainCircuit,
  History,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ProfileSidebar from './ProfileSidebar';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // 🔥 STATE TOGGLE
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`profile_avatar_${user?.id}`);
    if (saved) setAvatar(saved);
  }, [user?.id]);

  const isActive = (path) => {
    if (path === '/admin' || path === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname === path;
  };

  const adminMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Perbandingan', icon: GitCompare, path: '/admin/baseline-compare' },
    { label: 'Prediksi', icon: BrainCircuit, path: '/admin/predict' },
    { label: 'Riwayat', icon: History, path: '/admin/history' },
    { label: 'Kelola Lokasi', icon: MapPin, path: '/admin/locations' },
    { label: 'Kelola User', icon: Users, path: '/admin/users' },
  ];

  const userMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/user' },
    { label: 'Prediksi', icon: BrainCircuit, path: '/user/predict' },
    { label: 'Riwayat', icon: History, path: '/user/history' },
  ];

  const menu = user?.role === 'admin' ? adminMenu : userMenu;

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ===== LOGO ===== */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight hidden sm:inline">
                Water Quality <span className="text-blue-600">LSTM</span>
              </span>
              <span className="text-lg font-bold text-gray-900 tracking-tight sm:hidden">
                WQ <span className="text-blue-600">LSTM</span>
              </span>
            </div>

            {/* ===== MENU DESKTOP ===== */}
            <div className="hidden md:flex items-center gap-1 overflow-x-auto">
              {menu.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* ===== KANAN: AVATAR + TOGGLE MOBILE ===== */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Tombol Panah (muncul di HP) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-600"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {/* Avatar */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.username?.charAt(0).toUpperCase()
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* ===== MENU MOBILE (TOGGLE PANAH) ===== */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-2 border-t border-gray-100 flex flex-wrap gap-1">
              {menu.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)} // tutup otomatis setelah klik
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <ProfileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
};

export default Navbar;