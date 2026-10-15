# 🔍 Fase 7: Dynamic Filter Query Builder (`@reui/filters`)

> **File:** `docs/plans/07-dynamic-filter-query-builder.md`  
> **Status:** ⚪ Menunggu Fase 6  
> **Dependensi:** Fase 1 (`01-registry-and-primitives.md`), Fase 6 (`06-advanced-data-grid.md`)  
> **Target File:**
> - [`src/components/ui/filters.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/filters.tsx) (Komponen Primitif Filter Bar Baru)
> - Halaman Konsumen:
>   - [`src/app/(internal)/projects/[slug]/reports/reports-client.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/app/(internal)/projects/[slug]/reports/reports-client.tsx)
>   - [`src/app/(internal)/projects/[slug]/logistics/logistic-client.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/app/(internal)/projects/[slug]/logistics/logistic-client.tsx)
>   - [`src/app/(internal)/projects/[slug]/emergency/emergency-client.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/app/(internal)/projects/[slug]/emergency/emergency-client.tsx)

---

## 🎯 1. Sasaran & Masalah yang Diselesaikan

1. **Mengganti Dropdown Statis yang Kaku**: Saat ini filter di halaman laporan, logistik, dan kas darurat terdiri dari beberapa `<Select>` berjajar yang memakan banyak ruang layar dan kaku di HP.
2. **Filter Berbasis Active Tag Pills (Notion/Linear Style)**: Filter aktif tampil sebagai chip/pill yang memiliki tombol dismiss individu (`✕`) dan tombol global "Reset Filter".
3. **Ergonomi Filter di Smartphone**: Pada layar kecil, menu pemilihan filter terbuka dalam modal/drawer yang nyaman disentuh (`min-h-11`).
4. **Sinkronisasi Parameter URL**: Filter aktif disinkronkan ke URL search params sehingga filter dapat dibagikan atau dibookmark.

---

## 🏷️ 2. Tampilan & Alur Interaksi

```
[ + Tambah Filter ]  [ Status: Unreviewed ✕ ]  [ Cuaca: Hujan ✕ ]  [ Reset Filter ]
```

### 2.1 Alur Penggunaan
1. Pengguna mengklik tombol **"+ Tambah Filter"**.
2. Muncul popover / mobile drawer berisi daftar atribut yang dapat difilter (misalnya: _Status_, _Cuaca_, _Tanggal_, _Kategori_).
3. Setelah atribut dan nilainya dipilih, chip filter langsung ditambahkan ke deretan tag aktif.
4. Menekan tanda `✕` pada chip akan menghapus filter spesifik tersebut.
5. Tombol **"Reset Filter"** muncul secara dinamis hanya saat ada setidaknya satu filter aktif.

---

## 🧩 3. Arsitektur Komponen (`filters.tsx`)

```tsx
export interface FilterItem {
  id: string;
  field: string;
  label: string;
  operator: "eq" | "contains" | "gte" | "lte";
  value: string | number;
  displayValue: string;
}

interface FilterBarProps {
  fields: Array<{
    id: string;
    label: string;
    options?: Array<{ label: string; value: string }>;
    type: "select" | "date-range" | "text";
  }>;
  activeFilters: FilterItem[];
  onAddFilter: (filter: FilterItem) => void;
  onRemoveFilter: (filterId: string) => void;
  onResetFilters: () => void;
}
```

### Tag Pill Styling:
```tsx
<div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
  <span className="text-muted-foreground">{filter.label}:</span>
  <span className="font-semibold">{filter.displayValue}</span>
  <button
    type="button"
    onClick={() => onRemoveFilter(filter.id)}
    className="ml-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20"
    aria-label={`Hapus filter ${filter.label}`}
  >
    <IconX className="h-3 w-3" />
  </button>
</div>
```

---

## 📋 4. Prioritas Implementasi per Modul

### 1. Modul Laporan (`reports-client.tsx`)
- Atribut filter:
  - **Cuaca**: Cerah, Mendung, Hujan, Hujan Deras
  - **Rentang Tanggal**: Hari Ini, 7 Hari Terakhir, Bulan Ini
  - **Komentar**: Ada Diskusi / Belum Ada Diskusi

### 2. Modul Kas Darurat (`emergency-client.tsx`)
- Atribut filter:
  - **Tipe Transaksi**: Dana Masuk (Deposit) / Dana Keluar (Withdraw)
  - **Status Review**: Pending, Approved, Rejected
  - **Nominal**: Di atas Rp 1.000.000 / Di bawah Rp 1.000.000

### 3. Modul Logistik (`logistic-client.tsx`)
- Atribut filter:
  - **Status Stok**: Menipis (< minimum), Aman, Habis
  - **Kategori**: Material Kasar, Peralatan, Sanitari, Cat

---

## 🧪 5. Kriteria Keberhasilan & Verifikasi

- [ ] Pengguna dapat menambah, menggabungkan, dan menghapus filter atribut secara dinamis.
- [ ] Tombol "Reset Filter" mengembalikan daftar ke kondisi default tanpa filter dalam satu klik.
- [ ] Tag pills membungkus baris secara rapi (`flex-wrap`) tanpa menyebabkan horizontal overflow di mobile.
- [ ] Filter yang aktif menyaring data TanStack Query / tRPC secara akurat.
- [ ] `pnpm typecheck` dan `pnpm biome check` lulus 100%.
