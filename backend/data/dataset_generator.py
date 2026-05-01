"""
Dataset Generator — Simulasi Data Operasional PLTMH
Menghasilkan data time-series realistis untuk 6 parameter kritis:
  - flow_rate (m³/s): Debit air masuk turbin
  - vibration (mm/s): Getaran turbin (ISO 10816)
  - gen_temp (°C): Suhu generator
  - voltage (V): Tegangan output
  - current (A): Arus output
  - power_kw (kW): Daya output (V × I / 1000)

Data mencakup pola:
  - Musiman (musim hujan → debit tinggi, musim kemarau → debit rendah)
  - Degradasi komponen bertahap (bearing aus, pipa bocor)
  - Anomali sporadis (getaran spike, overheating)
"""

import os
import csv
import math
import random
from datetime import datetime, timedelta


def generate_pltmh_dataset(days=365, output_path=None):
    """Generate dataset simulasi operasional PLTMH selama `days` hari.
    
    Setiap hari menghasilkan 24 data point (per jam) untuk total days×24 rows.
    Untuk feasibility paper, kita generate data harian (1 row/hari) selama 365 hari.
    """
    random.seed(42)
    
    if output_path is None:
        output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset_pltmh.csv')
    
    start_date = datetime(2025, 4, 1)
    data = []
    
    # Baseline parameters untuk PLTMH 50 kW tipe Cross-flow
    BASE_FLOW = 0.55       # m³/s
    BASE_VIBRATION = 2.8   # mm/s (normal < 4.5 ISO 10816)
    BASE_GEN_TEMP = 58.0   # °C
    BASE_VOLTAGE = 220.0   # V
    BASE_CURRENT = 180.0   # A (untuk ~40 kW)
    
    # Degradation factors (simulasi keausan bertahap)
    bearing_wear = 0.0      # Akan meningkat seiring waktu
    pipe_degradation = 0.0  # Simulasi kebocoran pipa bertahap
    
    for day_idx in range(days):
        current_date = start_date + timedelta(days=day_idx)
        month = current_date.month
        day_of_year = current_date.timetuple().tm_yday
        
        # --- Pola Musiman ---
        # Indonesia: musim hujan ≈ Nov-Mar, musim kemarau ≈ Apr-Okt
        # Menggunakan fungsi sinusoidal untuk pola curah hujan → debit
        seasonal_factor = 0.3 * math.sin(2 * math.pi * (day_of_year - 30) / 365)
        
        # --- Degradasi Bertahap ---
        # Bearing mulai aus setelah hari ke-200 (simulasi)
        if day_idx > 200:
            bearing_wear = min(3.5, (day_idx - 200) * 0.012)
        
        # Pipa mulai bocor ringan setelah hari ke-250
        if day_idx > 250:
            pipe_degradation = min(0.12, (day_idx - 250) * 0.001)
        
        # --- Anomali Sporadis ---
        vibration_spike = 0
        temp_spike = 0
        flow_drop = 0
        
        # Anomali getaran (debris masuk turbin) — ~3% hari
        if random.random() < 0.03:
            vibration_spike = random.uniform(2.0, 5.0)
        
        # Anomali suhu (beban berlebih) — ~2% hari
        if random.random() < 0.02:
            temp_spike = random.uniform(15, 35)
        
        # Anomali debit (penyumbatan intake) — ~4% hari
        if random.random() < 0.04:
            flow_drop = random.uniform(0.15, 0.35)
        
        # --- Hitung Parameter ---
        # 1. Flow Rate (m³/s)
        flow_rate = (BASE_FLOW + seasonal_factor
                     - pipe_degradation
                     - flow_drop
                     + random.gauss(0, 0.02))
        flow_rate = max(0.05, min(flow_rate, 1.2))
        
        # 2. Vibration (mm/s) — ISO 10816
        vibration = (BASE_VIBRATION
                     + bearing_wear
                     + vibration_spike
                     + random.gauss(0, 0.3))
        vibration = max(0.5, min(vibration, 12.0))
        
        # 3. Generator Temperature (°C)
        # Suhu naik seiring beban dan keausan
        load_factor = flow_rate / BASE_FLOW
        gen_temp = (BASE_GEN_TEMP
                    + (load_factor - 1) * 10
                    + bearing_wear * 2.5
                    + temp_spike
                    + random.gauss(0, 1.5))
        gen_temp = max(35, min(gen_temp, 130))
        
        # 4. Voltage (V) — fluktuasi proporsional debit
        voltage = (BASE_VOLTAGE
                   + (flow_rate - BASE_FLOW) * 15
                   - bearing_wear * 1.5
                   + random.gauss(0, 2.0))
        voltage = max(180, min(voltage, 250))
        
        # 5. Current (A) — proporsional beban
        current = (BASE_CURRENT * load_factor
                   - bearing_wear * 3
                   + random.gauss(0, 3.0))
        current = max(20, min(current, 280))
        
        # 6. Power Output (kW)
        power_kw = (voltage * current) / 1000
        power_kw = max(0, min(power_kw, 100))
        
        # --- Tentukan status anomali (ground truth untuk validasi) ---
        anomaly_flags = []
        if vibration > 4.5:
            anomaly_flags.append('vibration_high')
        if gen_temp > 80:
            anomaly_flags.append('temp_high')
        if flow_rate < 0.25:
            anomaly_flags.append('flow_low')
        if voltage < 198 or voltage > 242:
            anomaly_flags.append('voltage_unstable')
        
        anomaly_str = '|'.join(anomaly_flags) if anomaly_flags else 'normal'
        
        data.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'flow_rate': round(flow_rate, 3),
            'vibration': round(vibration, 2),
            'gen_temp': round(gen_temp, 1),
            'voltage': round(voltage, 1),
            'current': round(current, 1),
            'power_kw': round(power_kw, 1),
            'anomaly_label': anomaly_str
        })
    
    # Write CSV
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fieldnames = ['date', 'flow_rate', 'vibration', 'gen_temp', 'voltage', 'current', 'power_kw', 'anomaly_label']
    
    with open(output_path, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"Dataset PLTMH generated: {len(data)} rows -> {output_path}")
    return data


if __name__ == "__main__":
    generate_pltmh_dataset()
