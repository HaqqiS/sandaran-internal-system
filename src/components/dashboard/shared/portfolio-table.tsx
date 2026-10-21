"use client";

import { IconArrowRight, IconCalendar } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { DataGrid, type DataGridCsvColumn } from "~/components/ui/data-grid";
import { formatWitaDate } from "~/lib/time-utils";
import { cn, formatIDR } from "~/lib/utils";
import { TimelineProgress } from "./timeline-progress";

export interface PortfolioItem {
  id: string;
  name: string;
  slug: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  elapsedPercent: number | null;
  latestReport: {
    id: string;
    slug: string;
    reportDate: Date | string;
    progressPercent: number;
    totalWorkers: number;
  } | null;
  hasProgressAnomaly: boolean;
  hasReportedToday: boolean;
  todayWorkers: number;
  emergencyBalance: number;
  unreviewedWithdrawalsCount: number;
  staleDays: number | null;
}

interface PortfolioTableProps {
  projects: PortfolioItem[];
  className?: string;
}

function formatDateRange(
  start: Date | string | null,
  end: Date | string | null,
) {
  if (!start && !end) return "Jadwal belum diatur";
  if (start && !end) {
    return `Mulai ${formatWitaDate(start, { shortMonth: true })}`;
  }
  if (!start && end) {
    return `Target ${formatWitaDate(end, { shortMonth: true })}`;
  }
  if (start && end) {
    return `${formatWitaDate(start, { shortMonth: true })} – ${formatWitaDate(end, { shortMonth: true })}`;
  }
  return "Jadwal belum diatur";
}

