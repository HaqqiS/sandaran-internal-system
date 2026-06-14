"use client";

import {
  IconAlertTriangle,
  IconBox,
  IconChevronRight,
  IconLoader2,
  IconMinus,
  IconPackage,
  IconPlus,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { TransactionDialog } from "~/components/logistic/transaction-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useLogisticStockSummary } from "~/hooks/useLogistic";
import { useProjectMembers } from "~/hooks/useProject";
import { useSession } from "~/stores/use-session-store";

interface LogisticsSectionProps {
  projectId: string;
  projectSlug: string;
}

const LOW_STOCK_THRESHOLD = 10;

function getStockStatus(currentStock: number, totalIn: number) {
  if (totalIn === 0) return "empty";
  const ratio = currentStock / totalIn;
  if (currentStock === 0) return "out";
  if (ratio <= 0.2 || currentStock < LOW_STOCK_THRESHOLD) return "critical";
  if (ratio <= 0.4) return "low";
  return "ok";
}

function getStockBadge(status: ReturnType<typeof getStockStatus>) {
  switch (status) {
    case "out":
      return {
        label: "Habis",
        className: "bg-destructive/10 text-destructive border-destructive/20",
      };
    case "critical":
      return {
        label: "Kritis",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
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

export function LogisticsSection({
  projectId,
  projectSlug,
}: LogisticsSectionProps) {
  const { data: items, isLoading } = useLogisticStockSummary(projectId);
  const { data: members } = useProjectMembers(projectId);
  const { session } = useSession();

  const [transactionDialog, setTransactionDialog] = useState<{
    isOpen: boolean;
    type: "IN" | "OUT";
    item: { id: string; name: string; unit: string } | null;
  }>({
    isOpen: false,
    type: "OUT",
    item: null,
  });

  // Find user's role
  const projectMember = members?.find((m) => m.userId === session?.user?.id);
  const role = projectMember?.role;
  const canRecordTransaction =
    role === "MANDOR" ||
    role === "FINANCE" ||
    session?.user?.roleGlobal === "ADMIN";

  const totalItems = items?.length ?? 0;
  const alertItems =
    items?.filter((item) => {
      const status = getStockStatus(item.currentStock, item.totalIn);
      return status === "out" || status === "critical";
    }) ?? [];

  // Sort: critical/out first, then by total activity descending
  const sortedItems = [...(items ?? [])].sort((a, b) => {
    const statusOrder = { out: 0, critical: 1, low: 2, ok: 3, empty: 4 };
    const aStatus = getStockStatus(a.currentStock, a.totalIn);
    const bStatus = getStockStatus(b.currentStock, b.totalIn);
    if (statusOrder[aStatus] !== statusOrder[bStatus]) {
      return statusOrder[aStatus] - statusOrder[bStatus];
    }
    return b.totalIn + b.totalOut - (a.totalIn + a.totalOut);
  });

  const displayItems = sortedItems.slice(0, 4);

  const handleTransactionSuccess = () => {
    setTransactionDialog((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <IconBox className="h-4 w-4 text-foreground" />
          <CardTitle className="text-base font-semibold">Logistik</CardTitle>
          {!isLoading && totalItems > 0 && (
            <span className="text-sm text-muted-foreground">
              ({totalItems} barang)
            </span>
          )}
        </div>
        <Link href={`/projects/${projectSlug}/logistics`}>
          <Button variant="ghost" size="sm" className="gap-1">
            Lihat Semua
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items && items.length > 0 ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total Items */}
              <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <IconPackage className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Total Barang</p>
                  <p className="text-xl font-bold leading-tight">
                    {totalItems}
                  </p>
                </div>
              </div>

              {/* Low/Critical Stock Count */}
              <div
                className={`flex items-center gap-3 rounded-xl p-3 ${
                  alertItems.length > 0 ? "bg-amber-500/10" : "bg-muted/50"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    alertItems.length > 0 ? "bg-amber-500/20" : "bg-muted"
                  }`}
                >
                  <IconAlertTriangle
                    className={`h-4 w-4 ${
                      alertItems.length > 0
                        ? "text-amber-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Stok Kritis</p>
                  <p
                    className={`text-xl font-bold leading-tight ${
                      alertItems.length > 0 ? "text-amber-600" : ""
                    }`}
                  >
                    {alertItems.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Item List */}
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Kondisi Stok
              </p>
              <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {displayItems.map((item) => {
                  const status = getStockStatus(
                    item.currentStock,
                    item.totalIn,
                  );
                  const badge = getStockBadge(status);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border bg-card p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-sm font-medium truncate">
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
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span
                            className="flex items-center gap-1"
                            title="Total Masuk"
                          >
                            <IconTrendingUp className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-green-600 font-medium">
                              {item.totalIn}
                            </span>
                          </span>
                          <span
                            className="flex items-center gap-1"
                            title="Total Keluar"
                          >
                            <IconTrendingDown className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-red-600 font-medium">
                              {item.totalOut}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold leading-none mb-1 ${
                              status === "out"
                                ? "text-destructive"
                                : status === "critical"
                                  ? "text-amber-600"
                                  : ""
                            }`}
                          >
                            {item.currentStock}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-none">
                            {item.unit}
                          </p>
                        </div>

                        {canRecordTransaction && (
                          <div className="flex items-center gap-1 border-l pl-3 ml-1">
                            <button
                              type="button"
                              onClick={() =>
                                setTransactionDialog({
                                  isOpen: true,
                                  type: "IN",
                                  item,
                                })
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-600 transition-all hover:bg-green-100 active:scale-95 dark:border-green-900 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900"
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
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                              aria-label={`Kurangi stok ${item.name}`}
                            >
                              <IconMinus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Show more hint */}
              {items.length > 4 && (
                <Link href={`/projects/${projectSlug}/logistics`}>
                  <p className="pt-1 text-center text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    +{items.length - 4} barang lainnya — lihat semua
                  </p>
                </Link>
              )}
            </div>
          </>
        ) : (
          /* Empty State with CTA */
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <IconBox className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Belum ada barang logistik
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tambahkan barang untuk mulai memantau stok proyek
              </p>
            </div>
            {canRecordTransaction && (
              <Link href={`/projects/${projectSlug}/logistics`}>
                <Button size="sm" variant="outline" className="gap-1.5 mt-1">
                  <IconPlus className="h-3.5 w-3.5" />
                  Tambah Barang
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>

      <TransactionDialog
        projectId={projectId}
        isOpen={transactionDialog.isOpen}
        onOpenChange={(open) =>
          setTransactionDialog((prev) => ({ ...prev, isOpen: open }))
        }
        type={transactionDialog.type}
        item={transactionDialog.item}
        onSuccess={handleTransactionSuccess}
      />
    </Card>
  );
}
