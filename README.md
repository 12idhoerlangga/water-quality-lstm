## ✅ README.md – Revisi Sesuai Kondisi Terkini

Saya sesuaikan README.md dengan **kondisi real proyek saat ini** (backend 100% siap, frontend dalam pengembangan). Perubahan utama:

- Endpoint `/api/report` dihapus (karena PDF akan dibuat di frontend).
- Endpoint `/api/set-baseline` diperbaiki menjadi `/api/baseline`.
- Struktur folder disesuaikan (Python scripts ada di `models/scripts/`).
- Dependencies frontend diperbaiki (React 18, Tailwind, dll).
- Menambahkan penjelasan bahwa training offline.
- Panduan menjalankan sistem lebih jelas.

---

### 📁 `README.md` (Final)

````markdown
# Water Quality LSTM

Sistem peramalan risiko kualitas air laut pada budidaya ikan kerapu cantang di Kampung Madong menggunakan model **Long Short-Term Memory (LSTM) multi-target** dengan optimasi hyperparameter menggunakan **Optuna (Bayesian Optimization)**.

---

## 📌 Deskripsi Proyek

Sistem ini dirancang untuk memprediksi **4 parameter kualitas air laut** (suhu, pH, salinitas, kekeruhan) secara simultan dengan **horizon 1 hari ke depan**. Model LSTM multi-target dilatih menggunakan dataset historis kualitas air laut (2022–2025) dengan optimasi hyperparameter menggunakan Optuna.

**Fitur utama:**
- ✅ Prediksi 4 parameter kualitas air laut secara simultan (multi-target)
- ✅ Perbandingan performa dengan baseline TFT (MAPE 57,08%)
- ✅ Target utama: MAPE kekeruhan < 25% (tercapai pada 5 trial)
- ✅ Website interaktif untuk Admin dan Pembudidaya

**Status pengembangan:**
- 🔹 **Backend** – 100% selesai (semua endpoint berfungsi)
- 🔹 **Database** – 100% selesai (MySQL)
- 🔹 **Frontend** – Sedang dalam pengembangan (React + Tailwind)
- 🔹 **Model LSTM** – Selesai (5 trial, MAPE 23.41%)

---

## 🛠️ Teknologi yang Digunakan

### Backend
| Komponen | Teknologi |
|----------|-----------|
| Runtime | Node.js (v25+) |
| Framework | Express.js (v5) |
| Database Driver | MySQL2 (v3) |
| Autentikasi | JWT + Bcrypt |
| Read Excel | XLSX (v0.18) |
| Integrasi Python | Child Process (exec) |

### Frontend (dalam pengembangan)
| Komponen | Teknologi |
|----------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |
| Grafik | Chart.js + react-chartjs-2 |

### Machine Learning (Python)
| Komponen | Teknologi |
|----------|-----------|
| Framework ML | TensorFlow 2.18 |
| Optimasi Hyperparameter | Optuna (TPE Sampler) |
| Analisis Data | Pandas, NumPy |
| Normalisasi & Evaluasi | Scikit-learn |
| Visualisasi | Matplotlib |

---

## 📁 Struktur Folder

```
Water Quality LSTM/
├── backend/                     # Backend API (Node.js + Express)
│   ├── .env                     # Konfigurasi environment
│   ├── index.js                 # Entry point server
│   └── package.json             # Dependencies backend
├── frontend/                    # Frontend (React + Vite) - dalam pengembangan
│   ├── src/                     # Source code React
│   ├── index.html               # Entry point HTML
│   └── package.json             # Dependencies frontend
├── models/                      # Model hasil training & scripts Python
│   ├── lstm_model.h5            # Model LSTM multi-target terbaik
│   ├── scaler.pkl               # Objek normalisasi (MinMaxScaler)
│   └── scripts/                 # Script Python
│       ├── train_model.py       # Training LSTM + Optuna (offline)
│       └── predict.py           # Prediksi recursive (dipanggil backend)
├── data/                        # Dataset
│   └── dataset_2022_2025.xlsx   # Dataset historis (110.874 baris)
├── venv/                        # Python virtual environment
├── database.sql                 # Skrip SQL untuk setup database
├── requirements.txt             # Python dependencies
├── README.md                    # Dokumentasi proyek
└── .gitignore                   # Git ignore
```

---

## 🚀 Cara Menjalankan Sistem

### 1. Clone / Masuk ke Folder Proyek

```bash
cd "/Applications/XAMPP/xamppfiles/htdocs/Water Quality LSTM"
```

---

### 2. Aktifkan Virtual Environment Python

```bash
source venv/bin/activate
```

---

### 3. Setup Database (MySQL)

