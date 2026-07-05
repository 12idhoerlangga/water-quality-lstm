# models/scripts/prepare_modified_dataset.py
import pandas as pd
import numpy as np
import os
import random

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'dataset_2022_2025.xlsx')
OUTPUT_PATH = os.path.join(BASE_DIR, 'data', 'dataset_modified.xlsx')

FEATURE_COLS = ['Temperature', 'Salinity', 'pH', 'Turbidity']
NUM_EXTREME_ROWS = 1000 # 🔥 Bisa diubah: 500, 1000, atau 2000

def create_modified_dataset():
    # 1. Baca dataset asli
    df = pd.read_excel(DATA_PATH)
    print(f"✅ Dataset asli: {len(df)} baris")
    
    # 2. Copy dataset
    df_modified = df.copy()
    
    # 3. Pilih baris acak untuk diubah (bisa juga ambil 27 baris terakhir)
    #    Saya sarankan acak agar model belajar outlier dari berbagai posisi
    indices = random.sample(range(len(df_modified)), NUM_EXTREME_ROWS)
    
    for idx in indices:
        # Suhu: 33-36°C (panas)
        df_modified.at[idx, 'Temperature'] = np.random.uniform(33, 36)
        # Salinitas: 3-8 ppt (rendah)
        df_modified.at[idx, 'Salinity'] = np.random.uniform(3, 8)
        # pH: 5.5-6.5 (asam)
        df_modified.at[idx, 'pH'] = np.random.uniform(5.5, 6.5)
        # Kekeruhan: 25-35 NTU (tinggi)
        df_modified.at[idx, 'Turbidity'] = np.random.uniform(25, 35)
    
    print(f"✅ {NUM_EXTREME_ROWS} baris diubah menjadi nilai ekstrem")
    print(f"   Suhu: 33-36°C, Salinitas: 3-8 ppt, pH: 5.5-6.5, Kekeruhan: 25-35 NTU")
    
    # 4. Simpan dataset baru
    df_modified.to_excel(OUTPUT_PATH, index=False)
    print(f"✅ Dataset modifikasi disimpan ke: {OUTPUT_PATH}")
    
    # 5. Tampilkan statistik
    print("\n📊 Statistik Kekeruhan Dataset Modifikasi:")
    print(df_modified['Turbidity'].describe())
    
    return OUTPUT_PATH

if __name__ == "__main__":
    create_modified_dataset()

   