"""
Dataset Generator — Simulasi Data Operasional PLTMH (10 Hz)
Menghasilkan data time-series untuk parameter kritis:
  - flow_rate (m³/s): Debit air masuk turbin
  - vibration (mm/s): Getaran turbin (ISO 10816)
  - gen_temp (°C): Suhu generator
  - voltage (V): Tegangan output
  - current (A): Arus output
  - power_kw (kW): Daya output (V × I / 1000)
  - head_pressure (bar): Tekanan inlet (proxy)
  - rpm: Kecepatan turbin

Pola data mencakup:
  - Fluktuasi musiman/harian
  - Degradasi komponen bertahap
  - Anomali sporadis (spike/getaran/overheat)
"""

import os
import csv
import math
import random
from datetime import datetime, timedelta


def generate_pltmh_dataset(duration_hours=2, sampling_hz=10, output_path=None):
    """Generate dataset simulasi operasional PLTMH.

    Default: 10 Hz selama 2 jam (sekitar 72.000 titik data).
    """
    random.seed(42)

    if output_path is None:
        output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset_pltmh.csv')

    total_points = int(duration_hours * 3600 * sampling_hz)
    dt = 1.0 / sampling_hz
    start_time = datetime(2026, 5, 1, 8, 0, 0)

    data = []

    # Baseline parameters untuk PLTMH 50 kW tipe Cross-flow
    BASE_FLOW = 0.55       # m³/s
    BASE_VIBRATION = 2.8   # mm/s (normal < 4.5 ISO 10816)
    BASE_GEN_TEMP = 58.0   # °C
    BASE_VOLTAGE = 220.0   # V
    BASE_CURRENT = 180.0   # A (untuk ~40 kW)
    BASE_HEAD = 1.45       # bar (proxy tekanan inlet)
    BASE_RPM = 750.0       # rpm

    # Degradation factors (simulasi keausan bertahap)
    bearing_wear = 0.0      # Akan meningkat seiring waktu
    pipe_degradation = 0.0  # Simulasi kebocoran pipa bertahap

    for i in range(total_points):
        t = i * dt
        current_time = start_time + timedelta(seconds=t)
        day_of_year = current_time.timetuple().tm_yday

        # --- Pola Musiman + Harian ---
        seasonal_factor = 0.15 * math.sin(2 * math.pi * (day_of_year - 30) / 365)
        diurnal_factor = 0.03 * math.sin(2 * math.pi * t / (24 * 3600))

        # --- Degradasi Bertahap ---
        if i > total_points * 0.55:
            bearing_wear = min(3.5, (i - total_points * 0.55) * 0.00008)
        if i > total_points * 0.70:
            pipe_degradation = min(0.12, (i - total_points * 0.70) * 0.00001)

        # --- Anomali Sporadis (DIMATIKAN UNTUK KONDISI NORMAL MURNI) ---
        vibration_spike = 0.0
        temp_spike = 0.0
        flow_drop = 0.0

        if False: # random.random() < 0.0025:
            vibration_spike = random.uniform(2.0, 5.0)
        if False: # random.random() < 0.002:
            temp_spike = random.uniform(15, 35)
        if False: # random.random() < 0.003:
            flow_drop = random.uniform(0.15, 0.35)

        # --- Hitung Parameter ---
        # 1. Flow Rate (m³/s)
        flow_rate = (BASE_FLOW + seasonal_factor + diurnal_factor
                     - pipe_degradation
                     - flow_drop
                     + random.gauss(0, 0.01))
        flow_rate = max(0.05, min(flow_rate, 1.2))

        # 2. Vibration (mm/s) — ISO 10816
        vibration = (BASE_VIBRATION
                     + bearing_wear
                     + vibration_spike
                     + random.gauss(0, 0.25))
        vibration = max(0.5, min(vibration, 12.0))

        # 3. Generator Temperature (°C)
        load_factor = flow_rate / BASE_FLOW
        gen_temp = (BASE_GEN_TEMP
                    + (load_factor - 1) * 10
                    + bearing_wear * 2.5
                    + temp_spike
                    + random.gauss(0, 1.2))
        gen_temp = max(35, min(gen_temp, 130))

        # 4. Voltage (V)
        voltage = (BASE_VOLTAGE
                   + (flow_rate - BASE_FLOW) * 15
                   - bearing_wear * 1.5
                   + random.gauss(0, 1.5))
        voltage = max(180, min(voltage, 250))

        # 5. Current (A)
        current = (BASE_CURRENT * load_factor
                   - bearing_wear * 3
                   + random.gauss(0, 2.5))
        current = max(20, min(current, 280))

        # 6. Power Output (kW)
        power_kw = (voltage * current) / 1000
        power_kw = max(0, min(power_kw, 100))

        # 7. Head Pressure (bar)
        head_pressure = (BASE_HEAD
                         + (flow_rate - BASE_FLOW) * 0.6
                         - pipe_degradation * 2
                         + random.gauss(0, 0.02))
        head_pressure = max(0.5, min(head_pressure, 2.5))

        # 8. RPM
        rpm = (BASE_RPM
               + (flow_rate - BASE_FLOW) * 120
               - bearing_wear * 5
               + random.gauss(0, 2.0))
        rpm = max(500, min(rpm, 900))

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
            'date': current_time.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3],
            'flow_rate': round(flow_rate, 3),
            'vibration': round(vibration, 2),
            'gen_temp': round(gen_temp, 1),
            'voltage': round(voltage, 1),
            'current': round(current, 1),
            'power_kw': round(power_kw, 2),
            'head_pressure': round(head_pressure, 3),
            'rpm': round(rpm, 1),
            'anomaly_label': anomaly_str,
        })

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fieldnames = [
        'date', 'flow_rate', 'vibration', 'gen_temp', 'voltage', 'current',
        'power_kw', 'head_pressure', 'rpm', 'anomaly_label'
    ]

    with open(output_path, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

    print(f"Dataset PLTMH generated: {len(data)} rows -> {output_path}")
    return data


if __name__ == "__main__":
    generate_pltmh_dataset()
