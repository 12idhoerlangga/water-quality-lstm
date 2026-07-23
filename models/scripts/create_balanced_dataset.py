import pandas as pd
import numpy as np
import os
from sklearn.utils import resample

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'dataset_2022_2025.xlsx')
OUTPUT_PATH = os.path.join(BASE_DIR, 'data', 'dataset_balanced.xlsx')

# Fungsi WQI dan klasifikasi (threshold baru sesuai Haris & Permen LHK)
def calculate_wqi(values):
    weights = [0.2, 0.2, 0.3, 0.3]
    smin = [28, 33, 7, 0]
    smax = [32, 34, 8.5, 5]
    sideal = [30, 34, 7.75, 2.5]
    qi = []
    for i in range(4):
        score = (1 - abs(values[i] - sideal[i]) / (smax[i] - smin[i])) * 100
        qi.append(max(0, min(100, score)))
    return (qi[0]*weights[0] + qi[1]*weights[1] + qi[2]*weights[2] + qi[3]*weights[3])

def classify_risk(wqi):
    if wqi >= 76:
        return 'Rendah'
    elif wqi >= 51:
        return 'Sedang'
    else:
        return 'Tinggi'

# 1. Load data asli
print("Loading dataset asli...")
df = pd.read_excel(DATA_PATH)
data = df[['Temperature', 'Salinity', 'pH', 'Turbidity']].values

# 2. Hitung WQI dan risiko
wqi = [calculate_wqi(row) for row in data]
risk = [classify_risk(w) for w in wqi]

df_original = pd.DataFrame(data, columns=['Temperature', 'Salinity', 'pH', 'Turbidity'])
df_original['wqi'] = wqi
df_original['risk'] = risk

# 3. Pisahkan berdasarkan risiko
df_rendah = df_original[df_original['risk'] == 'Rendah']
df_sedang = df_original[df_original['risk'] == 'Sedang']
df_tinggi = df_original[df_original['risk'] == 'Tinggi']

print(f"Distribusi awal: Rendah={len(df_rendah)}, Sedang={len(df_sedang)}, Tinggi={len(df_tinggi)}")

# 4. Buat data Rendah sintetik jika tidak ada
if len(df_rendah) == 0:
    print("Tidak ada data Rendah. Membuat data sintetik dari Sedang terbaik...")
    # Ambil 5000 data Sedang dengan WQI tertinggi (mendekati 76)
    df_sedang_sorted = df_sedang.sort_values('wqi', ascending=False)
    top_sedang = df_sedang_sorted.head(5000).copy()
    
    # Modifikasi agar WQI naik menjadi ≥76
    top_sedang['Temperature'] += 3.0          # naikkan suhu
    top_sedang['Turbidity'] -= 0.5            # turunkan kekeruhan
    top_sedang['pH'] += 0.2                   # naikkan pH sedikit
    
    # Hitung ulang WQI
    top_sedang['wqi'] = top_sedang[['Temperature', 'Salinity', 'pH', 'Turbidity']].apply(
        lambda row: calculate_wqi(row.values), axis=1
    )
    # Pastikan WQI ≥ 76 (threshold baru)
    top_sedang = top_sedang[top_sedang['wqi'] >= 76]
    top_sedang['risk'] = 'Rendah'
    df_rendah = top_sedang
    print(f"Data Rendah sintetik berhasil dibuat: {len(df_rendah)} baris")

# Jika tetap tidak ada, buat dari nol dengan parameter ideal
if len(df_rendah) == 0:
    print("Membuat data Rendah dari parameter ideal...")
    ideal_data = []
    for _ in range(5000):
        # Suhu di 28-30, salinitas 32-34, pH 7.8-8.2, kekeruhan 0.5-1.5
        row = [
            np.random.uniform(28, 30),
            np.random.uniform(32, 34),
            np.random.uniform(7.8, 8.2),
            np.random.uniform(0.5, 1.5)
        ]
        w = calculate_wqi(row)
        if w >= 76:  # threshold baru
            ideal_data.append(row + [w, 'Rendah'])
    df_rendah = pd.DataFrame(ideal_data, columns=['Temperature', 'Salinity', 'pH', 'Turbidity', 'wqi', 'risk'])
    print(f"Data Rendah dari parameter ideal: {len(df_rendah)} baris")

# 5. Tentukan target jumlah per kelas (30.000)
target_count = 30000

# 6. Oversample masing-masing kelas
df_rendah_resampled = resample(df_rendah, replace=True, n_samples=target_count, random_state=42)
df_sedang_resampled = resample(df_sedang, replace=True, n_samples=target_count, random_state=42)
df_tinggi_resampled = resample(df_tinggi, replace=True, n_samples=target_count, random_state=42)

# 7. Gabungkan dan acak
df_balanced = pd.concat([df_rendah_resampled, df_sedang_resampled, df_tinggi_resampled], ignore_index=True)
df_balanced = df_balanced.sample(frac=1, random_state=42).reset_index(drop=True)

# 8. Simpan (hanya parameter, tanpa kolom risk/wqi, karena LSTM hanya butuh parameter)
# Tapi kita simpan juga wqi dan risk untuk referensi (opsional)
df_balanced[['Temperature', 'Salinity', 'pH', 'Turbidity', 'wqi', 'risk']].to_excel(OUTPUT_PATH, index=False)
print(f"\nDataset balanced disimpan ke {OUTPUT_PATH}")
print(f"Total data: {len(df_balanced)}")
print("\nDistribusi:")
print(df_balanced['risk'].value_counts())
print("\nPersentase:")
print((df_balanced['risk'].value_counts() / len(df_balanced) * 100).round(2))