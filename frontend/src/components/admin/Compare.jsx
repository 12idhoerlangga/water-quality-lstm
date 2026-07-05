// src/components/admin/Compare.jsx
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

const safeNumber = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

const Compare = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/api/compare')
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error('Gagal ambil data perbandingan:', err);
        setError('Gagal memuat data perbandingan');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200 text-red-600">
        {error}
      </div>
    );
  }

  if (!data || (!data.baseline && !data.lstm)) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-gray-500 text-center">
        <p>Belum ada data perbandingan.</p>
        <p className="text-sm mt-1">Simpan baseline TFT dan lakukan training terlebih dahulu.</p>
      </div>
    );
  }

  const baseline = data.baseline || {};
  const lstm = data.lstm || {};

  const baselineMape = safeNumber(baseline.mape);
  const baselineRmse = safeNumber(baseline.rmse);
  const baselineMae = safeNumber(baseline.mae);
  const baselineR2 = safeNumber(baseline.r2);

  const lstmMape = safeNumber(lstm.best_mape);
  const lstmRmse = safeNumber(lstm.best_rmse);
  const lstmMae = safeNumber(lstm.best_mae);
  const lstmR2 = safeNumber(lstm.best_r2);
  const trialCount = lstm.trial_count || 0;

  const isMapeTarget = lstmMape !== null && lstmMape < 25;
  const isR2Target = lstmR2 !== null && lstmR2 > 0.7;

  const chartData = {
    labels: ['MAPE', 'RMSE', 'MAE', 'R²'],
    datasets: [
      {
        label: 'TFT (Baseline)',
        data: [
          baselineMape ?? 0,
          baselineRmse ?? 0,
          baselineMae ?? 0,
          baselineR2 ?? 0,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'LSTM + Optuna',
        data: [
          lstmMape ?? 0,
          lstmRmse ?? 0,
          lstmMae ?? 0,
          lstmR2 ?? 0,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { weight: 'bold' },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw;
            const metric = context.dataIndex;
            if (metric === 0) return `${label}: ${value?.toFixed(2)}%`;
            if (metric === 3) return `${label}: ${value?.toFixed(4)}`;
            return `${label}: ${value?.toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        title: {
          display: true,
          text: 'Nilai',
          font: { weight: 'bold' },
        },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const rows = [
    {
      label: 'MAPE (%)',
      baseline: baselineMape,
      lstm: lstmMape,
      format: (v) => (v !== null ? `${v.toFixed(2)}%` : '-'),
      isBetter: lstmMape !== null && baselineMape !== null && lstmMape < baselineMape,
    },
    {
      label: 'RMSE',
      baseline: baselineRmse,
      lstm: lstmRmse,
      format: (v) => (v !== null ? v.toFixed(4) : '-'),
      isBetter: lstmRmse !== null && baselineRmse !== null && lstmRmse < baselineRmse,
    },
    {
      label: 'MAE',
      baseline: baselineMae,
      lstm: lstmMae,
      format: (v) => (v !== null ? v.toFixed(4) : '-'),
      isBetter: lstmMae !== null && baselineMae !== null && lstmMae < baselineMae,
    },
    {
      label: 'R²',
      baseline: baselineR2,
      lstm: lstmR2,
      format: (v) => (v !== null ? v.toFixed(4) : '-'),
      isBetter: lstmR2 !== null && baselineR2 !== null && lstmR2 > baselineR2,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">Perbandingan Performa</h3>
        {trialCount > 0 && (
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {trialCount} trial
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-600 font-medium">MAPE Terbaik</p>
          <p className="text-xl font-bold text-gray-800">
            {lstmMape !== null ? `${lstmMape.toFixed(2)}%` : '-'}
          </p>
          <p className="text-xs text-gray-500">Target: {'< 25%'}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <p className="text-xs text-green-600 font-medium">R² Terbaik</p>
          <p className="text-xl font-bold text-gray-800">
            {lstmR2 !== null ? lstmR2.toFixed(4) : '-'}
          </p>
          <p className="text-xs text-gray-500">Target: {'> 0.7'}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
          <p className="text-xs text-purple-600 font-medium">Status MAPE</p>
          <p className="text-xl font-bold text-gray-800">
            {isMapeTarget ? '✅ Tercapai' : '⚠️ Belum'}
          </p>
          <p className="text-xs text-gray-500">
            {lstmMape !== null ? `${lstmMape.toFixed(2)}%` : '-'}
          </p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
          <p className="text-xs text-indigo-600 font-medium">Status R²</p>
          <p className="text-xl font-bold text-gray-800">
            {isR2Target ? '✅ Tercapai' : '⚠️ Belum'}
          </p>
          <p className="text-xs text-gray-500">
            {lstmR2 !== null ? lstmR2.toFixed(4) : '-'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-3 text-left font-semibold rounded-tl-lg">Metrik</th>
                <th className="p-3 text-center font-semibold">TFT</th>
                <th className="p-3 text-center font-semibold rounded-tr-lg">LSTM+Optuna</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.label}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="p-3 border border-gray-200 font-medium text-gray-700">
                    {row.label}
                  </td>
                  <td className="p-3 border border-gray-200 text-center font-mono text-gray-600">
                    {row.format(row.baseline)}
                  </td>
                  <td className="p-3 border border-gray-200 text-center font-mono">
                    <span
                      className={
                        row.lstm !== null
                          ? row.isBetter
                            ? 'text-green-600 font-bold'
                            : 'text-gray-600'
                          : 'text-gray-400'
                      }
                    >
                      {row.format(row.lstm)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-2 text-right">
            * Nilai LSTM dari training terakhir
          </p>
        </div>

        <div className="h-64 lg:h-72">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Compare;