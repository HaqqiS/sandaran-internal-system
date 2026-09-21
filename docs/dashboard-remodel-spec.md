# Dashboard Remodel — Implementation Spec

Audience: an AI coding agent working inside this repo. Read the whole file before writing code. Work phase by phase (section 9).

---

## 0. Rules (mandatory)

**UI RULE — use shadcn/ui for every UI element. Only if shadcn/ui has no suitable component (first check `src/components/ui`, then try `pnpm dlx shadcn@latest add <name>`), build it from scratch with Tailwind + `cn()` + the existing CSS tokens, following shadcn conventions (`data-slot`, `cva` variants, forwarded `className`). Never introduce another UI library.**

Other rules:

1. **No fake data.** Every number, percentage, trend and status label on a dashboard must be computed from Prisma data. No literals such as `"75%"`, `"Sehat"`, `"+2"`, `"Kerja bagus!"`.
2. **Authorization is server-side.** A `USER` must only receive data for projects where they have a `ProjectMember` row. Never send other projects' data and hide it in the UI.
3. Follow existing patterns: server `page.tsx` + `*-client.tsx`; tRPC hooks live in `src/hooks/useDashboard.ts` and are re-exported from `src/hooks/index.ts`; UI copy is Indonesian.
4. Do not change `prisma/schema.prisma` except the items listed under "Optional schema changes" — and only if asked.
5. After each phase run `pnpm typecheck` and `pnpm check` (Biome). Add Vitest tests for pure helpers (`pnpm test`).

Stack: Next.js 15 App Router, React 19, tRPC 11 + React Query 5, Prisma 6 (PostgreSQL), better-auth, Tailwind v4, shadcn/ui, Tabler icons, Recharts 2.15.4 (via `~/components/ui/chart`), pnpm.

---

## 1. Scope and roles

`src/app/(internal)/dashboard/page.tsx` selects the dashboard by `roleGlobal`:

| `roleGlobal` | Renders | Job |
|---|---|---|
| `ADMIN` | `AdminDashboard` | Keep the system running: approve users, staffing, reporting, data problems |
| `CEO` | `CeoDashboard` | Read-only portfolio overview |
| `USER` | `UserDashboard` | Do today's work on *my* projects, built from `ProjectMember.role` (MANDOR / ARCHITECT / FINANCE) as "lenses" |
| `NONE` | never reaches it | Handled by `/waiting-approval` |

An ADMIN who is also a project member still sees the Admin dashboard.

The old `MandorView`, `ArchitectView`, `FinanceView` are folded into `UserDashboard` as lenses. Today `page.tsx` renders every matching view, so a user who is Mandor in one project and Finance in another gets two full layouts stacked.

---

## 2. Audit — what to remove or replace

| Where | Current | Problem | Replacement |
|---|---|---|---|
| `ceo-view` | "Progres Keseluruhan 75% +5%" | Hardcoded | Per-project latest reported progress + time-elapsed bar. No portfolio average |
| `ceo-view` | "Kesehatan Keuangan: Sehat" | Hardcoded; no budget in schema | Fund balance, withdrawals this month, unreviewed count |
| `ceo-view` | "Analitik & Tren — segera hadir" | Placeholder | Real charts (section 5) |
| `architect-view` | "+2 minggu ini" | Hardcoded | Documents where `userId = me` in last 7 days |
| `mandor-view` | "sebelum jam 5 sore", "Kerja bagus!" | Deadline rule not stored | Only computed status: reported today / not yet |
| `admin-view` | "Peringatan Logistik", "Cek Stok Menipis" | `LogisticItem` has no minimum stock | "Item stok minus" (Σ IN − Σ OUT < 0) |
| `finance-view` | "Total disetujui bulan ini" | No approve state, only `UNREVIEWED`/`REVIEWED` | "Penarikan bulan ini" + "n belum ditinjau" |
| `project-detail-client` | "Progres Keseluruhan" = mean of `progressPercent` | Field is cumulative → mean is wrong | Latest report's value + its date |
| `StatCard` | `trend` accepts free text | Root cause of fake trends | `MetricCard` with `previous?: { value: number; periodLabel: string }`; delta computed inside |
| `StatsGrid` | `desktop: 5` → `lg:grid-cols-4`; `tablet/desktop: 2` → unprefixed `grid-cols-2` | Broken breakpoint mapping | Explicit literal-class lookup per breakpoint (Tailwind needs literal class names) |
| `DashboardLayout` | `p-6` + `space-y-8` inside `PageLayout` | Double spacing | Use `flex flex-col gap-6 p-4 md:p-6` |

