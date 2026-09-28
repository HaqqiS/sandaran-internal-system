# Plan: Mobile Bottom Navigation Refactor

> **Status:** Implemented (2026-09-25)
> **Dibuat:** 2026-09-25
> **Revisi:** 2026-09-25 (v2 — rombak total struktur tab)
> **Terkait Issue:** `docs/known-issues.md` §2 — Sheet Form keyboard glitch on mobile

---

## 1. Latar Belakang & Motivasi

### Masalah yang Diselesaikan

| Masalah | Root Cause | Solusi |
|---|---|---|
| `ProjectSelector` glitch saat keyboard virtual muncul | `Popover` + `CommandInput` nested di dalam Mobile Sidebar `Sheet` | Ganti jadi dedicated Vaul `Drawer` (Tab 3 "Pilih Proyek") |
| Mobile UX tidak native-feel | Sheet Sidebar dari kiri tidak sesuai pola mobile native | Bottom tab bar — pola standar iOS/Android |
| Sidebar terlalu "dalam" di mobile | Hamburger trigger → Sheet → multiple tap untuk navigasi | Akses langsung dari bottom nav, 1 tap |

### Scope Perubahan

- Mobile only (< 768px / breakpoint `md`)
- Desktop Sidebar: tidak berubah sama sekali
- Semua logika bisnis, tRPC, auth: tidak berubah
- `ProjectSelector` di desktop Sidebar: tetap pakai Popover
- **SidebarTrigger di header tetap ada** — hanya disembunyikan di mobile (`hidden md:flex`)

---

## 2. Arsitektur Akhir

```
Mobile Layout (< md)
+----------------------------------+
| SiteHeader                       |  h-(--header-height)
| [Breadcrumb] [header actions]    |  <- SidebarTrigger HIDDEN di mobile
+----------------------------------+
|                                  |
|   Page Content                   |
|   (pb-16 agar tidak tertutup     |
|    bottom nav)                   |
|                                  |
+----------------------------------+
| MobileBottomNav (position:fixed) |  h-16 + pb-safe
| [1]  [2]  [3]  [4]  [5]         |
+----------------------------------+

Desktop Layout (>= md) — tidak berubah
+-----------------+--------------------+
|   AppSidebar    |   SiteHeader       |
|                 +--------------------+
|  - NavMain      |   Page Content     |
|  - NavUser      |                    |
+-----------------+--------------------+
```

---

## 3. Struktur Bottom Nav (5 Tab — 1 Set Global)

> Tidak ada lagi perbedaan "global context" vs "project context". Satu set tab yang sama untuk semua halaman.

### 3.1 Layout Tab

| Posisi | Label | Icon | Behavior |
|---|---|---|---|
| Tab 1 | Laporan | `IconNews` | Link ke `/projects/[slug]/reports` — disabled jika belum pilih proyek |
| Tab 2 | Dana Darurat | `IconCoin` | Link ke `/projects/[slug]/emergency` — disabled jika belum pilih proyek |
| Tab 3 | Pilih Proyek | `IconLayoutGrid` | Buka `ProjectSwitcherDrawer` — **selalu aktif** |
| Tab 4 | Logistik | `IconPackage` | Link ke `/projects/[slug]/logistics` — disabled jika belum pilih proyek |
| Tab 5 | Dokumen | `IconFileText` | Link ke `/projects/[slug]/documents` — disabled jika belum pilih proyek |

### 3.2 Aturan Disabled State

- **Tab 1, 2, 4, 5**: disabled (greyed-out, `pointer-events-none`) **jika belum ada `selectedProjectSlug`**
- **Tab 3**: selalu bisa diklik (tidak pernah disabled)
- Setelah proyek dipilih via Tab 3 → semua tab jadi aktif, href terbentuk dari slug

### 3.3 Permission — Akses URL

Semua tab **bisa diklik** tanpa pengecekan role di UI. Server (tRPC + middleware) yang akan menolak akses jika user tidak punya permission — user akan di-redirect ke halaman error/forbidden.

> Catatan: ADMIN dan CEO punya akses ke semua tab. Semua ProjectRole (MANDOR, ARCHITECT, FINANCE) bisa mengakses semua URL; server enforce role-based restriction sesuai `docs/permission-flows.md`.

### 3.4 Active State Logic

```
isActive = selectedProjectSlug !== null &&
           (pathname === tab.href || pathname.startsWith(tab.href + "/"))
Tab 3 (ProjectSwitcher) = tidak pernah isActive (action tab)
```

### 3.5 Visual: Pilih Proyek Button (Tab 3)

Tab 3 didesain lebih menonjol dari tab lain — sebagai "anchor" navigasi:
- Ukuran icon lebih besar (`size={24}` vs `size={20}`)
- Background highlight: `bg-primary/10 rounded-xl`
- Label dengan warna `text-primary` (selalu, bukan hanya saat active)
- Tidak punya active indicator dot (karena bukan link)

---

## 4. State Management — Selected Project

### 4.1 Zustand Store (`src/stores/project-store.ts`)

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProjectState {
  selectedProjectSlug: string | null;
  selectedProjectName: string | null;
  setSelectedProject: (slug: string, name: string) => void;
  clearSelectedProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      selectedProjectSlug: null,
      selectedProjectName: null,
      setSelectedProject: (slug, name) =>
        set({ selectedProjectSlug: slug, selectedProjectName: name }),
      clearSelectedProject: () =>
        set({ selectedProjectSlug: null, selectedProjectName: null }),
    }),
    {
      name: "selected-project", // key di localStorage
      partialize: (state) => ({
        selectedProjectSlug: state.selectedProjectSlug,
        selectedProjectName: state.selectedProjectName,
      }),
    },
  ),
);
```

> **Mengapa Zustand + persist?**
> - Konsisten dengan rules project (Zustand untuk local UI state)
> - `persist` middleware otomatis handle localStorage + SSR-safe (tidak throw error di server)
> - State reaktif — semua subscriber langsung update tanpa manual sync

### 4.2 Sync dengan URL

Saat user menavigasi langsung ke `/projects/[slug]/...` (deep link / page refresh):
- `MobileBottomNav` membaca `params.slug` dari URL
- Jika `params.slug` ada dan berbeda dari `selectedProjectSlug` di store → update store via `useEffect`

```tsx
// Di MobileBottomNav
const params = useParams<{ slug?: string }>();
const { selectedProjectSlug, setSelectedProject } = useProjectStore();
const { data: projectFromUrl } = api.project.getBySlug.useQuery(
  { slug: urlSlug! },
  { enabled: !!urlSlug && urlSlug !== selectedProjectSlug },
);

useEffect(() => {
  if (projectFromUrl && urlSlug !== selectedProjectSlug) {
    setSelectedProject(projectFromUrl.slug, projectFromUrl.name);
  }
}, [projectFromUrl, urlSlug, selectedProjectSlug, setSelectedProject]);
```

---

## 5. File Baru yang Dibuat

### 5.1 `src/stores/project-store.ts`

Zustand store untuk `selectedProjectSlug` dan `selectedProjectName`. Lihat §4.1.

---

### 5.2 `src/components/navigation/project-switcher-drawer.tsx`

Menggantikan peran mobile `ProjectSelector`. Vaul Drawer dari bawah berisi daftar proyek dan input search.

**Interface:**

```tsx
interface ProjectSwitcherDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Dependencies:**
- `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle` dari `~/components/ui/drawer`
- `Avatar`, `AvatarFallback` dari `~/components/ui/avatar`
- `Input` dari `~/components/ui/input`
- `IconCheck` dari `@tabler/icons-react`
- `api` dari `~/trpc/react` (tRPC query `project.list`)
- `useRouter` dari `next/navigation`
- `useProjectStore` dari `~/stores/project-store`
- `useState` dari `react`
- `cn` dari `~/lib/utils`

**Pseudo-code struktur JSX:**

```tsx
<Drawer open={open} onOpenChange={onOpenChange}>
  <DrawerContent className="h-[80dvh] flex flex-col">
    <DrawerHeader className="text-left shrink-0 border-b pb-3 px-6 pt-4">
      <DrawerTitle>Pilih Proyek</DrawerTitle>
      {selectedProjectName && (
        <p className="text-xs text-muted-foreground mt-1">
          Aktif: {selectedProjectName}
        </p>
      )}
    </DrawerHeader>

    {/* Search — keyboard-safe karena Drawer adalah top-level */}
    <div className="px-4 pt-3 pb-2 shrink-0">
      <Input
        placeholder="Cari proyek..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus={false}
      />
    </div>

    {/* List — flex-1, scrollable */}
    <div className="flex-1 overflow-y-auto px-2 pb-safe" data-lenis-prevent>
      {isLoading ? <SkeletonList /> : (
        filteredProjects.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Proyek tidak ditemukan
          </p>
        ) : (
          Object.entries(groupedByStatus).map(([status, items]) => (
            <div key={status}>
              <p className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">
                {STATUS_LABELS[status] ?? status}
              </p>
              {items.map(project => (
                <button
                  key={project.id}
                  onClick={() => handleSelect(project)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left",
                    "active:scale-[0.98] transition-transform hover:bg-accent",
                    selectedProjectSlug === project.slug && "bg-primary/10 text-primary",
                  )}
                >
                  <Avatar className="h-8 w-8 rounded-lg shrink-0">
                    <AvatarFallback className="rounded-lg text-xs font-semibold">
                      {getInitials(project.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate font-medium text-sm">{project.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {project.location ?? "Lokasi tidak tersedia"}
                    </span>
                  </div>
                  {selectedProjectSlug === project.slug && (
                    <IconCheck className="ml-auto size-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          ))
        )
      )}
    </div>
  </DrawerContent>
</Drawer>
```

**Logika utama:**

```tsx
const { selectedProjectSlug, selectedProjectName, setSelectedProject } = useProjectStore();
const router = useRouter();

// handleSelect → update store + navigate + close drawer
const handleSelect = (project: Project) => {
  setSelectedProject(project.slug, project.name);
  onOpenChange(false);
  router.push(`/projects/${project.slug}`); // project overview/detail
};

// filteredProjects
const filteredProjects = projects?.filter(p =>
  p.name.toLowerCase().includes(search.toLowerCase()) ||
  (p.location?.toLowerCase().includes(search.toLowerCase()) ?? false)
) ?? [];

// Group by status
const groupedByStatus = filteredProjects.reduce<Record<string, Project[]>>((acc, p) => {
  const key = p.status ?? "UNKNOWN";
  (acc[key] ??= []).push(p);
  return acc;
}, {});

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Aktif",
  DONE: "Selesai",
  PAUSED: "Dijeda",
};
```

---

### 5.3 `src/components/navigation/mobile-bottom-nav.tsx`

Komponen utama bottom navigation. Fixed di bawah layar, hanya mobile, 5 tab tetap (tidak berganti per context). **Tidak menerima props** — semua state dari Zustand store dan hooks internal.

**Type NavTab:**

```tsx
type NavTab = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string;       // undefined = action tab (bukan link)
  action?: () => void; // untuk tab ProjectSwitcher
  isAnchor?: boolean;  // true untuk Tab 3 — styling berbeda
};
```

