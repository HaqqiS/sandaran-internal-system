# 📦 Fase 1: Setup reUI Registry & Primitives Fondasi

> **File:** `docs/plans/01-registry-and-primitives.md`  
> **Status:** 🟢 Selesai (Completed)  
> **Dependensi:** Tidak ada (Langkah Awal)  
> **Target File:**
> - [`components.json`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/components.json)
> - [`src/components/ui/stepper.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/stepper.tsx)
> - [`src/components/ui/item.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/item.tsx)
> - [`src/components/ui/bubble.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/bubble.tsx)
> - [`src/components/ui/message.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/message.tsx)

---

## 🎯 1. Sasaran & Ruang Lingkup

1. Mendaftarkan registry `@reui` di dalam [`components.json`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/components.json) agar kompatibel dengan shadcn CLI.
2. Memperbaiki dan menormalkan komponen primitif reUI yang telah dimasukkan ke dalam `src/components/ui/` agar 100% mematuhi aturan linting Biome (exhaustive-deps) dan TypeScript strict mode.
3. Memastikan fondasi primitif (`stepper`, `item`, `bubble`, `message`) siap digunakan oleh fase-fase berikutnya tanpa error tersembunyi.

---

## 🛠️ 2. Langkah-Langkah Teknis

### Langkah 1: Registrasi reUI pada `components.json`
Perbarui blok `registries` pada [`components.json`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/components.json):

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "tabler",
  "rtl": false,
  "aliases": {
    "components": "~/components",
    "utils": "~/lib/utils",
    "ui": "~/components/ui",
    "lib": "~/lib",
    "hooks": "~/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {
    "@reui": "https://reui.io/r/{style}/{name}.json"
  }
}
```

---

### Langkah 2: Perbaikan Linter Biome pada `src/components/ui/stepper.tsx`
Komponen `stepper.tsx` yang baru ditambahkan memiliki isu dependensi pada `useMemo` dan `useEffect` yang terdeteksi oleh Biome:
- Masalah: Hook `useMemo` pada line 129 belum memasukkan `focusPrev`, `focusLast`, `indicators` ke dependency array.
- Masalah: Hook `useEffect` pada line 252 memasukkan `btnRef.current` ke dependency array alih-alih `registerTrigger`.
- Masalah: Hook `useMemo` pada line 259 memasukkan `btnRef.current` yang tidak stabil.

**Hasil Perbaikan:**
1. Sesuaikan dependency array pada `contextValue` di `StepperProvider` dengan menyertakan `[currentStep, handleSetActiveStep, children, orientation, registerTrigger, focusNext, focusPrev, focusFirst, focusLast, triggerNodes, indicators]`.
2. Gunakan callback ref pattern untuk tombol `registerTrigger` pada `StepperTrigger` dan dynamic node lookup di dalam `handleKeyDown`.
3. Bersihkan non-null assertions dan unused imports.
4. Lolos uji Biome 100%.

---

### Langkah 3: Audit Komponen Primitif Lainnya
Lakukan validasi struktur dan styling pada:
- [`src/components/ui/item.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/item.tsx):
  - Normalisasi atribut role pada `ItemGroup` untuk a11y compliance.
- [`src/components/ui/message.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/message.tsx) & [`src/components/ui/bubble.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/bubble.tsx):
  - Varian `default` (primary) dan `muted` memiliki kontras WCAG AA.

---

## 🧪 3. Kriteria Keberhasilan & Verifikasi

- [x] `components.json` memiliki `"@reui": "https://reui.io/r/{style}/{name}.json"`.
- [x] `pnpm biome check src/components/ui/` keluar dengan status **0 errors, 0 warnings** (38 file bersih).
- [x] `pnpm typecheck` lulus 100%.
- [x] Seluruh komponen primitif dapat di-import tanpa runtime error di komponen Next.js client.
