# 📊 Fase 6: Advanced Data Grid & Column Pinning (`@reui/data-grid`)

> **File:** `docs/plans/06-advanced-data-grid.md`  
> **Status:** 🟢 Selesai (Completed)  
> **Dependensi:** Fase 1 (`01-registry-and-primitives.md`)  
> **Target File:**
> - [`src/components/ui/data-grid.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/data-grid.tsx) (Komponen Baru / Ekstensi [`src/components/ui/data-table.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/data-table.tsx))
> - Tabel Konsumen:
>   - [`src/components/emergency/transaction-list.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/emergency/transaction-list.tsx)
>   - [`src/components/logistic/item-list.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/logistic/item-list.tsx)
>   - [`src/components/user/users-table.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/user/users-table.tsx) & [`src/app/(internal)/users/users-client.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/app/%28internal%29/users/users-client.tsx)
>   - [`src/components/document/document-list.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/document/document-list.tsx)

---

## 🎯 1. Sasaran & Masalah yang Diselesaikan

1. **Aksi Terpotong di Layar Kecil**: Pada smartphone dan tablet, tabel transaksi kas darurat dan logistik memiliki banyak kolom, sehingga kolom "Aksi" berada di ujung kanan yang tersembunyi dan mengharuskan scroll horizontal panjang.
2. **Column Pinning (Sticky Columns)**: Mengunci kolom identitas utama di sisi kiri dan kolom aksi di sisi kanan (_sticky_), sehingga pengguna mobile tetap bisa mengenali baris dan menekan tombol aksi saat tabel digeser ke kiri/kanan.
3. **Density Switcher**: Memberi pilihan mode tampilan rapat (_Compact_) untuk audit angka oleh Finance/Logistik, atau mode santai (_Normal_).
4. **Export CSV/Excel Cepat**: Fitur ekspor data terfilter langsung dari grid tanpa reload.

---

## 📌 2. Arsitektur Column Pinning & Styling

```
+------------------------------------------------------------------------+
| [PIN KIRI: Deskripsi/Item] | Kategori | Jumlah | Tanggal | [PIN KANAN: Aksi] |
| (Sticky Left)              | (Scroll) | (Scroll)| (Scroll)| (Sticky Right)   |
+------------------------------------------------------------------------+
```

### 2.1 Konfigurasi TanStack Table Pinning
Mengaktifkan fitur pinning bawaan TanStack Table v8:

```tsx
const table = useReactTable({
  data,
  columns,
  state: {
    columnPinning: {
      left: ["title", "itemCode", "description"],
      right: ["actions", "status"],
    },
    // ...
  },
  enableColumnPinning: true,
  // ...
});
```

### 2.2 Sticky Styling dengan Shadow Indikator
Pada sel tabel header dan body yang di-pin:

```tsx
const isPinnedLeft = column.getIsPinned() === "left";
const isPinnedRight = column.getIsPinned() === "right";

className={cn(
  isPinnedLeft && "sticky left-0 z-20 bg-background/95 backdrop-blur shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
  isPinnedRight && "sticky right-0 z-20 bg-background/95 backdrop-blur shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]",
)}
```

---

## 🎚️ 3. Fitur Tambahan Data Grid

### 3.1 Density Toggle
Pilihan kerapatan baris tabel melalui tombol di toolbar:
- **Compact**: `py-1.5 px-2.5 text-xs` (menghemat ruang vertikal hingga 40% untuk audit data besar).
- **Normal**: `py-3 px-4 text-sm` (tampilan standar yang nyaman dibaca).

### 3.2 Quick Search & Column Visibility
- Input pencarian real-time dengan tombol reset cepat.
- Dropdown menu untuk menyembunyikan/menampilkan kolom tertentu dan melakukan pin/unpin kolom sesuai preferensi pengguna.

### 3.3 Export Action
- Tombol "Ekspor CSV" (`IconDownload`) yang mengonversi data baris aktif menjadi file `.csv` lengkap dengan UTF-8 BOM.

---

## 📋 4. Prioritas Implementasi pada Tabel

1. **Prioritas 1: `transaction-list.tsx` (Kas Darurat)**:
   - Kolom "Deskripsi Transaksi" di-pin di kiri.
   - Kolom "Aksi" di-pin di kanan.
2. **Prioritas 2: `item-list.tsx` (Logistik)**:
   - Kolom "Nama Barang" di-pin di kiri.
   - Kolom "Aksi" di-pin di kanan.
3. **Prioritas 3: `users-table.tsx` (`users-client.tsx`) & `document-list.tsx`**:
   - Terapkan konfigurasi serupa untuk standarisasi antar modul.

---

## 🧪 5. Kriteria Keberhasilan & Verifikasi

- [x] Saat tabel digeser horizontal di layar HP, kolom paling kiri dan kolom aksi paling kanan tetap terlihat di tempatnya.
- [x] Tombol density switcher mengubah tinggi baris tabel dengan mulus.
- [x] Ekspor CSV menghasilkan data yang sesuai dengan filter pencarian yang sedang aktif.
- [x] Tidak ada horizontal scrollbar liar di level halaman (`body`).
- [x] `pnpm typecheck` dan `pnpm biome check` lulus 100%.
