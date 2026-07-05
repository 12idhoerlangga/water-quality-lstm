// src/components/admin/PendingResetRequests.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PendingResetRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/api/admin/reset-requests');
      setRequests(res.data);
    } catch (err) {
      toast.error('Gagal memuat request reset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcess = async (id) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setProcessingId(id);
    try {
      await api.post(`/api/admin/reset-requests/${id}/process`, { newPassword });
      toast.success('Password berhasil direset!');
      setNewPassword('');
      fetchRequests(); // Refresh daftar
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal proses request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Memuat...</div>;

  if (requests.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-2">Request Reset Password</h3>
        <p className="text-gray-500">Tidak ada request reset password pending.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Request Reset Password</h3>
      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{req.username}</p>
                <p className="text-xs text-gray-400">
                  Request: {new Date(req.requested_at).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-yellow-600 font-medium">Status: Pending</p>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="password"
                  placeholder="Password baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={() => handleProcess(req.id)}
                  disabled={processingId === req.id}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50"
                >
                  {processingId === req.id ? 'Memproses...' : 'Proses'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingResetRequests;