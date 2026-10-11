"use client";

import {
  IconArrowRight,
  IconClock,
  IconFiles,
  IconPlus,
  IconUpload,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { UploadDialog } from "~/components/document/upload-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { formatWitaDate } from "~/lib/time-utils";
import { MetricCard, StatsGrid } from "../shared";

interface ArchitectLensProps {
  data: {
    kpis: {
      totalDocuments: number;
      myUploadsLast7Days: number;
    };
    projects: Array<{
      id: string;
      name: string;
      slug: string;
      totalDocs: number;
      byType: Record<string, number>;
      latestDoc?: {
        name: string;
        version: string;
        createdAt: Date | string;
      };
    }>;
  };
  onRefresh?: () => void;
}

export function ArchitectLens({ data, onRefresh }: ArchitectLensProps) {
  const [uploadProject, setUploadProject] = useState<{
    id: string;
    slug: string;
  } | null>(null);

  const { kpis, projects } = data;

  return (
    <div className="space-y-6">
      {/* 1. Baris Metrik KPI Arsitek */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 2 }}>
        <MetricCard
          label="Dokumen di Proyek Saya"
          value={`${kpis.totalDocuments} Berkas`}
          caption={`Arsip gambar & desain di ${projects.length} proyek aktif`}
          icon={IconFiles}
        />

        <MetricCard
          label="Saya Unggah (7 Hari)"
          value={`${kpis.myUploadsLast7Days} Berkas`}
          caption="Dokumen yang diunggah oleh Anda sepekan terakhir"
          icon={IconUpload}
        />
      </StatsGrid>

      {/* 2. Ringkasan Dokumen per Proyek Aktif */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Manajemen Gambar & Desain Proyek
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
                    href={`/projects/${project.slug}/documents`}
                    className="font-semibold text-sm md:text-base hover:underline text-foreground"
                  >
                    {project.name}
                  </Link>

                  <Badge variant="outline" className="text-xs">
                    {project.totalDocs} Berkas
                  </Badge>
                </div>

                {/* Kategori Berkas */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Object.entries(project.byType).length === 0 ? (
                    <span className="text-xs text-muted-foreground">
                      Belum ada dokumen terunggah
                    </span>
                  ) : (
                    Object.entries(project.byType).map(([type, count]) => (
                      <Badge
                        key={type}
                        variant="secondary"
                        className="text-[11px] font-medium"
                      >
                        {type}: {count}
                      </Badge>
                    ))
                  )}
                </div>

                {/* Dokumen Terkini */}
                {project.latestDoc && (
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate max-w-[200px]">
                        {project.latestDoc.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0"
                      >
                        {project.latestDoc.version}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <IconClock className="h-3 w-3" />
                      <span>
                        Diperbarui:{" "}
                        {formatWitaDate(project.latestDoc.createdAt, {
                          shortMonth: true,
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Aksi Cepat */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11 text-xs justify-center active:scale-95 transition-transform"
                  asChild
                >
                  <Link href={`/projects/${project.slug}/documents`}>
                    Buka Berkas
                    <IconArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>

                <Button
                  size="sm"
                  variant="default"
                  className="min-h-11 text-xs justify-center active:scale-95 transition-transform"
                  onClick={() =>
                    setUploadProject({ id: project.id, slug: project.slug })
                  }
                >
                  <IconPlus className="mr-1.5 h-3.5 w-3.5" />
                  Unggah Baru
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog Unggah Dokumen Terintegrasi */}
      {uploadProject && (
        <UploadDialog
          projectId={uploadProject.id}
          projectSlug={uploadProject.slug}
          open={!!uploadProject}
          onOpenChange={(open) => {
            if (!open) {
              setUploadProject(null);
              onRefresh?.();
            }
          }}
        />
      )}
    </div>
  );
}