**Dependencies:**
- `useIsMobile` dari `~/hooks/use-mobile`
- `usePathname`, `useParams` dari `next/navigation`
- `useState`, `useEffect` dari `react`
- `Link` dari `next/link`
- `cn` dari `~/lib/utils`
- `useProjectStore` dari `~/stores/project-store`
- `api` dari `~/trpc/react`
- `ProjectSwitcherDrawer` dari `./project-switcher-drawer`
- Icons: `IconNews`, `IconCoin`, `IconLayoutGrid`, `IconPackage`, `IconFileText`

**Logika membangun tabs array:**

```tsx
const { selectedProjectSlug, setSelectedProject } = useProjectStore();
const params = useParams<{ slug?: string }>();
const pathname = usePathname();
const [switcherOpen, setSwitcherOpen] = useState(false);
const urlSlug = params.slug;

// Sync store dengan URL params (untuk deep link / page refresh)
const { data: projectFromUrl } = api.project.getBySlug.useQuery(
  { slug: urlSlug! },
  { enabled: !!urlSlug && urlSlug !== selectedProjectSlug },
);
useEffect(() => {
  if (projectFromUrl && urlSlug !== selectedProjectSlug) {
    setSelectedProject(projectFromUrl.slug, projectFromUrl.name);
  }
}, [projectFromUrl, urlSlug, selectedProjectSlug, setSelectedProject]);

const slug = selectedProjectSlug;
const hasProject = !!slug;

const tabs: NavTab[] = [
  {
    id: "reports",
    label: "Laporan",
    icon: IconNews,
    href: hasProject ? `/projects/${slug}/reports` : undefined,
  },
  {
    id: "emergency",
    label: "Dana Darurat",
    icon: IconCoin,
    href: hasProject ? `/projects/${slug}/emergency` : undefined,
  },
  {
    id: "switcher",
    label: "Pilih Proyek",
    icon: IconLayoutGrid,
    action: () => setSwitcherOpen(true),
    isAnchor: true,
  },
  {
    id: "logistics",
    label: "Logistik",
    icon: IconPackage,
    href: hasProject ? `/projects/${slug}/logistics` : undefined,
  },
  {
    id: "documents",
    label: "Dokumen",
    icon: IconFileText,
    href: hasProject ? `/projects/${slug}/documents` : undefined,
  },
];
```

**Struktur JSX:**

```tsx
// SSR-safe: return null jika bukan mobile
if (!isMobile) return null;

return (
  <>
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-40 md:hidden",
      "bg-background/95 backdrop-blur-sm border-t border-border",
      "pb-safe",
    )}>
      <div className="flex items-stretch h-16">
        {tabs.map(tab => (
          <NavTabButton key={tab.id} tab={tab} pathname={pathname} hasProject={hasProject} />
        ))}
      </div>
    </nav>

    <ProjectSwitcherDrawer open={switcherOpen} onOpenChange={setSwitcherOpen} />
  </>
);
```

**Sub-component NavTabButton:**

```tsx
function NavTabButton({
  tab,
  pathname,
  hasProject,
}: {
  tab: NavTab;
  pathname: string;
  hasProject: boolean;
}) {
  const isDisabled = !tab.isAnchor && !hasProject;
  const isActive = !isDisabled && !!tab.href &&
    (pathname === tab.href || pathname.startsWith(tab.href + "/"));

  const inner = (
    <span className={cn(
      "relative flex flex-col items-center justify-center gap-0.5",
      "w-full h-full px-1 min-h-[48px]",
      "active:scale-95 transition-transform duration-75",
      tab.isAnchor
        ? "text-primary"
        : isActive
          ? "text-primary"
          : "text-muted-foreground",
      isDisabled && "opacity-30 pointer-events-none",
    )}>
      {/* Active indicator dot */}
      {isActive && (
        <span className="absolute top-1 w-1 h-1 rounded-full bg-primary" />
      )}

      {/* Tab 3 anchor styling */}
      {tab.isAnchor ? (
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <tab.icon size={24} />
        </span>
      ) : (
        <tab.icon size={20} />
      )}

      <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
    </span>
  );

  // Action tab (Tab 3 — ProjectSwitcher)
  if (tab.action) {
    return (
      <button
        onClick={tab.action}
        aria-label={tab.label}
        className="relative flex flex-1 items-center justify-center"
      >
        {inner}
      </button>
    );
  }

  // Disabled tab (belum pilih proyek)
  if (isDisabled) {
    return (
      <button
        disabled
        aria-label={`${tab.label} — pilih proyek terlebih dahulu`}
        className="relative flex flex-1 items-center justify-center"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={tab.href!}
      aria-label={tab.label}
      aria-current={isActive ? "page" : undefined}
      className="relative flex flex-1 items-center justify-center"
    >
      {inner}
    </Link>
  );
}
```

---

## 6. File yang Dimodifikasi

### 6.1 `src/components/layout/site-header.tsx`

```diff
- <SidebarTrigger className="-ml-1" />
+ <SidebarTrigger className="-ml-1 hidden md:flex" />

- <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-8" />
+ <Separator orientation="vertical" className="mx-2 hidden md:block data-[orientation=vertical]:h-8" />
```

### 6.2 `src/components/layout/dashboard-layout.tsx`

```diff
+ import { MobileBottomNav } from "~/components/navigation";

  // JSX changes:
- <div className="flex flex-1 flex-col">
+ <div className="flex flex-1 flex-col pb-16 md:pb-0">

  // Sebelum closing </SidebarProvider>:
+ <MobileBottomNav />
```

> `MobileBottomNav` tidak butuh props — semua state diambil dari Zustand store dan hooks internal.

