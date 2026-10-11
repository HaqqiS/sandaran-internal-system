"use client";

import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

interface TimelineProgressProps {
  elapsedPercent: number | null;
  progressPercent: number | null;
  hasAnomaly?: boolean;
  className?: string;
  reportDateLabel?: string;
}

export function TimelineProgress({
  elapsedPercent,
  progressPercent,
  hasAnomaly = false,
  className,
  reportDateLabel,
}: TimelineProgressProps) {
  const safeProgress =
    progressPercent !== null
      ? Math.min(Math.max(progressPercent, 0), 100)
      : null;
  const safeElapsed =
    elapsedPercent !== null ? Math.min(Math.max(elapsedPercent, 0), 100) : null;

  return (
    <div className={cn("space-y-1.5 min-w-[180px] max-w-xs", className)}>
      {/* 1. Track Tipis Atas: Waktu Kalender Berlalu */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Waktu Kalender</span>
          <span className="font-medium">
            {safeElapsed !== null ? `${safeElapsed}%` : "Tanggal belum diatur"}
          </span>
        </div>
        <div
          aria-hidden="true"
          className="h-1 w-full overflow-hidden rounded-full bg-muted"
        >
          {safeElapsed !== null && (
            <div
              className="h-full bg-muted-foreground/40 transition-all duration-300"
              style={{ width: `${safeElapsed}%` }}
            />
          )}
        </div>
      </div>

      {/* 2. Track Utama Bawah: Progres Laporan Kumulatif */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-foreground">Progres Riil</span>
          <div className="flex items-center gap-1.5">
            {hasAnomaly && (
              <Badge
                variant="outline"
                className="border-status-attention bg-status-attention-bg text-status-attention text-[9px] px-1 py-0 font-semibold"
              >
                Progres turun
              </Badge>
            )}
            <span className="font-bold text-foreground">
              {safeProgress !== null ? `${safeProgress}%` : "-"}
            </span>
            {reportDateLabel && (
              <span className="text-[10px] text-muted-foreground">
                ({reportDateLabel})
              </span>
            )}
          </div>
        </div>

        <div
          role="progressbar"
          aria-valuenow={safeProgress ?? 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progres kumulatif pekerjaan"
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          {safeProgress !== null ? (
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                hasAnomaly ? "bg-status-attention" : "bg-primary",
              )}
              style={{ width: `${safeProgress}%` }}
            />
          ) : (
            <div className="h-full bg-transparent" />
          )}
        </div>
      </div>
    </div>
  );
}
