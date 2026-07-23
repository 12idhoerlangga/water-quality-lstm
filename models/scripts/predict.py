import sys
import json
import argparse
import numpy as np
import tensorflow as tf
import joblib
import pandas as pd
import os
import warnings
warnings.filterwarnings('ignore')

# ============================================================
# KONFIGURASI
# ============================================================
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

MODEL_PATH_ASLI = os.path.join(BASE_DIR, 'models', 'lstm_model_filtered.h5')
SCALER_PATH_ASLI = os.path.join(BASE_DIR, 'models', 'scaler_filtered.pkl')

MODEL_PATH_MODIFIED = os.path.join(BASE_DIR, 'models', 'lstm_model_modified.h5')
SCALER_PATH_MODIFIED = os.path.join(BASE_DIR, 'models', 'scaler_modified.pkl')

MODEL_PATH_BALANCED = os.path.join(BASE_DIR, 'models', 'lstm_model_balanced.h5')
SCALER_PATH_BALANCED = os.path.join(BASE_DIR, 'models', 'scaler_balanced.pkl')

DATA_PATH = os.path.join(BASE_DIR, 'data', 'dataset_2022_2025.xlsx')

WINDOW = 24
LAG_STEPS = 3
FEATURE_COLS = ['Temperature', 'Salinity', 'pH', 'Turbidity']
HORIZON = 96

# ============================================================
# LOAD MODEL
# ============================================================
def load_model_and_scaler(model_type='asli'):
    if model_type == 'modified':
        model_path = MODEL_PATH_MODIFIED
        scaler_path = SCALER_PATH_MODIFIED
        print("Menggunakan Model Modifikasi (Risiko Tinggi)", file=sys.stderr)
    elif model_type == 'balanced':
        model_path = MODEL_PATH_BALANCED
        scaler_path = SCALER_PATH_BALANCED
        print("Menggunakan Model Balanced", file=sys.stderr)
    else:
        model_path = MODEL_PATH_ASLI
        scaler_path = SCALER_PATH_ASLI
        print("Menggunakan Model Asli (Skripsi)", file=sys.stderr)

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model tidak ditemukan: {model_path}")
    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"Scaler tidak ditemukan: {scaler_path}")

    model = tf.keras.models.load_model(model_path, compile=False)
    scaler = joblib.load(scaler_path)
    return model, scaler

# ============================================================
# AMBIL DATA DARI EXCEL
# ============================================================
def get_last_sequence_from_excel():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset tidak ditemukan di {DATA_PATH}")

    df = pd.read_excel(DATA_PATH)

    # Penanganan data hilang
    df[FEATURE_COLS] = df[FEATURE_COLS].interpolate(method='linear', limit_direction='both')
    df = df.dropna(subset=FEATURE_COLS)

    data = df[FEATURE_COLS].values

    mean = data[:, 3].mean()
    std = data[:, 3].std()
    upper_bound = mean + 3 * std
    lower_bound = mean - 3 * std
    mask = (data[:, 3] >= lower_bound) & (data[:, 3] <= upper_bound)
    data = data[mask]

    total_needed = WINDOW + LAG_STEPS
    if len(data) < total_needed:
        raise ValueError(f"Data tidak cukup: butuh {total_needed} baris, hanya ada {len(data)}")

    last_seq = data[-total_needed:]
    return last_seq

# ============================================================
# PREDIKSI RECURSIVE
# ============================================================
def predict_future(model, scaler, initial_seq, horizon=HORIZON):
    seq_scaled = scaler.transform(initial_seq)
    predictions = []
    current_seq = seq_scaled.copy()

    for _ in range(horizon):
        input_data = current_seq.reshape(1, WINDOW + LAG_STEPS, len(FEATURE_COLS))
        pred_scaled = model.predict(input_data, verbose=0)
        pred_orig = scaler.inverse_transform(pred_scaled)
        predictions.append(pred_orig[0])
        current_seq = np.roll(current_seq, shift=-1, axis=0)
        current_seq[-1] = pred_scaled[0]

    return np.array(predictions)

# ============================================================
# HITUNG WQI & RISIKO (DENGAN CLAMP)
# ============================================================
def calculate_wqi_and_risk(row):
    weights = [0.2, 0.2, 0.3, 0.3]

    # Baku mutu sesuai Tabel 4.5
    smin = [28, 33, 7, 0]   # Suhu, Salinitas, pH, Kekeruhan
    smax = [32, 34, 8.5, 5] # Suhu, Salinitas, pH, Kekeruhan
    sideal = [30, 34, 7.75, 2.5] # Nilai ideal

    qi = []
    for i in range(4):
        # Hitung skor mentah
        score = (1 - abs(row[i] - sideal[i]) / (smax[i] - smin[i])) * 100
        # Clamp: batasi antara 0 dan 100
        qi.append(max(0, min(100, score)))

    wqi = (qi[0]*weights[0] + qi[1]*weights[1] + qi[2]*weights[2] + qi[3]*weights[3])

    if wqi >= 76:
        risk = "Rendah"
        recommendation = "Kondisi air baik, lanjutkan pemantauan rutin."
    elif wqi >= 51:
        risk = "Sedang"
        recommendation = "Waspada, lakukan pengecekan parameter secara berkala."
    else:
        risk = "Tinggi"
        recommendation = "Segera lakukan tindakan mitigasi (aerasi, pengurangan pakan)."

    return wqi, risk, recommendation