### 6.3 `src/components/navigation/project-selector.tsx`

```diff
  return (
+   <div className="hidden md:block">
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        ...
      </Popover>
+   </div>
  );
```

### 6.4 `src/components/navigation/index.ts`

```diff
  export { NavDocuments } from "./nav-documents";
  export { NavMain } from "./nav-main";
  export { NavSecondary } from "./nav-secondary";
  export { NavUser } from "./nav-user";
+ export { MobileBottomNav } from "./mobile-bottom-nav";
+ export { ProjectSwitcherDrawer } from "./project-switcher-drawer";
```

### 6.5 `docs/known-issues.md` (setelah implementasi verified)

```diff
- - **Sheet Form**: Mengalami glitch pada tampilan mobile ketika keyboard virtual muncul.
+ - **Sheet Form**: ~~Mengalami glitch pada tampilan mobile ketika keyboard virtual muncul.~~
+   **[RESOLVED 2026-09-xx]** Digantikan dengan bottom nav + `ProjectSwitcherDrawer` (Vaul).
```

---

## 7. Urutan Eksekusi

```
Step 1  src/stores/project-store.ts         (BUAT BARU — foundation state)
Step 2  project-switcher-drawer.tsx         (BUAT BARU — paling independen)
Step 3  mobile-bottom-nav.tsx               (BUAT BARU — import dari Step 1 & 2)
Step 4  navigation/index.ts                 (MODIFIKASI — 2 baris export baru)
Step 5  project-selector.tsx                (MODIFIKASI — bungkus hidden md:block)
Step 6  site-header.tsx                     (MODIFIKASI — 2 baris hidden md:*)
Step 7  dashboard-layout.tsx                (MODIFIKASI — mount nav + pb-16)
Step 8  Test & Verifikasi
Step 9  known-issues.md                     (UPDATE setelah verified)
```

---

## 8. Edge Cases & Handling

| Case | Handling |
|---|---|
| SSR / Hydration mismatch | `useIsMobile()` return `false` di server; `MobileBottomNav` render `null`; mount di client setelah hydration |
| Zustand persist SSR | `zustand/middleware/persist` sudah SSR-safe — tidak throw di server, hydrate di client |
| User belum pilih proyek | Tab 1,2,4,5 disabled + `opacity-30`. Tab 3 selalu aktif |
| Deep link / page refresh ke `/projects/[slug]/...` | `useEffect` di `MobileBottomNav` auto-sync store dari URL params via `getBySlug` query |
| User navigasi manual ke URL proyek lain | Sync otomatis via `useEffect` + `api.project.getBySlug` |
| Proyek yang dipilih dihapus | Store tetap simpan slug lama → query 404 → clear store via `onError` callback |
| iPhone home bar (safe area) | `pb-safe` = `env(safe-area-inset-bottom)` via Tailwind safe-area plugin |
| Landscape orientation | Nav tetap h-16, label terbaca. Dapat disempurnakan nanti |
| `ProjectSwitcherDrawer` + keyboard | Aman — Drawer adalah top-level overlay, tidak nested di Sheet |
| Resize browser mobile ↔ desktop | `useIsMobile()` reactive via `matchMedia`, nav mount/unmount otomatis |
| Halaman Login / non-internal | Tidak ada `DashboardLayout` → `MobileBottomNav` tidak dirender |
| Permission denied setelah klik tab | Server reject → redirect ke halaman error/forbidden (backend enforce, bukan UI) |

---

## 9. Testing Checklist

### Fungsional
- [ ] Semua 4 tab (1,2,4,5) disabled sebelum pilih proyek (`opacity-30`)
- [ ] Tab 3 "Pilih Proyek" selalu bisa diklik
- [ ] Tap Tab 3 → `ProjectSwitcherDrawer` terbuka
- [ ] Pilih proyek → drawer tutup → navigasi ke `/projects/[slug]`
- [ ] Setelah pilih proyek → Tab 1,2,4,5 aktif dengan href yang benar
- [ ] Tab 1 → `/projects/[slug]/reports`
- [ ] Tab 2 → `/projects/[slug]/emergency`
- [ ] Tab 4 → `/projects/[slug]/logistics`
- [ ] Tab 5 → `/projects/[slug]/documents`
- [ ] Switcher: search berfungsi
- [ ] Switcher: keyboard virtual tidak glitch
- [ ] Active state tab sesuai URL pathname
- [ ] Deep link ke `/projects/[slug]/reports` → store sync → tab aktif benar
- [ ] Page refresh → store persist dari localStorage → tab masih aktif
- [ ] Pilih proyek berbeda → href semua tab update ke slug baru

### Visual & UX
- [ ] Konten tidak tertutup bottom nav (`pb-16` berjalan)
- [ ] `pb-safe` berjalan di iPhone
- [ ] Tab 3 styling lebih menonjol (`bg-primary/10` + icon size lebih besar)
- [ ] Tab disabled: `opacity-30` terlihat jelas berbeda dari tab aktif
- [ ] Touch feedback `active:scale-95` terasa di semua tab
- [ ] Label 10px terbaca, kontras cukup
- [ ] Desktop: bottom nav tidak tampil
- [ ] Desktop: SidebarTrigger masih berfungsi
- [ ] Desktop: ProjectSelector Popover di sidebar berfungsi

---

## 10. Rollback Plan

1. Revert `dashboard-layout.tsx` — hapus `<MobileBottomNav />` + `pb-16`
2. Revert `site-header.tsx` — hapus `hidden` pada SidebarTrigger
3. Revert `project-selector.tsx` — hapus wrapper `hidden md:block`
4. File baru (`mobile-bottom-nav.tsx`, `project-switcher-drawer.tsx`, `project-store.ts`) dibiarkan (tidak di-import = tidak berpengaruh)

