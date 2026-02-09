# 🔐 Panduan Role & Permission - Sandaran Internal System

Dokumen ini menjelaskan struktur role (peran) dan hak akses (permission) dalam sistem. Sistem menggunakan pendekatan **3-Layer Security** (Auth -> Global Role -> Project Role) untuk memastikan keamanan data.

---

## 1. Konsep Dasar

Terdapat dua jenis role dalam sistem:

1.  **Global Role**: Menentukan akses level sistem (misal: Login, Dashboard Admin, Buat User).
2.  **Project Role**: Menentukan apa yang bisa dilakukan user di dalam spesifik proyek.

> **Penting:** Seorang user bisa memiliki `GlobalRole: USER`, tapi menjadi `MANDOR` di Proyek A dan `ARCHITECT` di Proyek B.

---

## 2. Global Roles

Role yang melekat pada akun user, berlaku di seluruh sistem.

| Role              | Kode    | Deskripsi & Hak Akses                                                                                                                                                                                                                                                                            |
| :---------------- | :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Administrator** | `ADMIN` | **Akses Penuh (Superuser).**<br>• Bisa mengakses semua menu & fitur.<br>• Bisa membuat/mengedit user lain.<br>• Bisa membuat proyek baru & menambah member ke proyek.<br>• Bisa mengedit/hapus data apa saja (laporan, logistik, dll) di semua proyek.<br>• _Bypass_ semua validasi kepemilikan. |
| **CEO**           | `CEO`   | **Akses Monitoring (Read-Only).**<br>• Bisa melihat semua proyek dan dashboard.<br>• Bisa melihat detail laporan keuangan dan progres.<br>• **TIDAK BISA** melakukan input data operasional (laporan harian, request dana, logistik).<br>• **BISA** memberikan komentar pada laporan.            |
| **User**          | `USER`  | **Akses Standar.**<br>• Hanya bisa login.<br>• Tidak bisa melihat data apapun sampai dimasukkan ke dalam sebuah proyek sebagai member.<br>• Hak akses operasional bergantung sepenuhnya pada **Project Role**.                                                                                   |
| **None**          | `NONE`  | **User Baru / Non-Aktif.**<br>• Tidak bisa login atau mengakses sistem sama sekali sampai di-approve oleh Admin.                                                                                                                                                                                 |

---

## 3. Project Roles

Role yang diberikan per-proyek. Satu user bisa memiliki role berbeda di proyek berbeda.

| Role          | Kode        | Fokus Utama                                                                                                                                        |
| :------------ | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mandor**    | `MANDOR`    | **Operasional Lapangan.**<br>• Membuat laporan harian.<br>• Request dana darurat.<br>• Catat barang masuk/keluar.                                  |
| **Architect** | `ARCHITECT` | **Teknis & Pengawasan.**<br>• Membuat laporan progress/pengawasan.<br>• Upload dokumen gambar/desain.<br>• Review laporan lapangan.                |
| **Finance**   | `FINANCE`   | **Kontrol Biaya & Logistik.**<br>• Menyetujui request dana darurat.<br>• Kelola master data barang (logistik).<br>• Top-up saldo kas kecil proyek. |

---

## 4. Detail Permission per Fitur

Berikut detail siapa yang bisa melakukan apa di setiap fitur proyek.

### A. Manajemen Proyek & Member

Fitur untuk membuat proyek baru dan mengatur siapa saja yang terlibat.

| Aksi              | Pelaku         | Catatan                                                          |
| :---------------- | :------------- | :--------------------------------------------------------------- |
| **Buat Proyek**   | `ADMIN`        | User biasa/Project Role tidak bisa buat proyek.                  |
| **Tambah Member** | `ADMIN`        | Hanya Admin yang bisa menunjuk Mandor/Arsitek/Finance.           |
| **Lihat Proyek**  | `SEMUA MEMBER` | Member hanya lihat proyek dimana dia terdaftar. CEO lihat semua. |

### B. Laporan Harian (Daily Reports)

Fitur untuk mencatat progress harian, cuaca, jumlah pekerja, dan kendala.

