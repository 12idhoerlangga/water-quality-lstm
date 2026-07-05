// backend/update_hash.js
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
    if (err) throw err;
    console.log('✅ Connected');

    db.query('SELECT id, username, password FROM users', async (err, rows) => {
        if (err) throw err;
        for (const user of rows) {
            if (!user.password.startsWith('$2b$')) {
                const hashed = await bcrypt.hash(user.password, 10);
                await db.promise().query('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
                console.log(`✅ Password ${user.username} di-hash`);
            } else {
                console.log(`⏩ Password ${user.username} sudah hash, skip`);
            }
        }
        console.log('✅ Selesai!');
        db.end();
    });
});