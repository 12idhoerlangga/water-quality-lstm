// src/components/admin/ParameterStatus.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';

const ParameterStatus = () => {
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get('/api/history?limit=1');
        if (res.data.length > 0) {
          const pred = res.data[0];
          const jsonData = JSON.parse(pred.prediction_json);
          const last = jsonData[jsonData.length - 1];
          setLatestData(last);
        } else {
          setLatestData(null);
        }
      } catch (error) {
        console.error('Gagal ambil data parameter:', error);
        setError(true);
        setLatestData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  if (loading) {
    return <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">Memuat data...</div>;
  }

  if (error || !latestData) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-3">Status Parameter Terkini</h3>
        <p className="text-gray-500 text-sm">Belum ada data prediksi.</p>
      </div>
    );
  }

  const params = [
    { label: 'Suhu', value: latestData?.temperature?.toFixed(1), unit: '°C', standard: '25-30' },
    { label: 'pH', value: latestData?.pH?.toFixed(1), unit: '', standard: '6.5-8.5' },
    { label: 'Salinitas', value: latestData?.salinity?.toFixed(1), unit: 'ppt', standard: '30-35' },
    { label: 'Kekeruhan', value: latestData?.turbidity?.toFixed(1), unit: 'NTU', standard: '< 5' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-3">Status Parameter Terkini</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {params.map((p) => (
          <div key={p.label} className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">{p.label}</p>
            <p className="text-xl font-bold">
              {p.value ? `${p.value} ${p.unit}` : '-'}
            </p>
            <p className="text-xs text-gray-400">Standar: {p.standard}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParameterStatus;