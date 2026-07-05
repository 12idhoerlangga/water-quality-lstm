// src/components/prediction/PredictionForm.jsx
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import api from '../../api/axios';
import ResultChart from './ResultChart';
import WQIWidget from './WQIWidget';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const PredictionForm = forwardRef(({ onPredictionSuccess }, ref) => {
  const [form, setForm] = useState({
    suhu: '',
    ph: '',
    salinitas: '',
    kekeruhan: '',
    startDate: '',
    horizon: 96,
  });
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef(null);

  const fetchLocations = async () => {
    try {
      const res = await api.get('/api/locations');
      setLocations(res.data);
      if (res.data.length > 0) {
        setSelectedLocation(res.data[0].id);
      }
    } catch (err) {
      console.error('Gagal ambil lokasi:', err);
      toast.error('Gagal memuat daftar lokasi.');
    }
  };

  useImperativeHandle(ref, () => ({
    fetchLocations,
  }));

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        suhu: parseFloat(form.suhu),
        ph: parseFloat(form.ph),
        salinitas: parseFloat(form.salinitas),
        kekeruhan: parseFloat(form.kekeruhan),
        horizon: parseInt(form.horizon) || 96,
        location_id: parseInt(selectedLocation) || null,
      };
      if (form.startDate) payload.startDate = form.startDate;
      const res = await api.post('/api/predict', payload);
      if (res.data.status === 'success') {
        setResult(res.data);
        if (onPredictionSuccess) onPredictionSuccess();

        const lastData = res.data.data[res.data.data.length - 1];
        if (lastData) {
          if (lastData.risk === 'Tinggi') {
            toast.error('PERINGATAN! Risiko Kualitas Air TINGGI! Segera lakukan tindakan mitigasi.', {
              duration: 8000,
              style: { background: '#dc2626', color: '#fff', fontWeight: 'bold' },
            });
          } else if (lastData.risk === 'Sedang') {
            toast('Risiko Sedang. Waspada dan pantau terus.', {
              style: { background: '#f59e0b', color: '#fff' },
            });
          } else if (lastData.risk === 'Rendah') {
            toast.success('Kondisi air baik. Lanjutkan pemantauan rutin.', {
              style: { background: '#22c55e', color: '#fff' },
            });
          }
        }
      } else {
        setError(res.data.message || 'Prediksi gagal');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`laporan_kualitas_air_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Gagal generate PDF:', error);
      toast.error('Gagal generate PDF. Silakan coba lagi.');
    } finally {
      setPdfLoading(false);
    }
  };

  const getStats = (data, key) => {
    const values = data.map((d) => d[key]);
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  return (
    <div className="space-y-6">
      {/* ===== FORM ===== */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Prediksi</h3>
        <p className="text-sm text-gray-500 mb-6">
          Masukkan parameter kualitas air untuk memprediksi kondisi 1 hari ke depan.
          Sistem akan menghitung WQI dan memberikan rekomendasi mitigasi.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Row 1: Lokasi + Tanggal Mulai + Horizon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Tambak</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                required
              >
                {locations.length === 0 ? (
                  <option value="">Memuat lokasi...</option>
                ) : (
                  locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horizon</label>
              <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                1 Hari (96 langkah)
              </div>
              <input type="hidden" name="horizon" value={96} />
            </div>
          </div>

          {/* Parameter Kimia & Fisik */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">
                Parameter Kimia
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    pH <span className="text-xs text-gray-400 font-normal">(6.5 - 8.5)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="ph"
                    value={form.ph}
                    onChange={handleChange}
                    placeholder="Contoh: 7.5"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salinitas <span className="text-xs text-gray-400 font-normal">(ppt)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="salinitas"
                    value={form.salinitas}
                    onChange={handleChange}
                    placeholder="Contoh: 32.5"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">
                Parameter Fisik
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Suhu <span className="text-xs text-gray-400 font-normal">(°C)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="suhu"
                    value={form.suhu}
                    onChange={handleChange}
                    placeholder="Contoh: 28.5"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kekeruhan <span className="text-xs text-gray-400 font-normal">(NTU)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="kekeruhan"
                    value={form.kekeruhan}
                    onChange={handleChange}
                    placeholder="Contoh: 3.5"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ===== TOMBOL AKSI (RESPONSIF) ===== */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Memproses...' : 'Prediksi'}
            </button>
            <button
              type="reset"
              onClick={() => setForm({ suhu: '', ph: '', salinitas: '', kekeruhan: '', startDate: '', horizon: 96 })}
              className="w-full sm:w-auto bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Reset
            </button>
          </div>
        </form>

        {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}
      </div>

      {/* NARASI */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Tentang Parameter</h4>
        <p className="text-sm text-gray-500 leading-relaxed">
          Parameter yang Anda masukkan akan diproses oleh model LSTM yang telah dioptimasi
          dengan Optuna (Bayesian Optimization). Sistem akan memprediksi kondisi kualitas air
          untuk <strong>1 hari ke depan</strong> (96 langkah, interval 15 menit), menghitung
          Indeks Kualitas Air (WQI), serta memberikan rekomendasi mitigasi berdasarkan
          tingkat risiko yang terdeteksi.
        </p>
      </div>

      {/* ===== HASIL PREDIKSI ===== */}
      {result && (
        <>
          <div ref={reportRef} className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-center border-b border-gray-300 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-blue-900">Laporan Prediksi Kualitas Air Laut</h2>
              <p className="text-gray-600 text-sm">Sistem Peramalan Risiko Berbasis LSTM + Optuna</p>
              <p className="text-gray-500 text-xs mt-1">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <WQIWidget data={result.data} />

            <div className="mt-6">
              <h3 className="text-md font-semibold text-blue-900 border-b border-gray-200 pb-2 mb-3">
                Statistik Parameter Prediksi
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-900 text-white">
                      <th className="p-2 border text-left">Parameter</th>
                      <th className="p-2 border text-center">Rata-rata</th>
                      <th className="p-2 border text-center">Minimum</th>
                      <th className="p-2 border text-center">Maksimum</th>
                      <th className="p-2 border text-center">Satuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'temperature', label: 'Suhu', unit: '°C' },
                      { key: 'salinity', label: 'Salinitas', unit: 'ppt' },
                      { key: 'pH', label: 'pH', unit: '-' },
                      { key: 'turbidity', label: 'Kekeruhan', unit: 'NTU' },
                    ].map((item, idx) => {
                      const stats = getStats(result.data, item.key);
                      return (
                        <tr key={item.key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-2 border font-medium">{item.label}</td>
                          <td className="p-2 border text-center">{stats.avg.toFixed(2)}</td>
                          <td className="p-2 border text-center">{stats.min.toFixed(2)}</td>
                          <td className="p-2 border text-center">{stats.max.toFixed(2)}</td>
                          <td className="p-2 border text-center">{item.unit}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-semibold text-blue-900 border-b border-gray-200 pb-2 mb-3">
                Tren Prediksi 1 Hari ke Depan
              </h3>
              <ResultChart data={result.data} />
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
              <h3 className="text-md font-semibold text-blue-900 mb-2">Rekomendasi Mitigasi</h3>
              {result.data.length > 0 && (
                <>
                  <p className="text-sm">
                    <strong>Kategori Risiko:</strong>{' '}
                    <span
                      className={
                        result.data[result.data.length - 1].risk === 'Rendah'
                          ? 'text-green-600'
                          : result.data[result.data.length - 1].risk === 'Tinggi'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }
                    >
                      {result.data[result.data.length - 1].risk}
                    </span>
                  </p>
                  <p className="text-sm mt-1">
                    <strong>Tindakan:</strong> {result.data[result.data.length - 1].recommendation}
                  </p>
                  {result.data[result.data.length - 1].risk === 'Tinggi' && (
                    <div className="mt-2 p-2 bg-red-100 border-l-4 border-red-600 text-red-700 text-sm rounded">
                      Perhatian! Kondisi air memerlukan tindakan segera. Lakukan aerasi tambahan, kurangi pakan, dan siapkan pergantian air.
                    </div>
                  )}
                  {result.data[result.data.length - 1].risk === 'Sedang' && (
                    <div className="mt-2 p-2 bg-yellow-100 border-l-4 border-yellow-600 text-yellow-700 text-sm rounded">
                      Waspada! Lakukan pengecekan parameter secara berkala dan pantau tren perubahan.
                    </div>
                  )}
                  {result.data[result.data.length - 1].risk === 'Rendah' && (
                    <div className="mt-2 p-2 bg-green-100 border-l-4 border-green-600 text-green-700 text-sm rounded">
                      Kondisi air baik. Lanjutkan pemantauan rutin dan jaga kestabilan parameter.
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4 mt-6">
              Dicetak pada: {new Date().toLocaleString('id-ID')} &nbsp;|&nbsp; Copyright 2026 Water Quality LSTM - Skripsi
            </div>
          </div>

          {/* ===== TOMBOL CETAK PDF (RESPONSIF) ===== */}
          <div className="mt-4 text-center sm:text-right">
            <button
              onClick={generatePDF}
              disabled={pdfLoading}
              className="w-full sm:w-auto bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-sm"
            >
              {pdfLoading ? 'Memproses...' : 'Cetak Laporan PDF'}
            </button>
          </div>
        </>
      )}
    </div>
  );
});

export default PredictionForm;