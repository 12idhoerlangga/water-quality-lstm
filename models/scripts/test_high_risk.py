# models/scripts/test_high_risk.py
import pandas as pd
import numpy as np
import json
import os
import sys
import subprocess
from datetime import datetime

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'dataset_2022_2025.xlsx')
PREDICT_SCRIPT = os.path.join(BASE_DIR, 'models', 'scripts', 'predict.py')
OUTPUT_JSON = os.path.join(BASE_DIR, 'data', 'outlier_sequence.json')

FEATURE_COLS = ['Temperature', 'Salinity', 'pH', 'Turbidity']
WINDOW = 24
LAG_STEPS = 3
TOTAL_NEEDED = WINDOW + LAG_STEPS  # 27

def find_extreme_outlier_sequence():
    """Mencari 26 data sebelum + outlier = 27, prediksi setelah outlier."""
    df = pd.read_excel(DATA_PATH)
    data = df[FEATURE_COLS].values
    
    outlier_indices = []
    for i in range(len(data)):
        turb = data[i][3]
        sal = data[i][1]
        temp = data[i][0]
        ph = data[i][2]
        if turb > 20 or sal < 10 or temp < 6 or temp > 15 or ph < 7.0 or ph > 8.5:
            outlier_indices.append(i)
    
    if not outlier_indices:
        print("❌ Tidak ditemukan outlier ekstrem di dataset.")
        return None
    
    outlier_indices.sort(key=lambda idx: (data[idx][3] * -1, data[idx][1]))
    
    for idx in outlier_indices:
        if idx >= 26 and idx < len(data) - 1:
            start_idx = idx - 26
            sequence = data[start_idx:idx+1]  # 26 before + outlier = 27
            target_idx = idx + 1
            print(f"✅ Ditemukan outlier EKSTREM di baris ke-{idx}")
            print(f"   Kekeruhan: {data[idx][3]:.2f}, Salinitas: {data[idx][1]:.2f}")
            print(f"📊 26 data sebelum + outlier diambil (indeks {start_idx} - {idx})")
            print(f"🎯 Target prediksi: baris ke-{target_idx} (setelah outlier)")
            return sequence, idx, target_idx
    
    print("❌ Tidak ada outlier ekstrem yang memiliki data sebelum dan sesudahnya.")
    return None

def main():
    print("=" * 60)
    print("TEST PREDIKSI RISIKO TINGGI (OUTLIER SEBAGAI INPUT)")
    print("=" * 60)
    
    result = find_extreme_outlier_sequence()
    if result is None:
        sys.exit(1)
    
    sequence, outlier_idx, target_idx = result
    
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(sequence.tolist(), f)
    print(f"✅ Sequence disimpan ke {OUTPUT_JSON}")
    
    print("\n🔮 Menjalankan prediksi...")
    cmd = f'python "{PREDICT_SCRIPT}" --json --data "{OUTPUT_JSON}"'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    if result.returncode != 0:
        print("❌ Gagal menjalankan prediksi:")
        print(result.stderr)
        sys.exit(1)
    
    try:
        import json as jsonlib
        pred_result = jsonlib.loads(result.stdout)
        if pred_result['status'] == 'success':
            data = pred_result['data']
            # Ambil prediksi pertama (langkah setelah outlier)
            first_pred = data[0]
            wqi_first = first_pred['wqi']
            risk_first = first_pred['risk']
            # Rata-rata WQI semua prediksi
            wqi_values = [d['wqi'] for d in data]
            avg_wqi = sum(wqi_values) / len(wqi_values)
            
            print("\n" + "=" * 60)
            print("📊 HASIL PREDIKSI")
            print("=" * 60)
            print(f"WQI prediksi pertama (setelah outlier): {wqi_first:.2f}")
            print(f"Risiko pertama: {risk_first}")
            print(f"Rata-rata WQI 96 langkah: {avg_wqi:.2f}")
            
            if wqi_first < 60 or risk_first == "Tinggi":
                print("\n⚠️  RISIKO TINGGI! Notifikasi akan muncul di web.")
            else:
                print("\n✅ Risiko masih Sedang atau Rendah.")
        else:
            print("❌ Prediksi gagal:", pred_result.get('message', ''))
    except Exception as e:
        print("❌ Gagal parse hasil prediksi:", str(e))
        print(result.stdout)

if __name__ == "__main__":
    main()