Pastikan MySQL (XAMPP/MAMP) berjalan, lalu jalankan:

```bash
mysql -u root -p < database.sql
```

**Konfigurasi `.env` di `backend/`:**

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=water_quality_lstm
DB_PORT=3306
JWT_SECRET=rahasia123
```

---

### 4. Letakkan Dataset

Pastikan file dataset (Excel) diletakkan di folder `data/` dengan nama:

```
data/dataset_2022_2025.xlsx
```

**Kolom yang dibutuhkan:** `Temperature`, `Salinity`, `pH`, `Turbidity`

---

### 5. Jalankan Training Model (Offline) – Opsional

> **Catatan:** Training sudah dilakukan (5 trial, MAPE 23.41%). Jalankan hanya jika ingin training ulang.

```bash
cd models/scripts
python train_model.py
cd ../..
```

Proses ini memakan waktu sekitar 1 jam (5 trial) atau 2-3 jam (40 trial). Model akan tersimpan di:

- `models/lstm_model.h5`
- `models/scaler.pkl`

---

### 6. Jalankan Backend

```bash
cd backend
npm install
npm run server
```

Backend akan berjalan di: **http://localhost:5000**

**Endpoint yang tersedia:**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/health` | Cek status server |
| POST | `/api/login` | Login user (return JWT token) |
| POST | `/api/register` | Tambah user (hanya Admin) |
| POST | `/api/baseline` | Set baseline TFT (Admin) |
| GET | `/api/compare` | Lihat perbandingan LSTM vs TFT |
| POST | `/api/predict` | Prediksi 4 parameter (wajib token) |
| GET | `/api/history` | Riwayat prediksi user |

---

### 7. Jalankan Frontend (Sedang Dikembangkan)

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di: **http://localhost:5173**

---

## 🔧 Dependencies

### Python (`requirements.txt`)

```txt
tensorflow==2.18.0
optuna==4.9.0
pandas==3.0.3
numpy==2.4.6
scikit-learn==1.9.0
matplotlib==3.10.9
openpyxl==3.1.5
joblib==1.4.2
```

### Node.js (Backend)

```json
{
  "express": "^5.2.1",
  "cors": "^2.8.6",
  "mysql2": "^3.22.5",
  "dotenv": "^17.4.2",
  "bcrypt": "^6.0.0",
  "jsonwebtoken": "^9.0.3",
  "xlsx": "^0.18.5",
  "nodemon": "^3.1.14"
}
```

### Node.js (Frontend – dalam pengembangan)

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.22.0",
  "axios": "^1.6.0",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "vite": "^5.0.0",
  "tailwindcss": "^3.4.0"
}
```

---

## 📊 Hasil Model (5 Trial)

| Metrik | TFT (Baseline) | LSTM + Optuna | Peningkatan |
|--------|----------------|---------------|-------------|
| **MAPE Kekeruhan** | 57.08% | **23.41%** | ✅ Turun 59% |
| **R² Kekeruhan** | -0.07 | **0.8054** | ✅ Naik signifikan |
| **RMSE** | 0.908 | **0.6768** | ✅ Turun 25.5% |
| **MAE** | 0.792 | **0.4198** | ✅ Turun 47% |

**Target MAPE < 25% tercapai!** ✅

---

## 📝 Catatan Penting

- Training dilakukan **offline** (terpisah dari website) untuk menghindari load berlebih.
- Model LSTM memprediksi **4 parameter secara simultan** (multi-target).
- **Horizon prediksi:** 1 hari ke depan (96 langkah, interval 15 menit).
- **Backend** sudah 100% siap dengan autentikasi JWT + bcrypt.
- **Frontend** sedang dalam pengembangan (React + Tailwind + Chart.js).

---

## 📧 Kontributor

**Ridho Erlangga** – Teknik Informatika

© 2026 Water Quality LSTM – Skripsi
````

---

### ✅ Perubahan yang Dilakukan

| Sebelumnya | Sekarang |
|------------|----------|
| Endpoint `/api/set-baseline` | ✅ `/api/baseline` |
| Endpoint `/api/report` | ❌ Dihapus (PDF di frontend) |
| Struktur `scripts/` | ✅ `models/scripts/` |
| React versi 19.2.7 | ✅ React 18.3.1 |
| Deskripsi proyek umum | ✅ Tambahan status pengembangan |
| Panduan training | ✅ Diperjelas bahwa training offline |
| Daftar endpoint | ✅ Lengkap & sesuai implementasi |

---

### 🚀 Sekarang README.md Sudah Akurat!

Simpan file ini di root proyek (`Water Quality LSTM/README.md`). Jika ada yang perlu ditambahkan lagi, beri tahu saya! 😊