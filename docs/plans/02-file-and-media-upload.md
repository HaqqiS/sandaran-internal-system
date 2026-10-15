# 📸 Fase 2: Perombakan File & Media Upload (`@reui/file-upload` & Attachment Card)

> **File:** `docs/plans/02-file-and-media-upload.md`  
> **Status:** 🟢 Selesai (Completed)  
> **Dependensi:** Fase 1 (`01-registry-and-primitives.md`) [Selesai]  
> **Target File:**
> - [`src/components/shared/file-upload.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/shared/file-upload.tsx) (Refaktor Dropzone Utama & Attachment Card)
> - [`src/components/shared/image-upload.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/shared/image-upload.tsx) (Penyelarasan dengan Pola Dropzone & Attachment Card)
> - [`src/components/report/media-upload.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/report/media-upload.tsx) (Integrasi Dropzone & Attachment Card)
> - Form Konsumen:
>   - [`src/components/report/report-form.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/report/report-form.tsx)
>   - [`src/components/emergency/deposit-form.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/emergency/deposit-form.tsx)
>   - [`src/components/emergency/withdraw-form.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/emergency/withdraw-form.tsx)

---

## 🎯 1. Sasaran & Ruang Lingkup Perubahan (Revisi)

Berdasarkan revisi kebutuhan alur kerja:

1. **Menghilangkan Dual-Action Picker UI Terpisah**: Alih-alih membuat dua tombol terpisah yang memecah alur ("Ambil Foto" vs "Pilih Galeri"), alur pengunggahan disatukan ke dalam **Dropzone Terpadu** (`@reui/file-upload`) yang bersih, ergonomis, dan tidak memakan banyak vertikal ruang layar.
2. **Dukungan Direct Camera & Galeri/File dari Dropzone**:
   - Di smartphone (iOS Safari & Android Chrome), mengetuk area dropzone akan secara otomatis memicu _native action sheet_ sistem operasi yang menyediakan pilihan: **Ambil Foto (Kamera Langsung)**, **Pustaka Foto (Galeri)**, dan **Pilih Berkas (File Manager/Dokumen)**.
   - Di desktop, pengguna mendapatkan kenyamanan penuh fitur _drag-and-drop_ berkas langsung ke area dropzone atau klik untuk memilih berkas.
3. **Pola Kartu Lampiran (Attachment Card / Chip Pattern via `@reui/attachment`)**:
   - Berkas yang dipilih (staged) maupun yang sudah tersimpan di Cloudinary dirender di bawah area dropzone dalam format kartu/chip lampiran interaktif.
   - Dilengkapi thumbnail gambar (atau ikon dokumen), nama berkas, ukuran format terstandarisasi, bar progres animasi saat proses upload Cloudinary berlangsung, tombol zoom lightbox (`MediaPreview`), dan tombol hapus touch-friendly (`min-h-11 min-w-11`).
4. **Standarisasi Siklus Cloudinary**:
   - Mempertahankan integritas `useCloudinaryUpload` dan endpoint tRPC signed params.
   - Mendukung dua mode: **Atomic Staging** (berkas ditampung lokal terlebih dahulu sebelum form disubmit) dan **Direct Upload** (langsung diunggah ke Cloudinary seperti pada penambahan foto di laporan yang sudah tersimpan).

---

## 🏗️ 2. Arsitektur Komponen Baru

### 2.1 Unified Dropzone Area (`@reui/file-upload` Pattern)

Area dropzone modern dengan visual interaktif, responsif, dan touch-friendly:

```tsx
<div
  {...getRootProps()}
  className={cn(
    "group relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-8",
    "border-border/80 hover:border-primary hover:bg-muted/40",
    isDragActive && "border-primary bg-primary/5",
    disabled && "cursor-not-allowed opacity-50",
    className,
  )}
>
  <input {...getInputProps()} />

  <div className="flex flex-col items-center gap-3">
    {/* Icon Wrapper dengan Efek Hover / Drag Active */}
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-transform group-hover:scale-105 group-hover:bg-primary/10">
      {isDragActive ? (
        <IconUpload className="h-6 w-6 text-primary animate-bounce" />
      ) : (
        <IconPhoto className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
      )}
    </div>

    {/* Keterangan Aksi */}
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">
        {isDragActive
          ? "Lepaskan berkas di sini"
          : "Seret & lepas atau klik untuk mengunggah"}
      </p>
      <p className="text-xs text-muted-foreground">
        Kamera langsung, galeri foto, atau dokumen ({acceptedExtensionsText}) hingga {maxSizeMB}MB
      </p>
    </div>
  </div>
</div>
```

---

### 2.2 Attachment Card / Chip Pattern (`@reui/attachment`)

Setiap berkas yang dipilih (staged) atau telah terunggah dirender di bawah dropzone dalam format kartu ringkas:

```tsx
<div className="group relative flex items-center gap-3 rounded-lg border border-border/70 bg-card p-2.5 shadow-xs transition-all hover:border-border">
  {/* Thumbnail Preview / Icon Fallback */}
  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted/40">
    {isImage && previewUrl ? (
      <Image src={previewUrl} alt={fileName} fill className="object-cover" />
    ) : (
      <IconFile className="m-auto h-6 w-6 text-muted-foreground" />
    )}
  </div>

  {/* Metadata File */}
  <div className="min-w-0 flex-1">
    <p className="truncate text-xs font-medium text-foreground">{fileName}</p>
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
      <span>{formattedSize}</span>
      {isUploading && (
        <span className="text-primary font-medium">
          • Mengunggah {progress}%
        </span>
      )}
    </div>
    {/* Upload Progress Bar */}
    {isUploading && <Progress value={progress} className="mt-1.5 h-1" />}
  </div>

  {/* Aksi: Zoom Lightbox & Hapus */}
  <div className="flex items-center gap-1">
    {isImage && previewUrl && (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="min-h-11 min-w-11 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
        onClick={() => openLightbox(previewUrl)}
        aria-label="Perbesar gambar"
      >
        <IconZoomIn className="h-4 w-4" />
      </Button>
    )}
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="min-h-11 min-w-11 sm:h-8 sm:w-8 text-destructive hover:bg-destructive/10"
      onClick={() => handleRemove(fileId)}
      disabled={isUploading}
      aria-label="Hapus berkas"
    >
      <IconX className="h-4 w-4" />
    </Button>
  </div>
</div>
```

---

## 📋 3. Rencana Refaktor per File Target

### 1. `src/components/shared/file-upload.tsx`
- Sempurnakan tampilan dropzone dengan styling baru, animasi drag active, dan layout ikon yang bersih.
- Terapkan **Attachment Card / Chip Pattern** untuk menampilkan file yang dipilih/diunggah.
- Pertahankan dukungan mode Atomic (file ditampung sebelum submit form) dan mode Legacy (langsung upload ke Cloudinary).
- Pastikan touch target tombol hapus memenuhi standar minimum **44×44px** (`min-h-11 min-w-11`).

### 2. `src/components/shared/image-upload.tsx`
- Sederhanakan komponen dengan mengadopsi struktur dropzone yang seragam dengan `file-upload.tsx`.
- Ganti grid preview kotak kaku dengan deretan **Attachment Cards / Chips** yang mendukung multi-file (hingga 10 foto) maupun single-file.
- Hubungkan dengan modal `MediaPreview` (lightbox zoom) saat thumbnail di-klik.
- Pastikan input file memicu action sheet kamera/galeri secara native di mobile.

### 3. `src/components/report/media-upload.tsx`
- Terapkan dropzone terpadu untuk alur tambah foto dokumentasi pada laporan yang sudah tersimpan.
- Render dokumentasi yang sudah ada menggunakan Attachment Card lengkap dengan nama file, ukuran, dan tombol hapus tRPC.

### 4. Form Terkait (`report-form.tsx`, `deposit-form.tsx`, `withdraw-form.tsx`)
- Integrasikan komponen uploader yang telah diperbarui.
- Pastikan validasi Zod form dan siklus upload atomic ke Cloudinary tetap berjalan 100% tanpa regresi.

---

## 🧪 4. Kriteria Keberhasilan & Verifikasi

- [x] Dropzone responsif dapat menerima berkas melalui klik dan drag-and-drop.
- [x] Mengetuk area dropzone di smartphone memunculkan native action sheet: Kamera (ambil foto langsung), Galeri foto, dan Berkas.
- [x] Berkas yang dipilih muncul dalam bentuk **Attachment Card / Chip** yang memiliki thumbnail, nama file, ukuran file, dan bar progress saat diunggah.
- [x] Tombol hapus dan tombol zoom memiliki touch target minimum **44×44px** di mobile (`min-h-11 min-w-11`).
- [x] Lightbox preview terbuka saat ikon zoom ditekan.
- [x] Alur upload ke Cloudinary dan pembersihan asset berjalan mulus.
- [x] `pnpm typecheck` dan `pnpm biome check` lulus 100% (0 error, 0 warning).
