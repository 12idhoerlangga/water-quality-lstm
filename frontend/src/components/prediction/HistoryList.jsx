// src/components/prediction/HistoryList.jsx
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Search, Download, MapPin, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const HistoryList = forwardRef((props, ref) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // ============================================================
  // FETCH FUNCTIONS
  // ============================================================
  const fetchLocations = async () => {
    try {
      const res = await api.get('/api/locations');
      setLocations(res.data);
    } catch (err) {
      console.error('Gagal ambil lokasi:', err);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/history?limit=${limit}&order=${sortOrder}`);
      setHistory(res.data);
      // Filtering akan diterapkan di useEffect di bawah
    } catch (err) {
      console.error('Gagal ambil histori:', err);
      toast.error('Gagal memuat riwayat prediksi.');
      setHistory([]);
      setFilteredHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchHistory,
  }));

  // 🔥 Fetch ulang ketika limit atau sortOrder berubah
  useEffect(() => {
    fetchLocations();
    fetchHistory();
  }, [limit, sortOrder]);

  // 🔥 Filter data berdasarkan search, lokasi, dan history
  useEffect(() => {
    let filtered = history;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.username?.toLowerCase().includes(term) ||
        getLocationName(item.location_id).toLowerCase().includes(term) ||
        item.risk_final?.toLowerCase().includes(term) ||
        new Date(item.created_at).toLocaleDateString('id-ID').includes(term)
      );
    }
    if (selectedLocation) {
      filtered = filtered.filter((item) => Number(item.location_id) === Number(selectedLocation));
    }
    setFilteredHistory(filtered);
    setSelectedRows([]);
    setSelectAll(false);
  }, [searchTerm, selectedLocation, history]);

  // ============================================================
  // HELPER FUNCTIONS (diperbaiki)
  // ============================================================
  const getLocationName = (locationId) => {
    if (!locationId) return 'Tidak Diketahui';
    const loc = locations.find((l) => Number(l.id) === Number(locationId));
    return loc ? loc.name : 'Tidak Diketahui';
  };

  const getLastParams = (predictionJson) => {
    try {
      const data = JSON.parse(predictionJson);
      if (data && data.length > 0) {
        const last = data[data.length - 1];
        return {
          temperature: last.temperature,
          pH: last.pH,
          salinity: last.salinity,
          turbidity: last.turbidity,
        };
      }
    } catch (e) {
      console.error('Gagal parse prediction_json:', e);
    }
    return { temperature: '-', pH: '-', salinity: '-', turbidity: '-' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // ============================================================
  // EKSPORT FUNCTIONS (tetap sama)
  // ============================================================
  const exportCSV = () => {
    const dataToExport = filteredHistory.filter((item) => selectedRows.includes(item.id));
    if (dataToExport.length === 0) {
      toast.error('Pilih minimal satu data untuk diekspor.');
      return;
    }

    const headers = ['Tanggal', 'Waktu', 'Lokasi', 'User', 'Suhu', 'pH', 'Salinitas', 'Kekeruhan', 'WQI', 'Risiko'];
    const rows = dataToExport.map((item) => {
      const params = getLastParams(item.prediction_json);
      return [
        formatDate(item.created_at),
        formatTime(item.created_at),
        getLocationName(item.location_id),
        item.username || '-',
        params.temperature,
        params.pH,
        params.salinity,
        params.turbidity,
        item.wqi_avg || '-',
        item.risk_final || '-',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riwayat_prediksi_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${dataToExport.length} data berhasil diekspor (CSV)!`);
    setExportDropdownOpen(false);
  };

  const exportExcel = () => {
    const dataToExport = filteredHistory.filter((item) => selectedRows.includes(item.id));
    if (dataToExport.length === 0) {
      toast.error('Pilih minimal satu data untuk diekspor.');
      return;
    }

    const rows = dataToExport.map((item) => {
      const params = getLastParams(item.prediction_json);
      return {
        Tanggal: formatDate(item.created_at),
        Waktu: formatTime(item.created_at),
        Lokasi: getLocationName(item.location_id),
        User: item.username || '-',
        Suhu: params.temperature !== '-' ? params.temperature : '-',
        pH: params.pH !== '-' ? params.pH : '-',
        Salinitas: params.salinity !== '-' ? params.salinity : '-',
        Kekeruhan: params.turbidity !== '-' ? params.turbidity : '-',
        WQI: item.wqi_avg || '-',
        Risiko: item.risk_final || '-',
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Riwayat Prediksi');
    XLSX.writeFile(wb, `riwayat_prediksi_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`${dataToExport.length} data berhasil diekspor (Excel)!`);
    setExportDropdownOpen(false);
  };

  const exportPDF = () => {
    const dataToExport = filteredHistory.filter((item) => selectedRows.includes(item.id));
    if (dataToExport.length === 0) {
      toast.error('Pilih minimal satu data untuk diekspor.');
      return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setTextColor('#1a3a5c');
    doc.text('Riwayat Prediksi Kualitas Air', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor('#666');
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, 22, { align: 'center' });

    const tableHeaders = ['No', 'Tanggal', 'Waktu', 'Lokasi', 'User', 'Suhu', 'pH', 'Salinitas', 'Kekeruhan', 'WQI', 'Risiko'];
    const tableRows = dataToExport.map((item, idx) => {
      const params = getLastParams(item.prediction_json);
      return [
        idx + 1,
        formatDate(item.created_at),
        formatTime(item.created_at),
        getLocationName(item.location_id),
        item.username || '-',
        params.temperature !== '-' ? params.temperature.toFixed(1) : '-',
        params.pH !== '-' ? params.pH.toFixed(2) : '-',
        params.salinity !== '-' ? params.salinity.toFixed(1) : '-',
        params.turbidity !== '-' ? params.turbidity.toFixed(2) : '-',
        item.wqi_avg || '-',
        item.risk_final || '-',
      ];
    });

    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [26, 58, 92], textColor: [255, 255, 255], fontSize: 7 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor('#aaa');
        doc.text(
          `Generated by Water Quality LSTM · Halaman ${doc.internal.getNumberOfPages()}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      },
    });

    doc.save(`riwayat_prediksi_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success(`${dataToExport.length} data berhasil diekspor (PDF)!`);
    setExportDropdownOpen(false);
  };

  // ============================================================
  // HANDLE SELECT ALL
  // ============================================================
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredHistory.map((item) => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (loading) {
    return <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">Memuat...</div>;
  }

  const orderLabel = sortOrder === 'DESC' ? 'terbaru' : 'terlama';

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
      {/* HEADER & TOOLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Riwayat Pengukuran</h3>
          <p className="text-sm text-gray-500">
            Menampilkan {filteredHistory.length} dari {history.length} data
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
          >
            <option value="">Semua Lokasi</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
          >
            <option value="DESC">Terbaru</option>
            <option value="ASC">Terlama</option>
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
          >
            <option value={10}>10 data</option>
            <option value={25}>25 data</option>
            <option value={50}>50 data</option>
            <option value={100}>100 data</option>
          </select>

          {/* EXPORT DROPDOWN */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              disabled={selectedRows.length === 0}
              className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg transition text-sm font-medium ${
                selectedRows.length > 0
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              Export ({selectedRows.length})
              <ChevronDown className="w-4 h-4" />
            </button>
            {exportDropdownOpen && selectedRows.length > 0 && (
              <div className="absolute right-0 mt-1 w-full sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                <button onClick={exportPDF} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 border-b border-gray-100">
                  📄 PDF
                </button>
                <button onClick={exportExcel} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 border-b border-gray-100">
                  📊 Excel
                </button>
                {isAdmin && (
                  <button onClick={exportCSV} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
                    📋 CSV
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABEL */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-3 text-center font-semibold rounded-tl-lg">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="p-3 text-left font-semibold">Tanggal</th>
              <th className="p-3 text-left font-semibold">Waktu</th>
              <th className="p-3 text-left font-semibold">Lokasi</th>
              {history.some((item) => item.username) && (
                <th className="p-3 text-left font-semibold">User</th>
              )}
              <th className="p-3 text-center font-semibold">Suhu</th>
              <th className="p-3 text-center font-semibold">pH</th>
              <th className="p-3 text-center font-semibold">Salinitas</th>
              <th className="p-3 text-center font-semibold">Kekeruhan</th>
              <th className="p-3 text-center font-semibold">WQI</th>
              <th className="p-3 text-center font-semibold rounded-tr-lg">Risiko</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="11" className="p-6 text-center text-gray-500">Tidak ada data yang sesuai.</td>
              </tr>
            ) : (
              filteredHistory.map((item, idx) => {
                const params = getLastParams(item.prediction_json);
                const riskClass =
                  item.risk_final === 'Tinggi'
                    ? 'text-red-600 bg-red-50'
                    : item.risk_final === 'Sedang'
                    ? 'text-yellow-600 bg-yellow-50'
                    : 'text-green-600 bg-green-50';
                const isChecked = selectedRows.includes(item.id);
                return (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 border border-gray-200 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleRowSelect(item.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 border border-gray-200">{formatDate(item.created_at)}</td>
                    <td className="p-3 border border-gray-200">{formatTime(item.created_at)}</td>
                    <td className="p-3 border border-gray-200">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {getLocationName(item.location_id)}
                      </div>
                    </td>
                    {history.some((h) => h.username) && (
                      <td className="p-3 border border-gray-200">{item.username || '-'}</td>
                    )}
                    <td className="p-3 border border-gray-200 text-center font-mono">
                      {params.temperature !== '-' ? params.temperature.toFixed(1) : '-'}
                    </td>
                    <td className="p-3 border border-gray-200 text-center font-mono">
                      {params.pH !== '-' ? params.pH.toFixed(2) : '-'}
                    </td>
                    <td className="p-3 border border-gray-200 text-center font-mono">
                      {params.salinity !== '-' ? params.salinity.toFixed(1) : '-'}
                    </td>
                    <td className="p-3 border border-gray-200 text-center font-mono">
                      {params.turbidity !== '-' ? params.turbidity.toFixed(2) : '-'}
                    </td>
                    <td className="p-3 border border-gray-200 text-center font-bold">
                      {item.wqi_avg || '-'}
                    </td>
                    <td className="p-3 border border-gray-200 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${riskClass}`}>
                        {item.risk_final || '-'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">
        Menampilkan {filteredHistory.length} dari {history.length} data {orderLabel}
      </p>
    </div>
  );
});

export default HistoryList;