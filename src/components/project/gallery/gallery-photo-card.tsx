"use client";

import { IconZoomIn } from "@tabler/icons-react";
import * as React from "react";
import { cn } from "~/lib/utils";
import type { GalleryMediaItem } from "./types";

interface GalleryPhotoCardProps {
  item: GalleryMediaItem;
  onClick: () => void;
  className?: string;
}

export function GalleryPhotoCard({
  item,
  onClick,
  className,
}: GalleryPhotoCardProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border/80 bg-muted/40 shadow-2xs transition-all duration-200 hover:shadow-md hover:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-[0.98]",
        className,
      )}
      aria-label={`Lihat foto dokumentasi pekerjaan: ${item.report.taskDescription}`}
    >
      {/* Skeleton placeholder while loading */}
      {!isLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}

      {/* biome-ignore lint/performance/noImgElement: Cloudinary dynamic image */}
      <img
        src={item.url}
        alt={
          item.fileName || item.report.taskDescription || "Dokumentasi proyek"
        }
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "size-full object-cover transition-transform duration-300 group-hover:scale-105",
          isLoaded ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Hover overlay gradient & zoom cue */}
      <div className="absolute inset-0 flex flex-col justify-between p-2.5 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        <div className="flex justify-end">
          <span className="flex size-7 items-center justify-center rounded-full bg-black/60 text-white shadow-xs backdrop-blur-xs">
            <IconZoomIn className="size-4" />
          </span>
        </div>

        <div className="min-w-0 text-left">
          <p className="line-clamp-1 text-xs font-semibold text-white">
            {item.report.user.name}
          </p>
          <p className="line-clamp-1 text-[11px] text-white/80">
            {item.report.taskDescription}
          </p>
        </div>
      </div>
    </button>
  );
}
