// src/components/prediction/ResultChart.jsx
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ResultChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const labels = data.map(d => d.timestamp.slice(11, 16));
  const chartData = {
    labels,
    datasets: [
      { label: 'Suhu (°C)', data: data.map(d => d.temperature), borderColor: '#FF6384', tension: 0.2, pointRadius: 1 },
      { label: 'Salinitas (ppt)', data: data.map(d => d.salinity), borderColor: '#36A2EB', tension: 0.2, pointRadius: 1 },
      { label: 'pH', data: data.map(d => d.pH), borderColor: '#FFCE56', tension: 0.2, pointRadius: 1 },
      { label: 'Kekeruhan (NTU)', data: data.map(d => d.turbidity), borderColor: '#4BC0C0', tension: 0.2, pointRadius: 1 }
    ]
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Tren Prediksi 1 Hari ke Depan' } }, scales: { x: { title: { display: true, text: 'Waktu (15 menit)' } }, y: { title: { display: true, text: 'Nilai' } } } }} />
    </div>
  );
};

export default ResultChart;