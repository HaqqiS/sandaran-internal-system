"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconDownload,
  IconExternalLink,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";

export interface MediaPreviewItem {
  id: string;
  url: string;
  title?: string;
  subtitle?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface MediaPreviewProps {
  url?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Optional multi-item gallery mode
  items?: MediaPreviewItem[];
  currentIndex?: number | null;
  onNavigate?: (index: number) => void;
}

export function MediaPreview({
  url,
  open,
  onOpenChange,
  items,
  currentIndex,
  onNavigate,
}: MediaPreviewProps) {
  const isGalleryMode =
    Array.isArray(items) &&
    items.length > 0 &&
    currentIndex !== undefined &&
    currentIndex !== null;

  const currentItem = isGalleryMode ? items[currentIndex] : null;
  const activeUrl = currentItem?.url || url;

  const hasPrev = isGalleryMode && currentIndex > 0;
  const hasNext = isGalleryMode && currentIndex < items.length - 1;

  const handlePrev = React.useCallback(() => {
    if (
      hasPrev &&
      onNavigate &&
      currentIndex !== null &&
      currentIndex !== undefined
    ) {
      onNavigate(currentIndex - 1);
    }
  }, [hasPrev, onNavigate, currentIndex]);

  const handleNext = React.useCallback(() => {
    if (
      hasNext &&
      onNavigate &&
      currentIndex !== null &&
      currentIndex !== undefined
    ) {
      onNavigate(currentIndex + 1);
    }
  }, [hasNext, onNavigate, currentIndex]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handlePrev, handleNext]);

  if (!open || !activeUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none sm:max-w-none w-auto h-auto border-0 bg-transparent p-0 shadow-none outline-none overflow-visible select-none"
      >
        <DialogTitle className="sr-only">Pratinjau Media</DialogTitle>
        <DialogDescription className="sr-only">
          {currentItem?.title || "Pratinjau foto resolusi penuh"}
        </DialogDescription>

        <div className="relative flex flex-col items-center justify-center">
          {/* ── Top Floating Action Controls ── */}
          <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 rounded-full bg-black/60 p-1 backdrop-blur-md text-white shadow-lg">
            {isGalleryMode && (
              <span className="px-2 text-xs font-medium text-white/80 select-none">
                {currentIndex + 1} / {items.length}
              </span>
            )}

            {/* Optional Action Link (e.g. Buka Laporan) */}
            {currentItem?.actionUrl && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-white hover:bg-white/20 hover:text-white rounded-full cursor-pointer"
              >
                <Link href={currentItem.actionUrl}>
                  <IconExternalLink className="size-3.5" />
                  <span className="hidden sm:inline">
                    {currentItem.actionLabel || "Buka"}
                  </span>
                </Link>
              </Button>
            )}

            {/* Download Button */}
            <button
              type="button"
              onClick={() => window.open(activeUrl, "_blank")}
              className="flex size-7 items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
              title="Unduh foto"
              aria-label="Unduh foto"
            >
              <IconDownload className="size-3.5" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-7 items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
              title="Tutup pratinjau"
              aria-label="Tutup pratinjau"
            >
              <IconX className="size-4" />
            </button>
          </div>

          {/* ── Floating Left Prev Arrow (Gallery Mode) ── */}
          {hasPrev && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:-left-14 top-1/2 -translate-y-1/2 z-30 flex size-10 items-center justify-center rounded-full bg-black/60 text-white shadow-xl backdrop-blur-md transition-all hover:bg-black/90 active:scale-95 cursor-pointer"
              aria-label="Foto sebelumnya"
            >
              <IconArrowLeft className="size-5" />
            </button>
          )}

          {/* ── Main Centered Image ── */}
          <div className="relative flex items-center justify-center overflow-hidden rounded-xl">
            {/* biome-ignore lint/performance/noImgElement: Cloudinary dynamic image */}
            <img
              src={activeUrl}
              alt={currentItem?.title || "Pratinjau foto"}
              className="max-h-[80vh] w-auto max-w-[92vw] sm:max-h-[85vh] sm:max-w-[85vw] rounded-xl object-contain shadow-2xl"
            />
          </div>

          {/* ── Floating Right Next Arrow (Gallery Mode) ── */}
          {hasNext && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:-right-14 top-1/2 -translate-y-1/2 z-30 flex size-10 items-center justify-center rounded-full bg-black/60 text-white shadow-xl backdrop-blur-md transition-all hover:bg-black/90 active:scale-95 cursor-pointer"
              aria-label="Foto berikutnya"
            >
              <IconArrowRight className="size-5" />
            </button>
          )}

          {/* ── Bottom Caption Bar (Optional) ── */}
          {(currentItem?.title || currentItem?.subtitle) && (
            <div className="absolute bottom-2 inset-x-2 z-20 flex flex-col rounded-lg bg-black/60 p-2 sm:px-3 sm:py-2 text-white backdrop-blur-md shadow-lg text-left">
              {currentItem.title && (
                <p className="line-clamp-1 text-xs font-semibold text-white">
                  {currentItem.title}
                </p>
              )}
              {currentItem.subtitle && (
                <p className="line-clamp-2 text-[11px] text-white/80">
                  {currentItem.subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