# ============================================================
# MAIN (CLI)
# ============================================================
def main():
    global HORIZON

    parser = argparse.ArgumentParser(description='Prediksi Kualitas Air dengan LSTM')
    parser.add_argument('--model', type=str, default='asli', choices=['asli', 'modified', 'balanced'],
                        help='Pilih model: asli, modified, atau balanced')
    parser.add_argument('--json', action='store_true',
                        help='Output dalam format JSON')
    parser.add_argument('--data', type=str, default=None,
                        help='Path ke file JSON berisi data input (opsional)')
    parser.add_argument('--horizon', type=int, default=96,
                        help='Jumlah langkah prediksi (default: 96)')
    parser.add_argument('--start-date', type=str, default=None,
                        help='Tanggal mulai prediksi (format: YYYY-MM-DD HH:MM:SS)')

    args = parser.parse_args()
    json_mode = args.json

    if args.horizon:
        HORIZON = args.horizon

    base_time = pd.Timestamp.now()
    if args.start_date:
        try:
            base_time = pd.Timestamp(args.start_date)
            print(f"Menggunakan start-date: {base_time}", file=sys.stderr)
        except Exception as e:
            print(f"Gagal parse start-date, pakai waktu sekarang: {e}", file=sys.stderr)

    if not json_mode:
        print("=" * 60)
        print(f"PREDIKSI {HORIZON} LANGKAH KE DEPAN")
        print("=" * 60)

    try:
        if not json_mode:
            print("\n[1] Memuat model dan scaler...")
        model, scaler = load_model_and_scaler(model_type=args.model)
        if not json_mode:
            print("Model dan scaler berhasil dimuat.")

        if args.data:
            if not os.path.exists(args.data):
                raise FileNotFoundError(f"File data tidak ditemukan: {args.data}")
            with open(args.data, 'r') as f:
                data_list = json.load(f)
            initial_seq = np.array(data_list)
            if initial_seq.shape != (WINDOW + LAG_STEPS, len(FEATURE_COLS)):
                raise ValueError(f"Data harus berukuran ({WINDOW + LAG_STEPS}, {len(FEATURE_COLS)})")
            if not json_mode:
                print(f"Data dimuat dari {args.data} dengan shape {initial_seq.shape}")
        else:
            if not json_mode:
                print("\n[2] Mengambil data terakhir dari dataset Excel...")
            initial_seq = get_last_sequence_from_excel()
            if not json_mode:
                print(f"Initial sequence shape: {initial_seq.shape}")

        if not json_mode:
            print(f"\n[3] Melakukan recursive forecasting untuk {HORIZON} langkah...")
        predictions = predict_future(model, scaler, initial_seq, HORIZON)
        if not json_mode:
            print(f"Prediksi selesai. Shape: {predictions.shape}")

        if not json_mode:
            print("\n[4] Menghitung WQI dan risiko...")

        results = []
        for i, row in enumerate(predictions):
            wqi, risk, rec = calculate_wqi_and_risk(row)
            timestamp = base_time + pd.Timedelta(minutes=15 * (i + 1))
            results.append({
                'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'temperature': float(row[0]),
                'salinity': float(row[1]),
                'pH': float(row[2]),
                'turbidity': float(row[3]),
                'wqi': round(float(wqi), 2),
                'risk': risk,
                'recommendation': rec
            })

        if json_mode:
            json_output = {
                'status': 'success',
                'model_used': args.model,
                'horizon': HORIZON,
                'data': results
            }
            print(json.dumps(json_output, indent=2))
        else:
            print("\n[5] Ringkasan hasil prediksi (5 langkah pertama):")
            print("=" * 80)
            print(f"{'Waktu':<20} {'Suhu':<8} {'Salinitas':<10} {'pH':<8} {'Kekeruhan':<10} {'WQI':<6} {'Risiko':<8}")
            for item in results[:5]:
                print(f"{item['timestamp']:<20} {item['temperature']:<8.2f} {item['salinity']:<10.2f} {item['pH']:<8.2f} {item['turbidity']:<10.2f} {item['wqi']:<6.0f} {item['risk']:<8}")
            print("\n... (lanjut ke 96 langkah)")

            output_path = os.path.join(BASE_DIR, 'data', 'prediksi_1hari.csv')
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            df = pd.DataFrame(results)
            df.to_csv(output_path, index=False)
            print(f"\nHasil prediksi disimpan ke {output_path}")
            print("\n" + "=" * 60)
            print("PREDIKSI SELESAI!")
            print("=" * 60)

    except Exception as e:
        if json_mode:
            print(json.dumps({'status': 'error', 'message': str(e)}))
        else:
            print(f"Error: {str(e)}")
        sys.exit(1)

# ============================================================
# FUNGSI UNTUK BACKEND (IMPORT)
# ============================================================
def predict_from_backend(input_data, model_type='asli', horizon=96, start_date=None):
    initial_seq = np.array(input_data)
    if initial_seq.shape != (WINDOW + LAG_STEPS, len(FEATURE_COLS)):
        raise ValueError(f"Data harus berukuran ({WINDOW + LAG_STEPS}, {len(FEATURE_COLS)})")

    model, scaler = load_model_and_scaler(model_type)
    predictions = predict_future(model, scaler, initial_seq, horizon)

    base_time = pd.Timestamp.now()
    if start_date:
        try:
            base_time = pd.Timestamp(start_date)
        except Exception as e:
            print(f"Gagal parse start-date: {e}", file=sys.stderr)

    results = []
    for i, row in enumerate(predictions):
        wqi, risk, rec = calculate_wqi_and_risk(row)
        timestamp = base_time + pd.Timedelta(minutes=15 * (i + 1))
        results.append({
            'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'temperature': float(row[0]),
            'salinity': float(row[1]),
            'pH': float(row[2]),
            'turbidity': float(row[3]),
            'wqi': round(float(wqi), 2),
            'risk': risk,
            'recommendation': rec
        })
    return results

if __name__ == "__main__":
    main()