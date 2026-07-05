// src/components/admin/AddUser.jsx
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Users, Shield, UserCog, CheckCircle, PlusCircle, Trash2, Edit, X } from 'lucide-react';

const AddUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'user',
    location_id: 1,
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      toast.error('Username dan password wajib diisi');
      return;
    }
    setFormLoading(true);
    try {
      await api.post('/api/register', {
        username: form.username,
        password: form.password,
        role: form.role,
        location_id: 1,
      });
      toast.success('User berhasil ditambahkan!', { id: 'add-user-success' });
      setForm({ username: '', password: '', role: 'user', location_id: 1 });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menambah user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Yakin ingin menghapus user "${username}"?`)) return;
    try {
      await api.delete(`/api/users/${userId}`);
      toast.success(`User "${username}" berhasil dihapus`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus user');
    }
  };

  const openEditModal = (user) => {
    setEditingUser({
      id: user.id,
      username: user.username,
      role: user.role,
      location_id: user.location_id || 1,
      password: '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser.username.trim()) {
      toast.error('Username wajib diisi');
      return;
    }
    setEditLoading(true);
    try {
      const payload = {
        username: editingUser.username,
        role: editingUser.role,
        location_id: editingUser.location_id || 1,
      };
      if (editingUser.password && editingUser.password.trim() !== '') {
        if (editingUser.password.length < 6) {
          toast.error('Password minimal 6 karakter');
          setEditLoading(false);
          return;
        }
        payload.password = editingUser.password;
      }

      await api.put(`/api/users/${editingUser.id}`, payload);
      toast.success('User berhasil diperbarui!', { id: 'edit-user-success' });
      setEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui user');
    } finally {
      setEditLoading(false);
    }
  };

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;
  const activeCount = users.length;

  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-2 bg-blue-50 rounded-lg"><Users className="w-6 h-6 text-[#1a3a5c]" /></div>
          <div><p className="text-sm text-gray-500">Total Pengguna</p><p className="text-2xl font-bold text-gray-800">{totalUsers}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-2 bg-purple-50 rounded-lg"><Shield className="w-6 h-6 text-purple-600" /></div>
          <div><p className="text-sm text-gray-500">Administrator</p><p className="text-2xl font-bold text-gray-800">{adminCount}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-2 bg-green-50 rounded-lg"><UserCog className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-sm text-gray-500">Operator</p><p className="text-2xl font-bold text-gray-800">{userCount}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle className="w-6 h-6 text-emerald-600" /></div>
          <div><p className="text-sm text-gray-500">Status Aktif</p><p className="text-2xl font-bold text-gray-800">{activeCount}</p></div>
        </div>
      </div>

      {/* FORM TAMBAH USER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg"><PlusCircle className="w-5 h-5 text-[#1a3a5c]" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Tambah User Baru</h3>
            <p className="text-sm text-gray-500">Isi data user baru untuk memberikan akses ke sistem</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
            <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Masukkan username" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] outline-none transition" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Masukkan password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] outline-none transition" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] outline-none transition">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="md:col-span-2 flex flex-col sm:flex-row justify-end">
            <button
              type="submit"
              disabled={formLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1a3a5c] hover:bg-[#0f2a44] text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50"
            >
              <PlusCircle className="w-5 h-5" /> {formLoading ? 'Menyimpan...' : 'Tambah User'}
            </button>
          </div>
        </form>
      </div>

      {/* TABEL USER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-md font-semibold text-gray-800">Daftar Pengguna</h3>
          <p className="text-sm text-gray-500">Menampilkan {users.length} dari {users.length} data</p>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-600">
                  <th className="px-6 py-3 font-semibold">USERNAME</th>
                  <th className="px-6 py-3 font-semibold">ROLE</th>
                  <th className="px-6 py-3 font-semibold">STATUS</th>
                  <th className="px-6 py-3 font-semibold">LOGIN TERAKHIR</th>
                  <th className="px-6 py-3 font-semibold text-center">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-6 text-gray-400">Belum ada user terdaftar</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                      <td className="px-6 py-3 font-medium text-gray-800">{user.username}</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role === 'admin' ? 'Administrator' : 'Operator'}
                        </span>
                      </td>
                      <td className="px-6 py-3"><span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">Aktif</span></td>
                      <td className="px-6 py-3 text-gray-500">{user.last_login || '-'}</td>
                      <td className="px-6 py-3 text-center space-x-2">
                        <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition">
                          <Edit className="w-4 h-4 inline" /> Edit
                        </button>
                        <button onClick={() => handleDelete(user.id, user.username)} className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition">
                          <Trash2 className="w-4 h-4 inline" /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL EDIT USER */}
      {editModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Edit User</h3>
            <p className="text-sm text-gray-500 mb-6">Ubah data pengguna yang dipilih.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] outline-none transition"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru <span className="text-xs text-gray-400">(kosongkan jika tidak diubah)</span>
                </label>
                <input
                  type="password"
                  placeholder="Masukkan password baru (opsional)"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-[#1a3a5c] outline-none transition"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditModalOpen(false)} className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  Batal
                </button>
                <button type="submit" disabled={editLoading} className="w-full sm:w-auto px-6 py-2 bg-[#1a3a5c] hover:bg-[#0f2a44] text-white rounded-lg transition disabled:opacity-50">
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

export default AddUser;