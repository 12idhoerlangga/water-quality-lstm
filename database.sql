-- ============================================================
-- DATABASE water_quality_lstm (FINAL DENGAN PERBAIKAN)
-- ============================================================

DROP DATABASE IF EXISTS water_quality_lstm;
CREATE DATABASE water_quality_lstm;
USE water_quality_lstm;

-- ============================================================
-- 1. TABEL locations
-- ============================================================
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. TABEL users
-- ============================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    location_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- ============================================================
-- 3. TABEL sensor_data
-- ============================================================
CREATE TABLE sensor_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    location_id INT NULL,
    temperature DECIMAL(10,2),
    salinity DECIMAL(10,2),
    ph DECIMAL(10,2),
    turbidity DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

CREATE INDEX idx_sensor_data_user_created ON sensor_data(user_id, created_at DESC);

-- ============================================================
-- 4. TABEL baseline_tft (KOSONG, diisi admin via form)
-- ============================================================
CREATE TABLE baseline_tft (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mape DECIMAL(10,2),
    rmse DECIMAL(10,4),
    mae DECIMAL(10,4),
    r2 DECIMAL(10,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. TABEL predictions
-- ============================================================
CREATE TABLE predictions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    location_id INT NULL,
    sensor_data_id INT NULL,
    prediction_json JSON NOT NULL,
    wqi_avg DECIMAL(10,2),
    risk_final VARCHAR(20),
    start_date DATETIME NULL,
    horizon INT DEFAULT 96,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY (sensor_data_id) REFERENCES sensor_data(id) ON DELETE SET NULL
);

CREATE INDEX idx_predictions_user_date ON predictions(user_id, start_date, horizon);

-- ============================================================
-- 6. TABEL training_log (DENGAN model_type)
-- ============================================================
CREATE TABLE training_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    model_type VARCHAR(20) DEFAULT 'asli',   -- 🔥 TAMBAHAN
    trial_count INT,
    best_mape DECIMAL(10,2),
    best_rmse DECIMAL(10,4),
    best_mae DECIMAL(10,4),
    best_r2 DECIMAL(10,4),
    hyperparams JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DATA AWAL (SEEDER)
-- ============================================================

INSERT INTO locations (name, description) VALUES 
('Tambak 1', 'Lokasi utama penelitian kualitas air laut');

INSERT INTO users (username, password, role, location_id) VALUES 
('admin', 'admin123', 'admin', 1),
('pembudidaya1', 'user123', 'user', 1);

-- baseline_tft dibiarkan kosong

-- Log training model ASLI (hasil 5 trial)
INSERT INTO training_log (model_type, trial_count, best_mape, best_rmse, best_mae, best_r2, hyperparams) VALUES 
('asli', 5, 23.41, 0.6768, 0.4198, 0.8054, '{"window":24,"units":169,"layers":1,"dropout":0.217,"lr":0.00232,"batch_size":64}');

-- (Opsional) Log training model MODIFIKASI nanti akan masuk sendiri setelah lo train

-- ============================================================
-- CEK DATA
-- ============================================================
SELECT '✅ Database water_quality_lstm siap!' AS Status;
SELECT COUNT(*) AS total_locations FROM locations;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_baseline FROM baseline_tft;
SELECT COUNT(*) AS total_training_log FROM training_log;
SELECT COUNT(*) AS total_sensor_data FROM sensor_data;