**Total rollback: ~8 baris. Risiko sangat rendah.**

---

## 11. Pertanyaan Terbuka (TBD)

| # | Pertanyaan | Default jika tidak dijawab |
|---|---|---|
| Q1 | `autoFocus` di search Switcher Drawer — aktif atau tidak? | `autoFocus={false}` — user tap sendiri |
| Q2 | Proyek yang dihapus saat user masih pakai — clear store atau tetap? | Clear store via `onError` di `getBySlug` query |
| Q3 | Label "Dana Darurat" terlalu panjang untuk 10px? Alternatif: "Darurat" | Tetap "Dana Darurat", evaluasi saat testing |
| Q4 | Icon Tab 3 — `IconLayoutGrid` atau icon lain yang lebih "project switcher"? | `IconLayoutGrid` untuk sekarang |
| Q5 | Setelah pilih proyek, navigasi ke `/projects/[slug]` atau tetap di halaman sekarang? | Navigasi ke `/projects/[slug]` (project detail/overview) |

---

## 1. Latar Belakang & Motivasi

### Masalah yang Diselesaikan

| Masalah | Root Cause | Solusi |
|---|---|---|
| `ProjectSelector` glitch saat keyboard virtual muncul | `Popover` + `CommandInput` nested di dalam Mobile Sidebar `Sheet` | Ganti jadi dedicated Vaul `Drawer` tab tersendiri |
| Mobile UX tidak native-feel | Sheet Sidebar dari kiri tidak sesuai pola mobile native | Bottom tab bar — pola standar iOS/Android |
| Sidebar terlalu "dalam" di mobile | Hamburger trigger → Sheet → multiple tap untuk navigasi | Akses langsung dari bottom nav, 1 tap |

### Scope Perubahan

- Mobile only (< 768px / breakpoint `md`)
- Desktop Sidebar: tidak berubah sama sekali
- Semua logika bisnis, tRPC, auth: tidak berubah
- `ProjectSelector` di desktop Sidebar: tetap pakai Popover

---

## 2. Arsitektur Akhir

```
Mobile Layout (< md)
+----------------------------------+
| SiteHeader                       |  h-(--header-height)
| [Breadcrumb] [header actions]    |  <- SidebarTrigger HIDDEN di mobile
+----------------------------------+
|                                  |
|   Page Content                   |
|   (pb-16 agar tidak tertutup     |
|    bottom nav)                   |
|                                  |
+----------------------------------+
| MobileBottomNav (position:fixed) |  h-16 + pb-safe
| [1]  [2]  [3]  [4]  [5]         |
+----------------------------------+

Desktop Layout (>= md) — tidak berubah
+-----------------+--------------------+
|   AppSidebar    |   SiteHeader       |
|                 +--------------------+
|  - NavMain      |   Page Content     |
|  - NavUser      |                    |
+-----------------+--------------------+
```

---

## 3. Struktur Bottom Nav (5 Tab)

### 3.1 Global Context (/dashboard, /projects, /users, dll.)

| Posisi | Label | Icon | ADMIN | CEO | MANDOR | ARCHITECT | FINANCE |
|---|---|---|---|---|---|---|---|
| Tab 1 | Dashboard | `IconDashboard` | `/dashboard` | `/dashboard` | `/dashboard` | `/dashboard` | `/dashboard` |
| Tab 2 | Proyek | `IconFolder` | `/projects` | `/projects` | `/projects` | `/projects` | `/projects` |
| Tab 3 | Role Tab | varies | `IconUsers` /users | `IconNews` /reports | `IconNews` /reports | `IconFileText` /documents* | `IconCoin` /emergency* |
| Tab 4 | Pilih Proyek | `IconLayoutGrid` | Buka Drawer | same | same | same | same |
| Tab 5 | Menu | `IconMenu2` | Buka Sidebar kiri | same | same | same | same |

> Tab 3 USER tanpa ProjectRole: greyed-out `IconGrid4x4` label "Fitur", disabled.
> *) Route global /documents dan /emergency mungkin belum ada — lihat §10 Q1.

### 3.2 Project Context (/projects/[slug]/...)

| Posisi | Label | Icon | ADMIN | CEO | MANDOR | ARCHITECT | FINANCE |
|---|---|---|---|---|---|---|---|
| Tab 1 | Kembali | `IconArrowLeft` | /projects | /projects | /projects | /projects | /projects |
| Tab 2 | Laporan | `IconNews` | /projects/[slug]/reports | /projects/[slug]/reports | /projects/[slug]/reports | disabled | disabled |
| Tab 3 | Role Tab | varies | `IconUsers` /users | placeholder disabled | `IconPackage` logistics | `IconFileText` documents | `IconCoin` emergency |
| Tab 4 | Pilih Proyek | `IconLayoutGrid` | Buka Drawer | same | same | same | same |
| Tab 5 | Menu | `IconMenu2` | Buka Sidebar | same | same | same | same |

> CEO di project context: Tab 3 = placeholder disabled, `title="Segera hadir"`.

### 3.3 Active State Logic

```
isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
Tab 4 (ProjectSwitcher) dan Tab 5 (Menu) = tidak pernah isActive
```

---

## 4. File Baru yang Dibuat

### 4.1 `src/components/navigation/project-switcher-drawer.tsx`

Menggantikan peran mobile `ProjectSelector`. Vaul Drawer dari bawah berisi daftar proyek dan input search. Tidak ada nested overlay — bebas dari konflik keyboard.

**Interface:**

```tsx
interface ProjectSwitcherDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Dependencies:**
- `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle` dari `~/components/ui/drawer`
- `Avatar`, `AvatarFallback` dari `~/components/ui/avatar`
- `Input` dari `~/components/ui/input`
- `IconCheck` dari `@tabler/icons-react`
- `useProjectList` dari `~/hooks`
- `useRouter`, `useParams` dari `next/navigation`
- `useState` dari `react`
- `cn` dari `~/lib/utils`

**Pseudo-code struktur JSX:**

```tsx
<Drawer open={open} onOpenChange={onOpenChange}>
  <DrawerContent className="h-[80dvh] flex flex-col">
    <DrawerHeader className="text-left shrink-0 border-b pb-3 px-6 pt-4">
      <DrawerTitle>Pilih Proyek</DrawerTitle>
      {selectedProject && (
        <p className="text-xs text-muted-foreground mt-1">
          Aktif: {selectedProject.name}
        </p>
      )}
    </DrawerHeader>

    {/* Search — keyboard-safe karena Drawer adalah top-level */}
    <div className="px-4 pt-3 pb-2 shrink-0">
      <Input
        placeholder="Cari proyek..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus={false}
      />
    </div>

    {/* List — flex-1, scrollable */}
    <div className="flex-1 overflow-y-auto px-2 pb-safe" data-lenis-prevent>
      {isLoading ? <SkeletonList /> : (
        filteredProjects.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Proyek tidak ditemukan
          </p>
        ) : (
          Object.entries(groupedByStatus).map(([status, items]) => (
            <div key={status}>
              <p className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">
                {STATUS_LABELS[status] ?? status}
              </p>
              {items.map(project => (
                <button
                  key={project.id}
                  onClick={() => handleSelect(project)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left",
                    "active:scale-[0.98] transition-transform hover:bg-accent",
                    selectedProjectId === project.id && "bg-primary/10 text-primary",
                  )}
                >
                  <Avatar className="h-8 w-8 rounded-lg shrink-0">
                    <AvatarFallback className="rounded-lg text-xs font-semibold">
                      {getInitials(project.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate font-medium text-sm">{project.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {project.location ?? "Lokasi tidak tersedia"}
                    </span>
                  </div>
                  {selectedProjectId === project.id && (
                    <IconCheck className="ml-auto size-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          ))
        )
      )}
    </div>
  </DrawerContent>
</Drawer>
```

**Logika utama:**

```tsx
// handleSelect
const handleSelect = (project: Project) => {
  setSelectedProjectId(project.id);
  localStorage.setItem("selectedProjectId", project.id);
  onOpenChange(false);
  router.push(`/projects/${project.slug}`);
};

// filteredProjects
const filteredProjects = projects?.filter(p =>
  p.name.toLowerCase().includes(search.toLowerCase()) ||
  (p.location?.toLowerCase().includes(search.toLowerCase()) ?? false)
) ?? [];

// STATUS_LABELS
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Aktif",
  DONE: "Selesai",
  PAUSED: "Dijeda",
};
```

---

### 4.2 `src/components/navigation/mobile-bottom-nav.tsx`

Komponen utama bottom navigation. Fixed di bawah layar, hanya mobile, 5 tab dinamis berdasarkan GlobalRole + ProjectRole + URL context.

**Interface:**

```tsx
interface MobileBottomNavProps {
  role: GlobalRole;
  projectSlug?: string;
}
```

**Type NavTab:**

```tsx
type NavTab = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string;        // undefined = action tab (bukan link)
  action?: () => void;  // untuk tab Menu dan ProjectSwitcher
  disabled?: boolean;
};
```

**Dependencies:**
- `useSidebar` dari `~/components/ui/sidebar`
- `useIsMobile` dari `~/hooks/use-mobile`
- `useUserRole` dari `~/hooks/use-user-role`
- `usePathname`, `useParams` dari `next/navigation`
- `useState` dari `react`
- `Link` dari `next/link`
- `cn` dari `~/lib/utils`
- `ProjectSwitcherDrawer` dari `./project-switcher-drawer`
- Icons: `IconDashboard`, `IconFolder`, `IconNews`, `IconUsers`, `IconArrowLeft`, `IconPackage`, `IconFileText`, `IconCoin`, `IconLayoutGrid`, `IconMenu2`, `IconGrid4x4`, `IconInnerShadowTop`

**Helper buildRoleTab:**

```tsx
function buildRoleTab(
  globalRole: GlobalRole,
  projectRole: "MANDOR" | "ARCHITECT" | "FINANCE" | null,
  projectSlug?: string,
): NavTab {
  if (projectSlug) {
    // PROJECT CONTEXT
    if (globalRole === "ADMIN")
      return { id: "users", label: "Pengguna", icon: IconUsers, href: "/users" };
    if (globalRole === "CEO")
      return { id: "ceo-ph", label: "Segera", icon: IconInnerShadowTop, disabled: true };
    if (projectRole === "MANDOR")
      return { id: "logistics", label: "Logistik", icon: IconPackage,
               href: `/projects/${projectSlug}/logistics` };
    if (projectRole === "ARCHITECT")
      return { id: "documents", label: "Dokumen", icon: IconFileText,
               href: `/projects/${projectSlug}/documents` };
    if (projectRole === "FINANCE")
      return { id: "emergency", label: "Dana", icon: IconCoin,
               href: `/projects/${projectSlug}/emergency` };
    return { id: "no-role", label: "Fitur", icon: IconGrid4x4, disabled: true };
  }

  // GLOBAL CONTEXT
  if (globalRole === "ADMIN")
    return { id: "users", label: "Pengguna", icon: IconUsers, href: "/users" };
  if (globalRole === "CEO")
    return { id: "reports", label: "Laporan", icon: IconNews, href: "/reports" };
  if (projectRole === "MANDOR")
    return { id: "reports", label: "Laporan", icon: IconNews, href: "/reports" };
  if (projectRole === "ARCHITECT")
    return { id: "documents", label: "Dokumen", icon: IconFileText, href: "/documents" };
  if (projectRole === "FINANCE")
    return { id: "emergency", label: "Dana", icon: IconCoin, href: "/emergency" };
  return { id: "no-role", label: "Fitur", icon: IconGrid4x4, disabled: true };
}
```

**Logika membangun tabs array:**

```tsx
const isProjectContext = !!projectSlug;
const { isMandor, isArchitect, isFinance, isAdmin: isGlobalAdmin, isCEO } = useUserRole();
const currentProjectRole = isMandor ? "MANDOR" : isArchitect ? "ARCHITECT" : isFinance ? "FINANCE" : null;

const tab1: NavTab = isProjectContext
  ? { id: "back", label: "Kembali", icon: IconArrowLeft, href: "/projects" }
  : { id: "dashboard", label: "Dashboard", icon: IconDashboard, href: "/dashboard" };

const isReportsDisabled = isProjectContext && !isMandor && !isGlobalAdmin && !isCEO;
const tab2: NavTab = isProjectContext
  ? { id: "reports", label: "Laporan", icon: IconNews,
      href: `/projects/${projectSlug}/reports`, disabled: isReportsDisabled }
  : { id: "projects", label: "Proyek", icon: IconFolder, href: "/projects" };

const tab3 = buildRoleTab(role, currentProjectRole, projectSlug);

const tab4: NavTab = { id: "switcher", label: "Pilih Proyek", icon: IconLayoutGrid,
                       action: () => setSwitcherOpen(true) };
const tab5: NavTab = { id: "menu", label: "Menu", icon: IconMenu2,
                       action: () => setOpenMobile(true) };

const tabs = [tab1, tab2, tab3, tab4, tab5];
```

**Struktur JSX:**

```tsx
// SSR-safe: return null jika bukan mobile
if (!isMobile) return null;

return (
  <>
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-40 md:hidden",
      "bg-background/95 backdrop-blur-sm border-t border-border",
      "pb-safe",
    )}>
      <div className="flex items-stretch h-16">
        {tabs.map(tab => <NavTabButton key={tab.id} tab={tab} pathname={pathname} />)}
      </div>
    </nav>

    <ProjectSwitcherDrawer open={switcherOpen} onOpenChange={setSwitcherOpen} />
  </>
);
```

**Sub-component NavTabButton:**

```tsx
function NavTabButton({ tab, pathname }: { tab: NavTab; pathname: string }) {
  const isActive = !tab.disabled && !!tab.href &&
    (pathname === tab.href || pathname.startsWith(tab.href + "/"));

  const inner = (
    <span className={cn(
      "relative flex flex-col items-center justify-center gap-0.5",
      "w-full h-full px-1 min-h-[48px]", // 48dp touch target
      "active:scale-95 transition-transform duration-75",
      isActive ? "text-primary" : "text-muted-foreground",
      tab.disabled && "opacity-40 pointer-events-none",
    )}>
      {isActive && (
        <span className="absolute top-1 w-1 h-1 rounded-full bg-primary" />
      )}
      <tab.icon size={22} />
      <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
    </span>
  );

  if (tab.action) {
    return (
      <button onClick={tab.disabled ? undefined : tab.action} aria-label={tab.label}
              className="relative flex flex-1 items-center justify-center">
        {inner}
      </button>
    );
  }

  return (
    <Link href={tab.href!} aria-label={tab.label}
          aria-current={isActive ? "page" : undefined}
          onClick={e => tab.disabled && e.preventDefault()}
          className="relative flex flex-1 items-center justify-center">
      {inner}
    </Link>
  );
}
```

---

## 5. File yang Dimodifikasi

### 5.1 `src/components/layout/site-header.tsx`

```diff
- <SidebarTrigger className="-ml-1" />
+ <SidebarTrigger className="-ml-1 hidden md:flex" />

- <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-8" />
+ <Separator orientation="vertical" className="mx-2 hidden md:block data-[orientation=vertical]:h-8" />
```

### 5.2 `src/components/layout/dashboard-layout.tsx`

```diff
+ import { MobileBottomNav } from "~/components/navigation";
+ import type { GlobalRole } from "@prisma/client";

  interface DashboardLayoutProps {
    children: React.ReactNode;
    sidebarConfig: SidebarConfig;
    headerActions?: React.ReactNode;
    sidebarVariant?: "sidebar" | "floating" | "inset";
+   mobileNavRole?: GlobalRole;
+   mobileNavProjectSlug?: string;
  }

  // JSX changes:
- <div className="flex flex-1 flex-col">
+ <div className="flex flex-1 flex-col pb-16 md:pb-0">

  // Sebelum closing </SidebarProvider>:
+ {mobileNavRole && (
+   <MobileBottomNav role={mobileNavRole} projectSlug={mobileNavProjectSlug} />
+ )}
```

### 5.3 `src/components/layout/internal-layout-client.tsx`

```diff
  return (
    <DashboardLayout
      sidebarConfig={sidebarConfig}
      headerActions={config.headerActions}
+     mobileNavRole={validRole}
+     mobileNavProjectSlug={projectSlug}
    >
      {children}
    </DashboardLayout>
  );
```

### 5.4 `src/components/navigation/project-selector.tsx`

```diff
  return (
+   <div className="hidden md:block">
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        ...
      </Popover>
+   </div>
  );
```

### 5.5 `src/components/navigation/index.ts`

```diff
  export { NavDocuments } from "./nav-documents";
  export { NavMain } from "./nav-main";
  export { NavSecondary } from "./nav-secondary";
  export { NavUser } from "./nav-user";
+ export { MobileBottomNav } from "./mobile-bottom-nav";
+ export { ProjectSwitcherDrawer } from "./project-switcher-drawer";
```

### 5.6 `docs/known-issues.md` (setelah implementasi verified)

```diff
- - **Sheet Form**: Mengalami glitch pada tampilan mobile ketika keyboard virtual muncul.
+ - **Sheet Form**: ~~Mengalami glitch pada tampilan mobile ketika keyboard virtual muncul.~~
+   **[RESOLVED 2026-09-xx]** Digantikan dengan bottom nav + `ProjectSwitcherDrawer` (Vaul).
```

---

## 6. Urutan Eksekusi

```
Step 1  project-switcher-drawer.tsx    (BUAT BARU — paling independen)
Step 2  mobile-bottom-nav.tsx          (BUAT BARU — import dari Step 1)
Step 3  navigation/index.ts            (MODIFIKASI — 2 baris export baru)
Step 4  project-selector.tsx           (MODIFIKASI — bungkus hidden md:block)
Step 5  site-header.tsx                (MODIFIKASI — 2 baris hidden md:*)
Step 6  dashboard-layout.tsx           (MODIFIKASI — mount nav + pb-16)
Step 7  internal-layout-client.tsx     (MODIFIKASI — pass role props)
Step 8  Test & Verifikasi
Step 9  known-issues.md                (UPDATE setelah verified)
```

---

## 7. Edge Cases & Handling

| Case | Handling |
|---|---|
| SSR / Hydration mismatch | `useIsMobile()` return `false` di server; `MobileBottomNav` render `null`; mount di client setelah `useEffect` |
| User belum join project manapun | `isMandor/isArchitect/isFinance = false` → Tab 3 = disabled placeholder |
| User punya multiple ProjectRoles | Priority check: MANDOR > ARCHITECT > FINANCE (urutan di `buildRoleTab`) |
| CEO di project context | Tab 3 = disabled, `title="Segera hadir"` |
| iPhone home bar (safe area) | `pb-safe` = `env(safe-area-inset-bottom)` via Tailwind safe-area plugin |
| Landscape orientation | Nav tetap h-16, label terbaca. Dapat disempurnakan nanti. |
| Tab "Kembali" di /projects list | `/projects` tidak ada `params.slug` → bukan project context → Tab 1 = Dashboard |
| `ProjectSwitcherDrawer` + keyboard | Aman, Drawer adalah top-level overlay, tidak nested di Sheet |
| Resize browser mobile ↔ desktop | `useIsMobile()` reactive via `matchMedia`, nav mount/unmount otomatis |
| Halaman Login / non-internal | Tidak ada `DashboardLayout` → `MobileBottomNav` tidak dirender |

---

## 8. Testing Checklist

### Fungsional
- [ ] Tab 1 (Dashboard) → `/dashboard`
- [ ] Tab 1 (Kembali di project context) → `/projects`
- [ ] Tab 2 (Proyek di global context) → `/projects`
- [ ] Tab 2 (Laporan di project context) → `/projects/[slug]/reports`
- [ ] Tab 2 disabled untuk Architect/Finance di project context
- [ ] Tab 3 Admin → `/users`
- [ ] Tab 3 CEO global → `/reports`
- [ ] Tab 3 CEO project context → disabled, tidak navigasi
- [ ] Tab 3 Mandor global → `/reports`
- [ ] Tab 4 → membuka ProjectSwitcherDrawer
- [ ] Tab 5 → membuka Sidebar kiri
- [ ] Switcher: search berfungsi
- [ ] Switcher: pilih proyek → navigasi + tutup + simpan localStorage
- [ ] Switcher: keyboard virtual tidak glitch
- [ ] Active state tab sesuai URL

### Visual & UX
- [ ] Konten tidak tertutup bottom nav (pb-16 berjalan)
- [ ] pb-safe berjalan di iPhone
- [ ] Touch feedback `active:scale-95` terasa
- [ ] Label 10px terbaca, kontras cukup
- [ ] Desktop: bottom nav tidak tampil
- [ ] Desktop: SidebarTrigger masih berfungsi
- [ ] Desktop: ProjectSelector Popover di sidebar berfungsi

---

## 9. Rollback Plan

1. Revert `dashboard-layout.tsx` — hapus MobileBottomNav + pb-16
2. Revert `site-header.tsx` — hapus `hidden` pada SidebarTrigger
3. Revert `internal-layout-client.tsx` — hapus 2 prop baru
4. Revert `project-selector.tsx` — hapus wrapper `hidden md:block`
5. File baru dibiarkan (tidak di-import = tidak berpengaruh)

**Total rollback: ~10 baris. Risiko sangat rendah.**

---

## 10. Pertanyaan Terbuka (TBD)

| # | Pertanyaan | Default jika tidak dijawab |
|---|---|---|
| Q1 | Route `/documents` dan `/emergency` global (tanpa slug) sudah ada? | Jika belum, Tab 3 Architect/Finance di global context = disabled |
| Q2 | CEO di project context — tab apa nantinya? | Placeholder "Segera" disabled |
| Q3 | Icon "Pilih Proyek" — `IconLayoutGrid` sudah sesuai? | Tetap `IconLayoutGrid` |
| Q4 | Label bahasa Indonesia atau Inggris? | Bahasa Indonesia |
| Q5 | `autoFocus` di search Switcher Drawer — aktif atau tidak? | `autoFocus={false}` — user tap sendiri |

