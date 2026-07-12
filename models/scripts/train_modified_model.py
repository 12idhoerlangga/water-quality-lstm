# models/scripts/train_modified_model.py
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error, r2_score
import optuna
import joblib
import os
import json
import mysql.connector
from dotenv import load_dotenv
import warnings
import time  # 🔥 TAMBAHKAN IMPORT TIME
warnings.filterwarnings('ignore')

# ============================================================
# KONFIGURASI (Path Absolut) - PAKAI DATASET MODIFIKASI
# ============================================================
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'dataset_modified.xlsx')  # 🔥 PAKAI DATASET MODIFIKASI
MODEL_SAVE_PATH = os.path.join(BASE_DIR, 'models', 'lstm_model_modified.h5')  # 🔥 NAMA BERBEDA
SCALER_SAVE_PATH = os.path.join(BASE_DIR, 'models', 'scaler_modified.pkl')    # 🔥 SCALER BERBEDA

# Load konfigurasi database dari .env
dotenv_path = os.path.join(BASE_DIR, 'backend', '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'water_quality_lstm'),
    'port': os.getenv('DB_PORT', 3306)
}

EPOCHS = 25
TRIAL = 5  # Ubah ke 40 nanti untuk full training
WINDOW_OPTIONS = [24, 48]
LAG_STEPS = 3
FEATURE_COLS = ['Temperature', 'Salinity', 'pH', 'Turbidity']
TARGET_COLS = ['Temperature', 'Salinity', 'pH', 'Turbidity']

# ============================================================
# FUNGSI LOAD DATA - DENGAN FILTER OUTLIER (3 std) UNTUK SEMUA PARAMETER
# ============================================================
def load_data():
    df = pd.read_excel(DATA_PATH)
    data = df[FEATURE_COLS].values
    
    # 🔥 Catat jumlah data awal
    initial_count = len(data)
    print(f"📊 Jumlah data awal (sebelum filter): {initial_count} baris")

    # 🔥 Filter outlier untuk SEMUA parameter (3 standar deviasi)
    mask = np.ones(len(data), dtype=bool)
    for i in range(len(FEATURE_COLS)):
        mean = data[:, i].mean()
        std = data[:, i].std()
        lower_bound = mean - 3 * std
        upper_bound = mean + 3 * std
        mask = mask & (data[:, i] >= lower_bound) & (data[:, i] <= upper_bound)
    
    data = data[mask]
    filtered_count = len(data)
    
    print(f"✅ Data dimuat: {filtered_count} baris (dengan filter outlier 3 std untuk SEMUA parameter)")
    print(f"📊 Jumlah data yang dibuang (outlier): {initial_count - filtered_count} baris")
    return data, df[mask]

# ============================================================
# FUNGSI CREATE SEQUENCE DENGAN LAG FEATURES
# ============================================================
def create_sequences(data, window_size, lag_steps=3):
    X, y = [], []
    total_len = len(data)
    for i in range(total_len - window_size - lag_steps):
        seq = data[i:i+window_size]
        lag_values = []
        for lag in range(1, lag_steps + 1):
            lag_values.append(data[i+window_size - lag])
        lag_values = np.array(lag_values)
        seq_with_lag = np.concatenate([seq, lag_values], axis=0)
        X.append(seq_with_lag)
        y.append(data[i+window_size])
    return np.array(X), np.array(y)

# ============================================================
# FUNGSI OBJEKTIF OPTUNA
# ============================================================
def objective(trial):
    window = trial.suggest_categorical('window', WINDOW_OPTIONS)
    units = trial.suggest_int('units', 32, 256)
    layers = trial.suggest_int('layers', 1, 3)
    dropout = trial.suggest_float('dropout', 0.1, 0.5)
    lr = trial.suggest_float('lr', 0.001, 0.01, log=True)
    batch_size = trial.suggest_categorical('batch_size', [32, 64, 128])
    
    data, _ = load_data()
    scaler = MinMaxScaler()
    data_scaled = scaler.fit_transform(data)
    
    X, y = create_sequences(data_scaled, window, LAG_STEPS)
    split = int(0.8 * len(X))
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]
    
    model = tf.keras.Sequential()
    model.add(tf.keras.layers.Input(shape=(window + LAG_STEPS, len(FEATURE_COLS))))
    
    for i in range(layers):
        return_sequences = (i < layers - 1)
        model.add(tf.keras.layers.LSTM(units, return_sequences=return_sequences))
        model.add(tf.keras.layers.Dropout(dropout))
    
    model.add(tf.keras.layers.Dense(4))
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=lr),
                  loss='mse', metrics=['mae'])
    
    early_stop = tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)
    history = model.fit(X_train, y_train,
                        validation_data=(X_val, y_val),
                        epochs=EPOCHS,
                        batch_size=batch_size,
                        callbacks=[early_stop],
                        verbose=1)
    
    loss = model.evaluate(X_val, y_val, verbose=0)[0]
    return loss

# ============================================================
# FUNGSI SIMPAN LOG KE DATABASE
# ============================================================
def save_training_log(trial_count, mape, rmse, mae, r2, hyperparams):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO training_log 
            (trial_count, best_mape, best_rmse, best_mae, best_r2, hyperparams)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            trial_count,
            mape,
            rmse,
            mae,
            r2,
            json.dumps(hyperparams)
        ))
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Log training disimpan ke database.")
    except Exception as e:
        print(f"⚠️ Gagal simpan log ke database: {e}")

