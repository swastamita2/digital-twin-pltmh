"""
=======================================================
INJECT ANOMALY — untuk Screenshot Bab 4.3
=======================================================
Script ini menambahkan 10 baris anomali getaran KRITIS
ke akhir dataset, lalu menyimpannya.

Backend akan auto-detect perubahan file (cache invalidation)
dan dashboard akan menampilkan status CRITICAL dalam 5 detik.

CARA PAKAI:
  1. Pastikan backend sudah berjalan (run.ps1)
  2. Jalankan: python inject_anomaly.py
  3. Tunggu 5 detik → buka http://localhost:3000
  4. Ambil screenshot dashboard (status CRITICAL, grafik SPC merah)
  5. Jalankan: python restore_normal.py untuk mengembalikan data
=======================================================
"""

import csv
import os
import shutil
from datetime import datetime, timedelta

CSV_PATH = os.path.join(os.path.dirname(__file__), 'data', 'dataset_pltmh.csv')
BACKUP_PATH = CSV_PATH + '.backup'

def inject_anomaly():
    # Buat backup dulu sebelum modifikasi
    shutil.copy2(CSV_PATH, BACKUP_PATH)
    print(f"✅ Backup dibuat: {BACKUP_PATH}")

    # Baca data yang ada
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    # Ambil tanggal terakhir
    last_date_str = rows[-1]['date']
    # Format baru dari dataset 10 Hz: 2026-05-01T09:59:59.900
    try:
        last_date = datetime.strptime(last_date_str, '%Y-%m-%dT%H:%M:%S.%f')
    except ValueError:
        # Fallback jika tidak ada milidetik
        last_date = datetime.strptime(last_date_str, '%Y-%m-%dT%H:%M:%S')

    # Tambahkan field yang hilang jika perlu (karena format baru ada rpm dll)
    anomaly_rows = [
        # Fase 1: Warning — getaran mulai naik mendekati batas
        {'flow_rate': 0.68, 'vibration': 4.6,  'gen_temp': 68.2, 'voltage': 219.5, 'current': 218.0, 'power_kw': 47.8, 'head_pressure': 1.5, 'rpm': 760.0, 'anomaly_label': 'vibration_high'},
        {'flow_rate': 0.67, 'vibration': 5.1,  'gen_temp': 69.1, 'voltage': 218.9, 'current': 215.4, 'power_kw': 47.1, 'head_pressure': 1.5, 'rpm': 755.0, 'anomaly_label': 'vibration_high'},
        {'flow_rate': 0.66, 'vibration': 5.8,  'gen_temp': 70.5, 'voltage': 218.0, 'current': 212.0, 'power_kw': 46.2, 'head_pressure': 1.5, 'rpm': 750.0, 'anomaly_label': 'vibration_high'},
        # Fase 2: Critical — getaran jauh melewati UCL (4.5 mm/s ISO 10816)
        {'flow_rate': 0.65, 'vibration': 6.9,  'gen_temp': 72.8, 'voltage': 217.5, 'current': 209.5, 'power_kw': 45.6, 'head_pressure': 1.5, 'rpm': 745.0, 'anomaly_label': 'vibration_high'},
        {'flow_rate': 0.64, 'vibration': 7.8,  'gen_temp': 75.3, 'voltage': 216.1, 'current': 206.0, 'power_kw': 44.5, 'head_pressure': 1.5, 'rpm': 740.0, 'anomaly_label': 'vibration_high'},
        {'flow_rate': 0.63, 'vibration': 9.2,  'gen_temp': 78.9, 'voltage': 215.0, 'current': 200.0, 'power_kw': 43.0, 'head_pressure': 1.5, 'rpm': 735.0, 'anomaly_label': 'vibration_high'},
        # Fase 3: Parah — getaran masuk Zone D (11 mm/s = SHUTDOWN)
        {'flow_rate': 0.62, 'vibration': 10.4, 'gen_temp': 83.1, 'voltage': 213.5, 'current': 195.0, 'power_kw': 41.6, 'head_pressure': 1.5, 'rpm': 730.0, 'anomaly_label': 'vibration_high'},
        {'flow_rate': 0.61, 'vibration': 11.8, 'gen_temp': 88.7, 'voltage': 212.0, 'current': 190.0, 'power_kw': 40.3, 'head_pressure': 1.5, 'rpm': 725.0, 'anomaly_label': 'vibration_high'},
        {'flow_rate': 0.60, 'vibration': 12.0, 'gen_temp': 92.4, 'voltage': 211.0, 'current': 185.0, 'power_kw': 39.1, 'head_pressure': 1.5, 'rpm': 720.0, 'anomaly_label': 'vibration_high'},
        {'flow_rate': 0.59, 'vibration': 12.0, 'gen_temp': 95.0, 'voltage': 210.5, 'current': 182.0, 'power_kw': 38.3, 'head_pressure': 1.5, 'rpm': 715.0, 'anomaly_label': 'vibration_high'},
    ]

    # Tambahkan tanggal ke setiap baris anomali (10 Hz = +100 ms)
    for i, row in enumerate(anomaly_rows):
        new_date = last_date + timedelta(milliseconds=100 * (i + 1))
        row['date'] = new_date.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]

    # Tulis kembali ke CSV
    all_rows = rows + anomaly_rows
    with open(CSV_PATH, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"\n🚨 ANOMALI DIINJEKSI: {len(anomaly_rows)} baris getaran KRITIS ditambahkan")
    print(f"   Getaran puncak: 12.0 mm/s (ISO 10816 Zone D — BAHAYA)")
    print(f"   Batas normal  :  4.5 mm/s (ISO 10816 Zone A/B)\n")
    print("⏳ Tunggu 5 detik, lalu buka http://localhost:3000")
    print("📸 Ambil screenshot saat status 'CRITICAL' menyala merah")
    print("\n   Setelah selesai screenshot, jalankan: python restore_normal.py")

if __name__ == '__main__':
    inject_anomaly()