| Aksi              | Pelaku                | Catatan                                                              |
| :---------------- | :-------------------- | :------------------------------------------------------------------- |
| **Buat Laporan**  | `MANDOR`, `ARCHITECT` | `FINANCE` tidak bisa buat laporan.                                   |
| **Lihat Laporan** | `SEMUA MEMBER`        | Semua yang terlibat di proyek bisa baca.                             |
| **Edit/Hapus**    | `MANDOR`, `ARCHITECT` | **Hanya Laporan Milik Sendiri.** Tidak bisa edit laporan orang lain. |
| **Komentar**      | `SEMUA` + `CEO`       | Semua member & CEO bisa diskusi di kolom komentar.                   |
| **Upload Foto**   | `MANDOR`, `ARCHITECT` | Hanya ke laporan milik sendiri.                                      |

### C. Dana Darurat (Emergency Fund)

Fitur pengelolaan kas kecil (petty cash) di proyek untuk belanja mendesak.

| Aksi            | Pelaku         | Alur Kerja                                        |
| :-------------- | :------------- | :------------------------------------------------ |
| **Withdraw**    | `MANDOR`       | Mandor membuat permintaan -> Status `UNREVIEWED`. |
| **Verifikasi**  | `FINANCE`      | Finance review permintaan -> Status `REVIEWED`.   |
| **Fund Saldo**  | `FINANCE`      | Finance mengisi ulang (top-up) saldo kas proyek.  |
| **Lihat Saldo** | `SEMUA MEMBER` | Transparansi saldo untuk semua member proyek.     |

### D. Logistik & Material

Fitur pencatatan keluar-masuk barang material di proyek.

| Aksi                   | Pelaku         | Deskripsi                                              |
| :--------------------- | :------------- | :----------------------------------------------------- |
| **Kelola Master Item** | `FINANCE`      | Tambah/Edit/Hapus jenis barang (misal: Semen, Paku).   |
| **Catat Transaksi**    | `MANDOR`       | Input barang masuk (`IN`) atau barang dipakai (`OUT`). |
| **Lihat Stok**         | `SEMUA MEMBER` | Monitoring sisa stok di lapangan.                      |

### E. Dokumen Proyek

Fitur penyimpanan file gambar kerja, desain, dan spesifikasi.

| Aksi               | Pelaku         | Catatan                                            |
| :----------------- | :------------- | :------------------------------------------------- |
| **Upload Dokumen** | `ARCHITECT`    | Hanya Arsitek yang berwenang upload gambar teknis. |
| **Lihat Dokumen**  | `SEMUA MEMBER` | Mandor bisa melihat gambar kerja untuk acuan.      |
| **Hapus Dokumen**  | `ARCHITECT`    | Hanya dokumen milik sendiri.                       |

---

## 5. Matriks Ringkasan (Cheat Sheet)

| Fitur                |   Mandor   | Architect |    Finance     |  Admin  |   CEO    |
| :------------------- | :--------: | :-------: | :------------: | :-----: | :------: |
| **Manajemen Proyek** |  👁️ Lihat  | 👁️ Lihat  |    👁️ Lihat    | ⚡ Full | 👁️ Lihat |
| **Laporan Harian**   |  ✅ Buat   |  ✅ Buat  |    👁️ Lihat    | ⚡ Full | 👁️ Lihat |
| **Komentar**         |  ✅ Chat   |  ✅ Chat  |    ✅ Chat     | ⚡ Full | ✅ Chat  |
| **Request Dana**     | ✅ Request |   ❌ -    | 🛡️ Verifikasi  | ⚡ Full | 👁️ Lihat |
| **Topup Dana**       |    ❌ -    |   ❌ -    |    ✅ Topup    | ⚡ Full | 👁️ Lihat |
| **Catat Material**   | ✅ In/Out  | 👁️ Lihat  | ⚙️ Kelola Item | ⚡ Full | 👁️ Lihat |
| **Upload Gambar**    |  👁️ Lihat  | ✅ Upload |    👁️ Lihat    | ⚡ Full | 👁️ Lihat |

**Keterangan:**

- ✅ : Boleh melakukan aksi utama.
- 👁️ : Hanya boleh melihat (Read Only).
- 🛡️ : Berperan sebagai approver/verifikator.
- ⚙️ : Berperan sebagai pengelola data master.
- ⚡ : Akses penuh tanpa batas.
