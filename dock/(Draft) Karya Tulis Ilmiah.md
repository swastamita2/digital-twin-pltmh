> KOMPETISI KARYA TULIS ILMIAH

Simulasi Digital Twin dengan Edge Computing untuk Monitoring 
Prediktif PLTMH Off-Grid di Wilayah 3T Indonesia

![](media/image1.png){width="5.21181in" height="5.21181in"}

Nama Ketua & Anggota Tim

TEKNOLOGI

INSTITUT TEKNOLOGI PLN

DKI JAKARTA

TAHUN 2026

PERNYATAAN PENELITI

Yang bertanda tangan di bawah ini:

|                      |     |                                              |
| -------------------- | --- | -------------------------------------------- |
| Nama                 | :   | Achmad Sapta Megan Nugroho                   |
| Tempat,Tanggal Lahir | :   | Pasuruan, 9 Mei 2005                         |
| NIM                  | :   | 202332119                                    |
| Asal Institusi       | :   | Institut Teknologi Perusahaan Listrik Negara |

dengan ini menyatakan sejujurnya bahwa karya tulis ilmiah saya dengan judul **"Simulasi Digital Twin dengan Edge Computing untuk Monitoring 
Prediktif PLTMH Off-Grid di Wilayah 3T Indonesia"** bersifat orisinal/bukan hasil tindak plagiarisme. Bilamana di kemudian hari ditemukan ketidaksesuaian dengan pernyataan ini, saya bersedia menerima konsekuensi sesuai aturan KKTIN. Demikian pernyataan ini dibuat dengan sesungguhnya dan sebenar-benarnya.

> Dibuat di Jakarta

> Pada tanggal ...... Mei 2026

> Pembuat Pernyataan

> Achmad Sapta Megan Nugroho

> 202332119

ABSTRAK

Pembangkit Listrik Tenaga Mikro Hidro (PLTMH) merupakan infrastruktur energi vital bagi wilayah tertinggal, terdepan, dan terluar (3T) di Indonesia. Namun, lokasi yang terisolasi menyebabkan tingginya biaya operasi dan pemeliharaan akibat keterlambatan deteksi kegagalan mekanis. Pendekatan pemeliharaan prediktif menggunakan *digital twin* konvensional seringkali gagal diterapkan karena sangat bergantung pada konektivitas *cloud* yang stabil dan *bandwidth* transmisi yang besar. Oleh karena itu, penelitian ini mengusulkan rancangan *digital twin framework* berbasis *edge computing* yang dirancang spesifik untuk beroperasi pada kondisi jaringan telekomunikasi yang terbatas dan *intermittent* (putus-nyambung). Melalui pendekatan eksperimen komputasional terapan (*in silico*), arsitektur tiga lapis (*Sensor, Edge, Cloud*) dikembangkan untuk mendistribusikan beban pemrosesan. *Edge engine* dirancang untuk melakukan filtrasi, agregasi, dan deteksi anomali secara lokal menggunakan algoritma *Statistical Process Control* (SPC) berbasis tiga-sigma. Untuk memastikan validitas pengujian, pembangkitan data simulasi dikalibrasi menggunakan distribusi statistik dari *dataset* operasional empiris referensi. Pengujian simulasi dievaluasi menggunakan metrik akurasi (*confusion matrix*), kecepatan deteksi peringatan (*latency*), dan persentase reduksi *bandwidth* transmisi. Selain itu, antarmuka *dashboard* visualisasi 3D terintegrasi dikembangkan guna meningkatkan *Situational Awareness* (SA) dan evaluasi tekno-ekonomi bagi operator lapangan. Penelitian ini menawarkan bukti konsep (*proof-of-concept*) bahwa arsitektur komputasional *edge-cloud* mampu mempertahankan fungsi deteksi anomali saat jaringan terputus, memangkas kebutuhan kuota transmisi data secara drastis, dan memberikan landasan pemantauan prediktif yang layak secara teknis maupun ekonomis untuk keberlanjutan elektrifikasi wilayah 3T.

