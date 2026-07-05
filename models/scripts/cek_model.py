# models/scripts/cek_model.py
import tensorflow as tf
import joblib
import os

# ============================================================
# PATH ABSOLUT (sama seperti predict.py)
# ============================================================
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'lstm_model.h5')
SCALER_PATH = os.path.join(BASE_DIR, 'models', 'scaler.pkl')

# ========== CEK VERSI TENSORFLOW ==========
print("TensorFlow version:", tf.__version__)

# ========== CEK MODEL .h5 ==========
print("=" * 50)
print("CEK MODEL LSTM (.h5)")
print("=" * 50)

# Load model dengan compile=False (hindari error deserialize)
model = tf.keras.models.load_model(MODEL_PATH, compile=False)
print("\n[1] Arsitektur Model:")
model.summary()

print(f"\n[2] Total Parameters: {model.count_params():,}")
print(f"[3] Input shape: {model.input_shape}")
print(f"[4] Output shape: {model.output_shape}")

# ========== CEK SCALER .pkl ==========
print("\n" + "=" * 50)
print("CEK SCALER (.pkl)")
print("=" * 50)

scaler = joblib.load(SCALER_PATH)
print(f"\n[1] Tipe Scaler: {type(scaler)}")

if hasattr(scaler, 'data_min_'):
    print(f"[2] Data min: {scaler.data_min_}")
    print(f"[3] Data max: {scaler.data_max_}")
    print(f"[4] Scale: {scaler.scale_}")

if hasattr(scaler, 'feature_names_in_'):
    print(f"[5] Features: {scaler.feature_names_in_}")