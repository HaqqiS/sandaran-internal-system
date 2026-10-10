# 🏗️ Astaloka / Sandaran Studio — Internal System

> **Platform terpadu manajemen proyek konstruksi arsitektur, interior, dan pelaporan operasional lapangan (*mobile-first* & *cloud-native*).**

---

## 📖 Indeks Dokumentasi Proyek (`docs/`)

Seluruh dokumentasi teknis dan spesifikasi produk tersimpan rapi di dalam direktori [`docs/`](./docs/):

| Dokumen | Deskripsi & Cakupan |
| :--- | :--- |
| 📄 **[PRD.md](./docs/PRD.md)** | **Product Requirement Document (PRD)**<br>• Latar belakang bisnis & problem statement (Astaloka / Sandaran Studio).<br>• Persona peran, kebutuhan fungsional modul, dan kriteria sukses (KPI).<br>• Status rilis (*Active Development & Field Testing Phase*). |
| 🔐 **[PERMISSIONS.md](./docs/PERMISSIONS.md)** | **Single Source of Truth Hak Akses & Peran**<br>• Definisi peran Global (`ADMIN`, `EXECUTIVE`, `USER`) dan Project (`SUPERVISOR`, `ARCHITECT`, `FINANCE`, `LOGISTIC`).<br>• Matriks hak akses lengkap 28 aksi operasional.<br>• Diagram alur 3-Layer Permission Guard (Mermaid).<br>• Panduan developer tRPC (`publicProcedure`, `protectedProcedure`, `adminProcedure`, `projectProcedure`). |
| 🏛️ **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | **Arsitektur Sistem & Infrastruktur Cloud**<br>• Stack teknologi (Next.js 15, React 19, Better Auth, Prisma 6, tRPC 11).<br>• Infrastruktur Cloudflare Workers & Hyperdrive connection pool.<br>• Pipeline aset & upload Cloudinary.<br>• Siklus sesi & hydration (Zustand + hook `useUserRole`).<br>• Peta alur navigasi UI per role (*UI Flow Map*). |
| 🐛 **[KNOWN-ISSUES.md](./docs/KNOWN-ISSUES.md)** | **Daftar Isu Aktif & Backlog**<br>• Gotcha penamaan ulang folder Cloudinary saat slug proyek berganti.<br>• Catatan responsif/overflow tabel di layar mobile.<br>• Perilaku auto-zoom input & drawer scroll di iOS Safari.<br>• Antrean fitur (Project Galleries). |
| 🚀 **[dashboard-remodel-spec.md](./docs/dashboard-remodel-spec.md)** | **Spesifikasi Aktif Pembaruan Dashboard**<br>• Rencana teknis perombakan tampilan dashboard berbasis *role lenses* (`AdminDashboard`, `ExecutiveDashboard`, `UserDashboard`). |

---

## 🏗️ Ringkasan 3-Layer Security

Sistem menerapkan pengamanan berlapis untuk memisahkan wewenang administratif level sistem dengan keterlibatan di lokasi proyek:

```
Layer 1: Autentikasi
└── Pengguna harus login aktif & sudah disetujui (isActive = true, reviewedAt terisi)

Layer 2: Global Role Check
├── ADMIN & EXECUTIVE : Akses administratif sistem (adminProcedure)
└── USER              : Memerlukan penugasan proyek untuk aksi operasional

Layer 3: Project Context Check
└── Bergantung pada peran di ProjectMember (SUPERVISOR | ARCHITECT | FINANCE | LOGISTIC)
```

---

## 🛠️ Stack Teknologi

- **Framework**: [Next.js 15](https://nextjs.org) (App Router, React 19)
- **API & State**: [tRPC v11](https://trpc.io), [TanStack React Query v5](https://tanstack.com/query), [Zustand v5](https://github.com/pmndrs/zustand)
- **Autentikasi**: [Better Auth v1.3](https://better-auth.com) + Prisma Adapter
- **Database & ORM**: PostgreSQL, [Prisma v6](https://prisma.io)
- **Deployment & Edge**: [OpenNext](https://opennext.js.org) di [Cloudflare Workers](https://workers.cloudflare.com) dengan [Cloudflare Hyperdrive](https://developers.cloudflare.com/hyperdrive/)
- **Media & Penyimpanan**: [Cloudinary](https://cloudinary.com)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), [Tabler Icons](https://tabler.io/icons)

---

## 🚀 Panduan Memulai Cepat (Local Development)

### 1. Instalasi Dependensi
```bash
pnpm install
```

### 2. Konfigurasi Lingkungan (.env)
Salin `.env.example` ke `.env` dan pastikan konfigurasi database dan kredensial Cloudinary telah terisi:
```bash
cp .env.example .env
```

### 3. Database Migration & Prisma Client
```bash
pnpm db:generate   # Jalankan migrasi Prisma (dev)
# atau
pnpm postinstall   # Generate Prisma client
```

### 4. Menjalankan Server Development
```bash
pnpm dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 5. Pemeriksaan Kualitas Kode (Lint & Typecheck)
```bash
pnpm typecheck     # Validasi tipe TypeScript (tsc --noEmit)
pnpm check         # Linting dan format dengan Biome
```
