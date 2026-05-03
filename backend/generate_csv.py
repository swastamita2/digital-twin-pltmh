import os
import numpy as np
import pandas as pd

# Buat folder jika belum ada
output_dir = os.path.join(os.path.dirname(__file__), 'datasets')
os.makedirs(output_dir, exist_ok=True)

# Parameter Simulasi
num_points = 1200 # 120 detik (jika 10 data per detik)
t = np.linspace(0, 120, num_points)

print("Membuat Dataset Fisik PLTMH...")

# ==========================================
# 1. BASELINE NORMAL (Kondisi Mesin Sehat)
# ==========================================
# Getaran mesin normal didominasi rotasi turbin (misal 12.5 Hz = 750 RPM)
vibration_normal = 2.0 + 0.5 * np.sin(2 * np.pi * 12.5 * t) + np.random.normal(0, 0.1, num_points)
temp_normal = 68.0 + 0.2 * np.sin(2 * np.pi * 0.01 * t) + np.random.normal(0, 0.05, num_points)
flow_normal = 0.85 + 0.02 * np.sin(2 * np.pi * 0.5 * t) + np.random.normal(0, 0.01, num_points)
head_normal = 1.45 + np.random.normal(0, 0.01, num_points)
rpm_normal = 750 + np.random.normal(0, 1.5, num_points)

df_normal = pd.DataFrame({
    'timestamp_offset': t,
    'vibration': vibration_normal,
    'bearing_temp': temp_normal,
    'flow_rate': flow_normal,
    'head_pressure': head_normal,
    'rpm': rpm_normal,
    'label': ['normal'] * num_points
})

df_normal.to_csv(os.path.join(output_dir, 'baseline_normal.csv'), index=False)
print("✅ baseline_normal.csv berhasil dibuat.")

# ==========================================
# 2. ANOMALI (Unbalance / Kerusakan Baling-baling)
# ==========================================
# Menit pertama normal, menit kedua mulai bergetar hebat
vibration_anomaly = vibration_normal.copy()
temp_anomaly = temp_normal.copy()
rpm_anomaly = rpm_normal.copy()

# Injeksi anomali mulai detik ke-40 (titik ke-400)
start_anomaly = 400

# Getaran naik eksponensial lambat karena unbalance
growth_curve = np.exp(np.linspace(0, 2, num_points - start_anomaly)) - 1
vibration_anomaly[start_anomaly:] += growth_curve * 0.8 # Naik hingga ~8 mm/s (Bahaya!)

# Frekuensi getaran menjadi kacau (harmonics)
vibration_anomaly[start_anomaly:] += 1.5 * np.sin(2 * np.pi * 25.0 * t[start_anomaly:]) 

# Suhu bearing naik perlahan akibat gesekan tinggi
temp_curve = np.linspace(0, 15, num_points - start_anomaly) # Naik 15 derajat
temp_anomaly[start_anomaly:] += temp_curve

# RPM mulai turun/berfluktuasi liar karena gaya gesek
rpm_anomaly[start_anomaly:] -= np.linspace(0, 25, num_points - start_anomaly)
rpm_anomaly[start_anomaly:] += np.random.normal(0, 5, num_points - start_anomaly)

df_anomaly = pd.DataFrame({
    'timestamp_offset': t,
    'vibration': vibration_anomaly,
    'bearing_temp': temp_anomaly,
    'flow_rate': flow_normal, # Air tetap masuk, tapi mesin bermasalah
    'head_pressure': head_normal,
    'rpm': rpm_anomaly,
    'label': ['anomaly'] * num_points
})

df_anomaly.to_csv(os.path.join(output_dir, 'anomaly_unbalance.csv'), index=False)
print("✅ anomaly_unbalance.csv berhasil dibuat.")
print("Semua dataset siap digunakan oleh Edge Engine!")
