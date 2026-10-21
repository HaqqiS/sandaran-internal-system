"use client";

import {
  IconCalendar,
  IconCloud,
  IconLoader2,
  IconPhoto,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import {
  FilterBar,
  type FilterField,
  useDynamicFilters,
} from "~/components/ui/filters";
import { ItemGroup } from "~/components/ui/item";
import { useReportsByProject } from "~/hooks";
import { ReportCard } from "./report-card";
import { ReportListItem } from "./report-list-item";
import type { ReportItemData, ReportViewMode } from "./types";

const REPORT_FILTER_FIELDS: FilterField[] = [
  {
    id: "weather",
    label: "Cuaca",
    icon: IconCloud,
    options: [
      { label: "Cerah", value: "Cerah" },
      { label: "Mendung", value: "Mendung" },
      { label: "Hujan", value: "Hujan" },
      { label: "Hujan Deras", value: "Hujan Deras" },
    ],
  },
  {
    id: "dateRange",
    label: "Rentang Tanggal",
    icon: IconCalendar,
    options: [
      { label: "Hari Ini", value: "today" },
      { label: "7 Hari Terakhir", value: "week" },
      { label: "30 Hari Terakhir", value: "month" },
    ],
  },
  {
    id: "hasMedia",
    label: "Dokumentasi Foto",
    icon: IconPhoto,
    options: [
      { label: "Ada Foto", value: "yes" },
      { label: "Tanpa Foto", value: "no" },
    ],
  },
];

interface ReportListProps {
  projectId: string;
  projectSlug: string;
  viewMode?: ReportViewMode;
  onCreateClick?: () => void;
  canCreate?: boolean;
  canManageReport?: (report: ReportItemData) => boolean;
  onEditReport?: (report: ReportItemData) => void;
  onDeleteReport?: (report: ReportItemData) => void;
}

export function ReportList({
  projectId,
  projectSlug,
  viewMode = "grid",
  onCreateClick,
  canCreate = false,
  canManageReport,
  onEditReport,
  onDeleteReport,
}: ReportListProps) {
  const { data, isLoading, error } = useReportsByProject(projectId);
  const { activeFilters, addFilter, removeFilter, resetFilters } =
    useDynamicFilters();

  const reports = data?.reports ?? [];

  const filteredReports = useMemo(() => {
    if (activeFilters.length === 0) return reports;

    return reports.filter((report) => {
      // 1. Weather filter
      const weatherFilter = activeFilters.find((f) => f.field === "weather");
      if (
        weatherFilter &&
        report.weather?.toLowerCase() !==
          String(weatherFilter.value).toLowerCase()
      ) {
        return false;
      }

      // 2. Date range filter
      const dateFilter = activeFilters.find((f) => f.field === "dateRange");
      if (dateFilter) {
        const reportDate = new Date(report.reportDate);
        const now = new Date();
        if (dateFilter.value === "today") {
          if (
            reportDate.getDate() !== now.getDate() ||
            reportDate.getMonth() !== now.getMonth() ||
            reportDate.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        } else if (dateFilter.value === "week") {
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000,
          );
          if (reportDate < sevenDaysAgo) return false;
        } else if (dateFilter.value === "month") {
          const thirtyDaysAgo = new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000,
          );
          if (reportDate < thirtyDaysAgo) return false;
        }
      }

      // 3. Has media filter
      const mediaFilter = activeFilters.find((f) => f.field === "hasMedia");
      if (mediaFilter) {
        const hasMedia = Boolean(report.media && report.media.length > 0);
        if (mediaFilter.value === "yes" && !hasMedia) return false;
        if (mediaFilter.value === "no" && hasMedia) return false;
      }

      return true;
    });
  }, [reports, activeFilters]);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-muted-foreground">Gagal memuat laporan</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">Belum ada laporan</p>
        {canCreate && onCreateClick && (
          <Button onClick={onCreateClick}>
            <IconPlus className="mr-2 h-4 w-4" />
            Buat Laporan Pertama
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Dynamic Filter Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <FilterBar
          fields={REPORT_FILTER_FIELDS}
          activeFilters={activeFilters}
          onAddFilter={addFilter}
          onRemoveFilter={removeFilter}
          onResetFilters={resetFilters}
          triggerLabel="Filter Laporan"
        />

        {activeFilters.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Menampilkan{" "}
            <span className="font-semibold text-foreground">
              {filteredReports.length}
            </span>{" "}
            dari {reports.length} laporan
          </div>
        )}
      </div>

      {filteredReports.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Tidak ada laporan yang sesuai dengan filter yang aktif.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="gap-1.5"
          >
            <IconRefresh className="size-3.5" />
            <span>Reset Filter</span>
          </Button>
        </div>
      ) : viewMode === "list" ? (
        <ItemGroup className="gap-2.5">
          {filteredReports.map((report) => {
            const canManage = canManageReport ? canManageReport(report) : false;
            return (
              <ReportListItem
                key={report.id}
                report={report}
                projectSlug={projectSlug}
                onEdit={canManage ? onEditReport : undefined}
                onDelete={canManage ? onDeleteReport : undefined}
              />
            );
          })}
        </ItemGroup>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredReports.map((report) => {
            const canManage = canManageReport ? canManageReport(report) : false;
            return (
              <ReportCard
                key={report.id}
                report={report}
                projectSlug={projectSlug}
                onEdit={canManage ? onEditReport : undefined}
                onDelete={canManage ? onDeleteReport : undefined}
              />
            );
          })}
        </div>
      )}

      {/* Load More */}
      {data?.nextCursor && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" disabled>
            Muat Lebih Banyak
          </Button>
        </div>
      )}
    </div>
  );
}
