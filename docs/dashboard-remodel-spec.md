# Dashboard Remodel — Implementation Spec & Handoff Guide

> **Audience:** AI coding agent & tim pengembang *sandaran-internal-system*.  
> **Status:** Spesifikasi Aktif & Living Document (Target Milestone M5).  
> **Peran:** `ADMIN` · `EXECUTIVE` (sebelumnya `CEO`) · `USER` (Role Lenses: `SUPERVISOR` [sebelumnya `MANDOR`], `ARCHITECT`, `FINANCE`, `LOGISTIC`).

---

## 0. Rules (Mandatory)

**UI RULE — Gunakan `shadcn/ui` untuk setiap elemen UI.**  
Periksa terlebih dahulu komponen yang tersedia di `src/components/ui`. Jika belum ada, pasang menggunakan `pnpm dlx shadcn@latest add <nama-komponen>`. Bangun komponen kustom hanya jika shadcn/ui benar-benar tidak memilikinya dengan standar Tailwind CSS + `cn()` + CSS variables token yang ada (`data-slot`, varian `cva`, forwarded `className`). Dilarang keras menginstal atau mengimpor library UI eksternal lainnya.

Aturan fundamental lainnya:
1. **No Fake Data (Nol Data Palsu).**  
   Setiap angka, persentase, tren, dan status label di dashboard wajib dihitung murni dari query database Prisma. Dilarang mencantumkan teks/angka hardcoded seperti `"75%"`, `"Sehat"`, `"+2"`, `"Kerja bagus!"`, atau `"Sesuai Target"`.
2. **Otorisasi Ketat di Server-Side.**  
   Pengguna dengan `roleGlobal = USER` hanya berhak menerima data proyek di mana mereka terdaftar di tabel `ProjectMember` pada proyek aktif. Jangan pernah mengirim data proyek lain ke client lalu menyembunyikannya di UI.
3. **Pola Arsitektur Konsisten.**  
   Gunakan struktur Server Component `page.tsx` + Client Component `*-client.tsx` (atau modular dashboard view). Hook tRPC diletakkan di `src/hooks/useDashboard.ts` dan diekspor ulang melalui `src/hooks/index.ts`. Seluruh label antarmuka menggunakan bahasa Indonesia yang baku dan profesional.
4. **Stabilitas Skema Database.**  
   Jangan mengubah `prisma/schema.prisma` kecuali penambahan indeks performa atau perubahan opsional yang disetujui (misalnya field `minStock` pada `LogisticItem`).
5. **Verifikasi Kualitas Kode.**  
   Setelah menyelesaikan setiap fase, pastikan `pnpm typecheck` dan `pnpm check` (Biome) berhasil tanpa error. Tambahkan unit test Vitest (`pnpm test`) untuk helper fungsi murni (misalnya kalkulator zona waktu WITA).

**Tech Stack:** Next.js 15 (App Router), React 19, tRPC v11 + TanStack Query v5, Prisma v6 (PostgreSQL), Better Auth v1.3, Tailwind CSS v4, shadcn/ui + Radix UI, Tabler Icons (`@tabler/icons-react`), Recharts 2.15.4 (via `~/components/ui/chart`), pnpm.

---

## 1. Scope & Peran

Halaman utama `/dashboard` (`src/app/(internal)/dashboard/page.tsx`) memilih tampilan dashboard berdasarkan `roleGlobal`:

| `roleGlobal` | Komponen Dashboard | Tanggung Jawab Utama |
|---|---|---|
| `ADMIN` | `AdminDashboard` | Menjaga kelancaran sistem: persetujuan pengguna, kelengkapan staf proyek, deteksi keterlambatan pelaporan, dan anomali data. |
| `EXECUTIVE` | `ExecutiveDashboard` | Tinjauan portofolio eksekutif read-only: progres riil vs waktu kalender, total tenaga kerja lapangan, kendala dilaporkan, dan kesehatan arus kas darurat. *(Menggantikan CeoDashboard).* |
| `USER` | `UserDashboard` | Eksekusi pekerjaan harian pada proyek aktif saya, diorganisir dalam bentuk **Role Lenses** (`SUPERVISOR`, `ARCHITECT`, `FINANCE`, `LOGISTIC`). |
| `NONE` | *Tidak mencapai dashboard* | Dicegat dan dialihkan otomatis ke `/waiting-approval`. |

### Prinsip Multi-Role & Lensa:
- Pengguna dengan `roleGlobal = ADMIN` yang juga menjadi anggota proyek tertentu tetap diarahkan ke `AdminDashboard`. Akses ke proyek spesifik dilakukan melalui baris tabel *Kesehatan Proyek*.
- Pengguna dengan `roleGlobal = USER` yang memegang lebih dari satu peran (misalnya menjadi Supervisor di Proyek A dan Logistik di Proyek B) akan melihat **satu halaman `UserDashboard`** dengan tab lensa peran (`RoleLensTabs`), bukan tampilan bertumpuk (*stacked layouts*) seperti implementasi sebelumnya.

---

## 2. Audit — Kondisi Saat Ini vs Target Pengganti

Kondisi file dashboard saat ini di `src/components/dashboard/`:

| Lokasi / File Eksisting | Kondisi Saat Ini | Masalah | Target Pengganti Remodel |
|---|---|---|---|
| `ceo-view.tsx` *(juga dialiaskan sebagai `executive-view.tsx`)* | Teks "Progres Keseluruhan 75% +5%" & "Kesehatan Keuangan: Sehat" | Hardcoded literal; skema belum memiliki budget proyek. Chart "Analitik & Tren" hanya placeholder. | `ExecutiveDashboard`: Progres laporan terakhir per proyek + bar waktu kalender berlalu. Chart riil: Tenaga kerja 30 hari & Arus kas darurat 6 bulan. |
| `mandor-view.tsx` *(juga dialiaskan sebagai `supervisor-view.tsx`)* | "sebelum jam 5 sore", "Kerja bagus!" | Aturan deadline jam 5 sore tidak tersimpan di database; teks ucapan dekoratif. | `SupervisorLens` di dalam `UserDashboard`: Status komputasi riil: *Sudah lapor hari ini* / *Belum lapor hari ini*. |
| `architect-view.tsx` | "+2 minggu ini" | Tren kenaikan hardcoded. | `ArchitectLens` di dalam `UserDashboard`: Dihitung dari `ProjectDocument` di mana `userId = me` dalam 7 hari terakhir. |
| `finance-view.tsx` | "Total disetujui bulan ini" | Status persetujuan tidak ada; skema hanya mengenal `UNREVIEWED` / `REVIEWED`. | `FinanceLens` di dalam `UserDashboard`: "Penarikan bulan ini" + antrean "n transaksi belum ditinjau". |
| `logistic-view.tsx` | Belum terintegrasi sebagai lensa, minim penanganan anomali | Belum menyatu dalam lensa `UserDashboard`; belum ada peringatan stok minus dan tindakan mitigasi restock cepat. | `LogisticLens` mendalam di dalam `UserDashboard`: Monitoring stok minus, mutasi 7 hari, feed transaksi terbaru, dan aksi cepat modal mutasi/item. |
| `admin-view.tsx` | "Peringatan Logistik", "Cek Stok Menipis" | Model `LogisticItem` tidak memiliki field `minStock` (stok minimum). | `AdminDashboard`: Item stok minus riil (Σ IN − Σ OUT < 0) di seluruh proyek. |
| `project-detail-client.tsx` | "Progres Keseluruhan" = rata-rata `progressPercent` | Nilai `progressPercent` bersifat kumulatif; merata-ratakan nilai menghasilkan angka yang salah. | Kartu menampilkan nilai dari laporan harian terakhir (`reportDate desc, createdAt desc`) beserta tanggal pelaporannya. |
| `stat-card.tsx` | Menerima string bebas untuk prop `trend` | Celah utama munculnya tren palsu seperti `+5%`. | `MetricCard`: Menerima prop numerik `previous: { value, periodLabel }` dan menghitung delta secara internal. |
| `DashboardLayout` | `p-6` + `space-y-8` di dalam `PageLayout` | Terjadi double spacing vertikal. | Standardisasi wrapper: `flex flex-col gap-6 p-4 md:p-6`. |
| `StatsGrid` | Breakpoint mapping tidak konsisten | Mapping Tailwind dinamis yang memicu styling class hilang saat kompilasi. | Menggunakan lookup kelas literal Tailwind yang eksplisit per breakpoint. |

> [!NOTE]
> **Fitur yang Sengaja Ditiadakan (Karena Ketiadaan Dukungan Skema):**  
> Persentase rata-rata progres seluruh portofolio, label "Kesehatan Keuangan", peringatan stok menipis berdasarkan ambang batas (*low-stock threshold*), deteksi keterlambatan jadwal vs kurva S (*schedule variance*), produktivitas pekerja, status "Komentar Belum Dibaca" (karena tidak ada flag `isRead`), dan kendala berstatus "Open" (karena kolom `issues` tidak memiliki flag `isResolved`).

---

## 3. Data Rules & Aturan Komputasi

### Kebijakan Konstanta (`src/lib/dashboard-constants.ts`)

```ts
export const REPORT_STALE_DAYS = 2; // Proyek aktif tanpa laporan harian dalam >= 2 hari
export const ISSUE_WINDOW_DAYS = 7; // Jendela waktu monitoring kendala & mutasi mingguan
export const TZ_OFFSET_HOURS = 8;   // Zona waktu WITA (UTC+8, Bali/Lombok), tanpa DST
```

### Penanganan Zona Waktu (WITA)
Field `reportDate` disimpan dalam format UTC. Server cloud yang berjalan pada jam UTC akan menganggap rentang 00:00–07:59 WITA sebagai "kemarin". Seluruh batasan "hari ini", "minggu ini", dan "bulan ini" wajib menggunakan helper terpusat:

```ts
export function getStartOfTodayWita(now = new Date()): Date {
  const MS_PER_DAY = 86_400_000;
  const TZ_OFFSET_MS = TZ_OFFSET_HOURS * 3_600_000;
  return new Date(Math.floor((now.getTime() + TZ_OFFSET_MS) / MS_PER_DAY) * MS_PER_DAY - TZ_OFFSET_MS);
}
```