**Kata Kunci:** *Digital Twin*, *Edge Computing*, Pembangkit Listrik Tenaga Mikro Hidro, Pemeliharaan Prediktif, Simulasi *In Silico*, Wilayah 3T.

**BAB 1. PENDAHULUAN**

### 1.1 Latar Belakang

Pembangkit Listrik Tenaga Mikro Hidro (PLTMH) merupakan solusi strategis untuk elektrifikasi wilayah tertinggal, terdepan, dan terluar (3T) di Indonesia. Meskipun rasio elektrifikasi nasional telah mencapai 99,83%, kesenjangan akses listrik masih terjadi di wilayah timur Indonesia seperti Nusa Tenggara Timur, Papua Pegunungan, dan Papua Tengah (Kementerian Energi dan Sumber Daya Mineral, 2025). Dalam kondisi geografis yang terpencar, PLTMH _off-grid_ menjadi opsi yang relevan karena lebih hemat biaya dibandingkan perluasan jaringan listrik nasional atau pembangkit terpusat (Kishore et al., 2021).

Namun, keberlanjutan operasi PLTMH di desa terpencil menghadapi masalah krusial berupa keterbatasan pemantauan kondisi komponen secara _real-time_ dan tingginya beban pemeliharaan. Studi komprehensif oleh Kishore et al. (2021) menunjukkan bahwa tingginya biaya operasi dan pemeliharaan (O&M) sering menjadi hambatan utama keberlanjutan operasional PLTMH *off-grid*, di mana kegagalan komponen mekanis yang tak terdeteksi dapat menyumbang kerugian signifikan. Lokasi yang jauh dari pusat layanan serta keterbatasan akses transportasi membuat inspeksi rutin tertunda. Akibatnya, pola pemeliharaan reaktif (_run-to-failure_) yang masih dominan menyebabkan _downtime_ panjang dan menurunkan keandalan pasokan listrik.

Sistem *monitoring* konvensional berbasis SCADA (*Supervisory Control and Data Acquisition*) memerlukan koneksi jaringan yang sangat stabil untuk transmisi data *real-time*, sehingga rentan gagal jika diterapkan di wilayah 3T dengan infrastruktur telekomunikasi terbatas. Sebagai alternatif yang lebih canggih, teknologi _digital twin_ menawarkan replika virtual yang tersinkronisasi dengan sistem fisik untuk memantau, menganalisis, dan mendiagnosis anomali secara prediktif (Gómez-Coronel et al., 2023; Do-Duy et al., 2022). Kendalanya, implementasi _digital twin_ konvensional berbasis *cloud-only* tetap menuntut konektivitas stabil, padahal penetrasi internet di pedesaan pada 2025 baru 76,96% dengan kualitas koneksi yang sering terputus (*intermittent*) (Asosiasi Penyelenggara Jasa Internet Indonesia, 2025).

Mengingat tingginya biaya implementasi perangkat keras (_hardware_) fisik, keterbatasan infrastruktur, dan hambatan akses geografis di wilayah 3T, penelitian ini mengadopsi pendekatan rekayasa simulasi komputasional (_in silico_) sebagai metode validasi *proof-of-concept* yang lebih efisien dan terukur. Menggunakan landasan parameter sensor berbiaya rendah yang telah tervalidasi dalam literatur (Magadán et al., 2022), penelitian ini mengusulkan rancangan _digital twin framework_ berbasis _edge computing_ yang adaptif terhadap konektivitas terbatas. Kontribusi utama penelitian ini terletak pada perancangan dan evaluasi simulatif arsitektur _edge-cloud_ tiga lapis yang mengintegrasikan model matematis _reduced-order_ PLTMH dengan mekanisme deteksi anomali statistik, sehingga menghasilkan kerangka yang dapat direplikasi di berbagai wilayah terpencil.

### 1.2 Rumusan Masalah

Berdasarkan latar belakang tersebut, rumusan masalah penelitian ini adalah:

