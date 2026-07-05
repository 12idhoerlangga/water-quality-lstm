// src/components/admin/SetBaseline.jsx
import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const SetBaseline = ({ onSuccess }) => {
  const [form, setForm] = useState({ mape: '', rmse: '', mae: '', r2: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/baseline', {
        mape: parseFloat(form.mape),
        rmse: parseFloat(form.rmse),
        mae: parseFloat(form.mae),
        r2: parseFloat(form.r2),
      });
      toast.success('Baseline TFT berhasil disimpan!');
      setForm({ mape: '', rmse: '', mae: '', r2: '' });
      if (onSuccess) onSuccess(); // 🔥 Munculin tombol bandingkan
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal menyimpan baseline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Set Baseline TFT</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">MAPE (%)</label>
          <input
            type="number"
            step="0.01"
            name="mape"
            value={form.mape}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">RMSE</label>
          <input
            type="number"
            step="0.0001"
            name="rmse"
            value={form.rmse}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">MAE</label>
          <input
            type="number"
            step="0.0001"
            name="mae"
            value={form.mae}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">R²</label>
          <input
            type="number"
            step="0.01"
            name="r2"
            value={form.r2}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Baseline'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetBaseline;