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
        console.error('Gagal koneksi ke database:', err.message);
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
        console.log('🔍 Token decoded:', decoded);
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
// ENDPOINT HAPUS LOKASI (HANYA ADMIN) 🔥 DITAMBAHKAN
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
        // Tangani foreign key constraint
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
    try {
        const { suhu, ph, salinitas, kekeruhan, startDate, horizon, location_id } = req.body;
        const finalHorizon = horizon || 96;
        const userId = req.user.id;

        if ([suhu, ph, salinitas, kekeruhan].some(v => v === undefined || v === null)) {
            return res.status(400).json({ error: 'Semua parameter wajib diisi' });
        }

        db.query(
            'SELECT temperature, salinity, ph, turbidity FROM sensor_data ORDER BY created_at DESC LIMIT 26',
            (err, rows) => {
                if (err) console.warn('Gagal ambil dari database:', err.message);
                
                let historyData = rows.map(row => [row.temperature, row.salinity, row.ph, row.turbidity]);

                if (historyData.length < 26) {
                    const excelPath = path.resolve(__dirname, '..', 'data', 'dataset_2022_2025.xlsx');
                    if (!fs.existsSync(excelPath)) {
                        return res.status(500).json({ error: 'File dataset tidak ditemukan: ' + excelPath });
                    }
                    const workbook = XLSX.readFile(excelPath);
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const data = XLSX.utils.sheet_to_json(sheet);
                    const needed = 26 - historyData.length;
                    const excelRows = data.slice(-needed).map(row => [
                        row.Temperature || row.suhu || row.temperature,
                        row.Salinity || row.salinitas || row.salinity,
                        row.pH || row.ph || row.PH,
                        row.Turbidity || row.kekeruhan || row.turbidity
                    ]);
                    historyData = [...excelRows, ...historyData];
                }

                const inputData = [
                    ...historyData,
                    [parseFloat(suhu), parseFloat(salinitas), parseFloat(ph), parseFloat(kekeruhan)]
                ];

                const tempDir = '/tmp';
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const tempFile = path.join(tempDir, `input_${Date.now()}.json`);
                fs.writeFileSync(tempFile, JSON.stringify(inputData));

                const pythonScript = path.resolve(__dirname, '..', 'models', 'scripts', 'predict.py');
                if (!fs.existsSync(pythonScript)) {
                    fs.unlinkSync(tempFile);
                    return res.status(500).json({ error: 'File predict.py tidak ditemukan: ' + pythonScript });
                }
                const pythonExec = path.resolve(__dirname, '..', 'venv', 'bin', 'python');
                const pythonCmd = fs.existsSync(pythonExec) ? pythonExec : 'python';

                let cmd = `"${pythonCmd}" "${pythonScript}" --json --data "${tempFile}"`;
                if (startDate) cmd += ` --start-date ${startDate}`;
                if (finalHorizon) cmd += ` --horizon ${finalHorizon}`;
                console.log('Executing:', cmd);

                exec(cmd, (error, stdout, stderr) => {
                    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                    if (error) {
                        console.error('Error predict.py:', error.message);
                        console.error('stderr:', stderr);
                        return res.status(500).json({ error: 'Gagal memanggil model: ' + error.message });
                    }
                    try {
                        const result = JSON.parse(stdout);
                        if (result.status === 'success') {
                            const wqiAvg = result.data.reduce((sum, item) => sum + item.wqi, 0) / result.data.length;
                            const riskFinal = result.data[result.data.length - 1].risk;

                            db.query(
                                `INSERT INTO sensor_data (user_id, location_id, temperature, salinity, ph, turbidity) 
                                 VALUES (?, ?, ?, ?, ?, ?)`,
                                [userId, location_id || null, suhu, salinitas, ph, kekeruhan],
                                (err, insertResult) => {
                                    const sensorDataId = insertResult ? insertResult.insertId : null;
                                    const query = `INSERT INTO predictions 
                                        (user_id, location_id, sensor_data_id, prediction_json, wqi_avg, risk_final, start_date, horizon) 
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                                    const values = [
                                        userId,
                                        location_id || null,
                                        sensorDataId,
                                        JSON.stringify(result.data),
                                        wqiAvg,
                                        riskFinal,
                                        startDate || null,
                                        finalHorizon
                                    ];
                                    db.query(query, values, (err) => {
                                        if (err) console.warn('Gagal simpan prediksi:', err.message);
                                    });
                                }
                            );

                            res.json(result);
                        } else {
                            res.status(500).json({ error: result.message || 'Prediksi gagal' });
                        }
                    } catch (parseError) {
                        console.error('Gagal parse JSON:', parseError.message);
                        console.error('stdout:', stdout);
                        res.status(500).json({ error: 'Gagal parse output JSON' });
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ENDPOINT HISTORI PREDIKSI (DENGAN SORTING)
// ============================================================
app.get('/api/history', verifyToken, async (req, res) => {
    try {
        const { start_date, horizon, limit = 10, order = 'DESC' } = req.query;
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        let query = `
            SELECT p.*, u.username 
            FROM predictions p 
            LEFT JOIN users u ON p.user_id = u.id
        `;
        const params = [];

        if (req.user.role !== 'admin') {
            query += ' WHERE p.user_id = ?';
            params.push(req.user.id);
        }

        let hasWhere = query.includes('WHERE');
        if (start_date) {
            query += hasWhere ? ' AND' : ' WHERE';
            query += ' DATE(p.start_date) = ?';
            params.push(start_date);
            hasWhere = true;
        }
        if (horizon) {
            query += hasWhere ? ' AND' : ' WHERE';
            query += ' p.horizon = ?';
            params.push(parseInt(horizon));
        }

        query += ` ORDER BY p.created_at ${sortOrder} LIMIT ?`;
        params.push(parseInt(limit));

        const [rows] = await db.promise().query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ENDPOINT PROFIL USER SENDIRI (GET /api/users/me)
// ============================================================
app.get('/api/users/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('📥 GET /users/me - userId:', userId);
        const [rows] = await db.promise().query(
            'SELECT id, username, role, location_id, created_at FROM users WHERE id = ?',
            [userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('❌ Error GET /users/me:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ENDPOINT UPDATE PROFIL USER SENDIRI (PUT /api/users/me)
// ============================================================
app.put('/api/users/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('📤 PUT /users/me - userId:', userId);
        console.log('📦 Raw Payload:', req.body);

        if (!userId) {
            return res.status(400).json({ error: 'ID user tidak ditemukan dalam token' });
        }

        let { username, location_id } = req.body;

        if (username) {
            username = username.trim();
        }

        if (!username) {
            return res.status(400).json({ error: 'Username wajib diisi' });
        }

        const [existing] = await db.promise().query(
            'SELECT id FROM users WHERE username = ? AND id != ?',
            [username, userId]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username sudah digunakan oleh user lain' });
        }

        let query = 'UPDATE users SET username = ?';
        const params = [username];

        if (location_id !== undefined && location_id !== null) {
            const locId = parseInt(location_id);
            if (isNaN(locId)) {
                return res.status(400).json({ error: 'location_id tidak valid' });
            }
            query += ', location_id = ?';
            params.push(locId);
        }

        query += ' WHERE id = ?';
        params.push(userId);

        console.log('🔄 Query:', query);
        console.log('📊 Params:', params);

        const [result] = await db.promise().query(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        res.json({ success: true, message: 'Profil berhasil diperbarui' });
    } catch (error) {
        console.error('❌ Error update profil:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// ============================================================
// ENDPOINT UBAH PASSWORD (PUT /api/users/me/password)
// ============================================================
app.put('/api/users/me/password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Semua field wajib diisi' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password minimal 6 karakter' });
        }

        const [rows] = await db.promise().query(
            'SELECT password FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Password saat ini salah' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await db.promise().query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({ success: true, message: 'Password berhasil diubah' });
    } catch (error) {
        console.error('❌ Error ubah password:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ENDPOINT UPDATE USER (HANYA ADMIN)
// ============================================================
app.put('/api/users/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak, hanya admin' });
        }

        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'ID tidak valid' });
        }

        const { username, role, location_id, password } = req.body;

        if (!username || !role) {
            return res.status(400).json({ error: 'Username dan role wajib diisi' });
        }

        const [existing] = await db.promise().query(
            'SELECT id FROM users WHERE username = ? AND id != ?',
            [username, userId]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username sudah digunakan oleh user lain' });
        }

        let query = 'UPDATE users SET username = ?, role = ?, location_id = ?';
        const params = [username, role, location_id || 1];

        if (password && password.trim() !== '') {
            if (password.length < 6) {
                return res.status(400).json({ error: 'Password minimal 6 karakter' });
            }
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(userId);

        const [result] = await db.promise().query(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        res.json({ success: true, message: 'User berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ENDPOINT HAPUS USER (HANYA ADMIN)
// ============================================================
app.delete('/api/users/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak, hanya admin' });
        }
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'ID tidak valid' });
        }
        if (userId === req.user.id) {
            return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri' });
        }
        const [result] = await db.promise().query('DELETE FROM users WHERE id = ?', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }
        res.json({ success: true, message: 'User berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// JALANKAN SERVER
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});