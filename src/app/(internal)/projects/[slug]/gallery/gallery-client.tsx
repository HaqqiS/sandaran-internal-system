"use client";

import {
  IconArrowLeft,
  IconCalendar,
  IconCloud,
  IconLoader2,
  IconPhoto,
  IconRefresh,
  IconUser,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import * as React from "react";
import { PageLayout } from "~/components/layout";
import {
  type GalleryMediaItem,
  ProjectGalleryTimeline,
} from "~/components/project/gallery";
import {
  MediaPreview,
  type MediaPreviewItem,
} from "~/components/shared/media-preview";
import { Button } from "~/components/ui/button";
import {
  FilterBar,
  type FilterField,
  useDynamicFilters,
} from "~/components/ui/filters";
import { useProjectBySlug, useProjectGalleryMedia } from "~/hooks";

interface GalleryClientProps {
  projectSlug: string;
}

export function GalleryClient({ projectSlug }: GalleryClientProps) {
  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
  } = useProjectBySlug(projectSlug);

  const {
    data: galleryData,
    isLoading: isMediaLoading,
    error: mediaError,
  } = useProjectGalleryMedia(project?.id ?? "");

  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  const { activeFilters, addFilter, removeFilter, resetFilters } =
    useDynamicFilters();

  const allMedia = React.useMemo(() => {
    return (galleryData?.media as GalleryMediaItem[]) || [];
  }, [galleryData?.media]);

  // Extract unique reporter names for the dynamic filter
  const reporterOptions = React.useMemo(() => {
    const names = new Set<string>();
    for (const item of allMedia) {
      if (item.report?.user?.name) {
        names.add(item.report.user.name);
      }
    }
    return Array.from(names)
      .sort()
      .map((name) => ({
        label: name,
        value: name,
      }));
  }, [allMedia]);

  // Construct filter fields
  const filterFields = React.useMemo<FilterField[]>(() => {
    const fields: FilterField[] = [
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
    ];

    if (reporterOptions.length > 0) {
      fields.push({
        id: "reporter",
        label: "Pelapor",
        icon: IconUser,
        options: reporterOptions,
      });
    }

    return fields;
  }, [reporterOptions]);

  // Filter media items in memory
  const filteredMedia = React.useMemo(() => {
    if (activeFilters.length === 0) return allMedia;

    return allMedia.filter((item) => {
      // 1. Date Range
      const dateFilter = activeFilters.find((f) => f.field === "dateRange");
      if (dateFilter) {
        const itemDate = new Date(item.report.reportDate);
        const now = new Date();
        if (dateFilter.value === "today") {
          if (
            itemDate.getDate() !== now.getDate() ||
            itemDate.getMonth() !== now.getMonth() ||
            itemDate.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        } else if (dateFilter.value === "week") {
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000,
          );
          if (itemDate < sevenDaysAgo) return false;
        } else if (dateFilter.value === "month") {
          const thirtyDaysAgo = new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000,
          );
          if (itemDate < thirtyDaysAgo) return false;
        }
      }

      // 2. Weather
      const weatherFilter = activeFilters.find((f) => f.field === "weather");
      if (
        weatherFilter &&
        item.report.weather?.toLowerCase() !==
          String(weatherFilter.value).toLowerCase()
      ) {
        return false;
      }

      // 3. Reporter
      const reporterFilter = activeFilters.find((f) => f.field === "reporter");
      if (
        reporterFilter &&
        item.report.user.name.toLowerCase() !==
          String(reporterFilter.value).toLowerCase()
      ) {
        return false;
      }

      return true;
    });
  }, [allMedia, activeFilters]);

  const previewItems = React.useMemo<MediaPreviewItem[]>(() => {
    return filteredMedia.map((m) => {
      const formattedDate = format(
        new Date(m.report.reportDate),
        "EEEE, dd MMMM yyyy",
        { locale: id },
      );
      const weatherText = m.report.weather ? ` • ${m.report.weather}` : "";
      return {
        id: m.id,
        url: m.url,
        title: `${formattedDate}${weatherText}`,
        subtitle: `Oleh ${m.report.user.name}${
          m.report.taskDescription ? ` — ${m.report.taskDescription}` : ""
        }`,
        actionUrl: `/projects/${project?.slug}/reports/${m.report.slug}`,
        actionLabel: "Buka Laporan",
      };
    });
  }, [filteredMedia, project?.slug]);

  const isLoading = isProjectLoading || isMediaLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <PageLayout title="Proyek Tidak Ditemukan">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-semibold">Proyek tidak ditemukan</h2>
          <p className="text-muted-foreground">
            Proyek yang Anda cari tidak tersedia.
          </p>
          <Button asChild variant="outline">
            <Link href="/projects">
              <IconArrowLeft className="mr-2 size-4" />
              Kembali ke Daftar Proyek
            </Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  if (mediaError) {
    return (
      <PageLayout title={`${project.name} — Galeri Foto`}>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-destructive">
            Gagal memuat foto dokumentasi galeri.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Muat Ulang
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${project.name} — Galeri Foto`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
          >
            <Link href={`/projects/${project.slug}/reports`}>
              <IconPhoto className="size-3.5" />
              <span>Lihat Laporan</span>
            </Link>
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 p-4 md:p-6 w-full min-w-0">
        {/* ── Toolbar: Filter Bar & Summary Counter ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterBar
            fields={filterFields}
            activeFilters={activeFilters}
            onAddFilter={addFilter}
            onRemoveFilter={removeFilter}
            onResetFilters={resetFilters}
            triggerLabel="Filter Galeri"
          />

          <div className="text-xs text-muted-foreground">
            Menampilkan{" "}
            <span className="font-semibold text-foreground">
              {filteredMedia.length}
            </span>{" "}
            dari {allMedia.length} foto dokumentasi
          </div>
        </div>

        {/* ── Empty Filter State ── */}
        {allMedia.length > 0 && filteredMedia.length === 0 ? (
          <div className="flex h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Tidak ada foto dokumentasi yang cocok dengan filter yang aktif.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="gap-1.5 text-xs"
            >
              <IconRefresh className="size-3.5" />
              <span>Reset Filter</span>
            </Button>
          </div>
        ) : (
          /* ── Timeline Grouped Photo Grid ── */
          <ProjectGalleryTimeline
            items={filteredMedia}
            projectSlug={project.slug}
            onPhotoClick={(idx) => setLightboxIndex(idx)}
          />
        )}
      </div>

      {/* ── Unified Media Preview ── */}
      <MediaPreview
        open={lightboxIndex !== null}
        onOpenChange={(open) => !open && setLightboxIndex(null)}
        items={previewItems}
        currentIndex={lightboxIndex}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </PageLayout>
  );
}