1. Parameter operasional apa saja yang harus dimonitor secara _real-time_ untuk mendukung deteksi dini kegagalan komponen PLTMH dalam arsitektur _digital twin_ yang dirancang?
2. Bagaimana arsitektur digital twin berbasis edge computing dapat dirancang untuk mempertahankan fungsi deteksi anomali dengan latency minimal dan efisiensi bandwidth optimal pada kondisi konektivitas intermittent?
3. Seberapa besar peningkatan kinerja sistem pemantauan (dalam hal akurasi identifikasi anomali, _latency_ peringatan dini, dan reduksi _bandwidth_ transmisi) yang dapat dicapai melalui simulasi arsitektur _edge-cloud_ dibandingkan sistem terpusat konvensional?

### 1.3 Tujuan Penulisan

Tujuan penulisan karya tulis ilmiah ini adalah:

1. Mengidentifikasi parameter operasional utama PLTMH (hidrolik, mekanik, dan elektrikal) yang relevan untuk deteksi dini kegagalan.
2. Merancang arsitektur _digital twin_ tiga lapis (sensor, _edge_, _cloud_) secara simulatif yang adaptif terhadap keterbatasan konektivitas di wilayah 3T.
3. Mengevaluasi dampak penerapan _digital twin framework_ terhadap peningkatan kinerja sistem *monitoring* operasional dan efisiensi pemeliharaan melalui pengujian metrik skenario simulasi seperti _latency_ peringatan, efisiensi _bandwidth_, dan akurasi model.
4. Mengembangkan purwarupa _dashboard monitoring_ dengan visualisasi 3D sebagai antarmuka _digital twin_ untuk memudahkan operator dalam pengawasan dan pengambilan keputusan.

### 1.4 Manfaat Penelitian

Manfaat penelitian ini meliputi:

**Manfaat Teoretis**
Memperkaya literatur di bidang sistem informasi energi, _Internet of Things_ (IoT), dan teknologi _digital twin_ terdistribusi pada infrastruktur _off-grid_ yang memiliki keterbatasan telekomunikasi.

**Manfaat Metodologis**
Menyediakan kerangka kerja rekayasa simulasi komputasional (_in silico_) yang dapat direplikasi oleh peneliti lain untuk menguji dan memvalidasi arsitektur jaringan IoT pada kondisi infrastruktur terbatas tanpa harus melakukan instalasi *hardware* lapangan yang menelan biaya tinggi.

**Manfaat Praktis**

1. Bagi pengelola PLTMH: menyediakan kerangka pemantauan yang mendukung peralihan dari pemeliharaan reaktif ke prediktif dan mempercepat pengambilan keputusan teknis.
2. Bagi masyarakat pengguna listrik: meningkatkan keandalan pasokan listrik melalui deteksi dini gangguan operasional dan pengurangan durasi pemadaman.
3. Bagi pemerintah daerah dan pemangku kepentingan: menyediakan rancangan arsitektur yang dapat direplikasi pada PLTMH _off-grid_ di wilayah 3T sebagai acuan pengembangan program energi terbarukan.

**BAB 2. TINJAUAN PUSTAKA**

### 2.1 Arsitektur _Digital Twin_ Berbasis _Edge-Cloud_

_Digital twin_ (DT) adalah representasi virtual dinamis dari entitas fisik yang digunakan untuk pemantauan dan diagnosis secara _real-time_ (Gómez-Coronel et al., 2023). Untuk PLTMH _off-grid_ di wilayah 3T yang terkendala _bandwidth_ dan konektivitas, pendekatan *cloud-only* tidak dapat diandalkan. Oleh karena itu, penelitian ini mengadopsi arsitektur _edge computing_ tiga lapis (_Sensor, Edge, Cloud_) yang sejalan dengan kerangka kerja industri ISO 23247 (Kang et al., 2025). Pada _edge layer_, data difiltrasi, diagregasi, dan dianalisis anomali secara lokal, sehingga mengurangi beban transmisi ke _cloud_ secara drastis (Do-Duy et al., 2022). Untuk menjembatani kerumitan data komputasional, antarmuka visualisasi 3D diintegrasikan pada _dashboard_ guna meningkatkan _Situational Awareness_ (SA) operator lokal dalam mengambil keputusan pemeliharaan dengan cepat (Endsley, 1995).

