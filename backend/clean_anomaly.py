"""
=======================================================
CLEAN ANOMALY — Hapus semua baris anomali dari dataset
=======================================================
Jalankan script ini untuk membersihkan data anomali
yang tersisa dari inject_anomaly.py.

CARA PAKAI:
  .\\backend\\venv\\Scripts\\python.exe .\\backend\\clean_anomaly.py
=======================================================
"""

import os
import csv
import shutil

CSV_PATH = os.path.join(os.path.dirname(__file__), 'data', 'dataset_pltmh.csv')
BACKUP_PATH = CSV_PATH + '.backup'

def clean_anomaly():
    if not os.path.exists(CSV_PATH):
        print("❌ File dataset tidak ditemukan.")
        return

    # Cek apakah ada backup dulu (dari inject_anomaly.py)
    if os.path.exists(BACKUP_PATH):
        shutil.copy2(BACKUP_PATH, CSV_PATH)
        os.remove(BACKUP_PATH)
        print("✅ Dataset dikembalikan dari backup (kondisi NORMAL).")
        return

    # Jika tidak ada backup, bersihkan baris anomali secara manual
    print("⚙️  Membaca dataset...")
    clean_rows = []
    removed = 0

    with open(CSV_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            label = row.get('anomaly_label', 'normal').strip().lower()
            vibration = float(row.get('vibration', 0))
            gen_temp = float(row.get('gen_temp', 0))

            # Hapus baris yang jelas anomali:
            # vibration > 5.0 atau gen_temp > 85 atau label bukan 'normal'
            if label != 'normal' or vibration > 5.0 or gen_temp > 85:
                removed += 1
                continue
            clean_rows.append(row)

    with open(CSV_PATH, mode='w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(clean_rows)

    print(f"✅ Selesai! {removed} baris anomali dihapus.")
    print(f"📊 Dataset tersisa: {len(clean_rows)} baris data normal.")
    print("⏳ Restart backend agar perubahan terbaca.")

if __name__ == '__main__':
    clean_anomaly()
