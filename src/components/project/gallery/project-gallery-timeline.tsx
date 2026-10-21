"use client";

import { IconCalendarEvent, IconPhoto } from "@tabler/icons-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import * as React from "react";
import { getWeatherIcon } from "~/components/report/report-card";
import { Badge } from "~/components/ui/badge";
import { GalleryPhotoCard } from "./gallery-photo-card";
import type { GalleryDayGroup, GalleryMediaItem } from "./types";

interface ProjectGalleryTimelineProps {
  items: GalleryMediaItem[];
  projectSlug: string;
  onPhotoClick: (globalIndex: number) => void;
}

export function ProjectGalleryTimeline({
  items,
  onPhotoClick,
}: ProjectGalleryTimelineProps) {
  // Group photos by date
  const dayGroups = React.useMemo(() => {
    const map = new Map<string, GalleryDayGroup>();

    for (const item of items) {
      const dateObj = new Date(item.report.reportDate);
      const dateKey = format(dateObj, "yyyy-MM-dd");

      let dayGroup = map.get(dateKey);
      if (!dayGroup) {
        dayGroup = {
          dateKey,
          dateObj,
          formattedDate: format(dateObj, "EEEE, dd MMMM yyyy", { locale: id }),
          weathers: [],
          photos: [],
        };
        map.set(dateKey, dayGroup);
      }

      if (
        item.report.weather &&
        !dayGroup.weathers.includes(item.report.weather)
      ) {
        dayGroup.weathers.push(item.report.weather);
      }

      dayGroup.photos.push(item);
    }

    return Array.from(map.values()).sort(
      (a, b) => b.dateObj.getTime() - a.dateObj.getTime(),
    );
  }, [items]);

  // Map each item to its index in the flattened items array for lightbox
  const itemIndexMap = React.useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted mb-3">
          <IconPhoto className="size-7 text-muted-foreground/60" />
        </div>
        <h3 className="text-base font-semibold">Belum Ada Foto Dokumentasi</h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Foto akan muncul di galeri ini secara otomatis ketika tim lapangan
          mengunggah dokumentasi pada laporan harian proyek.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dayGroups.map((day) => (
        <section
          key={day.dateKey}
          aria-label={`Dokumentasi ${day.formattedDate}`}
          className="space-y-3"
        >
          {/* ── Minimal Day Header ── */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <IconCalendarEvent className="size-3.5" />
              </span>
              <h3 className="text-sm font-semibold text-foreground capitalize sm:text-base">
                {day.formattedDate}
              </h3>
              {day.weathers.map((weather) => (
                <Badge
                  key={weather}
                  variant="outline"
                  className="gap-1 py-0 px-2 text-[11px] font-normal"
                >
                  {getWeatherIcon(weather)}
                  <span>{weather}</span>
                </Badge>
              ))}
              <span className="text-xs text-muted-foreground font-medium">
                • {day.photos.length} Foto
              </span>
            </div>
          </div>

          {/* ── Direct Clean Photos Grid (No Card Wrapper!) ── */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-3">
            {day.photos.map((photo) => {
              const globalIdx = itemIndexMap.get(photo.id) ?? 0;
              return (
                <GalleryPhotoCard
                  key={photo.id}
                  item={photo}
                  onClick={() => onPhotoClick(globalIdx)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
