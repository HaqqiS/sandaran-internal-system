"use client";

import {
  IconCalendar,
  IconCloud,
  IconCloudRain,
  IconMessageCircle,
  IconPhoto,
  IconSun,
  IconUsers,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

interface ReportCardProps {
  report: {
    id: string;
    slug: string;
    reportDate: Date | string;
    taskDescription: string;
    progressPercent: number;
    weather?: string | null;
    totalWorkers: number;
    user: { name: string; image?: string | null };
    media: {
      url: string;
      id: string;
      createdAt: Date;
      publicId: string;
      reportId: string;
    }[];
    tasks: unknown[];
    _count?: { comments: number };
  };
  projectSlug: string;
}

function getWeatherIcon(weather?: string | null) {
  if (!weather) return null;
  const lower = weather.toLowerCase();
  if (lower.includes("hujan")) return <IconCloudRain className="h-4 w-4" />;
  if (lower.includes("mendung")) return <IconCloud className="h-4 w-4" />;
  return <IconSun className="h-4 w-4" />;
}

export function ReportCard({ report, projectSlug }: ReportCardProps) {
  const reportDate = new Date(report.reportDate);
  const initials = report.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // return (
  //   <Link href={`/projects/${projectSlug}/reports/${report.slug}`}>
  //     <Card className="transition-colors hover:bg-muted/50">
  //       <CardHeader className="pb-2">
  //         <div className="flex items-start justify-between gap-2">
  //           <div className="flex items-center gap-2">
  //             <Avatar className="h-8 w-8">
  //               <AvatarImage src={report.user.image ?? undefined} />
  //               <AvatarFallback className="text-xs">{initials}</AvatarFallback>
  //             </Avatar>
  //             <div>
  //               <p className="text-sm font-medium">{report.user.name}</p>
  //               <div className="flex items-center gap-1 text-xs text-muted-foreground">
  //                 <IconCalendar className="h-3 w-3" />
  //                 {format(reportDate, "dd MMM yyyy")}
  //               </div>
  //             </div>
  //           </div>
  //           {report.weather && (
  //             <Badge variant="outline" className="flex items-center gap-1">
  //               {getWeatherIcon(report.weather)}
  //               {report.weather}
  //             </Badge>
  //           )}
  //         </div>
  //       </CardHeader>
  //       <CardContent className="space-y-3">
  //         <p className="line-clamp-2 text-sm text-muted-foreground">
  //           {report.taskDescription}
  //         </p>

  //         {/* Progress */}
  //         <div className="space-y-1">
  //           <div className="flex items-center justify-between text-xs">
  //             <span className="text-muted-foreground">Progress</span>
  //             <span className="font-medium">{report.progressPercent}%</span>
  //           </div>
  //           <Progress value={report.progressPercent} className="h-2" />
  //         </div>

  //         {/* Stats */}
  //         <div className="flex items-center gap-4 text-xs text-muted-foreground">
  //           <div className="flex items-center gap-1">
  //             <IconUsers className="h-3.5 w-3.5" />
  //             <span>{report.totalWorkers} workers</span>
  //           </div>
  //           <div className="flex items-center gap-1">
  //             <IconPhoto className="h-3.5 w-3.5" />
  //             <span>{report.media.length}</span>
  //           </div>
  //           <div className="flex items-center gap-1">
  //             <IconMessageCircle className="h-3.5 w-3.5" />
  //             <span>{report._count?.comments ?? 0}</span>
  //           </div>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   </Link>
  // );

  return (
    <Link
      href={`/projects/${projectSlug}/reports/${report.slug}`}
      className="group relative block w-full outline-none"
    >
      {/* Media Card (Background) */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/30">
        {report.media.length > 0 ? (
          <Image
            src={report.media[0]?.url || ""}
            alt={report.taskDescription || "Report media"}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted/50 to-muted">
            <IconPhoto className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        {/* Overlay gradient for text readability if needed */}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />

        {/* Weather Badge floating on media */}
        {report.weather && (
          <div className="absolute right-3 top-3">
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-background/80 backdrop-blur-sm"
            >
              {getWeatherIcon(report.weather)}
              {report.weather}
            </Badge>
          </div>
        )}
      </div>

      {/* Info Card (Foreground Foreground / Overlapping) */}
      <div className="relative z-10 mx-3 -mt-12 transition-transform duration-300 ease-out group-hover:-translate-y-1 sm:mx-4 sm:-mt-16">
        <Card className="h-full border border-border/50 bg-background/95 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80">
          <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={report.user.image ?? undefined} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-sm font-medium">
                  {report.user.name}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <IconCalendar className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {format(reportDate, "dd MMM yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-5 sm:pt-0">
            <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
              {report.taskDescription || "No description provided."}
            </p>

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  Progress
                </span>
                <span className="font-semibold text-primary">
                  {report.progressPercent}%
                </span>
              </div>
              <Progress value={report.progressPercent} className="h-1.5" />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <IconUsers className="h-4 w-4 shrink-0" />
                <span>{report.totalWorkers} workers</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <IconPhoto className="h-4 w-4 shrink-0" />
                  <span>{report.media.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconMessageCircle className="h-4 w-4 shrink-0" />
                  <span>{report._count?.comments ?? 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}