### 2.2 Karakteristik Operasional dan Pemantauan PLTMH

PLTMH mengkonversi energi hidrolik menjadi energi mekanik dan listrik. Untuk beralih dari pemeliharaan reaktif menuju _predictive maintenance_, beberapa parameter sistem di sisi hidrodinamis, mekanis, dan elektrik wajib dipantau. Tabel 2.1 merangkum parameter kritis dan batas acuan normal untuk operasi PLTMH _cross-flow_ yang disimulasikan dalam penelitian ini.

**Tabel 2.1 Parameter Monitoring _Real-Time_ PLTMH**

| Parameter         | Tujuan Monitoring                 | Rentang Normal (Acuan Simulasi)    | Indikasi Gangguan            |
| ----------------- | --------------------------------- | ---------------------------------- | ---------------------------- |
| Tekanan _inlet_   | Kesehatan _penstock_ dan _intake_ | Sesuai _head_ desain ± 10%         | Penyumbatan atau kebocoran   |
| Debit aliran      | Stabilitas suplai air             | 0,25 – 0,90 m³/s                  | Sedimentasi, fluktuasi debit |
| Vibrasi turbin    | Keseimbangan mekanik              | < 4,5 mm/s (ISO 10816 Zone A/B)    | _Unbalance_, keausan bearing |
| Suhu _bearing_    | Keandalan pelumasan dan beban     | 35°C – 80°C                        | Overheating, gesekan tinggi  |
| RPM turbin        | Performa konversi energi          | 750 ± 5% rpm (tergantung desain)   | Penurunan efisiensi          |
| Tegangan keluaran | Kinerja generator                 | 220 V ± 10% (198 – 242 V)         | _Overload_, gangguan listrik |
| Frekuensi         | Stabilitas operasi generator      | 50 Hz ± 1% (49,5 – 50,5 Hz)       | Gangguan _governor_          |

### 2.3 Pemodelan Matematis Sistem

Model simulasi _digital twin_ dalam penelitian ini merupakan representasi matematika yang disederhanakan (_reduced-order model_) agar ringan untuk dieksekusi terus-menerus pada perangkat _edge_ yang terbatas. Terdapat tiga pemodelan inti:

**a) Model Hidrolik**
Debit operasional aktual ($Q$) diproyeksikan melalui modifikasi persamaan Bernoulli:
$$Q = C_d \cdot A \cdot \sqrt{2gH_{eff}}$$
dengan $H_{eff}$ adalah _head_ efektif setelah dikurangi kehilangan tekanan hidrolik akibat gesekan ($h_f$) pada jalur _penstock_:
$$H_{eff} = H_{gross} - \frac{f \cdot L \cdot v^2}{2 \cdot D \cdot g}$$

**b) Model Turbin-Generator**
Daya listrik ($P_{out}$) dikalkulasi berdasarkan aliran daya hidrolik dengan mempertimbangkan asumsikan efisiensi total sistem ($\eta_{total}$) pada rentang 0,65–0,80 (Do-Duy et al., 2022):
$$P_{out} = \eta_{total} \cdot \rho \cdot g \cdot Q \cdot H_{eff}$$

**c) Model Deteksi Anomali (_Statistical Process Control_)**
Sistem deteksi anomali pada sensor vibrasi dan suhu (yang mereferensikan akurasi _baseline_ empiris dari Magadán et al., 2022) dieksekusi menggunakan batas kontrol statistik _Shewhart_ tiga-sigma terhadap residual data ($e_t = x_t - \hat{x}_t$):
$$UCL = \bar{x} + 3\sigma, \quad LCL = \bar{x} - 3\sigma$$
Suatu kondisi akan secara otomatis diklasifikasikan sebagai *Critical* jika menyimpang melewati batas $3\sigma$, dan ditandai sebagai peringatan *Warning* jika melampaui $2\sigma$.

### 2.4 _State of the Art_ dan Gap Analysis

Tabel 2.2 merangkum posisi strategis penelitian ini dibandingkan dengan publikasi terkait terdahulu.

