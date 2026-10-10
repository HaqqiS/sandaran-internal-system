# 🐛 Sandaran System — Known Issues & Backlog

> **Daftar isu aktif, batasan teknis saat ini, dan antrean fitur mendatang.**

---

## 1. Isu Aktif & Gotchas

### 1.1 Cloudinary Folder Rename — Broken URLs
Ketika `slug` suatu proyek diperbarui, sistem secara otomatis mengubah nama folder terkait di Cloudinary (`sandaran/old-slug` ➔ `sandaran/new-slug`).
- **Penyebab**: Folder fisik di Cloudinary berpindah alamat, namun URL historis pada tabel database (`ProjectDocument`, `ReportMedia`, `EmergencyTransaction`) masih merujuk ke path URL lama.
- **Gejala**: Pengguna akan menemui error **404 Not Found** saat membuka aset yang diunggah sebelum pengubahan slug proyek dilakukan.
- **Solusi Sementara (Workaround)**: Hindari mengubah slug proyek yang sudah memiliki file atau media aktif. Perbaikan permanen membutuhkan skrip sinkronisasi transaksi batch untuk memperbarui `publicId` dan `url` di seluruh tabel terkait.

### 1.2 Mobile UI & Responsive Overflows
- **Tabel Data di Layar Kecil**: Tampilan data-table pada halaman detail proyek (`/projects/[slug]`) dan Emergency Fund masih mengalami horizontal overflow pada perangkat dengan lebar layar < 360px.
- **Warna Indikator Chart**: Perlu penyesuaian kontras warna dan kurva indikator chart kas darurat pada mode tema gelap (*dark theme*).

### 1.3 iOS Safari Virtual Keyboard Zoom & Overlay Scroll
- **Auto-Zoom pada Input Form**: Pada peramban iOS Safari, elemen form (`CommandInput`, `Input`, `Textarea`) yang memiliki ukuran font di bawah `16px` (`text-sm`) akan memicu zoom otomatis saat disentuh.
- **Scroll Gestures dalam Drawer**: Interaksi scroll daftar item panjang di dalam modal Vaul Drawer memerlukan penanganan gesture khusus (`data-vaul-no-drag`) agar interaksi swipe keyboard atau daftar tidak menutup drawer secara tidak sengaja.

---

## 2. Riwayat Isu yang Telah Terselesaikan (Resolved)

- **[RESOLVED 2026-09-25] Sheet Form Virtual Keyboard Glitch**:
  Glitch tampilan mobile saat keyboard virtual muncul telah diatasi dengan merombak navigasi menjadi Mobile Bottom Navigation (`MobileBottomNav`) dan dialog pemilih proyek menggunakan Vaul Drawer mandiri (`ProjectSwitcherDrawer`).
- **[RESOLVED 2026-09-30] Lenis Global Scroll Conflict**:
  Konflik smooth scroll Lenis yang mengganggu interaksi form di dalam modal dialog telah diselesaikan dengan membatasi scope `SmoothScrollProvider` hanya pada halaman homepage.

---

## 3. Rencana Fitur & Backlog Mendatang

- **Galeri Foto Proyek (Project Galleries)**:
  Pengembangan antarmuka galeri foto terpadu per proyek serta feed foto dokumentasi terkini (*recent progress gallery*) dari seluruh proyek aktif.
- **Role Lenses Dashboard Remodel**:
  Implementasi spesifikasi perombakan dashboard per role lens berdasarkan `docs/dashboard-remodel-spec.md`.
