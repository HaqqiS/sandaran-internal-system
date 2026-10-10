# 📄 Product Requirement Document (PRD)

## Astaloka / Sandaran Studio — Sistem Manajemen Proyek Arsitektur & Interior

| Metadata | Keterangan |
| :--- | :--- |
| **Produk** | Astaloka / Sandaran Internal System |
| **Domain Bisnis** | Studio Desain Arsitektur, Interior, & Manajemen Konstruksi Lapangan |
| **Fase Rilis** | *Active Development & Field Testing Phase* |
| **Target Platform** | Web Application (Mobile-First Responsive + Desktop Executive) |
| **Dokumentasi Pendukung** | [PERMISSIONS.md](./PERMISSIONS.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [KNOWN-ISSUES.md](./KNOWN-ISSUES.md) |

---

## 1. Ringkasan Eksekutif & Latar Belakang (Executive Summary)

**Astaloka / Sandaran Studio** adalah studio arsitektur dan interior yang menangani proyek desain hingga eksekusi konstruksi fisik di lapangan. 

Dalam operasional proyek konstruksi, sering terjadi kesenjangan (*gap*) komunikasi antara tim studio desain, manajemen keuangan, pimpinan eksekutif, dan pelaksana lapangan. Informasi progres kerja sering kali tercecer di grup chat (WhatsApp), bukti pengeluaran kas kecil hilang atau terlambat dicatat, mutasi keluar-masuk material bahan bangunan tidak terlacak secara akurat, dan dokumen gambar kerja revisi tidak tersinkronisasi.

**Sistem Manajemen Proyek Internal ini dibangun sebagai solusi tunggal terintegrasi (*single source of truth*)** untuk:
1. Memfasilitasi pelaporan operasional harian secara instan langsung dari lokasi proyek (*mobile-first*).
2. Memberikan transparansi pengelolaan dana darurat / kas kecil (*petty cash*) di lapangan.
3. Mengontrol pergerakan material dan logistik proyek secara akurat.
4. Memberikan visibilitas pengawasan tingkat tinggi (*executive oversight*) secara real-time kepada pemilik studio dan direksi.

---

## 2. Pernyataan Masalah & Solusi (Problem Statement & Value Proposition)

### A. Masalah Utama yang Dihadapi
1. **Pelaporan Manual & Tidak Terstruktur**: Progres harian, kendala cuaca, dan jumlah pekerja lapangan hanya disampaikan secara informal via chat tanpa arsip histori yang terorganisir per proyek.
2. **Kwitansi Kas Kecil Sering Hilang**: Pengeluaran darurat di lapangan sulit dipertanggungjawabkan karena nota belanja basah/hilang sebelum diverifikasi oleh bagian keuangan.
3. **Ketidaksesuaian Stok Material**: Pembelian semen, pasir, besi, dan material lain sering mengalami ketidakcocokan antara catatan kantor dengan fisik di gudang proyek.
4. **Revisi Gambar Kerja Tidak Sinkron**: Tim pelaksana di lapangan sering menggunakan gambar cetak versi lama karena gambar revisi dari arsitek belum terdistribusikan secara cepat.
5. **Eksekutif Kurang Visibilitas Real-time**: Pimpinan studio harus menunggu rekap mingguan manual untuk mengetahui apakah proyek berjalan sesuai jadwal atau mengalami kendala.

### B. Nilai Solusi (Value Proposition)
* **Mobile-First Data Entry**: Antarmuka dioptimalkan untuk ponsel pintar sehingga Supervisor dan tim Logistik dapat menginput data di lapangan dalam hitungan menit.
* **3-Layer Security Guard**: Pemisahan tegas hak akses level sistem dan level proyek untuk menjaga privasi anggaran dan integritas data.
* **Verifikasi Digital Dua Arah**: Alur pengajuan dan verifikasi kas darurat serta logistik tercatat secara permanen dengan foto bukti pendukung.
* **Executive Lens**: Dashboard cerdas yang menyajikan rangkuman progres, kesehatan logistik, dan aktivitas proyek tanpa data rekaan.

---

## 3. Persona Pengguna & Peran Sistem (User Roles)

Sistem membedakan peran menjadi dua tingkatan: **Global Role** (tingkat sistem) dan **Project Role** (tingkat keterlibatan di proyek spesifik).

```
┌────────────────────────────────────────────────────────┐
│                      GLOBAL ROLES                      │
│   ADMIN (Sistem)   │   EXECUTIVE (Direksi)   │  USER   │
└───────────────────────────────┬────────────────────────┘
                                │
                                ▼ Ditugaskan ke Proyek (ProjectMember)
┌────────────────────────────────────────────────────────┐
│                     PROJECT ROLES                      │
│  SUPERVISOR   │   ARCHITECT   │   FINANCE   │ LOGISTIC │
└────────────────────────────────────────────────────────┘
```

### A. Global Roles
1. **Administrator (`ADMIN`)**:
   - *Persona*: Tim IT / Admin Operasional Sistem.
   - *Wewenang*: Akses menyeluruh tanpa batas, manajemen akun pengguna, inisiasi proyek baru, bypass validasi kepemilikan.
2. **Executive (`EXECUTIVE` — sebelumnya CEO)**:
   - *Persona*: Pemilik Studio / Direktur Utama.
   - *Wewenang*: Akses pengawasan portofolio menyeluruh ke seluruh proyek, menyetujui user baru, membuat proyek, dan memantau analitik keuangan & logistik.
3. **User (`USER`)**:
   - *Persona*: Karyawan umum / staf lapangan / konsultan luar.
   - *Wewenang*: Hanya dapat mengakses menu setelah akun di-approve dan ditugaskan ke salah satu proyek aktif.

### B. Project Roles
1. **Supervisor (`SUPERVISOR` — sebelumnya Mandor)**:
   - *Persona*: Pelaksana proyek / mandor di lokasi konstruksi.
   - *Tanggung Jawab*: Menginput laporan harian, mengunggah foto progres, mencatat pekerja dan cuaca, mengajukan dana darurat kas kecil, serta mencatat penggunaan material di lapangan.
2. **Architect (`ARCHITECT`)**:
   - *Persona*: Arsitek perancang / pengawas teknis lapangan.
   - *Tanggung Jawab*: Mengunggah dan memperbarui gambar kerja (CAD/PDF), memeriksa kepatuhan spesifikasi, membuat laporan pengawasan arsitektural.
3. **Finance (`FINANCE`)**:
   - *Persona*: Staf keuangan studio.
   - *Tanggung Jawab*: Memverifikasi penarikan kas darurat (`UNREVIEWED` ➔ `REVIEWED`), mengisi ulang kas kecil proyek, memantau pengeluaran dan stok material (*read-only*).
4. **Logistic (`LOGISTIC`)**:
   - *Persona*: Staf pengadaan & logistik gudang proyek.
   - *Tanggung Jawab*: Mengelola katalog master barang (tambah jenis semen, cat, baut, dll.), mencatat dan memverifikasi barang masuk (`IN`) dan keluar (`OUT`), serta mengontrol inventaris fisik.

---

## 4. Kebutuhan Fungsional per Modul (Functional Requirements)

### 4.1 Modul Pengguna & Autentikasi (Auth & User Management)
* **Registrasi & Onboarding**: Pengguna dapat mendaftar menggunakan email atau nomor telepon (Better Auth). Akun baru berstatus `isActive: false` dan `roleGlobal: NONE`.
* **Persetujuan Akun (Approval Gate)**: Admin dan Executive dapat menyetujui akun baru melalui dialog approval, mengaktifkan status `isActive: true`, serta menetapkan `roleGlobal` dan role proyek awal.
* **Pencegahan Akses Ilegal**: Pengguna non-aktif secara otomatis dialihkan ke halaman penantian `/waiting-approval`.
* **Sesi Terhidrasi**: Sesi pengguna diambil di server layout dan didistribusikan ke client store Zustand secara reaktif.

### 4.2 Modul Manajemen Proyek (Project Management)
* **Inisiasi Proyek**: Admin dan Executive dapat membuat proyek baru dengan nama, lokasi, deskripsi, tanggal mulai/selesai, serta slug unik otomatis (contoh: `/projects/villa-canggu`).
* **Pengelolaan Member**: Admin dan Executive dapat menambah, mengubah peran, atau menghapus anggota proyek (`SUPERVISOR`, `ARCHITECT`, `FINANCE`, `LOGISTIC`). Satu pengguna hanya memiliki 1 peran per proyek.
* **Status Proyek**: Mendukung status siklus hidup `ACTIVE`, `DONE`, dan `PAUSED`.

### 4.3 Modul Laporan Harian (Daily Progress Reports)
* **Pencatatan Progres**: Supervisor dan Architect dapat membuat laporan harian per tanggal dengan:
  - Deskripsi pekerjaan umum & persentase progres kumulatif.
  - Kondisi cuaca (Cerah, Berawan, Hujan, dll.).
  - Jumlah total pekerja yang hadir hari tersebut.
  - Lokasi / zona pengerjaan spesifik (misal: "Lantai 2 - Kamar Utama").
  - Kendala atau isu lapangan (*blocking issues*).
* **Breakdown Sub-Tugas (`DailyReportTask`)**: Setiap laporan harian dapat dipecah menjadi sub-pekerjaan terukur (nama tugas, jumlah pekerja per tugas, progres 0-100%, catatan).
* **Dokumentasi Foto Lapangan (`ReportMedia`)**: Pengunggahan foto bukti pekerjaan langsung ke Cloudinary melalui signed payload.
* **Kolom Diskusi & Komentar (`ReportComment`)**: Seluruh anggota proyek dan Executive dapat memberikan catatan atau pertanyaan umpan balik dalam antarmuka gelembung chat (*chat bubbles*).
* **Hak Edit Berbasis Kepemilikan**: Laporan hanya dapat diubah atau dihapus oleh pembuat aslinya (atau Admin).

### 4.4 Modul Kas Darurat (Emergency Fund / Kas Kecil)
* **Saldo Kas Proyek**: Setiap proyek memiliki satu akun kas kecil mandiri dengan saldo tercatat (`Decimal(15, 2)`).
* **Pengajuan Dana Lapangan (`WITHDRAWAL`)**:
  - Supervisor mengajukan permintaan dana darurat dengan mencantumkan nominal, keterangan keperluan, dan foto bukti nota fisik (Cloudinary).
  - Status transaksi awal: `UNREVIEWED`.
* **Verifikasi Keuangan**:
  - Finance memeriksa pengajuan yang berstatus `UNREVIEWED`.
  - Finance memverifikasi pengajuan menjadi `REVIEWED`.
  - Saldo kas proyek otomatis terpotong saat transaksi diverifikasi.
* **Pengisian Saldo Kas (`DEPOSIT`)**:
  - Finance dapat menambahkan saldo kas kecil (*top-up*) yang langsung menambah `currentBalance`.
* **Transparansi Riwayat**: Seluruh anggota proyek dapat melihat mutasi kas darurat secara transparan untuk mencegah sengketa biaya.

### 4.5 Modul Logistik & Inventaris Material (Logistics & Inventory)
* **Katalog Master Barang (`LogisticItem`)**:
  - Role Logistic dapat menambah, mengubah, dan menghapus master barang proyek.
  - Satuan barang (*unit*) bersifat fleksibel dengan combobox dinamis (contoh: Sak, Pcs, M3, Batang, Kg, Roll, Dus).
* **Pencatatan Mutasi Transaksi (`LogisticTransaction`)**:
  - Transaksi Masuk (`IN`): Pencatatan material yang tiba di lokasi proyek dari supplier.
  - Transaksi Keluar (`OUT`): Pencatatan material yang diambil untuk dipakai pengerjaan.
  - Wewenang input: Staf Logistic dan Supervisor lapangan.
* **Perhitungan Stok Otomatis**: Stok tersisa dihitung secara dinamis dari agregasi $\sum \text{IN} - \sum \text{OUT}$.
* **Audit Visibilitas**: Finance dan Architect memiliki akses baca (*read-only*) untuk mengawasi kecocokan spesifikasi material dan anggaran belanja.

### 4.6 Modul Dokumen Teknis Proyek (Technical Documents)
* **Pengunggahan Gambar Kerja**: Architect mengunggah dokumen teknis proyek dengan klasifikasi tipe:
  - `DESIGN`: Konsep desain & 3D render.
  - `DRAWING`: Gambar kerja arsitektur, struktur, MEP, dan detail kerja (AutoCAD/PDF).
  - `REFERENCE`: Dokumen acuan atau studi lapangan.
  - `SPECIFICATION`: Dokumen spesifikasi teknis dan material (RAB/RKS).
* **Versioning & Penggantian File**: Fitur penggantian file dokumen yang otomatis menghapus aset lama di Cloudinary agar tidak meninggalkan file yatim (*orphaned storage*).
* **Akses Acuan**: Seluruh anggota proyek (termasuk Supervisor dan Logistic) dapat melihat dan mengunduh dokumen kerja resmi.

### 4.7 Modul Dashboard Multi-Role (Role Lenses Dashboard)
Dashboard utama menyajikan antarmuka adaptif sesuai peran pengguna:
* **Executive View**: Ringkasan portofolio seluruh proyek, progres terkini, kas darurat yang belum ditinjau, dan sinyal risiko proyek.
* **Supervisor View**: Pengingat pelaporan hari ini, status kas darurat yang diajukan, dan ringkasan material lapangan.
* **Architect View**: Ringkasan laporan pengawasan yang dibuat dan dokumen gambar kerja terkini.
* **Finance View**: Daftar penarikan kas yang menunggu verifikasi (*UNREVIEWED queue*) dan rekapitulasi dana darurat per proyek.
* **Logistic View**: Aktivitas mutasi material 30 hari terakhir, peringatan stok minus, dan daftar master barang.

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

### 5.1 Mobile-First UI/UX & Aksesibilitas
* **Touch Targets & Thumb Zone**: Seluruh tombol interaktif memiliki ukuran minimal $44 \times 44\text{ px}$. Aksi utama ditempatkan di area jangkauan jempol (bottom 40% layar).
* **Mobile Bottom Navigation**: Navigasi utama pada layar $< 768\text{ px}$ menggunakan bilah tab bawah tetap (*fixed bottom bar*) dengan dukungan safe area inset iOS.
* **Penanganan Form Virtual Keyboard**: Form input dan pemilih menggunakan Vaul Drawer mandiri di mobile untuk menghindari glitch keyboard pada viewport kecil.
* **Tipografi & Kontras**: Ukuran teks input minimal $16\text{ px}$ di layar mobile untuk mencegah auto-zoom iOS Safari. Dukungan tema terang dan gelap (*dark mode*) dengan rasio kontras WCAG AA.

### 5.2 Keamanan & Integritas Data
* **3-Layer Permission System**: Autentikasi ➔ Validasi Peran Global ➔ Validasi Peran Proyek.
* **Server-Side Authorization**: Seluruh pengecekan izin dieksekusi di tRPC middleware dan helper server-side; client UI hanya merefleksikan izin tampilan.
* **Ownership Verification**: Pengeditan laporan dan dokumen dibatasi secara ketat hanya untuk pemilik data terkait, kecuali Admin.

### 5.3 Performa & Infrastruktur Cloud
* **Edge Runtime**: Aplikasi dioptimalkan untuk berjalan di jaringan serverless Cloudflare Workers menggunakan OpenNext.
* **Connection Pooling Efisien**: Pemanfaatan Cloudflare Hyperdrive (`HYPERDRIVE`) untuk pooling koneksi berlatensi rendah ke PostgreSQL (`max: 5`).
* **Media CDN**: File foto dan dokumen disimpan di Cloudinary dengan signed parameter client-to-cloud upload, meminimalkan beban memori pada serverless worker.

---

## 6. Rencana Rilis & Uji Lapangan (Milestones & Field Testing)

Status proyek saat ini berada pada tahap **Active Development & Field Testing Phase**:

| Milestone | Ruang Lingkup | Status |
| :--- | :--- | :---: |
| **M1: Fondasi Sistem & Auth** | Setup Next.js 15, Better Auth, skema Prisma dasar, dan 3-Layer permission guard. | ✅ Selesai |
| **M2: Modul Operasional Inti** | Pembangunan fitur Proyek, Laporan Harian, Kas Darurat, Logistik, dan Dokumen. | ✅ Selesai |
| **M3: Nomenklatur Peran & Role Logistic** | Penambahan role `LOGISTIC`, rename `CEO ➔ EXECUTIVE` dan `MANDOR ➔ SUPERVISOR`. | ✅ Selesai |
| **M4: Uji Coba Lapangan (Field Testing)** | Uji coba penginputan laporan, upload bukti kas, dan mutasi barang langsung di lokasi konstruksi nyata oleh Supervisor & Logistic. | 🟡 Sedang Berjalan |
| **M5: Role Lenses Dashboard Remodel** | Transformasi antarmuka dashboard menjadi sistem lensa per peran (`dashboard-remodel-spec.md`). | 🔜 Direncanakan |
| **M6: Galeri Foto Proyek Terpadu** | Pembangunan modul antarmuka galeri foto proyek dan feed dokumentasi linimasa. | 🔜 Direncanakan |

---

## 7. Metrik Keberhasilan Produk (Key Success Metrics / KPIs)

Tingkat keberhasilan implementasi sistem diukur berdasarkan dua pilar utama dengan prioritas setara:

### A. Pilar Operasional Lapangan (Supervisor & Logistic)
* **Kecepatan Input Laporan Harian**: Supervisor dapat menyelesaikan pembuatan 1 laporan harian lengkap beserta foto dalam waktu $< 5\text{ menit}$.
* **Nol Nota Fisik Hilang**: 100% pengeluaran kas darurat lapangan tercatat secara digital lengkap dengan foto bukti fisik sebelum dana dicairkan.
* **Akurasi Inventaris Logistik**: Selisih antara pencatatan sistem logistik dan opname fisik material di lapangan $< 1\%$.

### B. Pilar Pengawasan Eksekutif (Executive & Finance)
* **Kecepatan Audit & Approval**: Waktu tunggu verifikasi transaksi kas darurat oleh Finance berkurang dari hitungan hari menjadi $< 24\text{ jam}$.
* **Visibilitas Progres Real-Time**: Executive dapat mengetahui progres aktual dan kendala seluruh proyek aktif tanpa perlu menunggu rapat rekap mingguan manual.
* **Zero Unauthorized Access**: Nol insiden kebocoran data anggaran proyek kepada pihak yang tidak memiliki hak akses (*security violation* = 0).