**Tabel 2.2 Ringkasan Publikasi Terkait dan _Gap Analysis_**

| Peneliti (Tahun)            | Metode                | Fokus                         | Keterbatasan                           | Celah yang Diisi Penelitian Ini                  |
| --------------------------- | --------------------- | ----------------------------- | -------------------------------------- | ------------------------------------------------ |
| Gómez-Coronel et al. (2023) | Implementasi fisik    | DT untuk PLTMH                | Mengandalkan konektivitas _cloud_      | Arsitektur _edge-based_ tahan _intermittent_     |
| Yao et al. (2022)           | Tinjauan literatur    | DT di sektor energi           | Tinjauan umum, tidak spesifik arsitektur| Desain spesifik _edge-cloud_ untuk PLTMH         |
| Do-Duy et al. (2022)        | Studi kasus jaringan  | DT dan MEC pada sistem energi | Skala jaringan besar, bukan _off-grid_ | Adaptasi ke PLTMH 3T skala kecil                 |
| Magadán et al. (2022)       | Eksperimen sensor     | _Low-cost sensor_ monitoring  | Belum terintegrasi dengan DT           | Integrasi asumsi sensor ke dalam model DT        |
| **Penelitian Ini**          | **Simulasi komputasional + Dashboard 3D + SPC** | **DT _Edge-Cloud_ PLTMH 3T** | **Belum divalidasi dengan data lapangan riil** | **Arsitektur adaptif _intermittent_ + Visualisasi _operator-friendly_** |

**Gap Metodologis:** Literatur _existing_ tentang DT untuk energi terbarukan didominasi oleh dua pendekatan: (1) implementasi *hardware* bersensor canggih pada instalasi *grid-connected* yang memerlukan investasi tinggi, atau (2) studi kasus retrospektif berbasis data historis yang tidak menguji skenario putusnya konektivitas jaringan secara *real-time*. Belum ada penelitian yang secara sistematis merancang dan mensimulasikan arsitektur DT berbasis *edge computing* yang spesifik untuk kondisi *off-grid* dengan konektivitas tidak stabil—kondisi jamak di wilayah 3T. Penelitian ini menutup celah tersebut dengan mengembangkan model simulasi yang ringan untuk perangkat *edge* (melalui _Statistical Process Control_) dan dilengkapi antarmuka visualisasi 3D yang sangat _operator-friendly_ guna mempercepat pengambilan keputusan teknis di lapangan terisolasi.

BAB 3. METODE PENELITIAN

### 3.1 Waktu dan Tempat Penelitian

Penelitian ini merupakan penelitian rekayasa komputasional (_computational engineering_) berbasis _in silico_ yang dilaksanakan pada bulan Mei hingga Juli 2026. Seluruh tahapan perancangan arsitektur, pemodelan matematis, dan eksekusi simulasi dilakukan di Laboratorium Komputasi Institut Teknologi PLN.

### 3.2 Alat dan Bahan

Sesuai dengan pendekatan perancangan _digital twin_ simulatif, penelitian ini tidak menggunakan perangkat keras lapangan fisik, melainkan mengandalkan lingkungan pengembangan virtual (_virtual development environment_):
1. **Perangkat Keras (_Hardware_):** Komputer/laptop sebagai mesin pengembangan dan *host* simulasi *edge* dengan spesifikasi komputasi yang memadai untuk menjalankan _rendering_ 3D dan kalkulasi _backend_ secara bersamaan.
2. **Perangkat Lunak (_Software_):** 
   - _Backend & Simulasi:_ Bahasa pemrograman Python dengan _framework_ FastAPI untuk pemodelan aliran data _real-time_, pembangkitan data _time-series_ acak terdistribusi, dan eksekusi algoritma deteksi anomali.
   - _Frontend & Visualisasi:_ _Framework_ React.js dengan pustaka TailwindCSS untuk antarmuka responsif dan Three.js/React Three Fiber untuk _rendering_ model turbin hidrolik 3D prosedural.
