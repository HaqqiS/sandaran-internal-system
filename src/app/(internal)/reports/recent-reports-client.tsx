"use client";

import { IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";
import { PageLayout } from "~/components/layout";
import { ReportCard } from "~/components/report/report-card";
import { Button } from "~/components/ui/button";
import { useRecentReportsByProject } from "~/hooks";
export function RecentReportsClient() {
  const { data: projects, isLoading, error } = useRecentReportsByProject();

  if (isLoading) {
    return (
      <PageLayout title="Laporan Terbaru">
        <div className="flex h-full items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Laporan Terbaru">
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-semibold text-destructive">
            Gagal memuat laporan
          </h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Laporan Terbaru">
      <div className="flex flex-col gap-8 p-4 md:p-6">
        {projects?.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">Belum ada proyek.</p>
          </div>
        ) : (
          projects?.map((project) => (
            <section key={project.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">
                  {project.name}
                </h2>
                <Button variant="link" asChild>
                  <Link href={`/projects/${project.slug}/reports`}>
                    Lihat Semua
                  </Link>
                </Button>
              </div>

              {project.reports.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Belum ada laporan terbaru.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {project.reports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      projectSlug={project.slug}
                    />
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </div>
    </PageLayout>
  );
}
