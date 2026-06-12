# Rencana Implementasi: Ekspor Laporan Bulanan ke Excel

Fitur ini memungkinkan pengguna dengan role **CEO** atau **ADMIN** untuk mengunduh laporan bulanan suatu proyek ke dalam file Excel (`.xlsx`). Laporan dibuat secara dinamis di sisi server menggunakan `exceljs`, menyatukan data `DailyReport`, `DailyReportTask`, dan foto dokumentasi (`ReportMedia`) ke dalam dua sheet: **Sheet Detail** dan **Sheet Ringkasan**.

---

## User Review Required

> [!IMPORTANT]
> **Strategi Foto di Excel — Hybrid (Thumbnail + Hyperlink):**
> Kolom "Dokumentasi" akan menampilkan thumbnail kecil (transformasi Cloudinary `w_100,q_auto,f_auto`) yang di-embed langsung sebagai gambar di Excel, **dan** setiap thumbnail akan diberi hyperlink ke URL full-resolution. Ini menjaga file tetap ringan namun tetap visual.

> [!IMPORTANT]
> **Otorisasi Diperluas ke ADMIN:**
> Dari plan awal yang hanya mengizinkan CEO, plan ini diperbarui agar **CEO dan ADMIN** keduanya dapat mengekspor. Ini konsisten dengan pola `isAdmin()` yang sudah ada di `auth-guards.ts`.

> [!WARNING]
> **Batas Gambar per Laporan:**
> Setiap `DailyReport` bisa memiliki banyak `ReportMedia`. Untuk mencegah timeout dan file Excel yang terlalu besar, download thumbnail dibatasi menggunakan `Promise.all` dengan semua gambar sekaligus (aman karena ukuran file kecil — thumbnail `w_100`). Namun jika jumlah total gambar dalam satu bulan melebihi **100 foto**, perlu dipertimbangkan untuk hanya mengambil 3 foto pertama per hari.

---

## Proposed Changes

### 1. Dependensi & Library

#### [MODIFY] [package.json](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/package.json)
- Tambahkan `exceljs` ke `dependencies`.
- `exceljs` sudah memiliki type definitions bawaan, sehingga **tidak perlu** `@types/exceljs`.

```bash
pnpm add exceljs
```

---

### 2. Sisi Server: API Route Handler

#### [NEW] [route.ts](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/app/api/projects/[id]/export/route.ts)

Path: `src/app/api/projects/[id]/export/route.ts`

Menerima `GET` request dengan query param `month` (format: `YYYY-MM`).

**Alur implementasi lengkap:**

#### 2a. Validasi Input

```typescript
// Validasi query param `month`
const monthParam = searchParams.get("month"); // "2026-06"
const parsed = monthParam?.match(/^(\d{4})-(\d{2})$/);
if (!parsed) return NextResponse.json({ error: "Format bulan tidak valid. Gunakan YYYY-MM." }, { status: 400 });

const year = parseInt(parsed[1]);
const month = parseInt(parsed[2]) - 1; // 0-indexed untuk Date
const startDate = new Date(year, month, 1);
const endDate = new Date(year, month + 1, 0, 23, 59, 59); // akhir bulan
```

#### 2b. Autentikasi & Otorisasi

```typescript
const session = await getSession();
const validation = validateSessionAccess(session);
if (!validation.isValid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// Gunakan helper isAdmin() dari auth-guards yang sudah ada
// isAdmin() mengembalikan true untuk ADMIN dan CEO
const canExport = isAdmin(session.user.roleGlobal as GlobalRole);
if (!canExport) return NextResponse.json({ error: "Forbidden: Hanya ADMIN dan CEO yang dapat mengekspor laporan." }, { status: 403 });
```

#### 2c. Query Database (Prisma)

```typescript
// Verifikasi project ada
const project = await db.project.findUniqueOrThrow({
  where: { id: params.id },
  select: { id: true, name: true, location: true, startDate: true, endDate: true },
});

// Fetch semua laporan bulan tersebut
const reports = await db.dailyReport.findMany({
  where: {
    projectId: params.id,
    reportDate: { gte: startDate, lte: endDate },
  },
  include: {
    user: { select: { name: true } },
    tasks: {
      select: { taskName: true, workerCount: true, progress: true, notes: true },
      orderBy: { createdAt: "asc" },
    },
    media: {
      select: { url: true, publicId: true },
      // Batasi 3 foto pertama per laporan untuk menjaga ukuran file
      take: 3,
    },
  },
  orderBy: { reportDate: "asc" },
});

// Handle bulan kosong
if (reports.length === 0) {
  return NextResponse.json(
    { error: `Tidak ada data laporan untuk bulan ${monthParam}.` },
    { status: 404 }
  );
}
```

#### 2d. Konstruksi Excel (exceljs)

**Inisialisasi Workbook:**
```typescript
const workbook = new ExcelJS.Workbook();
workbook.creator = session.user.name;
workbook.created = new Date();
```

---

**Sheet 1: "Detail Laporan"**

Definisi kolom (9 kolom):

| # | Nama Kolom | Width | Keterangan |
|---|---|---|---|
| A | No. | 5 | Nomor urut baris laporan |
| B | Tanggal | 15 | Format: `DD MMMM YYYY` (locale id-ID) |
| C | Cuaca | 12 | Field `weather` |
| D | Jml. Pekerja | 14 | Field `totalWorkers` |
| E | Lokasi | 20 | Field `location` |
| F | Progress (%) | 14 | Field `progressPercent` |
| G | Detail Pekerjaan | 35 | `taskName (workerCount org, progress%)\nnotes` per task |
| H | Kendala | 30 | Field `issues` |
| I | Dokumentasi | 20 | Thumbnail embedded + hyperlink |

**Header Laporan (Baris 1–4):**
- Baris 1: Merge A1:I1 — "LAPORAN BULANAN PROYEK" — Bold, size 16, center
- Baris 2: Merge A2:I2 — Nama Proyek — Bold, size 13, center
- Baris 3: Merge A3:I3 — "Periode: [Bulan Tahun]" — Italic, size 11
- Baris 4: Merge A4:I4 — "Diekspor oleh: [Nama User] | [Tanggal Ekspor]" — size 10, muted

**Header Tabel (Baris 6):**
- Background: navy (`#1E3A5F`), teks putih, bold, center, border tipis semua sisi

**Iterasi Data (Baris 7++):**

Karena setiap `DailyReport` bisa punya banyak `tasks` dan banyak `media`, tinggi baris dan merge cell dihitung dinamis:

```
rowSpan = Math.max(tasks.length, media.length, 1)
```

- Kolom A–F, H: di-merge secara vertikal sebesar `rowSpan` (merge cell)
- Kolom G: setiap task ditulis ke baris berbeda
- Kolom I: setiap foto ditulis ke baris berbeda sebagai thumbnail

**Embed Foto (Thumbnail + Hyperlink):**
```typescript
// Transformasi URL Cloudinary → thumbnail kecil
const thumbUrl = mediaItem.url.replace(
  "/upload/",
  "/upload/w_100,h_80,c_fill,q_auto,f_auto/"
);

// Download sebagai ArrayBuffer
const buffer = await fetch(thumbUrl).then(r => r.arrayBuffer());

// Tambahkan ke workbook image
const imageId = workbook.addImage({
  buffer: Buffer.from(buffer),
  extension: "jpeg",
});

// Posisikan di sel kolom I baris yang tepat (tl = top-left, br = bottom-right)
worksheet.addImage(imageId, {
  tl: { col: 8, row: currentRow - 1 }, // 0-indexed
  br: { col: 9, row: currentRow },
  editAs: "oneCell",
});

// Set hyperlink ke URL full-resolution di sel tersebut
worksheet.getCell(`I${currentRow}`).value = {
  text: "Lihat Foto",
  hyperlink: mediaItem.url, // URL asli Cloudinary
};
```

- Tinggi baris yang mengandung gambar: `row.height = 65` (pt)

---

**Sheet 2: "Ringkasan"**

Sheet kedua berisi rekap statistik bulan tersebut:

| Metric | Nilai |
|---|---|
| Nama Proyek | `project.name` |
| Periode | Bulan Tahun |
| Total Hari Laporan | `reports.length` |
| Total Pekerja (Kumulatif) | `SUM(totalWorkers)` |
| Rata-rata Pekerja/Hari | `AVG(totalWorkers)` |
| Rata-rata Progress (%) | `AVG(progressPercent)` |
| Progress Tertinggi | `MAX(progressPercent)` |
| Progress Terendah | `MIN(progressPercent)` |
| Total Task | `SUM(tasks.length)` |
| Total Foto | `SUM(media.length)` |
| Hari dengan Kendala | Jumlah laporan di mana `issues !== null` |

Styling sheet ringkasan:
- Header tabel: background `#1E3A5F`, teks putih
- Kolom metric: bold, width 30
- Kolom nilai: width 20, center

#### 2e. Response

```typescript
const buffer = await workbook.xlsx.writeBuffer();

// Nama file: Laporan_[NamaProyek]_[YYYY_MM].xlsx
const safeProjectName = project.name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
const filename = `Laporan_${safeProjectName}_${monthParam.replace("-", "_")}.xlsx`;

return new NextResponse(buffer, {
  status: 200,
  headers: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
  },
});
```

---

### 3. Sisi Client: UI & Dialog

#### [NEW] [export-report-dialog.tsx](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/project/export-report-dialog.tsx)

Path: `src/components/project/export-report-dialog.tsx`

**Props:**
```typescript
interface ExportReportDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**State:**
```typescript
const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM")); // default bulan ini
const [isDownloading, setIsDownloading] = useState(false);
```

**Aksi Unduh:**
```typescript
const handleExport = async () => {
  setIsDownloading(true);
  const toastId = toast.loading("Sedang membuat laporan Excel...");
  try {
    const response = await fetch(`/api/projects/${projectId}/export?month=${selectedMonth}`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error ?? "Gagal mengekspor laporan");
    }
    // Trigger download di browser
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan_${selectedMonth}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Laporan berhasil diunduh!", { id: toastId });
    onOpenChange(false);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Terjadi kesalahan", { id: toastId });
  } finally {
    setIsDownloading(false);
  }
};
```

**UI:**
- Menggunakan `shadcn/ui Dialog`
- Input bulan menggunakan `<input type="month" />` yang di-style dengan Tailwind (komponen native, tidak perlu date picker library)
- Default value: bulan berjalan (`format(new Date(), "yyyy-MM")`)
- Tombol "Unduh Laporan" menampilkan `IconLoader2` (spin) saat `isDownloading === true`
- Tombol disabled saat `isDownloading`

---

#### [MODIFY] [project-detail-client.tsx](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/app/%28internal%29/projects/%5Bslug%5D/project-detail-client.tsx)

Perubahan:
1. Tambahkan state baru: `const [isExportOpen, setIsExportOpen] = useState(false);`
2. Tambahkan variabel: `const canExport = isAdmin(session?.user?.roleGlobal as GlobalRole | null | undefined);` — **note:** `isAdmin()` sudah ada dan sudah di-import, variabel ini bisa menggantikan `canManage` atau diduplikasi tergantung konteks.
3. Di blok `actions` dalam `<PageLayout>`, tambahkan tombol **"Ekspor Laporan"** dengan kondisi `canExport`:
   ```tsx
   {canExport && (
     <Button variant="outline" size="sm" onClick={() => setIsExportOpen(true)}>
       <IconFileSpreadsheet className="mr-2 h-4 w-4" />
       <span className="hidden sm:inline">Ekspor Laporan</span>
       <span className="inline sm:hidden">Ekspor</span>
     </Button>
   )}
   ```
4. Tambahkan `<ExportReportDialog>` di bawah dialog-dialog lainnya:
   ```tsx
   {canExport && project && (
     <ExportReportDialog
       projectId={project.id}
       open={isExportOpen}
       onOpenChange={setIsExportOpen}
     />
   )}
   ```

**Import baru yang perlu ditambahkan:**
- `IconFileSpreadsheet` dari `@tabler/icons-react`
- `ExportReportDialog` dari `~/components/project/export-report-dialog`

---

## Verification Plan

### Automated Tests

```bash
# Linting & formatting
pnpm lint

# Type check
pnpm typecheck
```

### Manual Verification

#### Keamanan (Security)
1. Akses `GET /api/projects/[id]/export?month=2026-06` tanpa login → harus `401`
2. Login sebagai role `USER` biasa → harus `403`
3. Login sebagai `ADMIN` atau `CEO` → harus `200` dengan file Excel

#### Validasi Input
4. Request dengan `month=abc` → harus `400` dengan pesan jelas
5. Request bulan kosong (tidak ada report) → harus `404` dengan pesan jelas, dan toast error tampil di UI

#### Fungsionalitas Ekspor
6. Login sebagai CEO/ADMIN → buka halaman detail proyek → tombol "Ekspor Laporan" tampil
7. Login sebagai USER → tombol "Ekspor Laporan" **tidak tampil**
8. Pilih bulan yang ada data → klik "Unduh Laporan" → file `.xlsx` terunduh
9. Verifikasi `sonner` toast: muncul "loading" saat proses, "success" setelah selesai

#### Verifikasi Tampilan Excel (buka di Microsoft Excel / Google Sheets / WPS Office)
10. Sheet "Detail Laporan":
    - Header laporan ter-merge dengan benar (A1:I1 s/d A4:I4)
    - Header tabel berwarna navy, teks putih
    - Sel merge vertikal untuk report dengan multi-task: kolom A–F, H ter-merge dengan rapi
    - Kolom G menampilkan setiap task di baris terpisah
    - Kolom I menampilkan thumbnail foto ter-embed + teks "Lihat Foto" dengan hyperlink
    - Baris dengan foto memiliki tinggi yang cukup (foto tidak terpotong)
11. Sheet "Ringkasan":
    - Semua metric tampil dengan nilai yang benar (total hari, total pekerja, rata-rata progress, dsb.)

#### Edge Cases
12. Laporan yang tidak punya task → kolom G menampilkan `taskDescription` fallback atau kosong dengan tanda "-"
13. Laporan yang tidak punya foto → kolom I menampilkan "-"
14. Nama proyek mengandung karakter khusus (e.g., "Villa & Resort") → nama file Excel tetap valid tanpa karakter ilegal
