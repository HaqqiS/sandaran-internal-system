"use client";

import { IconLoader2, IconPlus } from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import { useReportsByProject } from "~/hooks";
import { ReportCard } from "./report-card";

interface ReportListProps {
  projectId: string;
  projectSlug: string;
  onCreateClick?: () => void;
  canCreate?: boolean;
}

export function ReportList({
  projectId,
  projectSlug,
  onCreateClick,
  canCreate = false,
}: ReportListProps) {
  const { data, isLoading, error } = useReportsByProject(projectId);

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

  const reports = data?.reports ?? [];

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
      {/* Header with Create button */}
      {canCreate && onCreateClick && (
        <div className="flex items-center justify-end">
          <Button onClick={onCreateClick}>
            <IconPlus className="mr-2 h-4 w-4" />
            Laporan Baru
          </Button>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            projectSlug={projectSlug}
          />
        ))}
      </div>

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
