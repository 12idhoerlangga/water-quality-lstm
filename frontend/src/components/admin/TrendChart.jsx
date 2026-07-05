// src/components/admin/TrendChart.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TrendChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/history?limit=1');
        if (res.data.length > 0) {
          const pred = res.data[0];
          const jsonData = JSON.parse(pred.prediction_json);
          const data = jsonData.slice(-24);
          const labels = data.map((d) => d.timestamp.slice(11, 16));
          setChartData({
            labels,
            datasets: [
              {
                label: 'Suhu (°C)',
                data: data.map((d) => d.temperature),
                borderColor: '#FF6384',
                tension: 0.2,
                pointRadius: 1,
              },
              {
                label: 'pH',
                data: data.map((d) => d.pH),
                borderColor: '#36A2EB',
                tension: 0.2,
                pointRadius: 1,
              },
              {
                label: 'Salinitas (ppt)',
                data: data.map((d) => d.salinity),
                borderColor: '#FFCE56',
                tension: 0.2,
                pointRadius: 1,
              },
              {
                label: 'Kekeruhan (NTU)',
                data: data.map((d) => d.turbidity),
                borderColor: '#4BC0C0',
                tension: 0.2,
                pointRadius: 1,
              },
            ],
          });
        } else {
          setChartData(null);
        }
      } catch (error) {
        console.error('Gagal ambil tren:', error);
        setError(true);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">Memuat grafik...</div>;
  }

  if (error || !chartData) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-3">Tren Parameter (6 Jam Terakhir)</h3>
        <p className="text-gray-500 text-sm">Belum ada data prediksi untuk grafik.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-3">Tren Parameter (6 Jam Terakhir)</h3>
      <div className="h-64">
        <Line
          data={chartData}
          options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }}
        />
      </div>
    </div>
  );
};

export default TrendChart;