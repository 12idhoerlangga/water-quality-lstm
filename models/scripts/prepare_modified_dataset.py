import pandas as pd
import numpy as np
import os
import random

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'dataset_2022_2025.xlsx')
OUTPUT_PATH = os.path.join(BASE_DIR, 'data', 'dataset_modified.xlsx')

FEATURE_COLS = ['Temperature', 'Salinity', 'pH', 'Turbidity']

# 🔥 Ubah persentase data ekstrem (0.25 = 25%)
EXTREME_RATIO = 0.25  # 25% data diubah ke ekstrem

def create_modified_dataset():
    # 1. Baca dataset asli
    df = pd.read_excel(DATA_PATH)
    total_rows = len(df)
    print(f"✅ Dataset asli: {total_rows} baris")

    # 2. Copy dataset
    df_modified = df.copy()

    # 3. Hitung jumlah baris yang akan diubah
    num_extreme = int(total_rows * EXTREME_RATIO)
    print(f"🔹 Mengubah {num_extreme} baris ({EXTREME_RATIO*100:.0f}%) menjadi nilai ekstrem")

    # 4. Pilih baris acak
    indices = random.sample(range(total_rows), num_extreme)

    for idx in indices:
        # Suhu: 35-42°C (sangat panas)
        df_modified.at[idx, 'Temperature'] = np.random.uniform(35, 42)
        # Salinitas: 1-6 ppt (sangat rendah)
        df_modified.at[idx, 'Salinity'] = np.random.uniform(1, 6)
        # pH: 4.5-6.5 (asam)
        df_modified.at[idx, 'pH'] = np.random.uniform(4.5, 6.5)
        # Kekeruhan: 50-120 NTU (sangat tinggi)
        df_modified.at[idx, 'Turbidity'] = np.random.uniform(50, 120)

    print(f"✅ {num_extreme} baris diubah menjadi nilai ekstrem")
    print(f"   Suhu: 35-42°C, Salinitas: 1-6 ppt, pH: 4.5-6.5, Kekeruhan: 50-120 NTU")

    # 5. Simpan dataset baru
    df_modified.to_excel(OUTPUT_PATH, index=False)
    print(f"✅ Dataset modifikasi disimpan ke: {OUTPUT_PATH}")

    # 6. Tampilkan statistik
    print("\n📊 Statistik Kekeruhan Dataset Modifikasi:")
    print(df_modified['Turbidity'].describe())

    return OUTPUT_PATH

if __name__ == "__main__":
    create_modified_dataset()