"""
=======================================================
RESTORE NORMAL — Kembalikan dataset ke kondisi normal
=======================================================
Jalankan script ini SETELAH selesai mengambil screenshot
anomali di Bab 4.3.

CARA PAKAI:
  python restore_normal.py
=======================================================
"""

import os
import shutil

CSV_PATH = os.path.join(os.path.dirname(__file__), 'data', 'dataset_pltmh.csv')
BACKUP_PATH = CSV_PATH + '.backup'

def restore_normal():
    if not os.path.exists(BACKUP_PATH):
        print("❌ File backup tidak ditemukan. Tidak ada yang perlu dikembalikan.")
        return

    shutil.copy2(BACKUP_PATH, CSV_PATH)
    os.remove(BACKUP_PATH)
    print("✅ Dataset berhasil dikembalikan ke kondisi NORMAL (backup dipulihkan).")
    print("⏳ Tunggu 5 detik, dashboard akan kembali ke status normal.")

if __name__ == '__main__':
    restore_normal()
