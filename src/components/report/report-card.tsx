"use client"

import {
  IconCalendar,
  IconCloud,
  IconCloudRain,
  IconMessageCircle,
  IconPhoto,
  IconSun,
  IconUsers,
} from "@tabler/icons-react"
import { format } from "date-fns"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"

interface ReportCardProps {
  report: {
    id: string
    slug: string
    reportDate: Date | string
    taskDescription: string
    progressPercent: number
    weather?: string | null
    totalWorkers: number
    user: { name: string; image?: string | null }
    media: unknown[]
    tasks: unknown[]
    _count?: { comments: number }
  }
  projectSlug: string
}

function getWeatherIcon(weather?: string | null) {
  if (!weather) return null
  const lower = weather.toLowerCase()
  if (lower.includes("hujan")) return <IconCloudRain className="h-4 w-4" />
  if (lower.includes("mendung")) return <IconCloud className="h-4 w-4" />
  return <IconSun className="h-4 w-4" />
}

export function ReportCard({ report, projectSlug }: ReportCardProps) {
  const reportDate = new Date(report.reportDate)
  const initials = report.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link href={`/projects/${projectSlug}/reports/${report.slug}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={report.user.image ?? undefined} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{report.user.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <IconCalendar className="h-3 w-3" />
                  {format(reportDate, "dd MMM yyyy")}
                </div>
              </div>
            </div>
            {report.weather && (
              <Badge variant="outline" className="flex items-center gap-1">
                {getWeatherIcon(report.weather)}
                {report.weather}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {report.taskDescription}
          </p>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{report.progressPercent}%</span>
            </div>
            <Progress value={report.progressPercent} className="h-2" />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <IconUsers className="h-3.5 w-3.5" />
              <span>{report.totalWorkers} workers</span>
            </div>
            <div className="flex items-center gap-1">
              <IconPhoto className="h-3.5 w-3.5" />
              <span>{report.media.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <IconMessageCircle className="h-3.5 w-3.5" />
              <span>{report._count?.comments ?? 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
