// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Droplet, ArrowRight, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

const RegisterPage = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/register', {
        username: form.username,
        password: form.password,
        role: 'user',
        location_id: 1,
      });

      setSuccess('Akun berhasil didaftarkan! Silakan login.');
      setForm({ username: '', password: '', confirmPassword: '' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mendaftarkan akun');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex bg-gray-50">
      
      {/* LEFT PANEL – same as before */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ 
            backgroundImage: 'url(/images/keramba1.avif)',
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
              <span className="text-blue-300">Daftar Akun</span><br />
              <span className="text-blue-300">Mulai Sekarang</span>
            </h2>
            <p className="text-blue-100/90 text-base max-w-sm drop-shadow-md">
              Bergabunglah untuk mengakses dashboard prediksi kualitas air secara real-time.
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-200/80 drop-shadow-md">
              <span className="w-8 h-0.5 bg-blue-400/60" />
              Gratis untuk pengguna terdaftar
            </div>
          </div>

          <div className="text-blue-300/50 text-xs drop-shadow-md">
            © {new Date().getFullYear()} Water Quality LSTM – Skripsi
          </div>
        </div>
      </div>

      {/* RIGHT PANEL – REGISTER CARD */}
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

          {/* Card Register */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 sm:p-6 md:p-8 animate-fade-in-up">
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Buat Akun</h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">Daftar untuk memulai</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl">
                  {success}
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
                      name="username"
                      value={form.username}
                      onChange={handleChange}
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
                      name="password"
                      value={form.password}
                      onChange={handleChange}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Konfirmasi password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50/50 text-sm sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {loading ? 'Memproses...' : 'Daftar'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <div className="text-center text-xs sm:text-sm text-gray-500">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  Masuk di sini
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

export default RegisterPage;