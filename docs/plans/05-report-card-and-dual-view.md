# 🔀 Fase 5: Pemolesan ReportCard & Dual-View Grid/List (`@reui/item`)

> **File:** `docs/plans/05-report-card-and-dual-view.md`  
> **Status:** 🟢 Selesai (Completed)  
> **Dependensi:** Fase 1 (`01-registry-and-primitives.md`)  
> **Target File:**
> - [`src/components/report/types.ts`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/report/types.ts) (File Baru: Definisi Type Bersama)
> - [`src/components/report/report-card.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/report/report-card.tsx) (Pembersihan Dead Code & Penambahan Badge Foto)
> - [`src/components/report/report-list-item.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/report/report-list-item.tsx) (File Baru: Baris List Mode)
> - [`src/components/report/report-list.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/report/report-list.tsx) (Dukungan Switcher Tampilan Grid / List)
> - [`src/app/(internal)/projects/[slug]/reports/reports-client.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/app/(internal)/projects/[slug]/reports/reports-client.tsx) (Toolbar Toggle & LocalStorage Sync)

---

## 🎯 1. Sasaran & Masalah yang Diselesaikan

1. **Mempertahankan Layered Cover Card yang Berkarakter**: Desain cover 16:9 dengan floating info card terbukti sangat premium untuk konstruksi, namun butuh pembersihan 58 baris dead code lama.
2. **Indikator Dokumentasi Foto yang Jelas**: Menambahkan badge glassmorphism jumlah foto (`📸 N Foto`) di pojok kiri atas cover, seimbang dengan badge cuaca di kanan atas.
3. **Mengatasi Scroll Fatigue dengan Dual-View Mode**: Pengguna dapat beralih antara **Grid View** (kartu visual kaya gambar) dan **List View** (tampilan baris rapat untuk scanning cepat data puluhan laporan).
4. **Persistensi Preferensi Pengguna**: Pilihan mode tampilan tersimpan di `localStorage` per peramban (`sandaran_reports_view_mode`).

---

## 📸 2. Ketentuan Photo Count Badge Overlay

Diletakkan di dalam media cover `src/components/report/report-card.tsx`:
- **Posisi**: `absolute top-3 left-3 z-10`
- **Kondisi & Format**:
  - `report.media.length > 1`: Menampilkan `📸 {report.media.length} Foto`
  - `report.media.length === 1`: Menampilkan `📸 1 Foto`
  - `report.media.length === 0`: Tidak menampilkan badge (hanya placeholder visual kosong)
- **Styling**:
  ```tsx
  className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md transition-transform group-hover:scale-105"
  ```

---

## 🗂️ 3. Arsitektur Komponen List Mode (`report-list-item.tsx`)

Dibangun menggunakan primitif [`src/components/ui/item.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/item.tsx):

```tsx
<Item
  asChild
  variant="outline"
  className="p-3 transition-colors hover:bg-muted/60 active:scale-[0.99]"
>
  <Link href={`/projects/${projectSlug}/reports/${report.slug}`}>
    {/* Leading: Thumbnail mini + Avatar */}
    <ItemMedia className="gap-3">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted/30">
        {report.media[0] ? (
          <Image src={report.media[0].url} alt="" fill className="object-cover" />
        ) : (
          <IconPhoto className="m-auto h-6 w-6 text-muted-foreground/40" />
        )}
        {report.media.length > 1 && (
          <span className="absolute bottom-0.5 right-0.5 rounded-sm bg-black/70 px-1 text-[9px] font-semibold text-white">
            +{report.media.length - 1}
          </span>
        )}
      </div>
      <Avatar className="h-7 w-7 border">
        <AvatarImage src={report.user.image ?? undefined} />
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>
    </ItemMedia>

    {/* Content: Info & Deskripsi Laporan */}
    <ItemContent className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-foreground">{report.user.name}</span>
        <span className="text-xs text-muted-foreground">• {format(reportDate, "dd MMM yyyy")}</span>
        {report.weather && (
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px] py-0 px-1.5 gap-1">
            {getWeatherIcon(report.weather)}
            {report.weather}
          </Badge>
        )}
      </div>
      <p className="line-clamp-1 sm:line-clamp-2 text-xs text-muted-foreground mt-0.5">
        {report.taskDescription || "Belum ada deskripsi."}
      </p>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
        <span>{report.totalWorkers} pekerja</span>
        <span>•</span>
        <span>💬 {report._count?.comments ?? 0}</span>
      </div>
    </ItemContent>

    {/* Trailing: Progress Pill & Chevron */}
    <ItemActions className="gap-3 shrink-0">
      <Badge className={cn("text-xs font-semibold px-2 py-0.5", getProgressColor(report.progressPercent))}>
        {report.progressPercent}%
      </Badge>
      <IconChevronRight className="h-5 w-5 text-muted-foreground" />
    </ItemActions>
  </Link>
</Item>
```

---

## 🎛️ 4. Kontrol Toolbar & Persistensi View Mode

Di dalam [`reports-client.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/app/(internal)/projects/[slug]/reports/reports-client.tsx):

```tsx
const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("sandaran_reports_view_mode");
    if (saved === "grid" || saved === "list") return saved;
  }
  return "grid";
});

const handleViewModeChange = (mode: "grid" | "list") => {
  setViewMode(mode);
  localStorage.setItem("sandaran_reports_view_mode", mode);
};
```

Toolbar menampilkan switcher:
```tsx
<ToggleGroup
  type="single"
  value={viewMode}
  onValueChange={(val) => val && handleViewModeChange(val as "grid" | "list")}
  className="border rounded-lg p-0.5"
>
  <ToggleGroupItem value="grid" aria-label="Grid View" className="h-8 w-8 p-0">
    <IconLayoutGrid className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="list" aria-label="List View" className="h-8 w-8 p-0">
    <IconList className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>
```

---

## 🧪 5. Kriteria Keberhasilan & Verifikasi

- [x] Seluruh blok dead code yang di-comment out (baris 70–128) di `report-card.tsx` telah dihapus.
- [x] Badge `📸 N Foto` muncul di pojok kiri atas foto cover jika laporan memiliki foto dokumentasi.
- [x] Toggle mode Grid/List berfungsi seketika tanpa reload halaman.
- [x] Preferensi view mode tersimpan di `localStorage` dan tetap aktif setelah browser di-refresh.
- [x] Mode list (`report-list-item.tsx`) memiliki touch target minimal 44px dan mudah di-tap di mobile.
- [x] `pnpm typecheck` dan `pnpm biome check` lulus 100%.
