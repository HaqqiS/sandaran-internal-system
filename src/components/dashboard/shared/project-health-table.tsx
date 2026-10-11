"use client";

import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProjectStatusBadge } from "~/components/shared/status-badge";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
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

      {/* Desktop / Tablet View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-xs">Proyek</TableHead>
              <TableHead className="font-semibold text-xs">Status</TableHead>
              <TableHead className="font-semibold text-xs">
                Tim (S A K L)
              </TableHead>
              <TableHead className="font-semibold text-xs">
                Laporan Terakhir
              </TableHead>
              <TableHead className="font-semibold text-xs text-center">
                Stok Minus
              </TableHead>
              <TableHead className="font-semibold text-xs text-center">
                Kas Belum Ditinjau
              </TableHead>
              <TableHead className="font-semibold text-xs text-right">
                Dokumen
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const isStale =
                project.staleDays !== null && project.staleDays >= 2;
              const hasNegative = project.negativeStockCount > 0;
              const hasUnreviewed = project.unreviewedEmergencyCount > 0;

              return (
                <TableRow
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.slug}`)}
                  className="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted/50"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/projects/${project.slug}`);
                    }
                  }}
                  role="link"
                  aria-label={`Buka detail proyek ${project.name}`}
                >
                  <TableCell className="font-medium">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">
                        {project.name}
                      </p>
                      {project.latestReport && (
                        <p className="text-xs text-muted-foreground">
                          Progres: {project.latestReport.progressPercent}% ·{" "}
                          {project.latestReport.totalWorkers} pekerja
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <ProjectStatusBadge
                      status={project.status}
                      className="text-[11px]"
                    />
                  </TableCell>

                  <TableCell>
                    <RoleCoverage coverage={project.coverage} />
                  </TableCell>

                  <TableCell>
                    {project.latestReport ? (
                      <div className="space-y-0.5">
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
                    ) : (
                      <span className="text-xs text-status-attention font-medium">
                        Belum ada laporan
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    {hasNegative ? (
                      <Badge
                        variant="outline"
                        className="border-status-attention bg-status-attention-bg text-status-attention text-xs font-semibold px-2 py-0.5"
                      >
                        {project.negativeStockCount} item
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    {hasUnreviewed ? (
                      <Badge
                        variant="outline"
                        className="border-status-warning bg-status-warning-bg text-status-warning text-xs font-semibold px-2 py-0.5"
                      >
                        {project.unreviewedEmergencyCount}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right text-xs font-medium">
                    {project.documentCount}
                  </TableCell>

                  <TableCell>
                    <IconArrowRight className="h-4 w-4 text-muted-foreground/50" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