Do **not** build (schema cannot support): overall/portfolio progress %, financial health, low-stock alerts, "behind schedule", worker productivity, "unread" comments (no read state), "open" issues (no resolved flag).

---

## 3. Data rules

Policy constants (put in `src/lib/dashboard-constants.ts`; values are proposals):

```ts
export const REPORT_STALE_DAYS = 2;   // ACTIVE project with no report in N days
export const ISSUE_WINDOW_DAYS = 7;   // issues KPI + feed
export const TZ_OFFSET_HOURS = 8;     // WITA, no DST
```

**Timezone.** `reportDate` is stored in UTC; a UTC server would treat 00:00–07:59 WITA as "yesterday". One shared helper (unit-tested):

```ts
startOfTodayWita = new Date(Math.floor((now + 8h) / 1d) * 1d - 8h)
```

Use it (and a matching month/week variant) for every "today" / "this month" boundary.

**`DailyReport.progressPercent` is cumulative project completion as of that report (confirmed).**
- Current progress = latest report, ordered `reportDate desc, createdAt desc`. Never average.
- Value lower than the previous report = data-entry anomaly → "Progres turun" warning.
- "Latest report per project per day" is used when summing `totalWorkers`, so several reports on one day are not double-counted.

**Definitions**
- Pending user: `reviewedAt = null`. Active: `isActive && reviewedAt`. Rejected: `!isActive && reviewedAt` (same as `users-client`).
- Kendala dilaporkan: `issues` not null and not `""`. Called "dilaporkan", never "terbuka".
- Negative stock: Σ `LogisticTransaction` IN − Σ OUT < 0 per item.
- "Tanpa bukti": `EmergencyTransaction.url` is null.
- Elapsed % = `clamp((now − startDate) / (endDate − startDate), 0, 1)`; needs both dates.

---

## 4. tRPC procedures and queries

| Procedure | Guard | Returns |
|---|---|---|
| `dashboard.getAdminOverview` | ADMIN | `attention, counts, pendingUsers[5], projectHealth[]` |
| `dashboard.getCeoOverview` | CEO | `kpis, portfolio[], issues[5], fund` |
| `dashboard.getCeoTrends` | CEO | `workersDaily30d[], fundMonthly6m[], progressSeries?` (split so slow charts don't block) |
| `dashboard.getUserOverview` | USER | `memberships[], mandor?, architect?, finance?` — a lens key exists only if the user holds that role on an ACTIVE project |

Find the existing dashboard router under `src/server/api/routers/` (likely `dashboard.router.ts`) and replace the per-role procedures (`getCEOStats`, `getAdminStats`, `getMandorStats`, …) once the new ones are wired. Keep `getEmergencyFundBreakdown` / `emergency.*` if other screens use them.

### Admin

| Widget | Query | Rule |
|---|---|---|
| Users pending/active/rejected | `user.count` ×3 | definitions in section 3 |
| Projects by status | `project.groupBy({ by: ["status"] })` | – |
| Sudah lapor hari ini (x dari y) | ACTIVE projects with ≥1 `dailyReport` ≥ `startOfTodayWita` | – |
| Role gaps | `projectMember.groupBy(projectId, role)` | ACTIVE project lacking MANDOR, ARCHITECT or FINANCE |
| Stale project | `max(reportDate)` per project | < now − `REPORT_STALE_DAYS`, or no report and `startDate ≤ today` |
| Unreviewed tx | `emergencyTransaction.count({ status: "UNREVIEWED" })` | – |
| Negative stock | `logisticTransaction.groupBy(itemId, type)` → sum | `recordTransaction` doesn't block negatives, so this can really happen |
| Pending users list | `user` where `reviewedAt null`, `createdAt asc`, take 5 | "menunggu" = now − `createdAt` |
| Project health row | project + role counts + last report + unreviewed + negative stock + document count | – |

### CEO

| Widget | Query | Rule |
|---|---|---|
| Proyek aktif | `project.groupBy(status)` | – |
| Laporan 7 hari vs 7 hari sebelumnya | `dailyReport.count` ×2 | Rolling windows; delta computed in component |
| Pekerja hari ini | latest report per ACTIVE project today | Σ `totalWorkers` |
| Kendala dilaporkan (7 hari) | `dailyReport.count` | `issues` filter above |
| Portfolio row | project + latest report (+ previous for anomaly) + fund + unreviewed count | elapsed % rule; both dates missing → "Tanggal belum diatur"; `endDate < today` and ACTIVE → "Lewat tenggat"; no reports → "Belum ada laporan" (never render 0% as reported) |
| Progress anomaly | top 2 reports per project | latest < previous → "Progres turun" |
| Issues feed | `dailyReport` where `issues` set, `reportDate desc`, take 5 | text clamped to 2 lines |
| Fund total / withdrawals | `emergencyFund._sum.currentBalance`; `emergencyTransaction._sum.amount` type WITHDRAWAL this month | counts reviewed and unreviewed |
| Fund flow 6 mo | reuse `emergency.getAnalytics` monthly aggregation | – |
| Workers 30 d | raw SQL `DISTINCT ON ("projectId", date)` then sum per day | missing days stay gaps, not zeros |
| Progress trend (optional) | `reportDate, progressPercent` per ACTIVE project | one line per project; ≥2 reports, else empty state |

### User lenses (all scoped to the caller's ACTIVE memberships)

| Lens | Widget | Query / rule |
|---|---|---|
| Mandor | Laporan hari ini (per project) | `dailyReport` with `userId = me`, project = P, today |
| Mandor | Penarikan saya belum ditinjau | `requestedById = me`, `UNREVIEWED`, WITHDRAWAL |
| Mandor | Komentar 7 hari | `reportComment` on reports where `userId = me`, `author ≠ me` (count, not "unread") |
| Mandor | Saldo darurat, laporan terakhir + progres | `emergencyFund.currentBalance`, latest `dailyReport` |
| Mandor | Laporan terbaru saya | `dailyReport` `userId = me`, `reportDate desc`, take 3, first `ReportMedia` as thumbnail |
| Arsitek | Dokumen per proyek | `projectDocument.groupBy(projectId, fileType)` + latest (`title ?? fileName`, `version`, `createdAt`) |
| Arsitek | Saya unggah 7 hari | `userId = me`, `createdAt ≥ now − 7d` |
| Keuangan | Antrean tinjauan | `UNREVIEWED` tx in projects where I'm FINANCE, `createdAt asc`, take 10; flag "Tanpa bukti" |
| Keuangan | Saldo, penarikan bulan ini, item stok minus | same rules as Admin/CEO, scoped to my FINANCE projects |

Open point: "Laporan hari ini" is "by me". If several mandors share a project, confirm whether it should be "by anyone in the project".

### Optional schema changes (only if asked)

- `LogisticItem.minStock Float?` — restores a real low-stock alert.
- Indexes for the aggregates: `DailyReport @@index([projectId, reportDate])`, `EmergencyTransaction @@index([status, createdAt])`, `LogisticTransaction @@index([itemId])`.
- A real "financial health" card would need `Project.budget` and a record of spend. Neither exists.

---

## 5. Screens

Order on every dashboard: (1) attention list, (2) KPI row, (3) main content, (4) charts. Split rows: `grid gap-4 lg:grid-cols-7` with `lg:col-span-4` / `lg:col-span-3`.

### Admin
```
[ Perlu tindakan ]  rows only when count > 0 (all zero → "Tidak ada yang perlu ditindaklanjuti")
   • n pengguna menunggu persetujuan        → /users
   • n proyek aktif belum punya <peran>     → project team dialog
   • n proyek aktif tanpa laporan ≥ 2 hari  → project
   • n transaksi belum ditinjau             → /emergency
   • n item logistik bersaldo minus         → /logistics
[ Proyek ][ Pengguna ][ Sudah lapor hari ini ][ Belum ditinjau ]
[ Persetujuan pengguna (4/7) ]      [ Aksi cepat (3/7) ]
[ Kesehatan proyek: Proyek | Status | Tim M A K | Laporan terakhir | Belum ditinjau | Stok minus | Dokumen ]
```

### CEO
```
[ Proyek aktif ][ Laporan 7 hari (Δ vs 7 hari lalu) ][ Pekerja hari ini ][ Kendala dilaporkan 7 hari ]
[ Portofolio proyek: Proyek | Status | Waktu vs progres | Pekerja hari ini | Saldo darurat | Belum ditinjau ]
     Waktu vs progres = two tracks: elapsed time (thin, muted) + latest reported progress (primary).
     Neutral: no "behind schedule" label — there is no plan baseline.
[ Kendala terbaru (1/2) ]           [ Dana darurat: total + fund-flow chart 6 bln (1/2) ]
[ Pekerja per hari, 30 hari ]  (+ optional progress trend)
```

### User
```
[ Proyek saya: chips "Proyek · Peran" ]
[ RoleLensTabs ]  hidden if 1 lens; default = lens with most action items; URL ?lens=
  Mandor:   KPIs (laporan hari ini, penarikan belum ditinjau, komentar 7 hari)
            list per project (status pill, saldo, laporan terakhir + progres, [Tarik dana] [Buat laporan])
            laporan terbaru saya (3)
  Arsitek:  KPIs (dokumen di proyek saya, saya unggah 7 hari)
            per project (count, last doc, type badges, [Lihat] [Unggah])
  Keuangan: KPIs (antrean, penarikan bulan ini, item stok minus)
            antrean tinjauan (Tandai ditinjau) + saldo per proyek ([Tambah dana])
No memberships → empty state "Belum ditugaskan ke proyek".
```
Keep the existing dialogs: `ReportDialog`, `WithdrawDialog`, `DepositDialog`, `UploadDialog`.

---

## 6. Components — built from shadcn/ui

Existing in `src/components/ui` (seen in imports): `card`, `badge`, `button`, `table`, `tabs`, `chart`, `progress`, `skeleton`, `tooltip`, `separator`, `avatar`, `data-table`, `select`, `dropdown-menu`, `dialog`-family. Add anything missing with `pnpm dlx shadcn@latest add <name>` (e.g. `alert`).

| Component | Built from | Notes |
|---|---|---|
| `MetricCard` (replaces `StatCard`) | `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Skeleton` | Props: `label, value, caption?, previous?, href?, tone?: "default"\|"attention", isLoading, isError`. No free-text trend. Delta hidden when `previous` undefined. `tone` derives from data (count > 0) |
| `AttentionList` | `Card`, `Button asChild variant="ghost"` + `Link`, `Badge` | `items: { key, count, label, href, severity }[]`; filters `count > 0`; empty → all-clear line |
| `ProjectHealthTable`, `PortfolioTable` | `Table` primitives (`DataTable` if paginating) | Table ≥ md; `Card` list below md |
| `TimelineProgress` | `Progress` (reported progress) + **custom** thin time track | shadcn has no two-track bar. States: normal, not started, overdue, no dates, no reports |
| `RoleCoverage` | `Badge variant="outline"` | M/A/K; missing role = dashed border via `className` |
| `IssueFeed` | `Card`, `Separator`, `Button asChild` links | 2-line clamp; whole row is a link |
| `RoleLensTabs` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Radix Tabs already implements the ARIA tabs pattern; sync to `?lens=` with `useSearchParams` |
| `FundFlowChart`, `WorkersChart`, `ProgressChart` | `ChartContainer`, `ChartTooltip`, `ChartTooltipContent` + Recharts | `accessibilityLayer` on; reuse the config style from `emergency-client.tsx` |
| Error state | `Alert` (add) + `Button` retry | Per widget, not per page |
| Empty state | `Card` (or shadcn `Empty` if added) | Single state with next step; never a grid of zeros |
| Status pills | `Badge` + new `success` / `warning` variants in `badge.tsx` via `cva` | Tokens below |

**Tokens.** Reuse `--primary`, `--muted`, `--muted-foreground`, `--card`, `--border`, `--destructive`, `--chart-1`, `--chart-2`. Add `--status-success` and `--status-warning` (+ `-foreground`/bg) in the global CSS where the shadcn tokens live, and register them in Tailwind v4's `@theme inline` so `bg-status-success` etc. work. Light: green-700 / amber-700 text on a 50 tint; dark: green-400 / amber-400 text on a 950 tint. Remove hardcoded `bg-green-50/50`, `text-green-600` etc. (no dark variant today).

Typography: KPI value `text-2xl font-bold`; label `text-sm font-medium`; caption `text-xs text-muted-foreground`. Spacing: page `p-4 md:p-6`, sections `gap-6`, cards `gap-4`.

---

## 7. States, responsive, motion

**States**

| Element | State | Behavior |
|---|---|---|
| MetricCard | Loading | `Skeleton`, keep card height |
| MetricCard | Error | "—" + "Gagal memuat" + retry; other cards unaffected |
| MetricCard | Zero | Show `0`, never hide |
| MetricCard / AttentionList row with link | Hover, focus | `border-primary/50` or `bg-muted/50`, 150 ms; visible focus ring |
| "Tandai ditinjau" | Pending | Disabled + "Meninjau…"; on success toast and invalidate `emergency.*` **and** `dashboard.*` |
| Dashboard | Stale | `staleTime` 60 s; footer "Diperbarui {relative time}" from `dataUpdatedAt` |
| Any mutation that changes counts (create report, review tx, approve user, upload doc, logistic tx) | Success | Invalidate the relevant `dashboard.*` query |

**Responsive**

| Breakpoint | Changes |
|---|---|
| ≥ 1024px | KPI row 4 columns; main splits 4/3; tables full width |
| 768–1023px | KPI row 2 columns; splits stack; tables scroll in `overflow-x-auto` |
| < 768px | KPI row 2 columns; tables become card lists (name + status, then 2–3 facts); lens tabs scroll horizontally; primary buttons full width. Mandors and finance staff are mostly on phones on site |

**Motion.** Card hover border 150 ms ease-out. Skeleton uses Tailwind's pulse. Mobile row expand may reuse the `projects-client` animation (300 ms, `[0.04, 0.62, 0.23, 0.98]`) and must honor `useReducedMotion()`. **No count-up on numbers.** The GSAP `MOTION` tokens are for the marketing site, not here.

**Edge cases**
- No projects at all: one empty state with the next step (Admin → "Buat proyek").
- Project without dates: "Tanggal belum diatur", no time bar. Without reports: "Belum ada laporan", no progress bar.
- `Decimal(15,2)` balances: serialize as string, format with `Intl.NumberFormat("id-ID")`. Abbreviations ("Rp 2,4 jt") only in narrow KPI cards; tables show full value.
- Long names: `truncate` + `title`. More than 20 projects: tables paginate at 10; user lens lists cap at 5 with "Lihat semua".
- Negative or unreviewed-only data is shown as-is with a pill, never clamped.
- Slow connection: overview renders first; charts have their own skeletons.

---

## 8. Accessibility

- `PageLayout` title is the h1; each card title is an h2 (`section aria-labelledby`).
- Focus order = visual order: attention list → KPIs → main content → charts.
- Status is never colour-only: every pill has text; overdue/negative also gets an icon.
- `TimelineProgress`: reported progress is `role="progressbar"` with `aria-valuenow`; the time track is `aria-hidden` and its value is in the visible label ("Waktu 62% · Progres 48%").
- Tables: `<caption className="sr-only">`, `scope="col"`; icon-only buttons need `aria-label`.
- Charts: `accessibilityLayer`, an `aria-label` summarising range and latest value, and a visually hidden table with the same data.
- Announce lens count changes with `aria-live="polite"` only after a user action, not on refetch.

---

## 9. Implementation phases

**Phase 1 — foundation.** `dashboard-constants.ts`, WITA time helpers (+ tests), status tokens and `Badge` variants, `MetricCard`, `AttentionList`, fixed `StatsGrid`, `DashboardLayout` spacing.

**Phase 2 — Admin.** `getAdminOverview`, hook in `useDashboard.ts` + `hooks/index.ts`, `AdminDashboard`, remove `AdminView`.

**Phase 3 — CEO.** `getCeoOverview`, `getCeoTrends`, `TimelineProgress`, `PortfolioTable`, `IssueFeed`, charts, remove `CEOView`.

**Phase 4 — User.** `getUserOverview`, `RoleLensTabs`, Mandor / Arsitek / Keuangan lenses reusing the existing dialogs, remove `MandorView`, `ArchitectView`, `FinanceView`.

**Phase 5 — switch and cleanup.** Rewrite `dashboard/page.tsx` to pick by `roleGlobal`; wire cache invalidation; replace the project-detail "Progres Keseluruhan" card with the latest report value + date; delete `StatCard` when unused.

**Acceptance criteria**
- Grep finds no hardcoded metric literals (`75%`, `Sehat`, `Sesuai Target`, `+2`, `Kerja bagus`) in `src/components/dashboard`.
- Every `MetricCard` value traces to a procedure field.
- Empty database → every role shows empty states, not zeros or crashes.
- Test accounts: ADMIN, CEO, USER with one role, USER with Mandor + Finance, USER with no membership.
- A USER cannot see any project they are not a member of (verify at the API, not the UI).
- Dark mode looks correct; no hardcoded Tailwind colour scales left in dashboard components.
- `pnpm typecheck`, `pnpm check`, `pnpm test` pass.
