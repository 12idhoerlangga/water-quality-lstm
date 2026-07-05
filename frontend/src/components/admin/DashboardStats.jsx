// src/components/admin/DashboardStats.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { MapPin, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalLocations: 0,
    goodQuality: 0,
    warnings: 0,
    todayData: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const locRes = await api.get('/api/locations');
        const totalLoc = locRes.data.length || 0;

        const predRes = await api.get('/api/history?limit=100');
        const predictions = predRes.data || [];

        const today = new Date().toISOString().slice(0, 10);
        const todayPreds = predictions.filter((p) => p.created_at?.startsWith(today));
        const good = todayPreds.filter((p) => p.risk_final === 'Rendah').length;
        const warnings = todayPreds.filter((p) => p.risk_final === 'Tinggi').length;

        setStats({
          totalLocations: totalLoc,
          goodQuality: todayPreds.length > 0 ? Math.round((good / todayPreds.length) * 100) : 0,
          warnings: warnings,
          todayData: todayPreds.length,
        });
      } catch (error) {
        console.error('Gagal ambil statistik:', error);
        // ❌ TIDAK ADA DUMMY, biarkan 0
        setStats({
          totalLocations: 0,
          goodQuality: 0,
          warnings: 0,
          todayData: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Lokasi</p>
          <p className="text-2xl font-bold">{stats.totalLocations}</p>
          <p className="text-xs text-green-600">Semua aktif</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-green-100 rounded-lg text-green-600">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Kualitas Baik</p>
          <p className="text-2xl font-bold">{stats.goodQuality}%</p>
          <p className="text-xs text-green-600">+0% dari kemarin</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-red-100 rounded-lg text-red-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Peringatan</p>
          <p className="text-2xl font-bold">{stats.warnings}</p>
          <p className="text-xs text-red-500">Risiko tinggi</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Data Hari Ini</p>
          <p className="text-2xl font-bold">{stats.todayData}</p>
          <p className="text-xs text-gray-400">Pengukuran tercatat</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;