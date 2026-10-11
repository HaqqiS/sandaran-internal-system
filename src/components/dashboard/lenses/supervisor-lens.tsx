"use client";

import {
  IconCalendarCheck,
  IconCash,
  IconChevronRight,
  IconMessageCircle,
  IconPlus,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { WithdrawDialog } from "~/components/emergency/withdraw-dialog";
import { ReportDialog } from "~/components/report/report-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatWitaDate } from "~/lib/time-utils";
import { cn, formatIDR } from "~/lib/utils";
import { MetricCard, StatsGrid } from "../shared";

interface SupervisorLensProps {
  data: {
    kpis: {
      pendingReportsToday: number;
      unreviewedWithdrawalsCount: number;
      weeklyCommentsCount: number;
    };
    projects: Array<{
      id: string;
      name: string;
      slug: string;
      hasReportedToday: boolean;
      emergencyBalance: number;
      latestReport?: {
        progressPercent: number;
        reportDate: Date | string;
      };
    }>;
    recentReports: Array<{
      id: string;
      slug: string;
      reportDate: Date | string;
      title: string;
      totalWorkers: number;
      projectName: string;
      projectSlug: string;
      thumbnailUrl?: string;
    }>;
  };
  onRefresh?: () => void;
}

export function SupervisorLens({ data, onRefresh }: SupervisorLensProps) {
  const [reportProjectId, setReportProjectId] = useState<string | null>(null);
  const [withdrawProject, setWithdrawProject] = useState<{
    id: string;
    slug: string;
  } | null>(null);

  const { kpis, projects, recentReports } = data;

  return (
    <div className="space-y-6">
      {/* 1. Baris Metrik KPI Supervisor */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 3 }}>
        <MetricCard
          label="Laporan Hari Ini"
          value={
            kpis.pendingReportsToday > 0
              ? `${kpis.pendingReportsToday} Belum Lapor`
              : "Semua Selesai"
          }
          caption={`dari ${projects.length} proyek Anda`}
          tone={kpis.pendingReportsToday > 0 ? "attention" : "default"}
          icon={IconCalendarCheck}
        />

        <MetricCard
          label="Penarikan Belum Ditinjau"
          value={`${kpis.unreviewedWithdrawalsCount} Pengajuan`}
          caption="Dana darurat diajukan oleh Anda"
          icon={IconCash}
        />

        <MetricCard
          label="Komentar (7 Hari)"
          value={`${kpis.weeklyCommentsCount} Komentar`}
          caption="Tanggapan tim pada laporan Anda"
          icon={IconMessageCircle}
        />
      </StatsGrid>

      {/* 2. Daftar Proyek Aktif Saya & Aksi Pelaporan */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Proyek Aktif yang Anda Awasi
          </h2>
          <span className="text-xs text-muted-foreground">
            {projects.length} Proyek
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-4 md:p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="font-semibold text-sm md:text-base hover:underline text-foreground"
                  >
                    {project.name}
                  </Link>

                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-2 py-0.5",
                      project.hasReportedToday
                        ? "border-status-success-border bg-status-success-bg text-status-success"
                        : "border-status-attention bg-status-attention-bg text-status-attention",
                    )}
                  >
                    {project.hasReportedToday
                      ? "Sudah lapor hari ini"
                      : "Belum lapor hari ini"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span>
                    Kas Darurat: {formatIDR(project.emergencyBalance)}
                  </span>
                  {project.latestReport ? (
                    <span>
                      Progres: {project.latestReport.progressPercent}%
                    </span>
                  ) : (
                    <span className="text-status-attention">
                      Belum ada progres
                    </span>
                  )}
                </div>
              </div>

              {/* Tombol Aksi Cepat */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11 text-xs justify-center active:scale-95 transition-transform"
                  onClick={() => setReportProjectId(project.id)}
                >
                  <IconPlus className="mr-1.5 h-3.5 w-3.5" />
                  Buat Laporan
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11 text-xs justify-center active:scale-95 transition-transform"
                  onClick={() =>
                    setWithdrawProject({ id: project.id, slug: project.slug })
                  }
                >
                  <IconCash className="mr-1.5 h-3.5 w-3.5" />
                  Tarik Kas
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. Laporan Harian Terakhir Dibuat oleh Pengguna */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 md:p-5 border-b pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Laporan Harian Terbaru Anda
          </CardTitle>
          <span className="text-xs text-muted-foreground">3 Terakhir</span>
        </CardHeader>

        <CardContent className="p-0">
          {recentReports.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Anda belum pernah membuat laporan harian pada proyek aktif.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/projects/${report.projectSlug}/reports/${report.slug}`}
                  className="flex items-center justify-between gap-3 p-3.5 hover:bg-muted/30 transition-colors focus-visible:outline-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {report.thumbnailUrl ? (
                      <div className="relative h-12 w-12 rounded overflow-hidden shrink-0 bg-muted">
                        <Image
                          src={report.thumbnailUrl}
                          alt={report.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted/60 flex items-center justify-center shrink-0 text-muted-foreground text-[10px]">
                        No foto
                      </div>
                    )}

                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {report.projectName} ·{" "}
                        {formatWitaDate(report.reportDate, {
                          shortMonth: true,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {report.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {report.totalWorkers} pekerja lapangan
                      </p>
                    </div>
                  </div>

                  <IconChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Integrasi Pelaporan & Penarikan */}
      {reportProjectId && (
        <ReportDialog
          projectId={reportProjectId}
          open={!!reportProjectId}
          onOpenChange={(open) => {
            if (!open) {
              setReportProjectId(null);
              onRefresh?.();
            }
          }}
        />
      )}

      {withdrawProject && (
        <WithdrawDialog
          projectId={withdrawProject.id}
          projectSlug={withdrawProject.slug}
          open={!!withdrawProject}
          onOpenChange={(open) => {
            if (!open) {
              setWithdrawProject(null);
              onRefresh?.();
            }
          }}
        />
      )}
    </div>
  );
}
