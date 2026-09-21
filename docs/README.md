# 📚 Sandaran Internal System - Dokumentasi

> **Indeks utama untuk dokumentasi arsitektur, autentikasi, permission, dan panduan teknis proyek.**

---

## 📖 Daftar Dokumen

### 🔐 Autentikasi & Sistem Izin (Auth & Permissions)

1. **[auth-system.md](./auth-system.md)**  
   *Panduan Implementasi Auth & Route Protection* — Contoh praktis penggunaan `auth-guards.ts`, `server-auth.ts`, session store, dan hooks peran pengguna. Berisi contoh kode untuk Server Components, Client Components, dan Server Actions.

2. **[roles-and-permissions.md](./roles-and-permissions.md)**  
   *Panduan Hak Akses & Konsep Role (Bahasa Indonesia)* — Penjelasan konsep Global Role (`ADMIN`, `CEO`, `USER`) vs Project Role (`MANDOR`, `ARCHITECT`, `FINANCE`), batasan aksi per modul, dan matriks ringkas untuk tim teknis maupun pemangku kepentingan.

3. **[permission-matrix.md](./permission-matrix.md)**  
   *Tabel Matriks Hak Akses Lengkap* — Spesifikasi teknis 28 action codes (global & project-scoped) terhadap seluruh role. Dilengkapi aturan kepemilikan data (*ownership guards*) dan penanganan kasus khusus (seperti CEO read-only).

4. **[permission-flows.md](./permission-flows.md)**  
   *Diagram Alur Permission (Mermaid)* — Visualisasi 3-Layer Permission Guard (Authentication → Global Role → Project Role) serta workflow approval dana darurat dan mutasi logistik.

5. **[permission-quick-reference.md](./permission-quick-reference.md)**  
   *Cheat-sheet Developer tRPC Guards* — Panduan cepat pemilihan procedure (`publicProcedure`, `protectedProcedure`, `adminProcedure`, `projectProcedure`), pola guard helpers, dan tips debugging permission.

6. **[ui-flow-map.md](./ui-flow-map.md)**  
   *Peta Navigasi UI per Peran* — Diagram navigasi visual mengenai menu dan halaman apa saja yang dapat diakses oleh setiap role di seluruh modul aplikasi.

---

### 🎨 UI, Animasi & Desain

7. **[motion-design-rules.md](./motion-design-rules.md)**  
   *Aturan Teknis Motion & Interaksi (Homepage)* — Standar integrasi GSAP 3, ScrollTrigger, dan Lenis Smooth Scroll untuk animasi performan pada landing page utama.

---

### 🚀 Spesifikasi Fitur Mendatang & Pemeliharaan

8. **[dashboard-remodel-spec.md](./dashboard-remodel-spec.md)**  
   *Spesifikasi Pembaruan Dashboard* — Rencana arsitektur dan spesifikasi teknis untuk merombak tampilan Dashboard per role (`AdminDashboard`, `CeoDashboard`, `UserDashboard` dengan role lenses) dan menghapus metric hardcoded.

9. **[known-issues.md](./known-issues.md)**  
   *Daftar Isu & Catatan Bug Aktif* — Catatan teknis gotcha Cloudinary folder rename, isu responsif/tabel di layar ponsel, dan backlog penyempurnaan UI galeri proyek.

---

### 🗄️ Arsip Rencana yang Telah Terselesaikan (Completed / Historical)

10. **[implementation_plan_export_excel.md](./implementation_plan_export_excel.md)**  
    *Rencana Ekspor Laporan ke Excel* — [SELESAI] Fitur telah diimplementasikan di `src/app/api/projects/[id]/export/route.ts`.

11. **[frontend-implementation-plan.md](./frontend-implementation-plan.md)**  
    *Rencana Implementasi Frontend UI* — [SELESAI] Dokumen perencanaan Fase 2–9 (Februari 2026) untuk pembangunan modul Projects, Reports, Emergency Fund, Logistics, dan Documents.

12. **[phase1-summary.md](./phase1-summary.md)**  
    *Ringkasan Arsitektur Fase 1* — [SELESAI] Dokumentasi transisi layout dan session internal awal.

---

## 🎯 Panduan Memulai Cepat (Quick Start)

### Developer Baru di Sandaran System
1. Baca **[roles-and-permissions.md](./roles-and-permissions.md)** untuk memahami hierarki peran dan domain bisnis proyek.
2. Pelajari **[auth-system.md](./auth-system.md)** untuk mengetahui cara melindungi halaman atau data.
3. Gunakan **[permission-quick-reference.md](./permission-quick-reference.md)** sebagai acuan saat membuat procedure tRPC baru di `src/server/api/routers/`.

### Frontend & UI Developer
1. Tinjau **[ui-flow-map.md](./ui-flow-map.md)** untuk memahami pengalaman pengguna tiap role.
2. Rujuk aturan motion di **[motion-design-rules.md](./motion-design-rules.md)** jika menyentuh interaksi scroll dan animasi homepage.
3. Periksa **[known-issues.md](./known-issues.md)** untuk memantau isu layout mobile yang masih terbuka.

---

## 🏗️ Konsep Inti Arsitektur

### 3-Layer Permission System

```
Layer 1: Autentikasi
└── User harus login aktif & sudah diapprove (isActive = true)

Layer 2: Global Role Check
├── ADMIN : Akses penuh ke seluruh fitur dan sistem
├── CEO   : Hak pantau / read-only ke seluruh proyek
└── USER  : Lanjut ke pemeriksaan Layer 3

Layer 3: Project Context Check
└── Bergantung pada role di ProjectMember (MANDOR / ARCHITECT / FINANCE)
```

### File Utama dalam Codebase

| File / Direktori | Deskripsi |
| :--- | :--- |
| `src/lib/auth-guards.ts` | Fungsi utilitas pure untuk pengecekan role & status akun |
| `src/lib/server-auth.ts` | Server-side helpers (`requireAuth`, `requireAdmin`) untuk Server Components |
| `src/server/api/trpc.ts` | Definisi middleware tRPC (`protectedProcedure`, `adminProcedure`, dll.) |
| `src/server/api/routers/` | Endpoint API tRPC per modul (`project`, `report`, `emergency`, `logistic`, dll.) |
| `src/hooks/use-user-role.ts` | Hook client-side untuk menentukan hak visibilitas komponen UI |