### Logika Kumulatif `DailyReport.progressPercent`
- Nilai `DailyReport.progressPercent` merupakan persentase penyelesaian proyek secara kumulatif pada saat laporan tersebut dibuat.
- Progres proyek saat ini = nilai dari laporan harian paling mutakhir (`orderBy: [{ reportDate: "desc" }, { createdAt: "desc" }]`). **Jangan pernah dirata-ratakan.**
- Jika laporan terbaru bernilai *lebih kecil* daripada laporan sebelumnya, ini mengindikasikan anomali input data → tampilkan pill badge peringatan `"Progres turun"`.
- Untuk menghitung total pekerja hari ini (`totalWorkers`), ambil 1 laporan terakhir per proyek pada hari ini agar proyek dengan multi-laporan tidak dihitung ganda.

### Definisi Status Data
- **Status Pengguna:**
  - *Menunggu Persetujuan:* `reviewedAt === null`
  - *Aktif:* `isActive === true && reviewedAt !== null`
  - *Ditolak:* `isActive === false && reviewedAt !== null`
- **Kendala Dilaporkan:** Laporan di mana kolom `issues !== null && issues.trim() !== ""`. Disebut sebagai *"Kendala dilaporkan"*, bukan *"Kendala terbuka"*.
- **Stok Minus Logistik:** Item barang di mana total kuantitas masuk dikurangi total kuantitas keluar menghasilkan nilai negatif (`Σ IN − Σ OUT < 0`).
- **Transaksi Tanpa Bukti:** Transaksi kas darurat di mana `url === null`.
- **Waktu Kalender Berlalu (Elapsed %):**  
  `Math.min(Math.max((now - startDate) / (endDate - startDate), 0), 1) * 100`. Membutuhkan kedua tanggal terisi; jika tidak ada, beri label *"Tanggal belum diatur"*.

---

## 4. tRPC Procedures & Query Contracts

Router dashboard (`src/server/api/routers/dashboard.ts` atau `dashboard.router.ts`) menyediakan prosedur terpisah:

| Prosedur | Otorisasi Guard | Data Kembalian |
|---|---|---|
| `dashboard.getAdminOverview` | `adminProcedure` | `{ attention, counts, pendingUsers, projectHealth }` |
| `dashboard.getExecutiveOverview` | `executiveProcedure` | `{ kpis, portfolio, recentIssues, fundSummary }` |
| `dashboard.getExecutiveTrends` | `executiveProcedure` | `{ workersDaily30d, fundMonthly6m, progressSeries? }` *(dipisah agar query analitik lambat tidak memblokir render utama)* |
| `dashboard.getUserOverview` | `authedProcedure` | `{ memberships, supervisor?, architect?, finance?, logistic? }` *(Lensa hanya disertakan jika user memegang peran tersebut pada proyek AKTIF)* |

---

### Detail Query per Dashboard

#### A. Admin (`dashboard.getAdminOverview`)
- **Counts & KPIs:**
  - Pengguna: hitung `user.count` untuk status pending, aktif, dan ditolak.
  - Proyek: `project.groupBy({ by: ["status"] })`.
  - Sudah lapor hari ini: Jumlah proyek `ACTIVE` dengan ≥1 laporan pada `reportDate >= startOfTodayWita`.
  - Transaksi belum ditinjau: `emergencyTransaction.count({ where: { status: "UNREVIEWED" } })`.
- **Daftar Perhatian (`attention`):**
  - Jumlah pengguna menunggu persetujuan (`count > 0`).
  - Proyek aktif yang belum memiliki peran kunci (`SUPERVISOR`, `ARCHITECT`, `FINANCE`, atau `LOGISTIC`).
  - Proyek aktif tanpa laporan ≥ 2 hari (`REPORT_STALE_DAYS`).
  - Transaksi darurat belum ditinjau.
  - Item logistik dengan stok minus.
- **Persetujuan Pengguna:** 5 user terlama menunggu (`reviewedAt: null`, `orderBy: { createdAt: "asc" }`).
- **Kesehatan Proyek:** Daftar proyek aktif dengan coverage peran tim, tanggal laporan terakhir, jumlah transaksi belum ditinjau, jumlah stok minus, dan total dokumen.

#### B. Executive (`dashboard.getExecutiveOverview` & `getExecutiveTrends`)
- **Executive KPIs:**
  - Total proyek aktif (`project.count({ where: { status: "ACTIVE" } })`).
  - Laporan 7 hari terakhir vs 7 hari sebelumnya (dihitung delta numeriknya di sisi client).
  - Total pekerja hari ini: Penjumlahan `totalWorkers` dari laporan terakhir setiap proyek aktif hari ini.
  - Kendala dilaporkan dalam 7 hari terakhir: `dailyReport.count({ where: { issues: { not: null }, reportDate: { gte: now - 7d } } })`.
- **Portofolio Proyek:**
  - Setiap proyek menyertakan: rentang tanggal, progres terakhir, progres sebelumnya (untuk deteksi anomali penurunan), saldo kas darurat, jumlah penarikan belum ditinjau, dan pekerja hari ini.
- **Feed Kendala Terbaru:** 5 laporan harian terkini dengan kolom kendala terisi (`take: 5`, `orderBy: { reportDate: "desc" }`).
- **Dana Darurat & Tren:**
  - Total saldo seluruh proyek (`emergencyFund._sum.currentBalance`).
  - Total penarikan bulan ini (`emergencyTransaction._sum.amount` tipe `WITHDRAWAL` bulan berjalan).
  - Trend pekerja 30 hari (agregasi `DISTINCT ON ("projectId", date)` lalu dijumlahkan per hari; hari kosong dibiarkan sebagai gap, bukan angka 0).
  - Cash flow 6 bulan (memanfaatkan logika agregasi bulanan dari modul dana darurat).