# ============================================================
# MAIN
# ============================================================
def main():
    # 🔥 MULAI TIMER
    start_time = time.time()
    
    print("=" * 60)
    print("TRAINING LSTM MULTI-TARGET DENGAN OPTUNA (MODIFIKASI - FILTER SEMUA PARAMETER)")
    print("=" * 60)
    print(f"Dataset: dataset_modified.xlsx (dengan filter outlier 3 std untuk SEMUA parameter)")
    print(f"Total Trial: {TRIAL}")
    print(f"Epochs per Trial: {EPOCHS}")
    print("=" * 60)
    
    print(f"\n[1] Optimasi hyperparameter dengan Optuna ({TRIAL} trial)...")
    study = optuna.create_study(direction='minimize', sampler=optuna.samplers.TPESampler(seed=42))
    study.optimize(objective, n_trials=TRIAL)
    
    print(f"\nBest trial: {study.best_trial.number}")
    print(f"Best loss: {study.best_trial.value:.6f}")
    print(f"Best hyperparameters: {study.best_params}")
    
    print("\n[2] Training model dengan hyperparameter terbaik...")
    best_params = study.best_params
    best_window = best_params['window']
    
    data, _ = load_data()
    scaler = MinMaxScaler()
    data_scaled = scaler.fit_transform(data)
    
    X, y = create_sequences(data_scaled, best_window, LAG_STEPS)
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    
    model = tf.keras.Sequential()
    model.add(tf.keras.layers.Input(shape=(best_window + LAG_STEPS, len(FEATURE_COLS))))
    
    for i in range(best_params['layers']):
        return_sequences = (i < best_params['layers'] - 1)
        model.add(tf.keras.layers.LSTM(best_params['units'], return_sequences=return_sequences))
        model.add(tf.keras.layers.Dropout(best_params['dropout']))
    
    model.add(tf.keras.layers.Dense(4))
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=best_params['lr']),
                  loss='mse', metrics=['mae'])
    
    early_stop = tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)
    history = model.fit(X_train, y_train,
                        validation_data=(X_test, y_test),
                        epochs=EPOCHS,
                        batch_size=best_params['batch_size'],
                        callbacks=[early_stop],
                        verbose=1)
    
    print("\n[3] Evaluasi model pada data testing...")
    y_pred = model.predict(X_test)
    
    y_test_orig = scaler.inverse_transform(y_test)
    y_pred_orig = scaler.inverse_transform(y_pred)
    
    metrics = {}
    for i, col in enumerate(TARGET_COLS):
        mae = mean_absolute_error(y_test_orig[:, i], y_pred_orig[:, i])
        rmse = np.sqrt(mean_squared_error(y_test_orig[:, i], y_pred_orig[:, i]))
        
        mask = y_test_orig[:, i] > 0.01
        if np.sum(mask) > 0:
            mape = mean_absolute_percentage_error(
                y_test_orig[mask, i],
                y_pred_orig[mask, i]
            ) * 100
        else:
            epsilon = 1e-8
            mape = mean_absolute_percentage_error(
                y_test_orig[:, i] + epsilon,
                y_pred_orig[:, i] + epsilon
            ) * 100
        
        r2 = r2_score(y_test_orig[:, i], y_pred_orig[:, i])
        metrics[col] = {'MAE': mae, 'RMSE': rmse, 'MAPE': mape, 'R2': r2}
    
    print("\n" + "=" * 60)
    print("HASIL EVALUASI PER PARAMETER")
    print("=" * 60)
    for col, m in metrics.items():
        print(f"\n{col}:")
        print(f"  MAE  : {m['MAE']:.4f}")
        print(f"  RMSE : {m['RMSE']:.4f}")
        print(f"  MAPE : {m['MAPE']:.2f}%")
        print(f"  R²   : {m['R2']:.4f}")
    
    mape_turbidity = metrics['Turbidity']['MAPE']
    rmse_turbidity = metrics['Turbidity']['RMSE']
    mae_turbidity = metrics['Turbidity']['MAE']
    r2_turbidity = metrics['Turbidity']['R2']
    
    print(f"\n[FOKUS UTAMA] MAPE Kekeruhan: {mape_turbidity:.2f}%")
    if mape_turbidity < 25:
        print("✅ Target MAPE < 25% tercapai!")
    else:
        print("⚠️ MAPE masih di atas 25%, perlu tuning ulang.")
    
    print("\n[4] Menyimpan model dan scaler...")
    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    model.save(MODEL_SAVE_PATH)
    joblib.dump(scaler, SCALER_SAVE_PATH)
    print(f"✅ Model disimpan di {MODEL_SAVE_PATH}")
    print(f"✅ Scaler disimpan di {SCALER_SAVE_PATH}")
    
    # ============================================================
    # SIMPAN LOG TRAINING KE DATABASE
    # ============================================================
    print("\n[5] Menyimpan log training ke database...")
    save_training_log(
        trial_count=TRIAL,
        mape=mape_turbidity,
        rmse=rmse_turbidity,
        mae=mae_turbidity,
        r2=r2_turbidity,
        hyperparams=best_params
    )
    
    # 🔥 AKHIRI TIMER & TAMPILKAN DURASI
    end_time = time.time()
    duration = end_time - start_time
    print("\n" + "=" * 60)
    print(f"⏱️ Total waktu training: {duration:.2f} detik ({duration/60:.2f} menit)")
    print("=" * 60)
    
    print("\n" + "=" * 60)
    print("TRAINING SELESAI!")
    print("=" * 60)

if __name__ == "__main__":
    main()