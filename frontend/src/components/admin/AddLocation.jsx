// src/components/admin/AddLocation.jsx
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MapPin, FileText, PlusCircle, Info, Trash2, Edit, X } from 'lucide-react';

const AddLocation = ({ onLocationAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [fetching, setFetching] = useState(false);

  // ===== STATE EDIT =====
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // ===== FETCH LOKASI =====
  const fetchLocations = async () => {
    setFetching(true);
    try {
      const res = await api.get('/api/locations');
      setLocations(res.data);
    } catch (err) {
      toast.error('Gagal memuat daftar lokasi');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // ===== TAMBAH LOKASI =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama lokasi wajib diisi');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/locations', { name, description });
      toast.success('Lokasi berhasil ditambahkan!');
      setName('');
      setDescription('');
      fetchLocations();
      if (onLocationAdded) onLocationAdded();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menambah lokasi');
    } finally {
      setLoading(false);
    }
  };

  // ===== HAPUS LOKASI =====
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus lokasi "${name}"?`)) return;
    try {
      await api.delete(`/api/locations/${id}`);
      toast.success(`Lokasi "${name}" berhasil dihapus`);
      fetchLocations();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus lokasi');
    }
  };

  // ===== EDIT LOKASI =====
  const openEditModal = (loc) => {
    setEditingLocation({
      id: loc.id,
      name: loc.name,
      description: loc.description || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingLocation.name.trim()) {
      toast.error('Nama lokasi wajib diisi');
      return;
    }
    setEditLoading(true);
    try {
      await api.put(`/api/locations/${editingLocation.id}`, {
        name: editingLocation.name,
        description: editingLocation.description,
      });
      toast.success('Lokasi berhasil diperbarui!');
      setEditModalOpen(false);
      fetchLocations();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui lokasi');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== CARD FORM TAMBAH LOKASI ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MapPin className="w-6 h-6 text-[#1a3a5c]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Form Tambah Lokasi Baru</h2>
            <p className="text-sm text-gray-500">
              Isi data lokasi tambak atau kolam baru untuk pemantauan
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lokasi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                placeholder="Contoh: Tambak Utara, Kolam 3, dll."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] transition"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi (opsional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="description"
                type="text"
                placeholder="Misal: Lokasi dekat muara, kedalaman 3m"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] transition"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Deskripsi opsional untuk informasi tambahan lokasi
            </p>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Informasi:</span> Lokasi yang berhasil ditambahkan akan langsung tersimpan ke dalam database dan dapat dipilih pada menu <span className="font-medium">Prediksi</span> serta tercatat di <span className="font-medium">Riwayat</span>.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Pastikan nama lokasi unik agar tidak tertukar dengan tambak lain.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#1a3a5c] hover:bg-[#0f2a44] text-white font-medium py-2.5 px-6 rounded-lg transition disabled:opacity-50"
            >
              <PlusCircle className="w-5 h-5" />
              {loading ? 'Menyimpan...' : 'Tambah Lokasi'}
            </button>
          </div>
        </form>
      </div>

      {/* ===== DAFTAR LOKASI ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Daftar Lokasi</h3>
          <span className="text-sm text-gray-500">{locations.length} lokasi</span>
        </div>

        {fetching ? (
          <div className="text-center py-4 text-gray-500">Memuat...</div>
        ) : locations.length === 0 ? (
          <div className="text-center py-4 text-gray-400">Belum ada lokasi terdaftar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-2 font-semibold">Nama</th>
                  <th className="px-4 py-2 font-semibold">Deskripsi</th>
                  <th className="px-4 py-2 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-2 font-medium text-gray-800">{loc.name}</td>
                    <td className="px-4 py-2 text-gray-500">{loc.description || '-'}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => openEditModal(loc)}
                        className="text-blue-500 hover:text-blue-700 transition"
                        title="Edit lokasi"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc.id, loc.name)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Hapus lokasi"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== MODAL EDIT LOKASI ===== */}
      {editModalOpen && editingLocation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Edit Lokasi</h3>
            <p className="text-sm text-gray-500 mb-6">Ubah data lokasi yang dipilih.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingLocation.name}
                  onChange={(e) =>
                    setEditingLocation({ ...editingLocation, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi (opsional)
                </label>
                <input
                  type="text"
                  value={editingLocation.description || ''}
                  onChange={(e) =>
                    setEditingLocation({ ...editingLocation, description: e.target.value })
                  }
                  placeholder="Misal: Lokasi dekat muara, kedalaman 3m"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] outline-none transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2 bg-[#1a3a5c] hover:bg-[#0f2a44] text-white rounded-lg transition disabled:opacity-50"
                >
                  {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddLocation;