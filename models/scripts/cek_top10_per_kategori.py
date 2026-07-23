import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'dataset_2022_2025.xlsx')

# ============================================================
# FUNGSI WQI & KLASIFIKASI (SAMA DENGAN PREDICT.PY)
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

# ============================================================
# LOAD DATASET & HITUNG WQI
# ============================================================
print("Loading dataset...")
df = pd.read_excel(DATA_PATH)
data = df[['Temperature', 'Salinity', 'pH', 'Turbidity']].values

print("Menghitung WQI...")
wqi_list = [calculate_wqi(row) for row in data]
df['wqi'] = wqi_list
df['risk'] = [classify_risk(w) for w in wqi_list]

# ============================================================
# PISAHKAN PER KATEGORI
# ============================================================
df_rendah = df[df['risk'] == 'Rendah'].sort_values('wqi', ascending=False)
df_sedang = df[df['risk'] == 'Sedang'].sort_values('wqi', ascending=False)
df_tinggi = df[df['risk'] == 'Tinggi'].sort_values('wqi', ascending=False)

# ============================================================
# TAMPILKAN 10 TERTINGGI PER KATEGORI
# ============================================================
def print_top10(df, kategori):
    print(f"\n{'='*60}")
    print(f"10 NILAI WQI TERTINGGI - KATEGORI {kategori.upper()}")
    print('='*60)
    if len(df) == 0:
        print(f"Tidak ada data untuk kategori {kategori}")
        return
    top10 = df[['Temperature', 'Salinity', 'pH', 'Turbidity', 'wqi']].head(10)
    print(top10.to_string(index=False))
    print(f"\nTotal data {kategori}: {len(df)} baris")

print_top10(df_rendah, 'Rendah')
print_top10(df_sedang, 'Sedang')
print_top10(df_tinggi, 'Tinggi')

# ============================================================
# RINGKASAN DISTRIBUSI
# ============================================================
print("\n" + "="*60)
print("RINGKASAN DISTRIBUSI")
print("="*60)
print(f"{'Kategori':<10} {'Jumlah':<10} {'Persentase'}")
print("-"*30)
total = len(df)
for kat in ['Rendah', 'Sedang', 'Tinggi']:
    cnt = len(df[df['risk'] == kat])
    pct = (cnt/total)*100
    print(f"{kat:<10} {cnt:<10} {pct:.2f}%")