// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Droplet, ArrowRight, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex bg-gray-50">
      
      {/* LEFT PANEL – same as before */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=800&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
        
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                <Droplet className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight drop-shadow-lg">Water Quality LSTM</span>
            </div>
            <p className="text-blue-200/90 text-sm drop-shadow-md">Sistem Peramalan Risiko Kualitas Air Laut</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight drop-shadow-lg">
              <span className="text-blue-300">Pantau &</span><br />
              <span className="text-blue-300">Kendalikan Kualitas Air</span>
            </h2>
            <p className="text-blue-100/90 text-base max-w-sm drop-shadow-md">
              Sistem prediksi berbasis AI untuk membantu Anda mengambil keputusan tepat dalam budidaya perairan.
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-200/80 drop-shadow-md">
              <span className="w-8 h-0.5 bg-blue-400/60" />
              Akurasi tinggi dengan LSTM + Optuna
            </div>
          </div>

          <div className="text-blue-300/50 text-xs drop-shadow-md">
            © {new Date().getFullYear()} Water Quality LSTM – Skripsi
          </div>
        </div>
      </div>

      {/* RIGHT PANEL – LOGIN CARD */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="text-center mb-4 sm:mb-6 lg:hidden">
            <div className="inline-flex items-center gap-2 text-blue-900">
              <Droplet className="w-6 h-6" />
              <span className="text-xl font-bold">Water Quality LSTM</span>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Sistem Peramalan Risiko Kualitas Air Laut</p>
          </div>

          {/* Card Login */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 sm:p-6 md:p-8 animate-fade-in-up">
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Selamat Datang Kembali</h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">Masuk untuk melanjutkan</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50/50 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50/50 text-sm sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Ingat Saya
                  </label>
                  <Link to="/forgot-password" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline">
                    Lupa Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <div className="text-center text-xs sm:text-sm text-gray-500">
                Belum punya akun?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  Daftar sekarang
                </Link>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-center text-[10px] sm:text-xs text-gray-400">
                  v1.0.0 &nbsp;|&nbsp; © {new Date().getFullYear()} Water Quality LSTM – Skripsi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;