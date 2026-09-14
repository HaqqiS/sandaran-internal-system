"use client";

import {
  IconAlertTriangle,
  IconBox,
  IconMinus,
  IconPlus,
  IconSearch,
  IconTrendingDown,
  IconTrendingUp,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useLogisticStockSummary } from "~/hooks/useLogistic";
import { useProjectMembers } from "~/hooks/useProject";
import { useSession } from "~/stores/use-session-store";
import { ItemActions } from "./item-actions";
import { TransactionDialog } from "./transaction-dialog";

interface ItemListProps {
  projectId: string;
}

type StockStatus = "all" | "critical" | "low" | "ok";

const LOW_STOCK_THRESHOLD = 10;

function getStockStatus(currentStock: number, totalIn: number) {
  if (totalIn === 0 || currentStock === 0) return "out";
  const ratio = currentStock / totalIn;
  if (ratio <= 0.2 || currentStock < LOW_STOCK_THRESHOLD) return "critical";
  if (ratio <= 0.4) return "low";
  return "ok";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "out":
      return {
        label: "Habis",
        className: "bg-destructive/10 text-destructive border-destructive/20",
      };
    case "critical":
      return {
        label: "Kritis",
        className:
          "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
      };
    case "low":
      return {
        label: "Menipis",
        className:
          "bg-yellow-400/10 text-yellow-700 border-yellow-400/20 dark:text-yellow-400",
      };
    default:
      return null;
  }
}

function getStockColor(status: string) {
  switch (status) {
    case "out":
      return "text-destructive";
    case "critical":
      return "text-amber-600 dark:text-amber-400";
    case "low":
      return "text-yellow-700 dark:text-yellow-400";
    default:
      return "";
  }
}

// ── Skeleton ──────────────────────────────────────────────────
function ItemListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar skeleton */}
      <Skeleton className="h-9 w-full rounded-lg" />

      {/* Mobile card skeletons */}
      <div className="md:hidden space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table skeleton */}
      <div className="hidden md:block rounded-xl border overflow-hidden">
        <div className="bg-muted/30 p-3 flex gap-6 border-b">
          {([160, 100, 60, 60, 60, 60] as const).map((w, i) => (
            <Skeleton
              key={`head-${i}-${w}`}
              className="h-3"
              style={{ width: w }}
            />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-3 flex gap-6 items-center border-b last:border-b-0"
          >
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-10 font-bold" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export function ItemList({ projectId }: ItemListProps) {
  const { data: items, isLoading } = useLogisticStockSummary(projectId);
  const { data: members } = useProjectMembers(projectId);
  const { session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatus>("all");

  const [transactionDialog, setTransactionDialog] = useState<{
    isOpen: boolean;
    type: "IN" | "OUT";
    item: { id: string; name: string; unit: string } | null;
  }>({
    isOpen: false,
    type: "OUT",
    item: null,
  });

  const projectMember = members?.find((m) => m.userId === session?.user?.id);
  const role = projectMember?.role;
  const canRecordTransaction =
    role === "MANDOR" ||
    role === "FINANCE" ||
    session?.user?.roleGlobal === "ADMIN";

  const handleTransactionSuccess = () => {
    setTransactionDialog((prev) => ({ ...prev, isOpen: false }));
  };

  if (isLoading) return <ItemListSkeleton />;

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-3">
          <IconBox className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <h3 className="text-sm font-semibold">Belum ada barang logistik</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Tambahkan barang untuk mulai memantau stok di proyek ini
        </p>
      </div>
    );
  }

  // Apply filters
  const filteredItems = items
    .filter((item) => {
      const matchSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (statusFilter === "all") return true;
      const status = getStockStatus(item.currentStock, item.totalIn);
      if (statusFilter === "critical")
        return status === "critical" || status === "out";
      if (statusFilter === "low") return status === "low";
      if (statusFilter === "ok") return status === "ok";
      return true;
    })
    .sort((a, b) => {
      // Sort: critical/out first, then by activity
      const order = { out: 0, critical: 1, low: 2, ok: 3 };
      const aS = getStockStatus(a.currentStock, a.totalIn);
      const bS = getStockStatus(b.currentStock, b.totalIn);
      if (order[aS] !== order[bS]) return order[aS] - order[bS];
      return b.totalIn + b.totalOut - (a.totalIn + a.totalOut);
    });

  const criticalCount = items.filter((i) => {
    const s = getStockStatus(i.currentStock, i.totalIn);
    return s === "critical" || s === "out";
  }).length;
  const lowCount = items.filter(
    (i) => getStockStatus(i.currentStock, i.totalIn) === "low",
  ).length;
  const okCount = items.filter(
    (i) => getStockStatus(i.currentStock, i.totalIn) === "ok",
  ).length;

  const filterTabs: { key: StockStatus; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: items.length },
    { key: "critical", label: "Kritis", count: criticalCount },
    { key: "low", label: "Menipis", count: lowCount },
    { key: "ok", label: "Aman", count: okCount },
  ];

  return (
    <div className="space-y-4">
      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Cari barang..."
            className="pl-9 pr-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === tab.key
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-md px-1 text-[10px] font-bold ${
                  statusFilter === tab.key
                    ? "bg-background/20 text-background"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── No results state ─────────────────────────── */}
      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center">
          <IconSearch className="h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium">Tidak ada hasil ditemukan</p>
          <p className="text-xs text-muted-foreground mt-1">
            Coba ubah kata kunci atau filter yang dipilih
          </p>
        </div>
      )}

      {filteredItems.length > 0 && (
        <>
          {/* ── Mobile: Card View ─────────────────────── */}
          <div className="md:hidden space-y-2">
            {filteredItems.map((item) => {
              const status = getStockStatus(item.currentStock, item.totalIn);
              const badge = getStatusBadge(status);

              return (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-3.5 transition-colors hover:bg-muted/30"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">
                          {item.name}
                        </p>
                        {badge && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 h-4 shrink-0 ${badge.className}`}
                          >
                            {badge.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Satuan: {item.unit}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-xl font-bold leading-tight ${getStockColor(status)}`}
                      >
                        {item.currentStock}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        tersisa
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IconTrendingUp className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-green-600 font-medium dark:text-green-400">
                          {item.totalIn}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <IconTrendingDown className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-red-600 font-medium dark:text-red-400">
                          {item.totalOut}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {canRecordTransaction && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setTransactionDialog({
                                isOpen: true,
                                type: "IN",
                                item,
                              })
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-600 transition-all hover:bg-green-100 active:scale-95 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
                            aria-label={`Tambah stok ${item.name}`}
                          >
                            <IconPlus className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setTransactionDialog({
                                isOpen: true,
                                type: "OUT",
                                item,
                              })
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
                            aria-label={`Kurangi stok ${item.name}`}
                          >
                            <IconMinus className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <ItemActions projectId={projectId} item={item} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Desktop: Table View ───────────────────── */}
          <div className="hidden md:block rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs font-medium w-[35%]">
                    Nama Barang
                  </TableHead>
                  <TableHead className="text-xs font-medium">Kondisi</TableHead>
                  <TableHead className="text-xs font-medium text-right">
                    Masuk
                  </TableHead>
                  <TableHead className="text-xs font-medium text-right">
                    Keluar
                  </TableHead>
                  <TableHead className="text-xs font-medium text-right">
                    Stok
                  </TableHead>
                  <TableHead className="text-xs font-medium text-right w-[120px]">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const status = getStockStatus(
                    item.currentStock,
                    item.totalIn,
                  );
                  const badge = getStatusBadge(status);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Satuan: {item.unit}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 min-w-[100px]">
                          {badge ? (
                            <Badge
                              variant="outline"
                              className={`w-fit text-xs ${badge.className}`}
                            >
                              {status === "out" && (
                                <IconAlertTriangle className="mr-1 h-3 w-3" />
                              )}
                              {badge.label}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="w-fit text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                            >
                              Aman
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-green-600 font-medium dark:text-green-400">
                          +{item.totalIn}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-red-600 font-medium dark:text-red-400">
                          −{item.totalOut}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`text-sm font-bold ${getStockColor(status)}`}
                        >
                          {item.currentStock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canRecordTransaction && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                                onClick={() =>
                                  setTransactionDialog({
                                    isOpen: true,
                                    type: "IN",
                                    item,
                                  })
                                }
                                aria-label={`Tambah stok ${item.name}`}
                              >
                                <IconPlus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={() =>
                                  setTransactionDialog({
                                    isOpen: true,
                                    type: "OUT",
                                    item,
                                  })
                                }
                                aria-label={`Kurangi stok ${item.name}`}
                              >
                                <IconMinus className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <ItemActions projectId={projectId} item={item} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <TransactionDialog
        projectId={projectId}
        isOpen={transactionDialog.isOpen}
        onOpenChange={(open: boolean) =>
          setTransactionDialog((prev) => ({ ...prev, isOpen: open }))
        }
        type={transactionDialog.type}
        item={transactionDialog.item}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}