3. **Bahan Penelitian:** Data referensi untuk kalibrasi _baseline_ operasional terdiri dari dua sumber empiris:
   - _Baseline Mekanik/Elektrik:_ Profil fluktuasi _noise_ dan anomali vibrasi serta suhu (_unbalance_, _looseness_) direferensikan dari _dataset_ eksperimental mesin berputar akses terbuka (Brito et al., 2023).
   - _Baseline Hidrolik:_ Karakteristik fluktuasi tekanan dan debit air dikalibrasi menggunakan rekaman telemetri sumber terbuka pemeliharaan unit pompa hidrolik industri skala besar.

### 3.3 Rancangan dan Prosedur Penelitian

Penelitian ini menggunakan pendekatan eksperimen komputasional terapan (_applied computational experiment_) dengan tahapan prosedur sebagai berikut:
1. **Pemodelan Matematis Sistem Fisik:** Merumuskan persamaan hidrolik, daya turbin-generator, dan penetapan _threshold_ batas normal ($\mu \pm 3\sigma$) berdasarkan standar ISO dan data operasional referensi.
2. **Pengembangan _Edge Engine_ (Backend):** Membangun _script_ simulasi berbasis Python (FastAPI) yang bertugas membangkitkan data sensor dengan frekuensi 10 Hz. Alih-alih menggunakan pengacakan sederhana (_pure random walk_), fluktuasi data anomali mekanis dan hidrolik dimodelkan secara statistik agar menduplikasi distribusi karakteristik kesalahan dari referensi _dataset_ empiris yang telah dikalibrasi. _Engine_ ini juga mengeksekusi algoritma kontrol batas statistik (_Statistical Process Control_) untuk mendeteksi anomali.
3. **Pengembangan Dashboard Visualisasi (Frontend):** Mengembangkan antarmuka interaktif yang memuat grafik *time-series*, panel performa tekno-ekonomi, notifikasi peringatan berjenjang, dan representasi 3D turbin yang bereaksi secara *real-time* terhadap fluktuasi data dari *backend*.
4. **Skenario Simulasi dan Injeksi Anomali:** Menjalankan sistem dalam tiga skenario komprehensif:
   - _Skenario Operasi Normal:_ Menjalankan model pada _head_ dan debit stabil.
   - _Skenario Anomali:_ Menginjeksi lonjakan (_spike_) pada suhu *bearing* atau *vibrasi*, serta fluktuasi tak wajar pada tekanan hidrolik.
   - _Skenario Intermittent Connectivity:_ Mensimulasikan jaringan putus-nyambung untuk menguji ketahanan lapisan _edge_ dalam menyimpan data kritis sebelum disinkronkan.

### 3.4 Metode Pengolahan dan Analisis Data

Data hasil pengujian simulasi pada sistem _dashboard_ dan *backend* dianalisis menggunakan metrik performa komputasional dan operasional berikut:
1. **Analisis Kecepatan Deteksi (_Latency_):** Mengukur selisih waktu sejak anomali diinjeksi pada data mentah hingga *dashboard* memunculkan indikator peringatan (*Critical*).
   $$Latency = T_{alert} - T_{injection}$$
