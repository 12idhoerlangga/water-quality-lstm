const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SALT_ROUNDS = 10;

// ============================================================
// KONEKSI DATABASE
// ============================================================
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error('❌ Gagal koneksi ke database:', err.message);
        process.exit(1);
    }
    console.log('✅ Database connected!');
});

// ============================================================
// MIDDLEWARE VERIFIKASI TOKEN
// ============================================================
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Invalid token:', error.message);
        res.status(403).json({ error: 'Invalid token' });
    }
};

// ============================================================
// ENDPOINT HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server running' });
});

// ============================================================
// ENDPOINT LOGIN
// ============================================================
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username dan password wajib diisi' });
        }
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            if (rows.length === 0) {
                return res.status(401).json({ error: 'Username atau password salah' });
            }
            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Username atau password salah' });
            }
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    location_id: user.location_id,
                    created_at: user.created_at
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ENDPOINT GET ALL USERS (HANYA ADMIN)
// ============================================================
app.get('/api/users', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak, hanya admin' });
        }
        const [rows] = await db.promise().query(`
            SELECT 
                id,
                username,
                role,
                location_id,
                created_at AS last_login
            FROM users
            ORDER BY id DESC
        `);
        const users = rows.map(user => ({
            id: user.id,
            username: user.username,
            email: `${user.username}@example.com`,
            role: user.role,
            status: 'Aktif',
            last_login: user.last_login ? new Date(user.last_login).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : '-'
        }));
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ENDPOINT REGISTER USER (PUBLIK + ADMIN DENGAN TOKEN)
// ============================================================
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, role = 'user', location_id = 1 } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username dan password wajib diisi' });
        }

        let isAdmin = false;
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.role === 'admin') {
                    isAdmin = true;
                }
            } catch (e) {
                // Token tidak valid, abaikan
            }
        }

        const finalRole = (isAdmin && (role === 'admin' || role === 'user')) ? role : 'user';

        const [existing] = await db.promise().query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username sudah digunakan' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await db.promise().query(
            'INSERT INTO users (username, password, role, location_id) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, finalRole, location_id]
        );
        res.json({ success: true, message: 'User berhasil ditambahkan' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ENDPOINT SET BASELINE TFT (ADMIN ONLY)
// ============================================================
app.post('/api/baseline', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak, hanya admin' });
        }
        const { mape, rmse, mae, r2 } = req.body;
        if ([mape, rmse, mae, r2].some(v => v === undefined || v === null)) {
            return res.status(400).json({ error: 'Semua field wajib diisi' });
        }
        await db.promise().query('DELETE FROM baseline_tft');
        await db.promise().query(
            'INSERT INTO baseline_tft (mape, rmse, mae, r2) VALUES (?, ?, ?, ?)',
            [mape, rmse, mae, r2]
        );
        res.json({ success: true, message: 'Baseline TFT berhasil disimpan' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ENDPOINT LIHAT PERBANDINGAN
// ============================================================
app.get('/api/compare', verifyToken, async (req, res) => {
    try {
        const [baselineRows] = await db.promise().query(
            'SELECT * FROM baseline_tft ORDER BY id DESC LIMIT 1'
        );
        const [lstmRows] = await db.promise().query(
            'SELECT trial_count, best_mape, best_rmse, best_mae, best_r2, hyperparams, created_at FROM training_log ORDER BY id DESC LIMIT 1'
        );
        res.json({
            baseline: baselineRows.length > 0 ? baselineRows[0] : null,
            lstm: lstmRows.length > 0 ? lstmRows[0] : null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ENDPOINT GET LOKASI
// ============================================================
app.get('/api/locations', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT id, name, description FROM locations ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// 🔥 ENDPOINT EDIT LOKASI (HANYA ADMIN) – DITAMBAHKAN
// ============================================================
app.put('/api/locations/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak, hanya admin' });
        }
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID tidak valid' });
        }
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Nama lokasi wajib diisi' });
        }
        const [result] = await db.promise().query(
            'UPDATE locations SET name = ?, description = ? WHERE id = ?',
            [name, description || null, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Lokasi tidak ditemukan' });
        }
        res.json({ success: true, message: 'Lokasi berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ENDPOINT TAMBAH LOKASI (HANYA ADMIN)
// ============================================================
app.post('/api/locations', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak, hanya admin' });
        }
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Nama lokasi wajib diisi' });
        }
        const [result] = await db.promise().query(
            'INSERT INTO locations (name, description) VALUES (?, ?)',
            [name, description || null]
        );
        res.json({
            success: true,
            message: 'Lokasi berhasil ditambahkan',
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ENDPOINT HAPUS LOKASI (HANYA ADMIN)
// ============================================================
app.delete('/api/locations/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak, hanya admin' });
        }
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID tidak valid' });
        }
        const [result] = await db.promise().query('DELETE FROM locations WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Lokasi tidak ditemukan' });
        }
        res.json({ success: true, message: 'Lokasi berhasil dihapus' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                error: 'Lokasi tidak dapat dihapus karena masih digunakan pada data prediksi atau pengguna.' 
            });
        }
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ENDPOINT PREDIKSI (DENGAN LOCATION_ID)
// ============================================================
app.post('/api/predict', verifyToken, async (req, res) => {
    // ... (kode yang sudah ada, tidak diubah) ...
});

// ============================================================
// ENDPOINT HISTORI PREDIKSI (DENGAN SORTING)
// ============================================================
app.get('/api/history', verifyToken, async (req, res) => {
    // ... (kode yang sudah ada, tidak diubah) ...
});

// ============================================================
// ENDPOINT PROFIL USER SENDIRI (GET /api/users/me)
// ============================================================
app.get('/api/users/me', verifyToken, async (req, res) => {
    // ... (kode yang sudah ada, tidak diubah) ...
});

// ============================================================
// ENDPOINT UPDATE PROFIL USER SENDIRI (PUT /api/users/me)
// ============================================================
app.put('/api/users/me', verifyToken, async (req, res) => {
    // ... (kode yang sudah ada, tidak diubah) ...
});

// ============================================================
// ENDPOINT UBAH PASSWORD (PUT /api/users/me/password)
// ============================================================
app.put('/api/users/me/password', verifyToken, async (req, res) => {
    // ... (kode yang sudah ada, tidak diubah) ...
});

// ============================================================
// ENDPOINT UPDATE USER (HANYA ADMIN)
// ============================================================
app.put('/api/users/:id', verifyToken, async (req, res) => {
    // ... (kode yang sudah ada, tidak diubah) ...
});

// ============================================================
// ENDPOINT HAPUS USER (HANYA ADMIN)
// ============================================================
app.delete('/api/users/:id', verifyToken, async (req, res) => {
    // ... (kode yang sudah ada, tidak diubah) ...
});

// ============================================================
// JALANKAN SERVER
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});