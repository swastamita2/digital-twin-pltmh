# Digital Twin PLTMH (Pembangkit Listrik Tenaga Mikro Hidro)

Sistem pemantauan dan analisis (Digital Twin) berbasis Edge Computing untuk PLTMH, dikembangkan untuk Kompetisi Karya Tulis Ilmiah Nasional (KKTIN).

## 🚀 Persiapan dan Cara Menjalankan (Sangat Mudah)

Proyek ini telah dikonfigurasi agar dapat langsung dijalankan (plug-and-play) di mesin Windows baru. Anda tidak perlu repot melakukan instalasi manual, cukup jalankan **satu script** berikut:

1. Buka **PowerShell** (atau Terminal di VS Code)
2. Masuk ke folder proyek: `cd digital-twin-pltmh`
3. Jalankan script:
   ```powershell
   .\run.ps1
   ```

Script di atas akan secara otomatis:
- Membuat Python Virtual Environment (`venv`) jika belum ada.
- Menginstal semua modul Python yang dibutuhkan (`requirements.txt`).
- Menginstal seluruh dependensi Node.js untuk Frontend jika `node_modules` belum ada.
- Menjalankan **Python Flask Backend** di `http://localhost:5000`.
- Menjalankan **Next.js Frontend** di `http://localhost:3000`.

## ⚙️ Persyaratan Sistem
Pastikan komputer/laptop Anda telah menginstal:
- **Python 3.8+** (beserta pip)
- **Node.js** (versi 18 LTS atau lebih baru)
- **Git**

## 📂 Struktur Proyek
- `/backend`: Server Flask, model Edge Computing, deteksi anomali, dan algoritma *techno-economics*.
- `/frontend`: Dashboard Next.js (TailwindCSS, Recharts, Three.js untuk visualisasi 3D).
- `/dock`: Berisi referensi dokumen dan panduan.

## 🛠️ Penyelesaian Masalah (Troubleshooting)
- Jika gagal menjalankan script karena Execution Policy Windows, jalankan perintah ini di PowerShell sebagai Administrator terlebih dahulu: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Untuk menghentikan sistem, cukup tutup jendela PowerShell atau tekan `Ctrl + C` pada masing-masing terminal.

# Jalankan script inject menggunakan python dari venv
.\backend\venv\Scripts\python.exe .\backend\inject_anomaly.py
# Jalankan script restore menggunakan python dari venv
.\backend\venv\Scripts\python.exe .\backend\restore_normal.py
