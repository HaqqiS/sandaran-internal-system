# 🐛 Sandaran System — Known Issues & Backlog

> **Daftar isu aktif, batasan teknis saat ini, dan antrean fitur mendatang.**

---

## 1. Isu Aktif & Gotchas

### 1.1 Mobile UI & Responsive Overflows

- **Tabel Data di Layar Kecil**: Tampilan data-table pada halaman detail proyek (`/projects/[slug]`) dan Emergency Fund masih mengalami horizontal overflow pada perangkat dengan lebar layar < 360px.
- **Warna Indikator Chart**: Perlu penyesuaian kontras warna dan kurva indikator chart kas darurat pada mode tema gelap (_dark theme_).

### 1.2 iOS Safari Virtual Keyboard Zoom & Overlay Scroll

- **Auto-Zoom pada Input Form**: Pada peramban iOS Safari, elemen form (`CommandInput`, `Input`, `Textarea`) yang memiliki ukuran font di bawah `16px` (`text-sm`) akan memicu zoom otomatis saat disentuh.
- **Scroll Gestures dalam Drawer**: Interaksi scroll daftar item panjang di dalam modal Vaul Drawer memerlukan penanganan gesture khusus (`data-vaul-no-drag`) agar interaksi swipe keyboard atau daftar tidak menutup drawer secara tidak sengaja.

---

## 2. Riwayat Isu yang Telah Terselesaikan (Resolved)

- **[RESOLVED 2026-10-12] Cloudinary Folder Rename — Broken URLs (404)**:
  Telah diselesaikan secara permanen dengan arsitektur **Cosmetic Dynamic Slug** (pola Notion / Stack Overflow) dan **Permanent Storage Key**:
  - **Permanent Storage Key**: Folder Cloudinary menggunakan identifier permanen seumur hidup proyek (`astaloka/[storageKey]/[type]`), di mana `storageKey = [initial-slug]-[shortId]`. Operasi rename folder Cloudinary telah dihapus sepenuhnya sehingga aset historis tidak akan pernah broken/404 saat nama atau slug proyek diedit.
  - **Cosmetic Dynamic Slug**: Slug web berformat `[nama-proyek]-[shortId]` di mana `shortId` diambil dari 10 karakter terakhir ID database CUID (`project.id.slice(-10)`). Jika nama proyek diedit, slug kosmetik diperbarui tanpa menyentuh folder fisik aset.
  - **Zero Broken Links & URL Kanonis**: Prosedur tRPC `getBySlug` mengekstrak `shortId` di akhir URL dengan fallback toleran ke slug lama. Frontend menyinkronkan URL peramban secara transparan via `window.history.replaceState`.
  - **Migrasi Data**: Seluruh proyek eksisting telah dimigrasikan dengan `shortId` dan `storageKey` permanen tanpa merusak link aset yang telah diunggah sebelumnya.
- **[RESOLVED 2026-09-25] Sheet Form Virtual Keyboard Glitch**:
  Glitch tampilan mobile saat keyboard virtual muncul telah diatasi dengan merombak navigasi menjadi Mobile Bottom Navigation (`MobileBottomNav`) dan dialog pemilih proyek menggunakan Vaul Drawer mandiri (`ProjectSwitcherDrawer`).
- **[RESOLVED 2026-09-30] Lenis Global Scroll Conflict**:
  Konflik smooth scroll Lenis yang mengganggu interaksi form di dalam modal dialog telah diselesaikan dengan membatasi scope `SmoothScrollProvider` hanya pada halaman homepage.

---

## 3. Rencana Fitur & Backlog Mendatang

- **Galeri Foto Proyek (Project Galleries)**:
  Pengembangan antarmuka galeri foto terpadu per proyek serta feed foto dokumentasi terkini (_recent progress gallery_) dari seluruh proyek aktif.
- **Role Lenses Dashboard Remodel**:
  Implementasi spesifikasi perombakan dashboard per role lens berdasarkan `docs/dashboard-remodel-spec.md`.
