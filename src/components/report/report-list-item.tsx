"use client";

import {
  IconAlertTriangle,
  IconCalendar,
  IconChevronRight,
  IconListCheck,
  IconMapPin,
  IconMessageCircle,
  IconPhoto,
  IconUsers,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
} from "~/components/ui/item";
import { Progress } from "~/components/ui/progress";
import { getWeatherIcon } from "./report-card";
import type { ReportListItemProps } from "./types";

export function ReportListItem({ report, projectSlug }: ReportListItemProps) {
  const reportDate = new Date(report.reportDate);
  const initials = report.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const visibleTasks = report.tasks.slice(0, 3);
  const remainingTasksCount = Math.max(
    0,
    report.tasks.length - visibleTasks.length,
  );
  const hasIssues = Boolean(report.issues && report.issues.trim().length > 0);

  return (
    <Item
      asChild
      variant="outline"
      className="min-h-11 flex-nowrap items-stretch gap-3 rounded-xl bg-card px-2.5 py-2 shadow-2xs transition-all hover:border-primary/30 hover:bg-muted/40 hover:shadow-xs active:scale-[0.995] sm:gap-3.5 sm:px-3 sm:py-2"
    >
      <Link href={`/projects/${projectSlug}/reports/${report.slug}`}>
        {/* Zone 1: Leading Landscape Thumbnail */}
        <ItemMedia className="self-center">
          <div className="relative flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40 sm:h-20 sm:w-28">
            {report.media[0] ? (
              <Image
                src={report.media[0].url}
                alt={report.taskDescription || "Report thumbnail"}
                fill
                sizes="(max-width: 640px) 80px, 112px"
                className="object-cover transition-transform duration-300 group-hover/item:scale-105"
              />
            ) : (
              <IconPhoto className="m-auto size-6 text-muted-foreground/35" />
            )}
            {report.media.length > 0 && (
              <span className="absolute right-1 bottom-1 inline-flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                <IconPhoto className="size-2.5" />
                {report.media.length}
              </span>
            )}
          </div>
        </ItemMedia>

        {/* Zone 2: Primary Content (Header Meta, Description, Task Pills) */}
        <ItemContent className="min-w-0 flex-1 justify-center gap-1.5">
          {/* Top Meta Row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <IconCalendar className="size-3.5 text-primary" />
              {format(reportDate, "dd MMM yyyy", { locale: id })}
            </span>

            <span className="text-muted-foreground/50">•</span>

            <div className="inline-flex items-center gap-1.5 min-w-0">
              <Avatar className="size-4 shrink-0 border">
                <AvatarImage
                  src={report.user.image ?? undefined}
                  alt={report.user.name}
                />
                <AvatarFallback className="text-[8px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="truncate font-medium text-muted-foreground">
                {report.user.name}
              </span>
            </div>

            {report.location && (
              <Badge
                variant="secondary"
                className="hidden h-5 items-center gap-1 px-1.5 py-0 text-[10px] font-normal sm:inline-flex"
              >
                <IconMapPin className="size-3 shrink-0" />
                <span className="max-w-[120px] truncate">
                  {report.location}
                </span>
              </Badge>
            )}

            {report.weather && (
              <Badge
                variant="outline"
                className="hidden h-5 items-center gap-1 px-1.5 py-0 text-[10px] font-normal sm:inline-flex"
              >
                {getWeatherIcon(report.weather)}
                <span>{report.weather}</span>
              </Badge>
            )}

            {hasIssues && (
              <Badge
                variant="outline"
                className="h-5 items-center gap-1 border-amber-500/40 bg-amber-500/10 px-1.5 py-0 text-[10px] font-medium text-amber-700 dark:text-amber-400"
              >
                <IconAlertTriangle className="size-3 shrink-0" />
                <span>Kendala</span>
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="line-clamp-1 text-sm font-medium text-foreground/90 sm:line-clamp-2">
            {report.taskDescription || "Belum ada deskripsi pekerjaan."}
          </p>

          {/* Sub-task Pills (Desktop/Tablet) or Compact Stats (Mobile) */}
          {visibleTasks.length > 0 ? (
            <div className="hidden flex-wrap items-center gap-1.5 pt-0.5 sm:flex">
              {visibleTasks.map((task) => (
                <span
                  key={task.id}
                  className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  <IconListCheck className="size-3 shrink-0 text-primary/80" />
                  <span className="max-w-[150px] truncate font-medium text-foreground/85">
                    {task.taskName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ({task.progress}%)
                  </span>
                </span>
              ))}
              {remainingTasksCount > 0 && (
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  +{remainingTasksCount} tugas
                </span>
              )}
            </div>
          ) : null}

          {/* Mobile Compact Meta */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground md:hidden">
            <span className="inline-flex items-center gap-1">
              <IconUsers className="size-3 shrink-0" />
              {report.totalWorkers} pekerja
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <IconListCheck className="size-3 shrink-0" />
              {report.tasks.length} tugas
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <IconMessageCircle className="size-3 shrink-0" />
              {report._count?.comments ?? 0}
            </span>
          </div>
        </ItemContent>

        {/* Zone 3: Operational Metrics Grid + Progress Bar + Action */}
        <ItemActions className="shrink-0 self-center gap-3 sm:gap-4">
          {/* Operational Stats Grid (Visible on md+) */}
          <div className="hidden grid-cols-2 gap-x-4 gap-y-1.5 border-l border-border/60 pl-4 text-xs text-muted-foreground lg:grid">
            <div className="flex items-center gap-1.5">
              <IconUsers className="size-3.5 shrink-0 text-muted-foreground/80" />
              <span className="font-semibold text-foreground">
                {report.totalWorkers}
              </span>
              <span>pekerja</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconListCheck className="size-3.5 shrink-0 text-muted-foreground/80" />
              <span className="font-semibold text-foreground">
                {report.tasks.length}
              </span>
              <span>tugas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconPhoto className="size-3.5 shrink-0 text-muted-foreground/80" />
              <span className="font-semibold text-foreground">
                {report.media.length}
              </span>
              <span>foto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconMessageCircle className="size-3.5 shrink-0 text-muted-foreground/80" />
              <span className="font-semibold text-foreground">
                {report._count?.comments ?? 0}
              </span>
              <span>diskusi</span>
            </div>
          </div>

          {/* Progress Column */}
          <div className="flex flex-col items-end justify-center gap-1.5 sm:w-32 sm:border-l sm:border-border/60 sm:pl-4">
            <div className="flex w-full items-center justify-end gap-2 sm:justify-between">
              <span className="hidden text-[11px] font-medium text-muted-foreground sm:inline">
                Progres
              </span>
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
              >
                {report.progressPercent}%
              </Badge>
            </div>
            <Progress
              value={report.progressPercent}
              className="hidden h-1.5 w-full sm:block"
            />
          </div>

          {/* Trailing Arrow */}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-colors group-hover/item:bg-primary/10 group-hover/item:text-primary">
            <IconChevronRight className="size-4 transition-transform group-hover/item:translate-x-0.5" />
          </div>
        </ItemActions>
      </Link>
    </Item>
  );
}