---

#### C. User Dashboard & Role Lenses (`dashboard.getUserOverview`)

Seluruh data lensa dibatasi secara ketat di database dengan filter:
`project: { status: "ACTIVE", members: { some: { userId: ctx.user.id, role: TARGET_ROLE } } }`

```ts
// Struktur Response dashboard.getUserOverview
type UserOverviewOutput = {
  memberships: Array<{
    projectId: string;
    projectName: string;
    projectSlug: string;
    role: "SUPERVISOR" | "ARCHITECT" | "FINANCE" | "LOGISTIC";
  }>;
  supervisor?: {
    kpis: {
      pendingReportsToday: number;
      unreviewedWithdrawalsCount: number;
      weeklyCommentsCount: number;
    };
    projects: Array<{
      id: string;
      name: string;
      slug: string;
      hasReportedToday: boolean;
      emergencyBalance: string;
      latestReport?: {
        progressPercent: number;
        reportDate: Date;
      };
    }>;
    recentReports: Array<{
      id: string;
      slug: string;
      reportDate: Date;
      title: string;
      totalWorkers: number;
      projectName: string;
      projectSlug: string;
      thumbnailUrl?: string;
    }>;
  };
  architect?: {
    kpis: {
      totalDocuments: number;
      myUploadsLast7Days: number;
    };
    projects: Array<{
      id: string;
      name: string;
      slug: string;
      totalDocs: number;
      byType: Record<string, number>;
      latestDoc?: {
        name: string;
        version: string;
        createdAt: Date;
      };
    }>;
  };
  finance?: {
    kpis: {
      unreviewedCount: number;
      monthlyWithdrawalsAmount: string;
      negativeStockCount: number;
    };
    unreviewedQueue: Array<{
      id: string;
      projectId: string;
      projectName: string;
      amount: string;
      requesterName: string;
      description: string;
      hasReceipt: boolean;
      createdAt: Date;
    }>;
    projectFunds: Array<{
      projectId: string;
      projectName: string;
      projectSlug: string;
      currentBalance: string;
    }>;
  };
  logistic?: {
    kpis: {
      negativeStockItemCount: number;
      weeklyMutationCount: number;
      assignedProjectsCount: number;
      totalItemsCount: number;
    };
    negativeStockItems: Array<{
      id: string;
      name: string;
      unit: string;
      projectId: string;
      projectName: string;
      projectSlug: string;
      currentStock: number; // Nilai < 0
      lastMutationAt: Date;
    }>;
    projectInventory: Array<{
      projectId: string;
      projectName: string;
      projectSlug: string;
      itemCount: number;
      negativeStockCount: number;
      lastActivityAt?: Date;
    }>;
    recentTransactions: Array<{
      id: string;
      type: "IN" | "OUT";
      quantity: number;
      unit: string;
      itemName: string;
      projectId: string;
      projectName: string;
      projectSlug: string;
      operatorName: string;
      notes?: string;
      createdAt: Date;
    }>;
  };
};
```

---

## 5. Screens, Wireframes & Mockups

Urutan blok tata letak pada setiap dashboard:
1. **Daftar Perhatian / Action Items** (jika ada item kritis)
2. **Baris Kartu KPI (`MetricCard`)**
3. **Konten Utama** (Grid split `lg:grid-cols-7` dengan porsi `lg:col-span-4` dan `lg:col-span-3`)
4. **Grafik & Analitik Lanjutan**

---

### A. Admin Dashboard

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ PERLU TINDAKAN (Hanya muncul jika count > 0)                                 │
│  • 3 pengguna menunggu persetujuan                        [Tinjau →]         │
│  • 1 proyek aktif belum memiliki anggota Logistik        [Kelola Tim →]      │
│  • 2 proyek aktif tanpa laporan ≥ 2 hari                 [Lihat →]           │
│  • 4 transaksi dana darurat belum ditinjau                [Periksa →]        │
│  • 1 item logistik bersaldo minus                         [Atasi →]          │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ ┌───────────────────┐
│ Proyek Aktif │ │ Pengguna     │ │ Lapor Hari Ini       │ │ Belum Ditinjau    │
│ 5 Aktif      │ │ 12 Aktif     │ │ 3 dari 5             │ │ 4 Transaksi       │
│ 1 tunda · 1 sel│ 3 tunggu · 1 tlk│ proyek aktif         │ │ Dana Darurat      │
└──────────────┘ └──────────────┘ └──────────────────────┘ └───────────────────┘

┌───────────────────────────────────────┐ ┌────────────────────────────────────┐
│ Persetujuan Pengguna (4/7)            │ │ Aksi Cepat (3/7)                   │
│ Ni Made Ayu (ayu@mail.com) · 4 hr lalu │ │ • Tinjau Pengguna Baru             │
│ Komang Adi (adi@mail.com)  · 2 hr lalu │ │ • Buat Proyek Baru                 │
│ Wayan Sari (sari@mail.com) · 3 jam lalu│ │ • Ekspor Rekapitulasi Laporan      │
└───────────────────────────────────────┘ └────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ KESEHATAN PROYEK (Tabel interaktif, klik baris → Detail Proyek)              │
│ Proyek           | Status  | Tim (S A K L) | Laporan Terakhir | Minus | Dok  │
│ Villa Jimbaran   | Aktif   | [S][A][K][L]  | Hari ini         | -     | 14   │
│ Ruko Sanur       | Aktif   | [S][A][K][!L] | 3 hari lalu      | 1     | 6    │
│ Interior Ubud    | Tertunda| [S][A][!K][!L]| 12 hari lalu     | -     | 0    │
│ (Catatan: [!L] menunjukkan role Logistik belum ditugaskan pada proyek)       │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### B. Executive Dashboard

