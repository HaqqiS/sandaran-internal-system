"use client";

import {
  IconChevronRight,
  IconFileText,
  IconLoader2,
  IconPlus,
  IconReportAnalytics,
} from "@tabler/icons-react";
import Link from "next/link";
import { ReportCard } from "~/components/report/report-card";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useReportsByProject } from "~/hooks";

interface RecentReportsSectionProps {
  projectId: string;
  projectSlug: string;
  canCreate?: boolean;
  onCreate?: () => void;
}

export function RecentReportsSection({
  projectId,
  projectSlug,
  canCreate = false,
  onCreate,
}: RecentReportsSectionProps) {
  const { data, isLoading, error } = useReportsByProject(projectId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Laporan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center">
            <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Laporan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Gagal memuat laporan
          </p>
        </CardContent>
      </Card>
    );
  }

  const reports = data?.reports ?? [];
  const recentReports = reports.slice(0, 3); // Get only 3 most recent
  const totalCount = reports.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <IconReportAnalytics className="h-4 w-4 text-foreground" />
          <CardTitle className="text-base font-semibold">
            Laporan Terbaru
          </CardTitle>
          <span className="text-sm text-muted-foreground">({totalCount})</span>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <Button size="sm" onClick={onCreate}>
              <IconPlus className="mr-2 h-4 w-4" />
              Buat Laporan
            </Button>
          )}
          <Link href={`/projects/${projectSlug}/reports`}>
            <Button variant="ghost" size="sm" className="gap-1">
              Lihat Semua
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {recentReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <IconFileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Belum ada laporan</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                projectSlug={projectSlug}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
