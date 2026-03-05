"use client";

import { IconCloudUpload, IconFileText } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { UploadDialog } from "~/components/document/upload-dialog";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useArchitectDashboard, useArchitectStats } from "~/hooks";
import { DashboardLayout } from "./shared/DashboardLayout";
import { StatsGrid } from "./shared/StatsGrid";
import { StatCard } from "./stat-card";

export function ArchitectView() {
  const { data: stats, isLoading: statsLoading } = useArchitectStats();
  const { data: dashboard, isLoading: dashboardLoading } =
    useArchitectDashboard();

  const [uploadProject, setUploadProject] = useState<{
    id: string;
    slug: string;
  } | null>(null);

  return (
    <DashboardLayout
      title="Dashboard Arsitek"
      description="Manajemen dokumen desain dan pengawasan proyek"
    >
      {/* Top Stats */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 2 }}>
        <StatCard
          title="Proyek Saya"
          value={stats?.projectCount ?? 0}
          icon={IconFileText}
          description="Proyek yang butuh dokumen desain"
          isLoading={statsLoading}
        />
        <StatCard
          title="Dokumen Diunggah"
          value={stats?.uploadedDocuments ?? 0}
          icon={IconCloudUpload}
          trend={{ value: "+2", label: "minggu ini", positive: true }}
          isLoading={statsLoading}
        />
      </StatsGrid>

      {/* Documents by Project */}
      <Card>
        <CardHeader>
          <CardTitle>Dokumen Saya</CardTitle>
          <CardDescription>
            Dokumen desain disusun berdasarkan proyek
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">Memuat dokumen...</p>
            </div>
          ) : !dashboard?.documentsByProject.length ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">
                Belum ada dokumen yang diunggah
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dashboard.documentsByProject.map((project) => (
                <div key={project.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{project.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {project.documentCount} dokumen
                      </p>
                    </div>
                    <IconFileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/projects/${project.slug}/documents`}>
                        Lihat Semua
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        setUploadProject({
                          id: project.id,
                          slug: project.slug,
                        })
                      }
                    >
                      Unggah
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      {uploadProject && (
        <UploadDialog
          projectId={uploadProject.id}
          projectSlug={uploadProject.slug}
          open={!!uploadProject}
          onOpenChange={(open) => !open && setUploadProject(null)}
          onSuccess={() => setUploadProject(null)}
        />
      )}
    </DashboardLayout>
  );
}