```
┌──────────────┐ ┌──────────────────────┐ ┌──────────────┐ ┌───────────────────┐
│ Proyek Aktif │ │ Laporan 7 Hari       │ │ Pekerja      │ │ Kendala Dilaporkan│
│ 5            │ │ 18                   │ │ 64 Orang     │ │ 3 Laporan         │
│ Dari 7 proyek│ │ ▲ 4 dari pekan lalu  │ │ 3 proyek lapor│ │ 7 hari terakhir  │
└──────────────┘ └──────────────────────┘ └──────────────┘ └───────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ PORTOFOLIO PROYEK                                                            │
│ Proyek               | Waktu vs Progres Kumulatif      | Pekerja | Kas Darurat│
│ Villa Jimbaran       | Waktu 62%   ████████░░░░        | 24      | Rp 12.5 jt │
│ 1 Mar – 30 Nov 2026  | Progres 48% ██████░░░░░░ (Hari) |         |            │
│ Ruko Sanur           | Waktu 88%   ███████████░        | -       | Rp 3.2 jt  │
│ 10 Jun – 10 Okt 2026 | Progres 71% █████████░░░ (3 hr) |         | (2 pending)│
│ Interior Ubud        | Belum ada laporan               | -       | Rp 0       │
└──────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────┐ ┌────────────────────────────────────┐
│ Kendala Terbaru Dilaporkan (1/2)      │ │ Posisi Dana Darurat (1/2)          │
│ • Ruko Sanur (16 Sep)                 │ │ Saldo Total: Rp 15.700.000         │
│   "Pengiriman semen tertunda 2 hari"  │ │ Penarikan Bulan Ini: Rp 2.400.000  │
│ • Villa Jimbaran (15 Sep)             │ │ [Grafik Cash Flow 6 Bulan Masuk/   │
│   "Hujan deras, cor lantai 2 ditunda" │ │  Keluar Recharts]                  │
└───────────────────────────────────────┘ └────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ Tren Tenaga Kerja Lapangan (30 Hari Terakhir)                                │
│ [Grafik Area / Bar Recharts: Akumulasi pekerja harian di proyek aktif]       │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### C. User Dashboard & Role Lenses

#### Header Bersama & Navigasi Lensa
```
[Proyek Saya: Villa Jimbaran (Supervisor, Logistik) · Ruko Sanur (Logistik)]

┌──────────────────────────────────────────────────────────────────────────────┐
│ [Tab: Supervisor (1)]  [Tab: Logistik (1)]  [Tab: Keuangan]  [Tab: Arsitek]  │
│ (Tab disinkronkan ke query parameter ?lens=; badge angka = item aksi aktif) │
└──────────────────────────────────────────────────────────────────────────────┘
```

Jika pengguna belum ditugaskan ke proyek aktif mana pun:
> **Status:** Belum Ditugaskan ke Proyek  
> *"Akun Anda telah aktif, namun belum ada penugasan proyek. Silakan hubungi Administrator untuk penugasan tim."*

---

#### 1. Lensa Supervisor (`SUPERVISOR`)
- **KPI Row:**
  - *Laporan Hari Ini:* "1 Belum Lapor" (dari 2 proyek Anda).
  - *Penarikan Belum Ditinjau:* "1 Transaksi" (Rp 1.500.000 diajukan oleh saya).
  - *Komentar (7 Hari):* "4 Komentar" pada laporan saya dari anggota tim lain.
- **Daftar Proyek Saya:**
  - Kartu proyek dengan status pelaporan hari ini, saldo kas darurat, laporan terakhir & persentase progres.
  - Aksi cepat: Tombol `[+ Buat Laporan Harian]` (buka `ReportDialog`) dan `[Tarik Dana Darurat]` (buka `WithdrawDialog`).
- **Laporan Terbaru Saya:** List 3 laporan harian terakhir yang dibuat oleh pengguna lengkap dengan tanggal, jumlah pekerja, dan thumbnail foto pertama.

---

#### 2. Lensa Arsitek (`ARCHITECT`)
- **KPI Row:**
  - *Dokumen di Proyek Saya:* Total berkas gambar/desain yang tersimpan.
  - *Saya Unggah (7 Hari):* Total dokumen yang diunggah oleh saya dalam sepekan terakhir.
- **Ringkasan Dokumen per Proyek:**
  - Kartu per proyek dengan rincian kategori dokumen (Desain, Gambar Kerja, Spesifikasi), versi dokumen terbaru, dan tanggal pembaruan.
  - Aksi cepat: Tombol `[Lihat Dokumen]` dan `[+ Unggah Dokumen Baru]` (buka `UploadDialog`).

---

#### 3. Lensa Keuangan (`FINANCE`)
- **KPI Row:**
  - *Antrean Tinjauan:* Jumlah transaksi dana darurat berstatus `UNREVIEWED` di proyek yang saya kelola.
  - *Penarikan Bulan Ini:* Total pengeluaran kas darurat bulan berjalan.
  - *Item Stok Minus:* Jumlah item material yang bersaldo minus di proyek saya.
- **Antrean Tinjauan Kas Darurat:**
  - Daftar transaksi menunggu verifikasi (maksimal 10, urutan terlama lebih dulu).
  - Indikator badge: *"Tanpa Bukti"* jika kuitansi/nota belum diunggah.
  - Aksi: Tombol langsung `[Tandai Ditinjau]`.
- **Saldo Kas Darurat per Proyek:**
  - Tampilan saldo kas aktif per proyek dengan tombol cepat `[+ Tambah Saldo / Deposit]` (buka `DepositDialog`).

---

#### 4. Lensa Logistik (`LOGISTIC`) — Spesifikasi Mendalam

Lensa Logistik didesain khusus untuk staf operasional gudang dan pengawas material lapangan yang bertanggung jawab memastikan ketersediaan barang dan akurasi mutasi fisik.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ LENSA LOGISTIK                                                               │
└──────────────────────────────────────────────────────────────────────────────┘

┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ ┌─────────────┐
│ Item Stok Minus   │ │ Mutasi 7 Hari     │ │ Proyek Dikelola   │ │ Total Barang│
│ 1 Item            │ │ 9 Transaksi       │ │ 2 Proyek          │ │ 23 Master   │
│ Butuh restock     │ │ Masuk & Keluar    │ │ Status Aktif      │ │ Material    │
└───────────────────┘ └───────────────────┘ └───────────────────┘ └─────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ PERHATIAN: ITEM MATERIAL BERSALDO MINUS                                    │
│ Terjadi selisih pencatatan di mana pengeluaran barang melebihi stok tercatat: │
│ • Ruko Sanur: Semen Tiga Roda (Saldo: -4 Sak)                                 │
│   Aksi: [Catat Masuk / Restock]  [Buka Gudang Proyek →]                      │
└──────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────┐ ┌────────────────────────────────────┐
│ Inventaris per Proyek (4/7)           │ │ Pintasan & Aksi Cepat (3/7)        │
│ Villa Jimbaran                        │ │ • [+ Catat Mutasi Masuk/Keluar]    │
│ 14 item terdaftar · Stok aman         │ │   (Buka TransactionDialog)         │
│ [Buka Modul Logistik →]               │ │ • [+ Tambah Master Barang Baru]    │
│ ───────────────────────────────────── │ │   (Buka LogisticItemDialog)        │
│ Ruko Sanur                            │ │ • Tanggung Jawab:                  │
│ 9 item terdaftar · ⚠️ 1 item minus     │ │   Pastikan setiap barang keluar    │
│ [Buka Modul Logistik →]               │ │   memiliki catatan peruntukan.     │
└───────────────────────────────────────┘ └────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ RIWAYAT MUTASI TERBARU (5 Transaksi Terakhir di Proyek Anda)                 │
│ Waktu         | Proyek        | Barang           | Tipe   | Kuantitas | Oleh │
│ Hari ini 14:10| Ruko Sanur    | Semen Tiga Roda  | [MASUK]| +20 Sak   | Made │
│ Kemarin 09:30 | Villa Jimbaran| Paku Ukuran 5cm  | [KELUAR| -5 Kg     | Budi │
│ 08 Okt 16:00  | Ruko Sanur    | Pasir Pasang     | [MASUK]| +2 Dump   | Made │
└──────────────────────────────────────────────────────────────────────────────┘
```

##### Komponen Utama Lensa Logistik:
1. **4x Kartu Metrik KPI (`MetricCard`):**
   - *Item Stok Minus:* Menggunakan `tone="attention"` berwarna merah/oranye jika nilai > 0. Caption: `"Σ IN − Σ OUT < 0"`.
   - *Mutasi 7 Hari:* Jumlah pergerakan barang dalam 7 hari terakhir.
   - *Proyek Dikelola:* Jumlah proyek aktif di mana pengguna menjabat sebagai Logistik.
   - *Total Master Barang:* Akumulasi ragam material yang terdaftar di proyek pengguna.
2. **Banner Peringatan Stok Minus:**
   - Muncul otomatis jika `negativeStockItemCount > 0`.
   - Menampilkan nama barang, satuan, proyek bersangkutan, dan jumlah minus.
   - Tombol aksi terintegrasi: `[Catat Masuk]` yang langsung membuka `TransactionDialog` tipe `IN` ter-prefill, serta tautan cepat ke modul logistik proyek.
3. **Ringkasan Inventaris Proyek:**
   - Menampilkan status kesehatan stok masing-masing proyek (Aman / Ada Stok Minus).
   - Tautan langsung ke `/projects/[slug]/logistics`.
4. **Feed Riwayat Mutasi Terkini:**
   - 5 transaksi mutasi terakhir di seluruh proyek pengguna.
   - Badge warna: Hijau untuk barang masuk (`IN` dengan ikon panah naik) dan Oranye/Merah untuk barang keluar (`OUT` dengan ikon panah turun).
   - Menampilkan kuantitas, satuan, nama petugas penginput, dan catatan ringkas.
5. **Integrasi Dialog Langsung:**
   - Staf Logistik dapat mencatat barang masuk/keluar secara langsung dari dashboard melalui `TransactionDialog` tanpa perlu navigasi berpindah halaman.

---

## 6. Components & Design System

Semua komponen dibangun di atas primitif `shadcn/ui`:

| Komponen Remodel | Primitif Dasar | Catatan & Perilaku Teknis |
|---|---|---|
| `MetricCard` *(menggantikan `StatCard`)* | `Card`, `Skeleton`, `Badge` | Props: `label, value, caption?, previous?: { value: number; periodLabel: string }, href?, tone?: "default" \| "attention", isLoading, isError`. Tidak ada tren teks bebas. Delta dihitung otomatis. |
| `AttentionList` | `Card`, `Button` (`variant="ghost"`), `Badge` | Props: `items: { key, count, label, href, severity }[]`. Hanya merender item dengan `count > 0`. Jika semua 0, tampilkan pesan all-clear. |
| `TimelineProgress` | `Progress` + custom elapsed bar | Dua track visual: Garis tipis atas untuk waktu kalender berlalu (*elapsed time*), dan garis utama untuk progres kumulatif yang dilaporkan. |
| `RoleCoverage` | `Badge` (`variant="outline"`) | Menampilkan pil [S] [A] [K] [L]. Jika peran belum terisi di proyek, pil menggunakan border putus-putus (`border-dashed opacity-60`). |
| `RoleLensTabs` | `Tabs`, `TabsList`, `TabsTrigger` | Menggunakan standar keyboard WAI-ARIA Tabs. Pilihan tab tersinkronisasi otomatis dengan query parameter URL (`?lens=`). |
| `IssueFeed` | `Card`, `Separator`, `Link` | Membatasi teks kendala maksimal 2 baris (`line-clamp-2`). Baris dapat diklik langsung menuju laporan terkait. |
| `ProjectHealthTable` / `PortfolioTable` | `Table`, `DataTable` | Ditampilkan sebagai tabel penuh pada layar desktop/tablet (≥ 768px), dan beralih menjadi format kartu pada layar ponsel (< 768px). |
| `FundFlowChart` & `WorkersChart` | `ChartContainer`, Recharts | Mengaktifkan `accessibilityLayer`. Warna grafik mengambil token `--chart-1` dan `--chart-2`. |

### Design Tokens & CSS Variables
Gunakan token CSS semantik dari tema global:
- `--primary`: Aksen utama dan bar pengisian progres laporan.
- `--muted`, `--muted-foreground`: Teks sekunder, caption, dan track waktu kalender.
- `--card`, `--border`: Seluruh container kartu dan garis batas tabel.
- `--destructive`: Indikator stok minus dan batas tenggat terlampaui.
- `--status-success` & `--status-warning` (+ background tint): Token status semantik untuk badge. Light mode: teks hijau/amber pekat di atas tint 50. Dark mode: teks hijau/amber cerah di atas tint 950. Dilarang menggunakan kombinasi warna Tailwind statis yang tidak mendukung dark mode (seperti `bg-green-50/50`).

---

## 7. Responsive, State & Motion

### Perilaku Responsif (Mobile-First Stack)
- **Desktop (≥ 1024px):** Baris KPI 4 kolom; area utama terbagi 4:3 (`lg:grid-cols-7`); tabel dirender penuh.
- **Tablet (768px – 1023px):** Baris KPI 2 kolom; layout split bertumpuk secara vertikal; tabel dapat digeser mendatar (`overflow-x-auto`).
- **Ponsel (< 768px):** Baris KPI 2 kolom kompak; tabel bertransformasi menjadi **daftar kartu (card list)** dengan nama proyek dan status di bagian atas, diikuti informasi kunci di bawahnya; tab lensa peran dapat digeser horizontal (*scrollable pills*); tombol tindakan utama memenuhi lebar kontainer (*full-width*).

### State Management & Mutasi
- **Loading State:** Menggunakan skeleton animasi shimmer (`Skeleton`), menjaga tinggi komponen agar tidak terjadi Cumulative Layout Shift (CLS).
- **Error State:** Tampilan per-widget berupa kartu peringatan dengan pesan kegagalan dan tombol aksi `[Coba Lagi]`. Kegagalan satu widget tidak merusak seluruh dashboard.
- **Zero / Empty State:** Menampilkan angka `0` (bukan disembunyikan). Untuk daftar proyek kosong, tampilkan ilustrasi atau pesan bantuan dengan tombol aksi pertama.
- **Cache Invalidation:** Ketika pengguna melakukan mutasi (membuat laporan harian, meninjau transaksi, mencatat mutasi logistik, mengunggah dokumen, atau menyetujui user), query `dashboard.*` terkait wajib di-invalidasi bersamaan dengan query modul asalnya.

### Prinsip Motion
- Hover border kartu: Transisi 150ms `ease-out`.
- Ekspansi kartu pada mobile: 300ms dengan transisi halus dan wajib mematuhi preferensi sistem `useReducedMotion()`.
- **Dilarang menggunakan efek animasi angka bergulir (count-up):** Angka metrik harus muncul langsung dan tegas agar terbaca sebagai data analitik yang presisi, bukan elemen dekoratif.

---

## 8. Aksesibilitas (WCAG AA)

