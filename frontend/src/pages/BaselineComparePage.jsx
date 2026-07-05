// src/pages/BaselineComparePage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import SetBaseline from '../components/admin/SetBaseline';
import Compare from '../components/admin/Compare';
import api from '../api/axios';

const BaselineComparePage = () => {
  const { user } = useAuth();
  const [showCompare, setShowCompare] = useState(false);
  const [baselineData, setBaselineData] = useState(null);
  const [lstmData, setLstmData] = useState(null);
  const [hasBaseline, setHasBaseline] = useState(false);

  // Ambil data perbandingan dari backend
  const fetchCompareData = async () => {
    try {
      const res = await api.get('/api/compare');
      if (res.data.baseline) {
        setBaselineData(res.data.baseline);
        setHasBaseline(true);
      }
      if (res.data.lstm) {
        setLstmData(res.data.lstm);
      }
    } catch (error) {
      console.error('Gagal ambil data perbandingan:', error);
    }
  };

  useEffect(() => {
    fetchCompareData();
  }, []);

  // Jika baseline & lstm sudah tersedia, tampilkan perbandingan otomatis
  useEffect(() => {
    if (baselineData && lstmData) {
      setShowCompare(true);
    }
  }, [baselineData, lstmData]);

  const handleBaselineSaved = () => {
    fetchCompareData();
    setShowCompare(true);
  };

  const handleToggleCompare = () => {
    if (!hasBaseline) {
      alert('Simpan baseline TFT terlebih dahulu!');
      return;
    }
    setShowCompare((prev) => !prev);
  };

  // ---------- NARASI STATIS (Target Penelitian) ----------
  const renderNarasiTFT = () => (
    <div>
      <p className="text-sm text-gray-600 mt-1">
        Temporal Fusion Transformer (TFT) adalah model deep learning untuk peramalan deret waktu.
        Pada penelitian sebelumnya, TFT digunakan sebagai baseline dengan target MAPE 57.08% dan R² -0.07.
      </p>
      <div className="mt-2 text-sm">
        <p className="font-medium text-gray-700">Target Awal (Baseline):</p>
        <ul className="list-disc list-inside text-gray-600 space-y-0.5 ml-2">
          <li>MAPE: <strong>57.08%</strong></li>
          <li>RMSE: <strong>0.908</strong></li>
          <li>MAE: <strong>0.792</strong></li>
          <li>R²: <strong>-0.07</strong></li>
        </ul>
      </div>
    </div>
  );

  const renderNarasiLSTM = () => (
    <div>
      <p className="text-sm text-gray-600 mt-1">
        Long Short-Term Memory (LSTM) dengan optimasi hyperparameter menggunakan Optuna
        (Bayesian Optimization) dirancang untuk mengatasi kelemahan TFT.
        Target yang ingin dicapai adalah MAPE {'<'} 25% dan R² {'>'} 0.7.
      </p>
      <div className="mt-2 text-sm">
        <p className="font-medium text-gray-700">Target Penelitian:</p>
        <ul className="list-disc list-inside text-gray-600 space-y-0.5 ml-2">
          <li>MAPE: <strong>{'< 25%'}</strong></li>
          <li>R²: <strong>{'> 0.7'}</strong></li>
          <li>RMSE: <strong>{'< 0.5'}</strong> (target tambahan)</li>
          <li>MAE: <strong>{'< 0.4'}</strong> (target tambahan)</li>
        </ul>
      </div>
    </div>
  );

  // ---------- KESIMPULAN DINAMIS (Data Ril) ----------
  const renderKesimpulan = () => {
    if (!baselineData || !lstmData) {
      return (
        <p className="text-sm text-gray-500">
          Simpan baseline TFT dan lakukan training terlebih dahulu untuk melihat kesimpulan.
        </p>
      );
    }

    const mapeBase = parseFloat(baselineData.mape);
    const mapeLstm = parseFloat(lstmData.best_mape);
    const r2Base = parseFloat(baselineData.r2);
    const r2Lstm = parseFloat(lstmData.best_r2);
    const rmseLstm = lstmData.best_rmse ? parseFloat(lstmData.best_rmse) : null;
    const maeLstm = lstmData.best_mae ? parseFloat(lstmData.best_mae) : null;
    const trial = lstmData.trial_count || 5;

    const mapeImprovement = ((mapeBase - mapeLstm) / mapeBase) * 100;
    const r2Improvement = ((r2Lstm - r2Base) / Math.abs(r2Base || 0.01)) * 100;

    const isMapeTarget = mapeLstm < 25;
    const isR2Target = r2Lstm > 0.7;

    let kesimpulanText = '';

    if (isMapeTarget && isR2Target) {
      kesimpulanText = (
        <span className="text-green-700 font-semibold">
          Model LSTM dengan optimasi hyperparameter Optuna berhasil mengungguli baseline TFT
          secara signifikan pada seluruh metrik evaluasi. Capaian MAPE sebesar {mapeLstm.toFixed(2)}%
          (di bawah target 25%) dan R² sebesar {r2Lstm.toFixed(4)} (di atas target 0.7)
          menunjukkan bahwa pendekatan ini efektif untuk meningkatkan akurasi prediksi kekeruhan.
          Penurunan MAPE sebesar {mapeImprovement.toFixed(1)}% dan peningkatan R² sebesar{' '}
          {r2Improvement.toFixed(1)}% mengindikasikan bahwa optimasi hyperparameter dengan Optuna
          memberikan kontribusi positif yang substansial terhadap performa model.
        </span>
      );
    } else if (isMapeTarget) {
      kesimpulanText = (
        <span className="text-yellow-700 font-semibold">
          Model LSTM+Optuna berhasil mencapai target MAPE (&lt; 25%) dengan nilai{' '}
          {mapeLstm.toFixed(2)}% (turun {mapeImprovement.toFixed(1)}% dari baseline TFT).
          Namun, nilai R² sebesar {r2Lstm.toFixed(4)} masih di bawah target (&gt; 0.7).
          Hal ini mengindikasikan bahwa model masih perlu ditingkatkan dalam menjelaskan
          variabilitas data kekeruhan. Disarankan untuk melakukan penambahan jumlah trial optimasi
          atau penyesuaian arsitektur jaringan guna mencapai performa yang lebih optimal.
        </span>
      );
    } else if (isR2Target) {
      kesimpulanText = (
        <span className="text-yellow-700 font-semibold">
          Model LSTM+Optuna berhasil mencapai target R² (&gt; 0.7) dengan nilai{' '}
          {r2Lstm.toFixed(4)} (meningkat {r2Improvement.toFixed(1)}% dari baseline TFT).
          Namun, MAPE sebesar {mapeLstm.toFixed(2)}% masih di atas target (&lt; 25%).
          Hal ini menunjukkan bahwa model cukup baik dalam menangkap pola data, tetapi masih
          terdapat ruang untuk peningkatan akurasi prediksi pada nilai aktual. Diperlukan
          tuning hyperparameter lebih lanjut untuk menurunkan tingkat kesalahan prediksi.
        </span>
      );
    } else {
      kesimpulanText = (
        <span className="text-yellow-700 font-semibold">
          Model LSTM+Optuna menunjukkan peningkatan performa dibandingkan baseline TFT,
          dengan penurunan MAPE sebesar {mapeImprovement.toFixed(1)}% dan peningkatan R²
          sebesar {r2Improvement.toFixed(1)}%. Namun, secara keseluruhan target penelitian
          (MAPE &lt; 25% dan R² &gt; 0.7) belum tercapai secara bersamaan. Hal ini
          mengindikasikan bahwa optimasi dengan 5 trial yang dilakukan belum cukup untuk
          mencapai hasil yang optimal. Disarankan untuk melakukan training dengan jumlah
          trial yang lebih banyak guna memperluas ruang
          pencarian hyperparameter dan meningkatkan performa model secara menyeluruh.
        </span>
      );
    }

    return (
      <div className="space-y-4 text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Jumlah Trial Optimasi</p>
            <p className="text-lg font-bold text-gray-800">{trial} trial</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Status Pencapaian Target</p>
            <p className="text-sm font-medium">
              MAPE: <span className={isMapeTarget ? 'text-green-600 font-bold' : 'text-yellow-600 font-bold'}>
                {isMapeTarget ? 'Tercapai' : 'Belum Tercapai'}
              </span>
              {' | '}
              R²: <span className={isR2Target ? 'text-green-600 font-bold' : 'text-yellow-600 font-bold'}>
                {isR2Target ? 'Tercapai' : 'Belum Tercapai'}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <p>
            <strong>MAPE:</strong> TFT = {mapeBase.toFixed(2)}% → LSTM+Optuna = {mapeLstm.toFixed(2)}%
            <span className="text-green-600 font-semibold">
              {' '}(turun {mapeImprovement.toFixed(1)}%)
            </span>
            {isMapeTarget && <span className="ml-2 text-green-600 font-medium">[Target tercapai]</span>}
            {!isMapeTarget && <span className="ml-2 text-yellow-600 font-medium">[Target belum tercapai]</span>}
          </p>
          <p>
            <strong>R²:</strong> TFT = {r2Base.toFixed(4)} → LSTM+Optuna = {r2Lstm.toFixed(4)}
            <span className="text-green-600 font-semibold">
              {' '}(meningkat {r2Improvement.toFixed(1)}%)
            </span>
            {isR2Target && <span className="ml-2 text-green-600 font-medium">[Target tercapai]</span>}
            {!isR2Target && <span className="ml-2 text-yellow-600 font-medium">[Target belum tercapai]</span>}
          </p>
          {rmseLstm !== null && (
            <p>
              <strong>RMSE:</strong> TFT = {baselineData.rmse} → LSTM+Optuna = {rmseLstm.toFixed(4)}
              <span className="text-green-600 font-semibold">
                {' '}(turun {((parseFloat(baselineData.rmse) - rmseLstm) / parseFloat(baselineData.rmse) * 100).toFixed(1)}%)
              </span>
            </p>
          )}
          {maeLstm !== null && (
            <p>
              <strong>MAE:</strong> TFT = {baselineData.mae} → LSTM+Optuna = {maeLstm.toFixed(4)}
              <span className="text-green-600 font-semibold">
                {' '}(turun {((parseFloat(baselineData.mae) - maeLstm) / parseFloat(baselineData.mae) * 100).toFixed(1)}%)
              </span>
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700">Kesimpulan:</p>
          <div className="mt-1 text-sm leading-relaxed">{kesimpulanText}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Baseline & Perbandingan</h1>
          <span className="text-sm text-gray-500">Halo, {user?.username}</span>
        </div>

        {/* Target Penelitian (STATIS) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-3">Target Penelitian</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-800">TFT (Baseline)</h4>
              {renderNarasiTFT()}
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-bold text-green-800">LSTM + Optuna</h4>
              {renderNarasiLSTM()}
            </div>
          </div>
        </div>

        {/* Set Baseline */}
        <SetBaseline onSuccess={handleBaselineSaved} />

        {/* Tombol Lihat Perbandingan */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {hasBaseline
              ? 'Baseline TFT sudah tersimpan.'
              : 'Simpan baseline TFT terlebih dahulu untuk melihat perbandingan.'}
          </p>
          <button
            onClick={handleToggleCompare}
            disabled={!hasBaseline}
            className={`px-4 py-2 rounded-lg transition ${
              hasBaseline
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {showCompare ? 'Sembunyikan Perbandingan' : 'Lihat Perbandingan'}
          </button>
        </div>

        {/* Komponen Perbandingan (DINAMIS) */}
        {showCompare && <Compare />}

        {/* Kesimpulan (DINAMIS) */}
        {showCompare && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-3">Kesimpulan Perbandingan</h3>
            {renderKesimpulan()}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaselineComparePage;