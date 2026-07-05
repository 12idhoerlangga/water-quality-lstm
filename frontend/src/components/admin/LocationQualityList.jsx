// src/components/admin/LocationQualityList.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LocationQualityList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const locRes = await api.get('/api/locations');
        const locs = locRes.data;

        if (locs.length === 0) {
          setLocations([]);
          setLoading(false);
          return;
        }

        const predRes = await api.get('/api/history?limit=100');
        const predictions = predRes.data || [];

        const latestPerLocation = {};
        predictions.forEach((pred) => {
          const locId = pred.location_id;
          if (locId && !latestPerLocation[locId]) {
            latestPerLocation[locId] = pred;
          }
        });

        const result = locs.map((loc) => {
          const pred = latestPerLocation[loc.id];
          let wqi = null;
          let risk = 'Belum Ada Data';
          let updated = null;

          if (pred) {
            try {
              const jsonData = JSON.parse(pred.prediction_json);
              const last = jsonData[jsonData.length - 1];
              wqi = last?.wqi || pred.wqi_avg;
              risk = last?.risk || pred.risk_final || 'Belum Ada Data';
              updated = new Date(pred.created_at).toLocaleString('id-ID');
            } catch (e) {
              // Jika JSON tidak valid
            }
          }

          return { ...loc, wqi, risk, updated };
        });

        setLocations(result);
      } catch (error) {
        console.error('Gagal ambil data kualitas per lokasi:', error);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRiskColor = (risk) => {
    if (risk === 'Rendah') return 'text-green-600 bg-green-100';
    if (risk === 'Tinggi') return 'text-red-600 bg-red-100';
    if (risk === 'Sedang') return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-500 bg-gray-100';
  };

  const getChartColor = (risk) => {
    if (risk === 'Rendah') return '#22c55e';
    if (risk === 'Tinggi') return '#ef4444';
    if (risk === 'Sedang') return '#eab308';
    return '#9ca3af';
  };

  const hasWqiData = locations.some((loc) => loc.wqi !== null);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-3">Kualitas per Lokasi</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 p-4 rounded-lg h-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-3">Kualitas per Lokasi</h3>
        <p className="text-gray-500 text-sm">Belum ada data lokasi.</p>
      </div>
    );
  }

  const chartLabels = locations.map((loc) => loc.name);
  const chartDataValues = locations.map((loc) => (loc.wqi !== null ? loc.wqi.toFixed(1) : 0));
  const chartColors = locations.map((loc) => getChartColor(loc.risk));

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'WQI',
        data: chartDataValues,
        backgroundColor: chartColors,
        borderColor: chartColors.map(() => '#ffffff'),
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const loc = locations[context.dataIndex];
            return `WQI: ${loc.wqi?.toFixed(2) || '-'} (${loc.risk})`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'WQI' },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-3">Kualitas per Lokasi</h3>

      {hasWqiData && (
        <div className="h-48 md:h-56 mb-6">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => (
          <div key={loc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-gray-800">{loc.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(loc.risk)}`}>
                {loc.risk}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              WQI: <span className="font-bold text-gray-700">{loc.wqi !== null ? loc.wqi.toFixed(2) : '-'}</span>
            </p>
            {loc.updated && (
              <p className="text-xs text-gray-400 mt-2">Update: {loc.updated}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationQualityList;