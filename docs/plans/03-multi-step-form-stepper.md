# 🪜 Fase 3: Multi-Step Form Stepper pada Laporan (`@reui/stepper`)

> **File:** `docs/plans/03-multi-step-form-stepper.md`  
> **Status:** 🟢 Selesai (Completed)  
> **Dependensi:** Fase 1 (`01-registry-and-primitives.md`), Fase 2 (`02-file-and-media-upload.md`)  
> **Target File:**
> - [`src/components/report/report-form.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/report/report-form.tsx) (Refaktor Wizard 3 Langkah)
> - [`src/components/report/report-dialog.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/report/report-dialog.tsx) (Penyesuaian Container Dialog/Drawer)

---

## 🎯 1. Sasaran & Masalah yang Diselesaikan

1. **Scroll Fatigue di Smartphone Lapangan**: Form laporan harian saat ini membentang 481 baris kode dan satu scroll panjang. Mandor di bawah sinar matahari lapangan kesulitan menavigasi form yang terlalu panjang.
2. **Validasi Terisolasi per Tahap**: Pengguna sering kali baru menyadari ada field wajib di bagian atas setelah men-scroll sampai ke tombol Simpan paling bawah.
3. **Penyederhanaan Kognitif**: Memecah pengisian menjadi **3 Langkah Terstruktur** menggunakan komponen primitif [`src/components/ui/stepper.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/stepper.tsx).

---

## 🧱 2. Rincian 3 Langkah Form Wizard

```
+-------------------------------------------------------------+
|  [ 1. Lapangan ] ──── [ 2. Progres ] ──── [ 3. Dokumentasi ] |
+-------------------------------------------------------------+
|                                                             |
|                    KONTEN LANGKAH AKTIF                     |
|                                                             |
+-------------------------------------------------------------+
| [ < Kembali ]                           [ Lanjutkan > / 💾 ] |
+-------------------------------------------------------------+
```

### Langkah 1: Kondisi Lapangan
- **Field**:
  - `reportDate`: Pemilih tanggal format WITA (`Popover` + `Calendar`).
  - `location`: Lokasi/Area kerja di proyek.
  - `weather` & `customWeather`: Pilihan cuaca (`Select` preset + input custom jika memilih "Lainnya").
  - `totalWorkers`: Jumlah pekerja hari ini (`Input type="number"`).
- **Zod Schema Validasi Tahap 1**:
  ```ts
  const step1Schema = z.object({
    reportDate: z.date({ required_error: "Tanggal laporan wajib diisi" }),
    weather: z.string().optional(),
    customWeather: z.string().optional(),
    totalWorkers: z.number().min(0, "Jumlah pekerja minimal 0"),
    location: z.string().optional(),
  });
  ```

---

### Langkah 2: Progres & Rincian Tugas
- **Field**:
  - `taskDescription`: Deskripsi umum pekerjaan (`Textarea`, min 5 karakter).
  - `progressPercent`: Persentase progres harian 0–100% (`Slider` / `Input` dengan indikator progres warna).
  - Sub-tugas: Rincian checklist pekerjaan yang diselesaikan.
- **Zod Schema Validasi Tahap 2**:
  ```ts
  const step2Schema = z.object({
    taskDescription: z.string().min(1, "Deskripsi pekerjaan wajib diisi"),
    progressPercent: z.number().min(0).max(100),
  });
  ```

---

### Langkah 3: Dokumentasi & Kendala
- **Field**:
  - `images`: Dual-action file picker dari Fase 2 (Kamera langsung HP `capture="environment"` + Galeri).
  - `issues`: Catatan kendala lapangan / blocker pekerjaan (`Textarea`).
- **Zod Schema Validasi Tahap 3**:
  ```ts
  const step3Schema = z.object({
    issues: z.string().optional(),
    images: z.array(z.union([z.string(), z.instanceof(File)])).optional(),
  });
  ```

---

## 📱 3. Ergonomi Mobile & Navigasi Tombol

1. **Stepper Header**:
   - Di mobile (< 640px): Tampilkan indikator nomor kompak `Langkah X dari 3: [Nama Langkah]` atau mini circular steps agar tidak terjadi layout break.
   - Di desktop (≥ 640px): Tampilkan full horizontal stepper lengkap dengan title dan deskripsi.
2. **Bottom Navigation Bar (Sticky)**:
   - Diletakkan di bagian bawah form dengan tombol **"Kembali"** (outline) dan **"Lanjutkan"** (primary, ukuran standar).
   - Pada langkah terakhir (Langkah 3), tombol "Lanjutkan" berubah menjadi **"Simpan Laporan"** dengan indikator loading (`IconLoader2`).
3. **Penyimpanan State Form Antar-Langkah**:
   - State form TanStack Form tetap satu kesatuan di level root `ReportForm`. Navigasi antar-step hanya mengubah `activeStep` tanpa me-reset form state.

---

## 🧪 4. Kriteria Keberhasilan & Verifikasi

- [x] Pengguna tidak dapat melangkah ke Langkah 2 jika ada field Langkah 1 yang belum valid (pesan error muncul tepat di bawah field).
- [x] Tombol "Kembali" berfungsi dengan mulus dan mempertahankan nilai input yang sudah diisi.
- [x] Tombol aksi navigasi bawah menggunakan ukuran tombol standar yang konsisten.
- [x] Kamera langsung HP tetap berfungsi sempurna di Langkah 3.
- [x] Form submit berhasil menyimpan data laporan ke database via tRPC `createReport` / `updateReport`.
- [x] `pnpm typecheck` dan `pnpm biome check` lulus 100%.
