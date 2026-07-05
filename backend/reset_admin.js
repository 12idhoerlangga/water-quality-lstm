// backend/reset_admin.js
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect(async (err) => {
    if (err) {
        console.error('❌ Gagal koneksi ke database:', err.message);
        process.exit(1);
    }
    console.log('✅ Terhubung ke database');

    const newPassword = 'admin123'; // Ganti sesuai keinginan
    const hashed = await bcrypt.hash(newPassword, 10);

    db.query('UPDATE users SET password = ? WHERE username = ?', [hashed, 'admin'], (err, result) => {
        if (err) {
            console.error('❌ Gagal update password:', err.message);
            process.exit(1);
        }
        if (result.affectedRows === 0) {
            console.log('⚠️ User "admin" tidak ditemukan.');
        } else {
            console.log(`✅ Password admin berhasil direset menjadi: ${newPassword}`);
        }
        db.end();
    });
});

// cd backend
// node reset_admin.js