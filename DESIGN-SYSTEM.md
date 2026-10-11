# 📐 Sandaran & Astaloka — Design System Specification

> Panduan komprehensif sistem desain antarmuka (UI) dan pengalaman pengguna (UX) untuk ekosistem **Astaloka Studio** (Landing Page) & **Sandaran** (Sistem Operasional Internal).

---

## 📑 Daftar Isi
1. [Arsitektur & Filosofi Desain](#1-arsitektur--filosofi-desain)
2. [Sistem Warna & Aksesibilitas](#2-sistem-warna--aksesibilitas)
3. [Tipografi & Skala Teks](#3-tipografi--skala-teks)
4. [Sistem Spasi, Radius & Elevasi](#4-sistem-spasi-radius--elevasi)
5. [Standar Komponen (shadcn/ui + Radix)](#5-standar-komponen-shadcnui--radix)
6. [Pola Ergonomi & Mobile-First](#6-pola-ergonomi--mobile-first)
7. [Motion, Scroll & Feedback](#7-motion-scroll--feedback)
8. [Ikonografi & Aset](#8-ikonografi--aset)
9. [Kamus Istilah & Lokalisasi (Microcopy)](#9-kamus-istilah--lokalisasi-microcopy)

---

## 1. Arsitektur & Filosofi Desain

Proyek ini mengusung pendekatan **Dual-Persona Architecture** yang memisahkan ranah ekspresi publik dengan kepraktisan operasional internal:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             ARSITEKTUR DESAIN                               │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 1. Astaloka Studio (Landing Page)    │ 2. Sandaran Portal (Internal System) │
│ • Gaya: Editorial Brutalist Luxury   │ • Gaya: Neo-Industrial Precision     │
│ • Nuansa: Dark deep-void (#000a12)   │ • Nuansa: Slate & Electric Lime      │
│ • Tipografi: Display Syne & Playfair │ • Tipografi: Inter & Space Mono      │
│ • Interaksi: Lenis, GSAP, Noise      │ • Interaksi: Mobile-First, Vaul, h8  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### 1.1 Aturan Batas Wilayah (Boundary Rule)
- Token dengan prefiks `--hp-*` (**Homepage Tokens**) bersifat eksklusif untuk landing page di folder `src/components/homepage/` dan `src/app/page.tsx`. **Dilarang keras** menggunakan token `--hp-*` di dalam rute `src/app/(internal)/`.
- Komponen internal wajib mengonsumsi token tema berbasis semantic OKLCH (`--background`, `--foreground`, `--primary`, `--status-*`).

---

## 2. Sistem Warna & Aksesibilitas

### 2.1 Model Warna OKLCH
Seluruh warna tema antarmuka internal didefinisikan menggunakan model warna **OKLCH** untuk memastikan gradasi perceptually uniform dan rendering warna yang konsisten di berbagai layar modern.

| Token | Light Mode (OKLCH) | Dark Mode (OKLCH) | Peran |
|---|---|---|---|
| `--background` | `oklch(0.98 0.01 120)` | `oklch(0.1288 0.0406 264.6952)` | Kanvas utama aplikasi |
| `--foreground` | `oklch(0.2077 0.0398 265.7549)` | `oklch(0.9842 0.0034 247.8575)` | Teks bodi utama |
| `--card` | `oklch(0.9892 0.0054 117.9205)` | `oklch(0.2077 0.0398 265.7549)` | Latar belakang kartu & panel |
| `--border` / `--input` | `oklch(0.9288 0.0126 255.5078)` | `oklch(0.2795 0.0368 260.031)` | Garis pemisah & batas form |
| `--primary` | `oklch(0.8871 0.2122 128.5041)` | `oklch(0.8871 0.2122 128.5041)` | Aksen Electric Lime / Chartreuse |
| `--primary-foreground` | `oklch(0 0 0)` | `oklch(0 0 0)` | Teks di atas tombol primary |
| `--primary-text` | `oklch(0.42 0.15 130)` | `oklch(0.8871 0.2122 128.5041)` | Teks ber-aksen (memenuhi WCAG AA) |

### 2.2 Aturan Aksesibilitas Warna Primary (Electric Lime)
`--primary` memiliki tingkat keterangannya (Lightness) yang sangat tinggi (~`0.887`).
1. **Penggunaan pada Elemen Solid**:
   Gunakan selalu pasangan `bg-primary text-primary-foreground`. Teks di dalamnya **wajib hitam** (`oklch(0 0 0)`), menghasilkan rasio kontras prima > 15:1.
2. **Penggunaan pada Teks / Tautan / Ikon di Light Mode**:
   **Jangan gunakan `text-primary` langsung** di atas latar belakang putih/terang karena kontras hanya ~1.2:1 (gagal standar aksesibilitas).
   * Gunakan token `--primary-text` (`text-primary-text`), atau
   * Gunakan `text-foreground font-semibold`.

### 2.3 Semantic Status Tokens
Hindari menuliskan class manual seperti `bg-green-100 text-green-700` tanpa varian dark. Gunakan token semantic berikut:

| Status | Teks Token | Latar Token | Border Token | Penggunaan |
|---|---|---|---|---|
| **Success** | `--status-success` | `--status-success-bg` | `--status-success-border` | Proyek Aktif, Laporan Hari Ini, Stok Aman, Transaksi Diverifikasi |
| **Warning** | `--status-warning` | `--status-warning-bg` | `--status-warning-border` | Proyek Dijeda, Menunggu Verifikasi, Stok Menipis |
| **Attention / Danger** | `--status-attention` | `--status-attention-bg` | `--status-attention-border` | Stok Minus, Belum Lapor, Ditolak, Transaksi Darurat |

---

## 3. Tipografi & Skala Teks

### 3.1 Alokasi Font Family
Konfigurasi `next/font/google` di `src/app/layout.tsx` menggunakan nama variabel CSS unik agar tidak saling menimpa:

| Font | CSS Variable | Definisi CSS | Peruntukan |
|---|---|---|---|
| **Inter** | `--font-inter` | `--font-sans` | Seluruh body teks, tabel data, form, navigasi dashboard |
| **Syne** | `--font-syne` | `--font-display` | Display headline raksasa hero & branding editorial |
| **Playfair Display** | `--font-playfair` | `--font-serif` | Aksen kutipan arsitektur, filosofi editorial |
| **Space Mono** | `--font-space-mono` | `--font-mono` | Angka keuangan (RAB/Dana Darurat), tanggal/waktu WITA, ID teknis, nomor telepon |

> **Catatan Stabilitas**: `--font-sans` di `:root` maupun `.dark` **selalu menggunakan `Inter`**. Hal ini mencegah terjadinya *font jumping* atau perubahan bentuk font saat pengguna mengganti tema.

### 3.2 Hierarki Skala Teks
- **Display 2XL/Hero**: `clamp(3.5rem, 8vw, 9rem)` — Khusus landing page.
- **H1 (Page Header)**: `text-xl md:text-2xl font-bold tracking-tight`. Maksimal 1 H1 per halaman.
- **H2 (Card/Section Title)**: `text-base font-semibold tracking-tight`.
- **H3 (Subsection Title)**: `text-sm font-semibold`.
- **Body Regular**: `text-sm leading-relaxed`.
- **Caption / Secondary**: `text-xs text-muted-foreground`.
- **Micro / Badge**: `text-[10px]` atau `text-[11px] font-medium`.

---

## 4. Sistem Spasi, Radius & Elevasi

### 4.1 8pt Spatial Grid
Pengaturan jarak antarelemen wajib mematuhi kelipatan 4px / 8px:
- `gap-1` (4px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px).

### 4.2 Hierarki Border Radius
Sistem menggunakan radius lengkung yang ramah dan modern:
- Base token: `--radius: 1rem` (16px).
- Kontainer kartu luar / modal: `rounded-xl` (14px) hingga `rounded-2xl` (16px).
- Elemen di dalam kontainer (inner items/inputs/buttons): `rounded-lg` (12px) atau `rounded-md` (8px) mengikuti formula:
  $$\text{Radius Inner} = \text{Radius Outer} - \text{Padding}$$
- Badges & Pills: `rounded-full` atau `rounded-4xl`.

### 4.3 Custom Scrollbar
Untuk menjaga kerapian antarmuka, seluruh kontainer scrollable (`overflow-y-auto`, tabel, dan dialog) dilengkapi scrollbar tipis modern (6px):
- **Track**: `transparent`
- **Thumb**: `var(--border)` dengan `border-radius: 9999px`
- **Hover Thumb**: `var(--muted-foreground)`

---

## 5. Standar Komponen (shadcn/ui + Radix)

### 5.1 Tombol (Button)
Berdasarkan audit arsitektur, sistem menggunakan hierarki ukuran bawaan shadcn untuk menjaga densitas tabel dan toolbar:

| Ukuran | Tinggi (Height) | Padding | Keterangan |
|---|---|---|---|
| `xs` | `h-6` (24px) | `px-2 text-xs` | Badge action, tag inline |
| `sm` | `h-7` (28px) | `px-2.5 text-[0.8rem]` | Baris tabel, action toolbar, filter dropdown |
| `default` | `h-8` (32px) | `px-2.5 text-sm` | Tombol utama form, dialog actions di desktop |
| `lg` | `h-9` (36px) | `px-3 text-sm` | Hero action / landing page button |
| `touch` (Mobile Primary) | `min-h-11` (44px) / `h-10` | `px-4 text-sm` | Tombol submit utama di mobile drawer |

*Semua tombol menyertakan efek taktil:* `active:scale-95 transition-all`.

### 5.2 Status Badges
Hindari penggunaan badge warna manual. Gunakan varian baku pada `Badge`:
```tsx
import { Badge } from "~/components/ui/badge";

<Badge variant="success">Aktif</Badge>
<Badge variant="warning">Dijeda</Badge>
<Badge variant="attention">Stok Menipis</Badge>
```

Atau gunakan komponen status proyek terpadu:
```tsx
import { ProjectStatusBadge } from "~/components/shared/status-badge";

<ProjectStatusBadge status="ACTIVE" /> {/* Otomatis: "Aktif", variant "success" */}
<ProjectStatusBadge status="PAUSED" /> {/* Otomatis: "Dijeda", variant "warning" */}
<ProjectStatusBadge status="DONE" />   {/* Otomatis: "Selesai", variant "outline" */}
```

### 5.3 Pola Adaptive Dialog vs Drawer (`ResponsiveFormDialog`)
Semua dialog formulir wajib mengadopsi standar adaptif:
- **Desktop (>= 768px)**: Tampil sebagai Radix `Dialog` di tengah layar.
- **Mobile (< 768px)**: Tampil sebagai Vaul `Drawer` yang meluncur dari bawah.
- **Header Ramping**: Padding vertikal kompak (`px-5 py-3.5` / `px-4 py-2.5`) dengan judul `text-base font-semibold` agar ruang formulir maksimal.
- **Footer Sticky**: Tombol Batal & Simpan wajib **selalu terlihat (sticky)** di bagian bawah dengan efek latar `bg-muted/40 backdrop-blur-xs` (desktop) atau `bg-background/95 pb-safe` (mobile).

---

## 6. Pola Ergonomi & Mobile-First

1. **Thumb Zone Awareness**:
   Navigasi utama berada pada tab bar bawah ([mobile-bottom-nav.tsx](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/navigation/mobile-bottom-nav.tsx)) dengan target sentuh minimal `min-h-[48px]`.
2. **Safe Area Insets**:
   Gunakan utility `pb-safe` (`padding-bottom: env(safe-area-inset-bottom)`) pada elemen yang menempel di dasar viewport perangkat bergerak.
3. **Pencegahan iOS Safari Auto-Zoom**:
   Semua elemen `input`, `textarea`, dan `select` diatur berukuran minimal `16px` pada perangkat layar sentuh melalui CSS reset di `globals.css` guna mencegah browser iOS melakukan zoom paksa saat field difokuskan.

---

## 7. Motion, Scroll & Feedback

### 7.1 Isolasi Lenis Smooth Scroll
- **Landing Page**: Menggunakan `SmoothScrollProvider` (Lenis + GSAP ScrollTrigger) untuk pengalaman gulir momentum editorial yang mulus.
- **Dashboard Internal**: **Wajib menggunakan native scrolling**. Jangan pernah membungkus layout internal dengan Lenis untuk menjaga performa rendering tabel data dan virtualisasi list.

### 7.2 Toast Notifications (Sonner)
- Konfigurasi: `Toaster richColors position="top-center" duration={5000}`.
- Gunakan `toast.success()`, `toast.error()`, atau `toast.promise()` untuk feedback aksi asinkron.

### 7.3 Aksesibilitas Gerak
Seluruh animasi CSS dan transisi menghormati pengaturan preferensi pengguna via media query `@media (prefers-reduced-motion: reduce)`.

---

## 8. Ikonografi & Aset

- **Pustaka Tunggal**: Gunakan `@tabler/icons-react` secara eksklusif. Dilarang mencampur icon library lain (Lucide, Heroicons, FontAwesome) atau emoji pada antarmuka sistem.
- **Ukuran Baku**:
  - `size={20}`: Ikon navigasi menu, header, dan item daftar.
  - `size={16}`: Ikon di dalam tombol, input prefix/suffix, atau badge.
  - `size={12}` - `size={14}`: Ikon mikro indikator.

---

## 9. Kamus Istilah & Lokalisasi (Microcopy)

Kebijakan bahasa antarmuka sistem Sandaran adalah **Bahasa Indonesia Baku & Profesional**.

| Kategori | Bahasa Inggris (Lama) | Standar Bahasa Indonesia (Baku) |
|---|---|---|
| **Status Proyek** | Active / Paused / Done | **Aktif / Dijeda / Selesai** |
| **Status Pengguna** | Pending / Active / Rejected | **Menunggu / Aktif / Ditolak** |
| **Aksi Persetujuan** | Approve / Reject | **Setujui / Tolak** |
| **Filter Pengguna** | All Users | **Semua Pengguna** |
| **Aksi Formulir** | New Project / Edit Project | **Proyek Baru / Edit Proyek** |
| **Manajemen Tim** | Team Management | **Manajemen Tim** |
| **Menu Profil** | Account / Log out | **Pengaturan Akun / Keluar** |
| **Aksi Massal** | Approve All / Clear | **Setujui Semua / Batal Pilihan** |
| **Tombol Dialog** | Cancel / Submit | **Batal / Simpan** (atau kata kerja spesifik) |

---

*Dokumen ini merupakan acuan resmi pengembangan UI/UX di Sandaran Internal System. Setiap komponen baru wajib mematuhi token dan pola yang tertuang di sini.*
