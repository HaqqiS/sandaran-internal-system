"use client";

import { IconChevronRight, IconLoader2, IconPhoto } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useProjectGalleryMedia } from "~/hooks";
import type { GalleryMediaItem } from "../gallery/types";

interface GallerySectionProps {
  projectId: string;
  projectSlug: string;
}

export function GallerySection({
  projectId,
  projectSlug,
}: GallerySectionProps) {
  const { data, isLoading, error } = useProjectGalleryMedia(projectId, 6);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Galeri Foto Proyek
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center">
            <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null;
  }

  const media = (data?.media as GalleryMediaItem[]) || [];
  const recentMedia = media.slice(0, 6);
  const totalCount = media.length;

  return (
    <Card className="rounded-2xl border-border/80 shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconPhoto className="size-4" />
          </span>
          <div>
            <CardTitle className="text-base font-semibold">
              Galeri Dokumentasi
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Arsip foto lapangan dari laporan harian
            </CardDescription>
          </div>
          {totalCount > 0 && (
            <span className="text-xs font-semibold text-muted-foreground ml-1">
              ({totalCount})
            </span>
          )}
        </div>

        <Link href={`/projects/${projectSlug}/gallery`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs cursor-pointer"
          >
            <span>Lihat Galeri</span>
            <IconChevronRight className="size-4" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent>
        {recentMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <IconPhoto className="size-10 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">
              Belum ada foto dokumentasi yang diunggah.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 sm:gap-3">
            {recentMedia.map((photo) => (
              <Link
                key={photo.id}
                href={`/projects/${projectSlug}/gallery`}
                className="group relative aspect-4/3 overflow-hidden rounded-xl border border-border/60 bg-muted/40 transition-all hover:border-primary/40 hover:shadow-xs"
              >
                {/* biome-ignore lint/performance/noImgElement: Cloudinary dynamic preview image */}
                <img
                  src={photo.url}
                  alt={photo.fileName || "Foto dokumentasi"}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-2">
                  <span className="truncate text-[10px] text-white font-medium">
                    {photo.report.user.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
