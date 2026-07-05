// src/pages/LandingPage.jsx
import { useNavigate } from 'react-router-dom';
import { 
  Droplet, 
  BarChart2, 
  BrainCircuit, 
  TrendingUp, 
  Activity, 
  LayoutDashboard, 
  Database, 
  FileText, 
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-white font-sans overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-lg z-50 border-b border-gray-100/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="p-2 bg-blue-600 rounded-xl shadow-md shadow-blue-500/20">
                <Droplet className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">
                Water Quality <span className="text-blue-600">LSTM</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/login')}
                className="hidden sm:inline-block text-gray-600 hover:text-blue-600 font-medium px-3 py-2 transition-colors text-sm"
              >
                Masuk
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium text-sm transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center gap-1.5"
              >
                Mulai Sekarang <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 pt-16 lg:pt-20">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] lg:w-[900px] h-[300px] lg:h-[500px] bg-gradient-to-r from-blue-300/20 to-blue-400/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-0" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-2xl mb-5 shadow-sm border border-blue-200/50 ring-4 ring-blue-50/50">
            <Droplet className="w-8 h-8 lg:w-10 lg:h-10" strokeWidth={2.5} />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-3 leading-[1.1]">
            Sistem Peramalan <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400">
              Risiko Kualitas Air Laut
            </span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed px-4">
            Solusi terintegrasi berbasis Deep Learning (LSTM + Optuna) untuk memantau, menganalisis, dan memprediksi kualitas air tambak secara efisien dan akurat.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4">
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5"
            >
              Mulai Sekarang <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5"
            >
              Pelajari Fitur
            </button>
          </div>
        </div>
      </section>

      {/* THREE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="group bg-white p-5 sm:p-6 rounded-xl lg:rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 hover:border-blue-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-all duration-300 group-hover:bg-blue-100">
              <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" strokeWidth={2} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Monitoring Real-time</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Pantau parameter suhu, pH, salinitas, dan kekeruhan secara aktual dengan dashboard interaktif.
            </p>
          </div>

          <div className="group bg-white p-5 sm:p-6 rounded-xl lg:rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 hover:border-indigo-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-all duration-300 group-hover:bg-indigo-100">
              <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" strokeWidth={2} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Prediksi Cerdas (LSTM)</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Sistem peramalan risiko otomatis yang dioptimasi dengan Optuna untuk peringatan dini.
            </p>
          </div>

          <div className="group bg-white p-5 sm:p-6 rounded-xl lg:rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 hover:border-sky-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-all duration-300 group-hover:bg-sky-100">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" strokeWidth={2} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Analisis Tren</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Lacak perubahan data kualitas air dari waktu ke waktu untuk keputusan strategis.
            </p>
          </div>
        </div>
      </section>

      {/* DETAIL FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 scroll-mt-16">
        <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-12 shadow-lg shadow-gray-100/50 border border-gray-100">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium border border-blue-100/50 mb-3">
              <Droplet className="w-3 h-3" />
              Fitur Unggulan
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Fitur Utama Platform</h2>
            <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-2xl mx-auto px-4">
              Dibangun dengan teknologi terkini untuk memastikan keamanan dan optimalisasi budidaya perairan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5">Input & Integrasi Data</h4>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  Catat parameter suhu, pH, salinitas, dan kekeruhan secara manual atau integrasikan dengan sensor IoT.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5">Dashboard Monitoring</h4>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  Visualisasi data dengan grafik interaktif dan indikator status WQI.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5">Data Historis & Cloud</h4>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  Akses riwayat pengukuran tanpa batas untuk analisis jangka panjang.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5">Laporan Otomatis</h4>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  Generate laporan prediktif komprehensif untuk kebutuhan regulasi dan mitigasi risiko.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center shadow-xl shadow-blue-500/20">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
            Siap Mengoptimalkan Budidaya Anda?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base mb-4 max-w-xl mx-auto">
            Mulai gunakan sistem peramalan risiko kualitas air sekarang juga.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            Mulai Sekarang <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-gray-100 py-6 sm:py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Droplet className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-base text-gray-900 tracking-tight">
            Water Quality <span className="text-blue-600">LSTM</span>
          </span>
        </div>
        <p className="text-xs text-gray-400">
          {new Date().getFullYear()} Water Quality LSTM - Proyek Skripsi. Hak Cipta Dilindungi.
        </p>
        <p className="text-xs text-gray-300 mt-1">
          Sistem Peramalan Risiko Kualitas Air Laut berbasis LSTM + Optuna
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;