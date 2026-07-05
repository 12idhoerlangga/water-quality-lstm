// src/components/prediction/WQIWidget.jsx
const WQIWidget = ({ data }) => {
    if (!data || data.length === 0) return null;
    const last = data[data.length - 1];
    const avgWQI = data.reduce((sum, d) => sum + d.wqi, 0) / data.length;
    const riskColor = { 'Rendah': 'text-green-600 bg-green-100', 'Sedang': 'text-yellow-600 bg-yellow-100', 'Tinggi': 'text-red-600 bg-red-100' };
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded border border-blue-200"><p className="text-sm text-gray-600">Rata-rata WQI</p><p className="text-3xl font-bold">{avgWQI.toFixed(2)}</p></div>
        <div className={`p-4 rounded border ${riskColor[last.risk] || 'bg-gray-100'}`}><p className="text-sm text-gray-600">Risiko Terakhir</p><p className="text-2xl font-bold">{last.risk}</p></div>
        <div className="bg-gray-50 p-4 rounded border border-gray-200"><p className="text-sm text-gray-600">Rekomendasi</p><p className="text-sm">{last.recommendation}</p></div>
      </div>
    );
  };
  
  export default WQIWidget;