export function PortfolioTable({ projects, className }: PortfolioTableProps) {
  const router = useRouter();

  const columns = useMemo<ColumnDef<PortfolioItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Proyek & Periode",
        cell: ({ row }) => {
          const project = row.original;
          return (
            <div className="space-y-1 py-0.5 min-w-[200px]">
              <Link
                href={`/projects/${project.slug}`}
                className="text-sm font-semibold text-foreground line-clamp-1 hover:underline"
              >
                {project.name}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconCalendar className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {formatDateRange(project.startDate, project.endDate)}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: "progress",
        header: "Waktu vs Progres Kumulatif",
        accessorFn: (row) => row.latestReport?.progressPercent ?? -1,
        cell: ({ row }) => {
          const project = row.original;
          const hasReport = project.latestReport !== null;
          const dateLabel = project.hasReportedToday
            ? "Hari Ini"
            : project.staleDays !== null
              ? `${project.staleDays} hr lalu`
              : undefined;

          if (!hasReport) {
            return (
              <div className="space-y-1 min-w-[220px]">
                <span className="text-xs text-status-attention font-medium">
                  Belum ada laporan
                </span>
                {project.elapsedPercent !== null && (
                  <p className="text-[11px] text-muted-foreground">
                    Waktu kalender: {project.elapsedPercent}%
                  </p>
                )}
              </div>
            );
          }

          return (
            <div className="min-w-[220px]">
              <TimelineProgress
                elapsedPercent={project.elapsedPercent}
                progressPercent={project.latestReport?.progressPercent ?? null}
                hasAnomaly={project.hasProgressAnomaly}
                reportDateLabel={dateLabel}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "todayWorkers",
        header: "Pekerja Hari Ini",
        cell: ({ row }) => {
          const count = row.original.todayWorkers;
          if (count > 0) {
            return (
              <div className="space-y-0.5 text-center min-w-[100px]">
                <span className="text-sm font-bold text-foreground">
                  {count}
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Orang
                </span>
              </div>
            );
          }
          return (
            <div className="text-center min-w-[100px]">
              <span className="text-xs text-muted-foreground">-</span>
            </div>
          );
        },
      },
      {
        accessorKey: "emergencyBalance",
        header: "Saldo Kas Darurat",
        cell: ({ row }) => {
          const project = row.original;
          return (
            <div className="space-y-0.5 text-right min-w-[140px]">
              <span className="text-sm font-semibold text-foreground">
                {formatIDR(project.emergencyBalance)}
              </span>
              {project.unreviewedWithdrawalsCount > 0 && (
                <div className="flex justify-end">
                  <Badge
                    variant="outline"
                    className="border-status-warning bg-status-warning-bg text-status-warning text-[10px] px-1 py-0 font-medium"
                  >
                    {project.unreviewedWithdrawalsCount} pending
                  </Badge>
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Aksi",
        enableSorting: false,
        cell: ({ row }) => {
          const project = row.original;
          return (
            <div className="flex items-center justify-center">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title={`Detail portofolio ${project.name}`}
              >
                <Link href={`/projects/${project.slug}`}>
                  <IconArrowRight className="h-4 w-4 text-muted-foreground group-hover/row:text-foreground transition-colors" />
                  <span className="sr-only">Buka portofolio</span>
                </Link>
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const csvColumns = useMemo<DataGridCsvColumn<PortfolioItem>[]>(
    () => [
      { header: "Nama Proyek", accessor: (p) => p.name },
      {
        header: "Periode Mulai",
        accessor: (p) =>
          p.startDate ? formatWitaDate(p.startDate, { shortMonth: true }) : "-",
      },
      {
        header: "Target Selesai",
        accessor: (p) =>
          p.endDate ? formatWitaDate(p.endDate, { shortMonth: true }) : "-",
      },
      {
        header: "Waktu Kalender (%)",
        accessor: (p) => p.elapsedPercent ?? "-",
      },
      {
        header: "Progres Kumulatif (%)",
        accessor: (p) => p.latestReport?.progressPercent ?? "-",
      },
      { header: "Pekerja Hari Ini", accessor: (p) => p.todayWorkers },
      {
        header: "Saldo Kas Darurat (IDR)",
        accessor: (p) => p.emergencyBalance,
      },
      {
        header: "Penarikan Pending",
        accessor: (p) => p.unreviewedWithdrawalsCount,
      },
    ],
    [],
  );

  if (projects.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <p className="text-sm text-muted-foreground">
          Belum ada proyek aktif dalam portofolio eksekutif.
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="p-4 md:p-5 border-b flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight">
            Portofolio Proyek
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Komparasi progres riil pekerjaan terhadap waktu kalender, tenaga
            kerja hari ini, dan kas darurat.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {projects.length} Proyek Aktif
        </Badge>
      </CardHeader>

      {/* Desktop / Tablet DataGrid View (>= 768px) */}
      <div className="hidden md:block px-4 md:px-5">
        <DataGrid
          columns={columns}
          data={projects}
          filterColumn="name"
          filterPlaceholder="Cari nama proyek..."
          initialColumnPinning={{
            left: ["name"],
            right: ["actions"],
          }}
          onRowClick={(project) => router.push(`/projects/${project.slug}`)}
          exportFilename="portofolio-proyek"
          csvColumns={csvColumns}
          defaultDensity="normal"
          emptyMessage="Tidak ada proyek yang sesuai dengan pencarian."
        />
      </div>

      {/* Mobile Card List View (< 768px) */}
      <div className="md:hidden divide-y divide-border">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-4 space-y-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/projects/${project.slug}`}
                  className="text-sm font-semibold text-foreground hover:underline focus:outline-none"
                >
                  {project.name}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDateRange(project.startDate, project.endDate)}
                </p>
              </div>

              {project.todayWorkers > 0 && (
                <Badge
                  variant="outline"
                  className="text-[11px] shrink-0 font-semibold"
                >
                  {project.todayWorkers} Pekerja
                </Badge>
              )}
            </div>

            <div className="pt-1">
              <TimelineProgress
                elapsedPercent={project.elapsedPercent}
                progressPercent={project.latestReport?.progressPercent ?? null}
                hasAnomaly={project.hasProgressAnomaly}
                reportDateLabel={
                  project.hasReportedToday
                    ? "Hari ini"
                    : project.staleDays !== null
                      ? `${project.staleDays} hr lalu`
                      : undefined
                }
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Kas Darurat:</span>
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <span>{formatIDR(project.emergencyBalance)}</span>
                {project.unreviewedWithdrawalsCount > 0 && (
                  <Badge
                    variant="outline"
                    className="border-status-warning bg-status-warning-bg text-status-warning text-[10px] px-1 py-0"
                  >
                    {project.unreviewedWithdrawalsCount} pending
                  </Badge>
                )}
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full min-h-11 justify-between text-xs font-medium"
            >
              <Link href={`/projects/${project.slug}`}>
                Detail Portofolio
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