1. **Struktur Heading Semantis:** Judul halaman utama menggunakan tag `<h1>`, judul masing-masing kartu menggunakan `<h2>` atau `<section aria-labelledby="...">`.
2. **Status Multi-Indikator:** Status tidak boleh hanya dibedakan berdasarkan warna. Setiap status wajib memiliki label teks yang jelas, dan status kritis (seperti stok minus atau lewat tenggat) harus menyertakan ikon pembeda.
3. **Aksesibilitas Bar Progres:** Komponen `TimelineProgress` menetapkan atribut `role="progressbar"` dan `aria-valuenow` pada track progres laporan utama. Track waktu kalender ditandai dengan `aria-hidden="true"`, dengan nilainya dijelaskan melalui label teks tampak.
4. **Navigasi Keyboard Penuh:** Seluruh baris tabel, link kartu, dan tab lensa dapat diakses melalui tombol Tab dan diaktifkan dengan tombol Enter/Space.

---

## 9. Rencana Implementasi Bertahap (Phases)

Pengerjaan remodel dashboard dilakukan secara bertahap untuk memastikan stabilitas sistem:

### Fase 1 — Pondasi & Komponen Dasar
- Buat file `src/lib/dashboard-constants.ts` dan fungsi helper zona waktu WITA (`src/lib/time-utils.ts` atau sejenisnya) beserta unit test Vitest.
- Daftarkan token status di CSS variabel dan tema Tailwind.
- Bangun komponen fondasi: `MetricCard`, `AttentionList`, perbaikan grid responsif, dan layout wrapper.

### Fase 2 — Admin Dashboard
- Buat prosedur tRPC `dashboard.getAdminOverview`.
- Hubungkan hook query di `src/hooks/useDashboard.ts`.
- Bangun komponen `AdminDashboard` dan verifikasi seluruh widget berfungsi dari data Prisma.

### Fase 3 — Executive Dashboard
- Buat prosedur tRPC `dashboard.getExecutiveOverview` dan `dashboard.getExecutiveTrends`.
- Bangun komponen `TimelineProgress`, `PortfolioTable`, `IssueFeed`, serta grafik pekerja & arus kas Recharts.
- Satukan ke dalam komponen `ExecutiveDashboard`.

### Fase 4 — User Dashboard & Role Lenses
- Buat prosedur tRPC `dashboard.getUserOverview` dengan penanganan lensa `supervisor`, `architect`, `finance`, dan `logistic`.
- Bangun komponen `RoleLensTabs`.
- Bangun masing-masing lensa:
  - `SupervisorLens` (integrasi `ReportDialog` & `WithdrawDialog`).
  - `ArchitectLens` (integrasi `UploadDialog`).
  - `FinanceLens` (aksi verifikasi transaksi & `DepositDialog`).
  - `LogisticLens` (tabel stok minus, feed mutasi, integrasi `TransactionDialog` & `LogisticItemDialog`).
- Tangani state kosong bagi pengguna tanpa penugasan proyek aktif.

### Fase 5 — Switch Routing & Pembersihan File Warisan
- Perbarui `src/app/(internal)/dashboard/page.tsx` untuk melakukan percabangan bersih berdasarkan `roleGlobal` (`AdminDashboard`, `ExecutiveDashboard`, `UserDashboard`).
- Hubungkan invalidasi cache React Query pada aksi-aksi mutasi terkait.
- Perbaiki perhitungan rata-rata keliru pada kartu *Progres Keseluruhan* di halaman detail proyek agar menggunakan laporan harian terakhir.
- **Pembersihan File Warisan:** Setelah dashboard baru beroperasi stabil, hapus atau ganti file-file lama berikut:
  - `src/components/dashboard/ceo-view.tsx` & `executive-view.tsx`
  - `src/components/dashboard/mandor-view.tsx` & `supervisor-view.tsx`
  - `src/components/dashboard/admin-view.tsx`
  - `src/components/dashboard/architect-view.tsx`
  - `src/components/dashboard/finance-view.tsx`
  - `src/components/dashboard/logistic-view.tsx`
  - `src/components/dashboard/stat-card.tsx` (jika tidak lagi digunakan)
- Jalankan verifikasi menyeluruh: `pnpm typecheck`, `pnpm check`, `pnpm test`.

---

## 10. Kriteria Penerimaan (Acceptance Criteria)

- [ ] Tidak ditemukan lagi teks atau angka metrik palsu/hardcoded di seluruh komponen dashboard.
- [ ] Setiap angka pada `MetricCard` dapat ditelusuri langsung ke field query database Prisma.
- [ ] Pengguna dengan `roleGlobal = USER` terisolasi secara mutlak: tidak dapat melihat data proyek yang tidak menjadi bagian dari keanggotaannya.
- [ ] Pengguna dengan multi-peran pada proyek berbeda dapat berganti lensa secara mulus melalui tab peran tanpa terjadi penumpukan layout.
- [ ] Lensa Logistik menampilkan data stok minus riil dengan aksi cepat mitigasi pencatatan mutasi masuk.
- [ ] Tampilan responsif diuji dan nyaman digunakan pada perangkat seluler (< 768px).
- [ ] Mode gelap (*dark mode*) teruji kontras dan tampil harmonis pada seluruh komponen.
- [ ] Perintah `pnpm typecheck`, `pnpm check`, dan `pnpm test` berhasil 100% tanpa error.
