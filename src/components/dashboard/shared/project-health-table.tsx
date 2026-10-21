"use client";

import { IconArrowRight } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ProjectStatusBadge } from "~/components/shared/status-badge";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { DataGrid, type DataGridCsvColumn } from "~/components/ui/data-grid";
import { formatWitaDate } from "~/lib/time-utils";
import { cn } from "~/lib/utils";
import { RoleCoverage, type RoleCoverageData } from "./role-coverage";

export interface ProjectHealthItem {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "PAUSED" | "DONE";
  coverage: RoleCoverageData;
  latestReport: {
    id: string;
    slug: string;
    reportDate: Date | string;
    progressPercent: number;
    totalWorkers: number;
  } | null;
  staleDays: number | null;
  hasReportedToday: boolean;
  unreviewedEmergencyCount: number;
  negativeStockCount: number;
  documentCount: number;
}

interface ProjectHealthTableProps {
  projects: ProjectHealthItem[];
  className?: string;
}

export function ProjectHealthTable({
  projects,
  className,
}: ProjectHealthTableProps) {
  const router = useRouter();

  const columns = useMemo<ColumnDef<ProjectHealthItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Proyek",
        cell: ({ row }) => {
          const project = row.original;
          return (
            <div className="space-y-0.5 py-0.5 min-w-[180px]">
              <Link
                href={`/projects/${project.slug}`}
                className="text-sm font-semibold text-foreground line-clamp-1 hover:underline"
              >
                {project.name}
              </Link>
              {project.latestReport && (
                <p className="text-xs text-muted-foreground">
                  Progres: {project.latestReport.progressPercent}% ·{" "}
                  {project.latestReport.totalWorkers} pekerja
                </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="min-w-[90px]">
            <ProjectStatusBadge
              status={row.original.status}
              className="text-[11px]"
            />
          </div>
        ),
      },
      {
        id: "coverage",
        header: "Tim (S A K L)",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-[130px]">
            <RoleCoverage coverage={row.original.coverage} />
          </div>
        ),
      },
      {
        id: "latestReport",
        header: "Laporan Terakhir",
        accessorFn: (row) =>
          row.hasReportedToday
            ? 9999999999999
            : row.latestReport
              ? new Date(row.latestReport.reportDate).getTime()
              : 0,
        cell: ({ row }) => {
          const project = row.original;
          const isStale = project.staleDays !== null && project.staleDays >= 2;

          if (!project.latestReport) {
            return (
              <span className="text-xs text-status-attention font-medium">
                Belum ada laporan
              </span>
            );
          }

          return (
            <div className="space-y-0.5 min-w-[130px]">
              <div className="flex items-center gap-1.5">
                {project.hasReportedToday ? (
                  <Badge
                    variant="outline"
                    className="border-status-success-border bg-status-success-bg text-status-success text-[10px] px-1.5 py-0"
                  >
                    Hari Ini
                  </Badge>
                ) : isStale ? (
                  <Badge
                    variant="outline"
                    className="border-status-attention bg-status-attention-bg text-status-attention text-[10px] px-1.5 py-0"
                  >
                    {project.staleDays} hari lalu
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {project.staleDays} hari lalu
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground/80">
                {formatWitaDate(project.latestReport.reportDate, {
                  shortMonth: true,
                })}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "negativeStockCount",
        header: "Stok Minus",
        cell: ({ row }) => {
          const count = row.original.negativeStockCount;
          return (
            <div className="text-center min-w-[90px]">
              {count > 0 ? (
                <Badge
                  variant="outline"
                  className="border-status-attention bg-status-attention-bg text-status-attention text-xs font-semibold px-2 py-0.5"
                >
                  {count} item
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "unreviewedEmergencyCount",
        header: "Kas Belum Ditinjau",
        cell: ({ row }) => {
          const count = row.original.unreviewedEmergencyCount;
          return (
            <div className="text-center min-w-[120px]">
              {count > 0 ? (
                <Badge
                  variant="outline"
                  className="border-status-warning bg-status-warning-bg text-status-warning text-xs font-semibold px-2 py-0.5"
                >
                  {count}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "documentCount",
        header: "Dokumen",
        cell: ({ row }) => (
          <div className="text-right text-xs font-medium min-w-[80px]">
            {row.original.documentCount}
          </div>
        ),
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
                title={`Detail proyek ${project.name}`}
              >
                <Link href={`/projects/${project.slug}`}>
                  <IconArrowRight className="h-4 w-4 text-muted-foreground group-hover/row:text-foreground transition-colors" />
                  <span className="sr-only">Buka proyek</span>
                </Link>
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const csvColumns = useMemo<DataGridCsvColumn<ProjectHealthItem>[]>(
    () => [
      { header: "Nama Proyek", accessor: (p) => p.name },
      { header: "Status", accessor: (p) => p.status },
      {
        header: "Progres (%)",
        accessor: (p) => p.latestReport?.progressPercent ?? "-",
      },
      {
        header: "Pekerja Terakhir",
        accessor: (p) => p.latestReport?.totalWorkers ?? 0,
      },
      {
        header: "Status Pelaporan",
        accessor: (p) =>
          p.hasReportedToday
            ? "Hari Ini"
            : p.staleDays !== null
              ? `${p.staleDays} hari lalu`
              : "Belum ada laporan",
      },
      { header: "Stok Minus (Item)", accessor: (p) => p.negativeStockCount },
      {
        header: "Kas Belum Ditinjau",
        accessor: (p) => p.unreviewedEmergencyCount,
      },
      { header: "Total Dokumen", accessor: (p) => p.documentCount },
    ],
    [],
  );

  if (projects.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <p className="text-sm text-muted-foreground">
          Belum ada proyek aktif dalam sistem.
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="p-4 md:p-5 border-b flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight">
            Kesehatan Proyek
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitoring kelengkapan tim, keaktifan pelaporan harian, anomali
            stok, dan dokumen.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {projects.length} Proyek
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
          exportFilename="kesehatan-proyek"
          csvColumns={csvColumns}
          defaultDensity="normal"
          emptyMessage="Tidak ada proyek yang sesuai dengan pencarian."
        />
      </div>

      {/* Mobile Card List View (< 768px) */}
      <div className="md:hidden divide-y divide-border">
        {projects.map((project) => {
          const isStale = project.staleDays !== null && project.staleDays >= 2;
          const hasNegative = project.negativeStockCount > 0;
          const hasUnreviewed = project.unreviewedEmergencyCount > 0;

          return (
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
                  {project.latestReport && (
                    <p className="text-xs text-muted-foreground">
                      Progres: {project.latestReport.progressPercent}% ·{" "}
                      {project.latestReport.totalWorkers} pekerja
                    </p>
                  )}
                </div>
                <ProjectStatusBadge
                  status={project.status}
                  className="text-[10px]"
                />
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-y border-border/50">
                <span className="text-muted-foreground">Cakupan Tim:</span>
                <RoleCoverage coverage={project.coverage} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Laporan:
                  </span>
                  {project.hasReportedToday ? (
                    <span className="text-status-success font-medium">
                      Sudah lapor hari ini
                    </span>
                  ) : project.latestReport ? (
                    <span
                      className={cn(
                        "font-medium",
                        isStale ? "text-status-attention" : "text-foreground",
                      )}
                    >
                      {project.staleDays} hari lalu
                    </span>
                  ) : (
                    <span className="text-status-attention font-medium">
                      Belum lapor
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-muted-foreground block text-[11px]">
                    Dokumen:
                  </span>
                  <span className="font-medium text-foreground">
                    {project.documentCount} file
                  </span>
                </div>
              </div>

              {(hasNegative || hasUnreviewed) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {hasNegative && (
                    <Badge
                      variant="outline"
                      className="border-status-attention bg-status-attention-bg text-status-attention text-[11px]"
                    >
                      ⚠️ {project.negativeStockCount} Stok Minus
                    </Badge>
                  )}
                  {hasUnreviewed && (
                    <Badge
                      variant="outline"
                      className="border-status-warning bg-status-warning-bg text-status-warning text-[11px]"
                    >
                      {project.unreviewedEmergencyCount} Kas Belum Ditinjau
                    </Badge>
                  )}
                </div>
              )}

              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full min-h-11 justify-between text-xs font-medium"
              >
                <Link href={`/projects/${project.slug}`}>
                  Detail Proyek
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
