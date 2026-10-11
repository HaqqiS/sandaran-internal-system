"use client";

import { IconArrowRight, IconCalendar } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function PortfolioTable({ projects, className }: PortfolioTableProps) {
  const router = useRouter();

  const formatDateRange = (
    start: Date | string | null,
    end: Date | string | null,
  ) => {
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
  };

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

      {/* Desktop / Tablet Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-xs min-w-[200px]">
                Proyek & Periode
              </TableHead>
              <TableHead className="font-semibold text-xs min-w-[220px]">
                Waktu vs Progres Kumulatif
              </TableHead>
              <TableHead className="font-semibold text-xs text-center min-w-[120px]">
                Pekerja Hari Ini
              </TableHead>
              <TableHead className="font-semibold text-xs text-right min-w-[150px]">
                Saldo Kas Darurat
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const hasReport = project.latestReport !== null;
              const dateLabel = project.hasReportedToday
                ? "Hari Ini"
                : project.staleDays !== null
                  ? `${project.staleDays} hr lalu`
                  : undefined;

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
                  aria-label={`Buka detail portofolio ${project.name}`}
                >
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <IconCalendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {formatDateRange(project.startDate, project.endDate)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {hasReport ? (
                      <TimelineProgress
                        elapsedPercent={project.elapsedPercent}
                        progressPercent={
                          project.latestReport?.progressPercent ?? null
                        }
                        hasAnomaly={project.hasProgressAnomaly}
                        reportDateLabel={dateLabel}
                      />
                    ) : (
                      <div className="space-y-1">
                        <span className="text-xs text-status-attention font-medium">
                          Belum ada laporan
                        </span>
                        {project.elapsedPercent !== null && (
                          <p className="text-[11px] text-muted-foreground">
                            Waktu kalender: {project.elapsedPercent}%
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-center font-medium">
                    {project.todayWorkers > 0 ? (
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-foreground">
                          {project.todayWorkers}
                        </span>
                        <span className="text-[11px] text-muted-foreground block">
                          Orang
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="space-y-0.5">
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
