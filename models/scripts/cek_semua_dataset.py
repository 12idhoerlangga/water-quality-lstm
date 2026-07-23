import pandas as pd
import numpy as np
import os
from sklearn.utils import resample

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'dataset_2022_2025.xlsx')
BALANCED_PATH = os.path.join(BASE_DIR, 'data', 'dataset_balanced.xlsx')

# ============================================================
# FUNGSI WQI & KLASIFIKASI
# ============================================================
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

def get_distribution(df):
    """Mengembalikan dictionary jumlah per kategori"""
    dist = df['risk'].value_counts()
    return {
        'Rendah': dist.get('Rendah', 0),
        'Sedang': dist.get('Sedang', 0),
        'Tinggi': dist.get('Tinggi', 0)
    }

# ============================================================
# 1. DATASET ASLI
# ============================================================
print("\n" + "=" * 70)
print("MEMPROSES DATASET...")
print("=" * 70)

df_original = pd.read_excel(DATA_PATH)
data_array = df_original[['Temperature', 'Salinity', 'pH', 'Turbidity']].values
wqi_orig = [calculate_wqi(row) for row in data_array]
df_original['wqi'] = wqi_orig
df_original['risk'] = [classify_risk(w) for w in wqi_orig]
dist_orig = get_distribution(df_original)
total_orig = len(df_original)

# ============================================================
# 2. DATASET FILTERED (OUTLIER 3 STD)
# ============================================================
mask = np.ones(len(data_array), dtype=bool)
for i in range(4):
    mean = data_array[:, i].mean()
    std = data_array[:, i].std()
    mask &= (data_array[:, i] >= mean - 3*std) & (data_array[:, i] <= mean + 3*std)

filtered_data = data_array[mask]
wqi_filt = [calculate_wqi(row) for row in filtered_data]
df_filtered = pd.DataFrame(filtered_data, columns=['Temperature', 'Salinity', 'pH', 'Turbidity'])
df_filtered['wqi'] = wqi_filt
df_filtered['risk'] = [classify_risk(w) for w in wqi_filt]
dist_filt = get_distribution(df_filtered)
total_filt = len(df_filtered)
outlier_removed = len(data_array) - total_filt

# ============================================================
# 3. DATASET MODIFIED (25% EKSTREM) - MENGGUNAKAN DATA ASLI
# ============================================================
num_extreme = int(len(data_array) * 0.25)
np.random.seed(42)
indices = np.random.choice(len(data_array), num_extreme, replace=False)
data_modified = data_array.copy()
for idx in indices:
    data_modified[idx] = [
        np.random.uniform(10, 15),
        np.random.uniform(10, 20),
        np.random.uniform(5, 6),
        np.random.uniform(20, 40)
    ]
wqi_mod = [calculate_wqi(row) for row in data_modified]
df_modified = pd.DataFrame(data_modified, columns=['Temperature', 'Salinity', 'pH', 'Turbidity'])
df_modified['wqi'] = wqi_mod
df_modified['risk'] = [classify_risk(w) for w in wqi_mod]
dist_mod = get_distribution(df_modified)
total_mod = len(df_modified)

# ============================================================
# 4. DATASET BALANCED (jika ada)
# ============================================================
if os.path.exists(BALANCED_PATH):
    df_balanced = pd.read_excel(BALANCED_PATH)
    # Jika belum ada kolom risk, hitung ulang
    if 'risk' not in df_balanced.columns:
        data_bal = df_balanced[['Temperature', 'Salinity', 'pH', 'Turbidity']].values
        wqi_bal = [calculate_wqi(row) for row in data_bal]
        df_balanced['wqi'] = wqi_bal
        df_balanced['risk'] = [classify_risk(w) for w in wqi_bal]
    dist_bal = get_distribution(df_balanced)
    total_bal = len(df_balanced)
    has_balanced = True
else:
    has_balanced = False

# ============================================================
# 5. TAMPILKAN RINGKASAN
# ============================================================
print("\n" + "=" * 70)
print("RINGKASAN DISTRIBUSI RISIKO")
print("=" * 70)

# Header
print(f"{'Dataset':<20} {'Total':<8} {'Rendah':<10} {'Sedang':<10} {'Tinggi':<10}")
print("-" * 70)

# Asli
p_rendah = (dist_orig['Rendah']/total_orig)*100 if total_orig>0 else 0
p_sedang = (dist_orig['Sedang']/total_orig)*100 if total_orig>0 else 0
p_tinggi = (dist_orig['Tinggi']/total_orig)*100 if total_orig>0 else 0
print(f"{'Dataset Asli':<20} {total_orig:<8} {dist_orig['Rendah']:<10} {dist_orig['Sedang']:<10} {dist_orig['Tinggi']:<10}")
print(f"{'':20} {'':8} ({p_rendah:5.2f}%)   ({p_sedang:5.2f}%)   ({p_tinggi:5.2f}%)")

# Filtered
p_rendah = (dist_filt['Rendah']/total_filt)*100 if total_filt>0 else 0
p_sedang = (dist_filt['Sedang']/total_filt)*100 if total_filt>0 else 0
p_tinggi = (dist_filt['Tinggi']/total_filt)*100 if total_filt>0 else 0
print(f"{'Dataset Filtered':<20} {total_filt:<8} {dist_filt['Rendah']:<10} {dist_filt['Sedang']:<10} {dist_filt['Tinggi']:<10}")
print(f"{'':20} {'':8} ({p_rendah:5.2f}%)   ({p_sedang:5.2f}%)   ({p_tinggi:5.2f}%)")
print(f"Outlier dibuang: {outlier_removed} baris ({outlier_removed/len(data_array)*100:.2f}%)")

# Modified
p_rendah = (dist_mod['Rendah']/total_mod)*100 if total_mod>0 else 0
p_sedang = (dist_mod['Sedang']/total_mod)*100 if total_mod>0 else 0
p_tinggi = (dist_mod['Tinggi']/total_mod)*100 if total_mod>0 else 0
print(f"{'Dataset Modified 25%':<20} {total_mod:<8} {dist_mod['Rendah']:<10} {dist_mod['Sedang']:<10} {dist_mod['Tinggi']:<10}")
print(f"{'':20} {'':8} ({p_rendah:5.2f}%)   ({p_sedang:5.2f}%)   ({p_tinggi:5.2f}%)")

# Balanced (jika ada)
if has_balanced:
    p_rendah = (dist_bal['Rendah']/total_bal)*100 if total_bal>0 else 0
    p_sedang = (dist_bal['Sedang']/total_bal)*100 if total_bal>0 else 0
    p_tinggi = (dist_bal['Tinggi']/total_bal)*100 if total_bal>0 else 0
    print(f"{'Dataset Balanced':<20} {total_bal:<8} {dist_bal['Rendah']:<10} {dist_bal['Sedang']:<10} {dist_bal['Tinggi']:<10}")
    print(f"{'':20} {'':8} ({p_rendah:5.2f}%)   ({p_sedang:5.2f}%)   ({p_tinggi:5.2f}%)")
else:
    print(f"{'Dataset Balanced':<20} {'-' :<8} {'-' :<10} {'-' :<10} {'-' :<10}")
    print("Dataset balanced belum dibuat. Jalankan script cek_balanced.py terlebih dahulu.")

print("=" * 70)