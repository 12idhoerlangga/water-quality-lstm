// src/pages/InfoPage.jsx
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import { BookOpen, Home, BrainCircuit, History, GitCompare, Users, MapPin, HelpCircle } from 'lucide-react';

const InfoPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const features = [
    {
      icon: Home,
      title: 'Dashboard',
      description: 'Memantau ringkasan kualitas air secara real-time. Menampilkan total lokasi, status parameter terkini (suhu, pH, salinitas, kekeruhan), serta grafik tren untuk deteksi perubahan.',
      color: 'blue'
    },
    {
      icon: BrainCircuit,
      title: 'Prediksi (LSTM)',
      description: 'Masukkan 4 parameter kualitas air untuk meramalkan kondisi 1 hari ke depan (96 langkah). Sistem akan menampilkan nilai WQI (Indeks Kualitas Air), status risiko (Rendah/Sedang/Tinggi), dan rekomendasi mitigasi untuk pembudidaya.',
      color: 'purple'
    },
    {
      icon: History,
      title: 'Riwayat & Ekspor',
      description: 'Lihat seluruh riwayat prediksi yang pernah dilakukan. Admin dapat mengekspor data ke format PDF, Excel, dan CSV. User dapat mengekspor ke PDF dan Excel. Data dapat difilter berdasarkan lokasi, tanggal, dan kata kunci.',
      color: 'green'
    },
    ...(isAdmin ? [{
      icon: GitCompare,
      title: 'Perbandingan (Admin)',
      description: 'Bandingkan performa model LSTM (dengan Optuna) dengan model TFT baseline. Admin dapat menginput nilai baseline TFT secara manual melalui form, dan sistem akan menampilkan perbandingan metrik (MAPE, RMSE, MAE, R²) dalam tabel dan grafik.',
      color: 'orange'
    }] : []),
    ...(isAdmin ? [{
      icon: Users,
      title: 'Kelola User (Admin)',
      description: 'Kelola hak akses pengguna sistem. Admin dapat menambah, mengedit (username, role, password), dan menghapus akun pengguna. Role terdiri dari Admin dan User (Operator).',
      color: 'red'
    }] : []),
    ...(isAdmin ? [{
      icon: MapPin,
      title: 'Tambah Lokasi (Admin)',
      description: 'Tambahkan lokasi tambak atau kolam baru ke dalam sistem. Lokasi yang sudah ditambahkan akan muncul di dropdown saat melakukan prediksi dan di filter riwayat.',
      color: 'teal'
    }] : []),
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    teal: 'bg-teal-50 text-teal-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-[#1a3a5c]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Panduan Penggunaan</h1>
            <p className="text-sm text-gray-500">Kenali fitur-fitur utama dalam sistem pemantauan kualitas air</p>
          </div>
        </div>

        {/* ===== INTRO ===== */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 flex items-start gap-2 sm:gap-3">
          <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <strong className="text-[#1a3a5c]">Sistem Prediksi Kualitas Air Laut</strong> berbasis LSTM dengan optimasi hyperparameter Optuna. 
              Dirancang khusus untuk membantu pembudidaya ikan kerapu cantang di Kampung Madong dalam mengambil keputusan mitigasi risiko.
            </p>
          </div>
        </div>

        {/* ===== GRID FITUR ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition group"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${colorMap[item.color]}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== FOOTER / STATUS AKUN ===== */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-100 rounded-xl text-center text-xs sm:text-sm text-gray-500 border border-gray-200">
          <p className="leading-relaxed">
            Anda login sebagai <strong className="text-gray-700 capitalize">{user?.role}</strong> 
            {' '}(<span className="font-mono">{user?.username}</span>).
            {isAdmin ? ' Anda memiliki akses penuh ke semua fitur.' : ' Anda dapat melakukan prediksi dan melihat riwayat.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;