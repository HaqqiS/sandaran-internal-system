"use client";

import {
  IconAlertTriangle,
  IconCash,
  IconCheck,
  IconCircleCheck,
  IconPackages,
  IconPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { DepositDialog } from "~/components/emergency/deposit-dialog";
import { VerifyDialog } from "~/components/emergency/verify-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatWitaDate } from "~/lib/time-utils";
import { cn, formatIDR } from "~/lib/utils";
import { MetricCard, StatsGrid } from "../shared";

interface FinanceLensProps {
  data: {
    kpis: {
      unreviewedCount: number;
      monthlyWithdrawalsAmount: number;
      negativeStockCount: number;
    };
    unreviewedQueue: Array<{
      id: string;
      projectId: string;
      projectName: string;
      amount: number;
      requesterName: string;
      description: string;
      hasReceipt: boolean;
      createdAt: Date | string;
    }>;
    projectFunds: Array<{
      projectId: string;
      projectName: string;
      projectSlug: string;
      currentBalance: number;
    }>;
  };
  onRefresh?: () => void;
}

export function FinanceLens({ data, onRefresh }: FinanceLensProps) {
  const [verifyItem, setVerifyItem] = useState<{
    projectId: string;
    transactionId: string;
  } | null>(null);

  const [depositProject, setDepositProject] = useState<{
    id: string;
    slug: string;
  } | null>(null);

  const { kpis, unreviewedQueue, projectFunds } = data;

  return (
    <div className="space-y-6">
      {/* 1. Baris Metrik KPI Keuangan */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 3 }}>
        <MetricCard
          label="Antrean Tinjauan"
          value={`${kpis.unreviewedCount} Pengajuan`}
          caption="Transaksi kas darurat menunggu"
          tone={kpis.unreviewedCount > 0 ? "attention" : "default"}
          icon={IconAlertTriangle}
        />

        <MetricCard
          label="Penarikan Bulan Ini"
          value={formatIDR(kpis.monthlyWithdrawalsAmount)}
          caption="Pengeluaran kas darurat bulan ini"
          icon={IconCash}
        />

        <MetricCard
          label="Item Stok Minus"
          value={`${kpis.negativeStockCount} Item`}
          caption="Material bersaldo minus di proyek Anda"
          tone={kpis.negativeStockCount > 0 ? "attention" : "default"}
          icon={IconPackages}
        />
      </StatsGrid>

      {/* 2. Antrean Tinjauan Kas Darurat */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 md:p-5 border-b pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight">
              Antrean Tinjauan Kas Darurat
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verifikasi pengeluaran darurat yang diajukan oleh pengawas
              lapangan
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-2 py-0.5",
              unreviewedQueue.length > 0
                ? "border-status-warning bg-status-warning-bg text-status-warning"
                : "text-muted-foreground",
            )}
          >
            {unreviewedQueue.length} Antrean
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {unreviewedQueue.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
              <IconCircleCheck className="h-6 w-6 text-status-success mx-auto opacity-80" />
              <p className="font-medium text-foreground">
                Semua transaksi telah ditinjau
              </p>
              <p>Tidak ada pengajuan kas darurat yang menggantung.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {unreviewedQueue.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {tx.projectName}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {formatIDR(tx.amount)}
                      </span>
                      {!tx.hasReceipt && (
                        <Badge
                          variant="outline"
                          className="border-status-attention bg-status-attention-bg text-status-attention text-[10px] px-1.5 py-0"
                        >
                          Tanpa Bukti
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {tx.description}
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      Diajukan oleh {tx.requesterName} ·{" "}
                      {formatWitaDate(tx.createdAt, { shortMonth: true })}
                    </p>
                  </div>

                  <div className="self-end sm:self-auto shrink-0">
                    <Button
                      size="sm"
                      className="min-h-11 md:min-h-9 text-xs px-3 active:scale-95 transition-transform"
                      onClick={() =>
                        setVerifyItem({
                          projectId: tx.projectId,
                          transactionId: tx.id,
                        })
                      }
                    >
                      <IconCheck className="mr-1.5 h-3.5 w-3.5" />
                      Tandai Ditinjau
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Saldo Kas Darurat per Proyek */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Posisi Saldo Kas Darurat per Proyek
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {projectFunds.map((fund) => (
            <Card
              key={fund.projectId}
              className="p-4 md:p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1">
                <Link
                  href={`/projects/${fund.projectSlug}/emergency`}
                  className="font-semibold text-sm hover:underline text-foreground"
                >
                  {fund.projectName}
                </Link>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {formatIDR(fund.currentBalance)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11 text-xs justify-center active:scale-95 transition-transform"
                  asChild
                >
                  <Link href={`/projects/${fund.projectSlug}/emergency`}>
                    Buka Kas
                  </Link>
                </Button>

                <Button
                  size="sm"
                  variant="default"
                  className="min-h-11 text-xs justify-center active:scale-95 transition-transform"
                  onClick={() =>
                    setDepositProject({
                      id: fund.projectId,
                      slug: fund.projectSlug,
                    })
                  }
                >
                  <IconPlus className="mr-1.5 h-3.5 w-3.5" />
                  Tambah Saldo
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog Verifikasi */}
      {verifyItem && (
        <VerifyDialog
          projectId={verifyItem.projectId}
          transactionId={verifyItem.transactionId}
          open={!!verifyItem}
          onOpenChange={(open) => {
            if (!open) {
              setVerifyItem(null);
              onRefresh?.();
            }
          }}
        />
      )}

      {/* Dialog Tambah Deposit */}
      {depositProject && (
        <DepositDialog
          projectId={depositProject.id}
          projectSlug={depositProject.slug}
          open={!!depositProject}
          onOpenChange={(open) => {
            if (!open) {
              setDepositProject(null);
              onRefresh?.();
            }
          }}
        />
      )}
    </div>
  );
}
