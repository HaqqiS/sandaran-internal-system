"use client";

import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconBox,
  IconBuildingSkyscraper,
  IconClipboardList,
  IconPackages,
  IconPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { LogisticItemDialog } from "~/components/logistic/item-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatWitaDate } from "~/lib/time-utils";
import { cn } from "~/lib/utils";
import { MetricCard, StatsGrid } from "../shared";

interface LogisticLensProps {
  data: {
    kpis: {
      negativeStockItemCount: number;
      weeklyMutationCount: number;
      assignedProjectsCount: number;
      totalItemsCount: number;
    };
    negativeStockItems: Array<{
      id: string;
      name: string;
      unit: string;
      projectId: string;
      projectName: string;
      projectSlug: string;
      currentStock: number;
      lastMutationAt: Date | string | null;
    }>;
    projectInventory: Array<{
      projectId: string;
      projectName: string;
      projectSlug: string;
      itemCount: number;
      negativeStockCount: number;
      lastActivityAt?: Date | string | null;
    }>;
    recentTransactions: Array<{
      id: string;
      type: "IN" | "OUT";
      quantity: number;
      unit: string;
      itemName: string;
      projectId: string;
      projectName: string;
      projectSlug: string;
      operatorName: string;
      notes?: string;
      createdAt: Date | string;
    }>;
  };
  onRefresh?: () => void;
}

export function LogisticLens({ data, onRefresh }: LogisticLensProps) {
  const [createItemProjectId, setCreateItemProjectId] = useState<string | null>(
    null,
  );

  const { kpis, negativeStockItems, projectInventory, recentTransactions } =
    data;

  return (
    <div className="space-y-6">
      {/* 1. Baris Kartu Metrik KPI Logistik */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 4 }}>
        <MetricCard
          label="Item Stok Minus"
          value={
            kpis.negativeStockItemCount > 0
              ? `${kpis.negativeStockItemCount} Item`
              : "0 Item"
          }
          caption="Σ IN − Σ OUT < 0"
          tone={kpis.negativeStockItemCount > 0 ? "attention" : "default"}
          icon={IconAlertTriangle}
        />

        <MetricCard
          label="Mutasi 7 Hari"
          value={`${kpis.weeklyMutationCount} Transaksi`}
          caption="Pergerakan masuk & keluar sepekan"
          icon={IconClipboardList}
        />

        <MetricCard
          label="Proyek Dikelola"
          value={`${kpis.assignedProjectsCount} Proyek`}
          caption="Status penugasan aktif"
          icon={IconBuildingSkyscraper}
        />

        <MetricCard
          label="Total Barang"
          value={`${kpis.totalItemsCount} Master`}
          caption="Katalog material di proyek Anda"
          icon={IconPackages}
        />
      </StatsGrid>

      {/* 2. Banner Peringatan Stok Minus (Muncul jika ada item minus) */}
      {negativeStockItems.length > 0 && (
        <Card className="border-status-attention/60 bg-status-attention-bg/30 overflow-hidden">
          <CardHeader className="p-4 md:p-5 pb-3 border-b border-status-attention/20 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <IconAlertTriangle className="h-5 w-5 text-status-attention shrink-0" />
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Perhatian: Item Material Bersaldo Minus
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Terjadi selisih pencatatan di mana pengeluaran barang melebihi
                  stok tercatat di gudang.
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-status-attention bg-status-attention-bg text-status-attention text-xs font-bold"
            >
              {negativeStockItems.length} Item Minus
            </Badge>
          </CardHeader>

          <CardContent className="p-3 md:p-4 divide-y divide-status-attention/20">
            {negativeStockItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {item.projectName}: {item.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-status-attention bg-status-attention-bg text-status-attention text-[11px] font-bold px-1.5 py-0"
                    >
                      Saldo: {item.currentStock} {item.unit}
                    </Badge>
                  </div>
                  {item.lastMutationAt && (
                    <p className="text-[11px] text-muted-foreground">
                      Mutasi terakhir:{" "}
                      {formatWitaDate(item.lastMutationAt, {
                        shortMonth: true,
                      })}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    size="sm"
                    className="min-h-11 md:min-h-9 text-xs px-3 active:scale-95 transition-transform"
                    asChild
                  >
                    <Link href={`/projects/${item.projectSlug}/logistics`}>
                      <IconPlus className="mr-1 h-3.5 w-3.5" />
                      Restock di Gudang
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-11 md:min-h-9 text-xs px-3 active:scale-95 transition-transform"
                    asChild
                  >
                    <Link href={`/projects/${item.projectSlug}/logistics`}>
                      Detail Proyek
                      <IconArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 3. Inventaris per Proyek */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Inventaris per Proyek
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {projectInventory.map((proj) => {
            const hasNegative = proj.negativeStockCount > 0;

            return (
              <Card
                key={proj.projectId}
                className="p-4 md:p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/projects/${proj.projectSlug}/logistics`}
                        className="font-semibold text-sm hover:underline text-foreground"
                      >
                        {proj.projectName}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {proj.itemCount} item material terdaftar
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-0.5 font-medium",
                        hasNegative
                          ? "border-status-attention bg-status-attention-bg text-status-attention"
                          : "border-status-success-border bg-status-success-bg text-status-success",
                      )}
                    >
                      {hasNegative
                        ? `⚠️ ${proj.negativeStockCount} minus`
                        : "Stok aman"}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    {proj.lastActivityAt
                      ? `Aktivitas mutasi terakhir: ${formatWitaDate(proj.lastActivityAt, { shortMonth: true })}`
                      : "Belum ada aktivitas mutasi"}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-11 md:min-h-8 text-xs px-3 active:scale-95 transition-transform"
                    onClick={() => setCreateItemProjectId(proj.projectId)}
                  >
                    <IconBox className="mr-1.5 h-3.5 w-3.5" />
                    Tambah Barang
                  </Button>

                  <Button
                    size="sm"
                    variant="default"
                    className="min-h-11 md:min-h-8 text-xs px-3 active:scale-95 transition-transform"
                    asChild
                  >
                    <Link href={`/projects/${proj.projectSlug}/logistics`}>
                      Buka Modul Logistik
                      <IconArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4. Riwayat Mutasi Terbaru */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 md:p-5 border-b pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight">
              Riwayat Mutasi Terbaru
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              5 Transaksi mutasi terakhir pada proyek yang Anda kelola
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {recentTransactions.length} Transaksi
          </Badge>
        </CardHeader>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Waktu</TableHead>
                <TableHead className="text-xs">Proyek</TableHead>
                <TableHead className="text-xs">Barang</TableHead>
                <TableHead className="text-xs text-center">Tipe</TableHead>
                <TableHead className="text-xs text-right">Kuantitas</TableHead>
                <TableHead className="text-xs">Oleh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-xs py-6 text-muted-foreground"
                  >
                    Belum ada transaksi mutasi yang tercatat.
                  </TableCell>
                </TableRow>
              ) : (
                recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatWitaDate(tx.createdAt, {
                        includeTime: true,
                        shortMonth: true,
                      })}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-foreground">
                      {tx.projectName}
                    </TableCell>
                    <TableCell className="text-xs text-foreground">
                      {tx.itemName}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 font-bold",
                          tx.type === "IN"
                            ? "border-status-success-border bg-status-success-bg text-status-success"
                            : "border-status-attention bg-status-attention-bg text-status-attention",
                        )}
                      >
                        {tx.type === "IN" ? (
                          <span className="inline-flex items-center">
                            <IconArrowUp className="mr-0.5 h-3 w-3" /> MASUK
                          </span>
                        ) : (
                          <span className="inline-flex items-center">
                            <IconArrowDown className="mr-0.5 h-3 w-3" /> KELUAR
                          </span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right font-bold text-foreground">
                      {tx.type === "IN" ? `+${tx.quantity}` : `-${tx.quantity}`}{" "}
                      {tx.unit}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {tx.operatorName}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-border">
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3.5 space-y-1.5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  {tx.projectName}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatWitaDate(tx.createdAt, {
                    includeTime: true,
                    shortMonth: true,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground">{tx.itemName}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0 font-bold",
                    tx.type === "IN"
                      ? "border-status-success-border bg-status-success-bg text-status-success"
                      : "border-status-attention bg-status-attention-bg text-status-attention",
                  )}
                >
                  {tx.type === "IN" ? `+${tx.quantity}` : `-${tx.quantity}`}{" "}
                  {tx.unit}
                </Badge>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Diinput oleh: {tx.operatorName}
                {tx.notes && ` · "${tx.notes}"`}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal Dialog Master Barang Baru */}
      {createItemProjectId && (
        <LogisticItemDialog
          projectId={createItemProjectId}
          open={!!createItemProjectId}
          onOpenChange={(open) => {
            if (!open) {
              setCreateItemProjectId(null);
            }
          }}
          onSuccess={() => {
            setCreateItemProjectId(null);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
}