2. **Analisis Efisiensi Transmisi (_Bandwidth Reduction_):** Menghitung selisih persentase antara volume data mentah berfrekuensi tinggi (arsitektur terpusat/*cloud-only*) dibandingkan volume data teragregasi (arsitektur *edge-cloud*).
   $$Bandwidth\ Reduction = \left( \frac{Data_{cloud\_only} - Data_{edge\_cloud}}{Data_{cloud\_only}} \right) \times 100\%$$
3. **Analisis Performansi Algoritma:** Menggunakan _Confusion Matrix_ teoritis untuk mengevaluasi akurasi sistem _Statistical Process Control_ dalam mengidentifikasi anomali sejati (_True Positive_) dibandingkan laporan palsu (_False Positive_).
   $$Accuracy = \frac{TP + TN}{TP + TN + FP + FN}$$
4. **Estimasi Kelayakan Tekno-Ekonomi:** Membandingkan nilai asumsi investasi perangkat *edge computing* dengan estimasi biaya pemeliharaan reaktif/kegagalan fatal jika PLTMH _downtime_, berdasarkan perhitungan di modul tekno-ekonomi pada *dashboard*.

BAB 4. HASIL DAN PEMBAHASAN

### 4.1 Pengembangan Model _Digital Twin_

_(Bagian ini membahas hasil perancangan arsitektur edge-cloud dan pembuatan model matematis PLTMH. Akan disajikan skema arsitektur perangkat lunak dan flowchart pemrosesan data di edge layer dan cloud layer.)_

### 4.2 Hasil Simulasi Skenario Normal

_(Menyajikan grafik data simulasi sensor time-series saat kondisi operasi stabil. Membandingkan output dari model matematis (prediksi) dengan data sensor simulatif untuk menunjukkan tingkat akurasi model/baseline. Contoh: Grafik Debit Air vs Waktu, Tegangan vs Waktu.)_

### 4.3 Kinerja Deteksi Anomali pada Skenario Gangguan Fisik

_(Membahas respons arsitektur edge computing ketika diinjeksi anomali, misalnya lonjakan suhu bearing atau penurunan tekanan akibat kebocoran. Analisis difokuskan pada kemampuan edge dalam memberikan peringatan dini dengan latency yang rendah. Contoh: Grafik residual deteksi anomali dengan batas kontrol statistik $\mu \pm 3\sigma$.)_

### 4.4 Evaluasi Ketahanan pada Jaringan _Intermittent_

_(Menyajikan hasil simulasi pengiriman data saat terjadi putus-nyambung koneksi internet. Menampilkan metrik penggunaan bandwidth dan efisiensi penyimpanan lokal/buffer di perangkat edge. Contoh: Tabel perbandingan penggunaan bandwidth Konvensional vs Edge DT, Grafik pemulihan sinkronisasi data pasca-pemadaman jaringan.)_

### 4.5 Analisis Potensi Peningkatan Keandalan

_(Menganalisis secara deskriptif dan teoritis bagaimana kecepatan deteksi dari simulasi berpotensi mencegah kegagalan fatal komponen PLTMH. Membahas proyeksi perbaikan metrik keandalan seperti penurunan persentase downtime teoritis.)_

BAB 5. KESIMPULAN DAN SARAN

Bagian ini memuat inti hasil penulisan karya tulis ilmiah sebagai jawaban atas masalah/hipotesis penelitian. Selanjutnya, peneliti menuliskan saran yang memuat hal-hal yang dianggap perlu dikaji lebih lanjut. (halaman baru)

DAFTAR PUSTAKA

Bagian ini memuat referensi yang dirujuk dalam naskah penelitian dan ditulis secara alfabetis dan konsisten sesuai dengan selingkung (APA, MLA, atau yang lain) yang digunakan. Ukuran huruf tiap pustaka 11 pt. Daftar pustaka tidak bersumber dari wikipedia atau blog pribadi.

Contoh pustaka jurnal: Yuliana N.D., Iqbal M., Jahangir M., Wijaya C.H., Korthout H., Kottenhage M., Kim H.K., Verpoorte R. 2011. Screening of selected Asian spices for anti-obesity related bioactivities. Food Chem 126: 1724-1729. DOI: 10.1016/j.foodchem 2010.12.066

Contoh pustaka buku: Lioe H.N., Apriyantono A., Yasuda M. 2012. Soy Sauce: Typical Aspects of Japanes Japanese Shoyu and Indonesian Kecap. 93-102. CRC Press, Boca Raton, Florida.

Contoh pustaka skripsi, tesis dan disertasi: Merdiyanti A. 2008. Paket Teknologi Pembuatan Mi Kering dengan Memanfaatkan Bahan Baku Tepung Jagung \[Skripsi\]. Bogor: Fakultas Teknologi Pertanian, Institut Pertanian Bogor.

Contoh pustaka dari internet: Van der Sman RGM. 2012. Soft matter approaches to food structuring. http://www.sciencedirect.com/science/article/pii/S0001868612000620 \[04 Juni 2012\].
