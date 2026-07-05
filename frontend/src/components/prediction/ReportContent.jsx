// src/components/prediction/ReportContent.jsx
import React from 'react';
import ResultChart from './ResultChart';
import WQIWidget from './WQIWidget';

const ReportContent = ({ data, predictionDate }) => {
  // Hitung statistik per parameter
  const stats = {
    temperature: {
      avg: data.reduce((s, d) => s + d.temperature, 0) / data.length,
      min: Math.min(...data.map(d => d.temperature)),
      max: Math.max(...data.map(d => d.temperature)),
    },
    salinity: {
      avg: data.reduce((s, d) => s + d.salinity, 0) / data.length,
      min: Math.min(...data.map(d => d.salinity)),
      max: Math.max(...data.map(d => d.salinity)),
    },
    pH: {
      avg: data.reduce((s, d) => s + d.pH, 0) / data.length,
      min: Math.min(...data.map(d => d.pH)),
      max: Math.max(...data.map(d => d.pH)),
    },
    turbidity: {
      avg: data.reduce((s, d) => s + d.turbidity, 0) / data.length,
      min: Math.min(...data.map(d => d.turbidity)),
      max: Math.max(...data.map(d => d.turbidity)),
    },
  };

  const last = data[data.length - 1];
  const avgWQI = data.reduce((s, d) => s + d.wqi, 0) / data.length;

  // Skema warna formal untuk status risiko
  const riskStyles = {
    Rendah: { bg: '#f3faf4', border: '#2e7d32', text: '#1b5e20', alertBg: '#e8f5e9' },
    Sedang: { bg: '#fffde7', border: '#f57f17', text: '#b78103', alertBg: '#fffde7' },
    Tinggi: { bg: '#fdf2f2', border: '#c62828', text: '#c62828', alertBg: '#fde8e8' }
  };

  const currentRisk = riskStyles[last.risk] || riskStyles['Sedang'];

  return (
    <div className="report-content" style={{ 
      fontFamily: '"Times New Roman", Times, serif', 
      padding: '40px', 
      backgroundColor: '#fff',
      maxWidth: '900px',
      margin: '0 auto',
      color: '#333',
      lineHeight: '1.5'
    }}>
      
      {/* HEADER LAPORAN */}
      <div style={{ 
        textAlign: 'center', 
        borderBottom: '3px double #1a3a5c', 
        paddingBottom: '16px', 
        marginBottom: '30px' 
      }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1a3a5c', margin: '0 0 6px 0', uppercase: 'true', letterSpacing: '0.5px' }}>
          LAPORAN PREDIKSI KUALITAS AIR LAUT
        </h1>
        <p style={{ fontSize: '15px', color: '#444', fontStyle: 'italic', margin: '0 0 8px 0' }}>
          Sistem Peramalan Risiko Berbasis Deep Learning (LSTM + Optuna)
        </p>
        <p style={{ fontSize: '13px', color: '#666', margin: 0, fontWeight: '500' }}>
          Tanggal Analisis: {predictionDate || new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* RINGKASAN EKSEKUTIF / WIDGET */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '35px' }}>
        <div style={{ backgroundColor: '#f4f7fa', padding: '16px', borderRadius: '4px', borderTop: '4px solid #1a3a5c', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', fontWeight: 'bold', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>Rata-Rata WQI</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a3a5c', margin: 0 }}>{avgWQI.toFixed(2)}</p>
        </div>
        
        <div style={{ backgroundColor: currentRisk.bg, padding: '16px', borderRadius: '4px', borderTop: `4px solid ${currentRisk.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', fontWeight: 'bold', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>Status Risiko Terakhir</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: currentRisk.text, margin: 0 }}>{last.risk}</p>
        </div>
        
        <div style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '4px', borderTop: '4px solid #757575', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', gridColumn: 'span 1' }}>
          <p style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', fontWeight: 'bold', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>Kesimpulan Umum</p>
          <p style={{ fontSize: '13px', margin: 0, color: '#444', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            "{last.recommendation}"
          </p>
        </div>
      </div>

      {/* TABEL STATISTIK PARAMETER */}
      <div style={{ marginBottom: '35px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a3a5c', borderBottom: '1px solid #1a3a5c', paddingBottom: '6px', marginBottom: '12px', textTransform: 'uppercase' }}>
          I. Ringkasan Statistik Parameter Prediksi
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a3a5c', color: '#fff' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '6px' }}>Parameter Metrik</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '6px' }}>Nilai Rata-rata</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '6px' }}>Minimum</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '6px' }}>Maksimum</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '6px' }}>Satuan</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 'bold' }}>Suhu Air (Temperature)</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{stats.temperature.avg.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{stats.temperature.min.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{stats.temperature.max.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>°C</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#fcfcfc' }}>
              <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 'bold' }}>Salinitas (Salinity)</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{stats.salinity.avg.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{stats.salinity.min.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{stats.salinity.max.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>ppt</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 'bold' }}>Derajat Keasaman (pH)</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{stats.pH.avg.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{stats.pH.min.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{stats.pH.max.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>-</td>
            </tr>
            <tr style={{ borderBottom: '2px solid #1a3a5c', backgroundColor: '#fcfcfc' }}>
              <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 'bold' }}>Kekeruhan Air (Turbidity)</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{stats.turbidity.avg.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{stats.turbidity.min.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>{stats.turbidity.max.toFixed(2)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>NTU</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* GRAFIK TREN */}
      <div style={{ marginBottom: '35px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a3a5c', borderBottom: '1px solid #1a3a5c', paddingBottom: '6px', marginBottom: '15px', textTransform: 'uppercase' }}>
          II. Visualisasi Tren Prediksi (1 Hari ke Depan)
        </h3>
        <div style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#fafafa' }}>
          <ResultChart data={data} />
        </div>
      </div>

      {/* REKOMENDASI MITIGASI (DETEL) */}
      <div style={{ marginBottom: '40px', border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#1a3a5c', color: '#fff', padding: '10px 16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>
            III. Arahan & Rekomendasi Mitigasi Risiko
          </h3>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#fff' }}>
          <p style={{ fontSize: '14px', margin: '0 0 8px 0', color: '#444' }}>
            <strong>Kategori Klasifikasi Risiko:</strong> <span style={{ color: currentRisk.text, fontWeight: 'bold' }}>{last.risk}</span>
          </p>
          <p style={{ fontSize: '14px', margin: '0 0 16px 0', color: '#444', lineHeight: '1.6' }}>
            <strong>Tindakan Prosedural:</strong> {last.recommendation}
          </p>
          
          {/* Alur Alert Berdasarkan Tingkat Risiko */}
          {last.risk === 'Tinggi' && (
            <div style={{ backgroundColor: currentRisk.alertBg, padding: '12px 16px', borderRadius: '4px', borderLeft: `4px solid ${currentRisk.border}` }}>
              <p style={{ fontSize: '13px', margin: 0, color: currentRisk.text, fontWeight: '500' }}>
                ⚠️ <strong>PROSEDUR DARURAT:</strong> Kondisi air terindikasi kritis dan memerlukan tindakan penanganan segera. Disarankan untuk menambahkan aerasi mekanis, membatasi pemberian pakan sementara, dan mempersiapkan sistem sirkulasi/pergantian air laut yang bersih.
              </p>
            </div>
          )}
          {last.risk === 'Sedang' && (
            <div style={{ backgroundColor: currentRisk.alertBg, padding: '12px 16px', borderRadius: '4px', borderLeft: `4px solid ${currentRisk.border}` }}>
              <p style={{ fontSize: '13px', margin: 0, color: '#7e6005', fontWeight: '500' }}>
                ⚠️ <strong>PROSEDUR WASPADA:</strong> Parameter air menunjukkan fluktuasi minor mendekati batas ambang batas normal. Lakukan observasi lapangan dan pengecekan sensor berkala guna memantau perkembangan tren peramalan berikutnya.
              </p>
            </div>
          )}
          {last.risk === 'Rendah' && (
            <div style={{ backgroundColor: currentRisk.alertBg, padding: '12px 16px', borderRadius: '4px', borderLeft: `4px solid ${currentRisk.border}` }}>
              <p style={{ fontSize: '13px', margin: 0, color: currentRisk.text, fontWeight: '500' }}>
                ✅ <strong>PROSEDUR RUTIN:</strong> Indeks Kualitas Air (WQI) berada pada zona aman dan stabil. Lanjutkan pemantauan otomatis berkala dan pertahankan manajemen kualitas air yang sedang berjalan saat ini.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER & VERIFIKASI DOKUMEN */}
      <div style={{ 
        borderTop: '1px solid #ccc', 
        paddingTop: '12px', 
        marginTop: '40px',
        display: 'flex',
        justifyContent: 'between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p style={{ fontSize: '11px', color: '#777', margin: 0 }}>
            Dokumen ini digenerate secara otomatis oleh sistem komputasi cerdas.
          </p>
          <p style={{ fontSize: '10px', color: '#999', margin: '2px 0 0 0' }}>
            © 2026 Water Quality Prediction Platform – Proyek Skripsi
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '11px', color: '#555', margin: 0, fontWeight: '500' }}>
            Waktu Cetak: {new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
          </p>
          <p style={{ fontSize: '10px', color: '#777', fontStyle: 'italic', margin: '2px 0 0 0' }}>
            LSTM + Optuna Optimization Engine v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportContent;