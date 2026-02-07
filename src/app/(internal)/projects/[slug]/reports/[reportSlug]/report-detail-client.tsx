"use client"

import {
  IconArrowLeft,
  IconCalendar,
  IconCloud,
  IconCloudRain,
  IconLoader2,
  IconMapPin,
  IconPencil,
  IconSun,
  IconUsers,
} from "@tabler/icons-react"
import { format } from "date-fns"
import type { GlobalRole } from "generated/prisma"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { PageLayout } from "~/components/layout"
import { MediaGallery } from "~/components/report/media-gallery"
import { MediaUpload } from "~/components/report/media-upload"
import { ReportDialog } from "~/components/report/report-dialog"
import { TaskList } from "~/components/report/task-list"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"

import {
  useDeleteReportMedia,
  useProjectBySlug,
  useReportBySlug,
} from "~/hooks"
import { useSessionStore } from "~/stores/use-session-store"

interface ReportDetailClientProps {
  projectSlug: string
  reportSlug: string
}

function getWeatherIcon(weather?: string | null) {
  if (!weather) return null
  const lower = weather.toLowerCase()
  if (lower.includes("hujan")) return <IconCloudRain className="h-4 w-4" />
  if (lower.includes("mendung")) return <IconCloud className="h-4 w-4" />
  return <IconSun className="h-4 w-4" />
}

export function ReportDetailClient({
  projectSlug,
  reportSlug,
}: ReportDetailClientProps) {
  const { data: project, isLoading: projectLoading } =
    useProjectBySlug(projectSlug)
  const {
    data: report,
    isLoading: reportLoading,
    error,
  } = useReportBySlug(project?.id ?? "", reportSlug)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const session = useSessionStore((state) => state.session)
  const deleteMedia = useDeleteReportMedia()

  const isLoading = projectLoading || reportLoading
  const userRole = session?.user?.roleGlobal as GlobalRole | undefined
  const isAdmin = userRole === "ADMIN" || userRole === "CEO"
  const isOwner = report?.userId === session?.user?.id
  const canEdit = isAdmin || isOwner

  const handleDeleteMedia = async (mediaId: string) => {
    if (!project) return
    try {
      await deleteMedia.mutateAsync({
        projectId: project.id,
        mediaId,
      })
      toast.success("Image deleted")
    } catch {
      toast.error("Failed to delete image")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !project || !report) {
    return (
      <PageLayout title="Report Not Found">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-semibold">Report not found</h2>
          <p className="text-muted-foreground">
            The report you are looking for does not exist.
          </p>
          <Button asChild variant="outline">
            <Link href={`/projects/${projectSlug}/reports`}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
        </div>
      </PageLayout>
    )
  }

  const reportDate = new Date(report.reportDate)
  const initials = report.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <PageLayout
      title={`Report - ${format(reportDate, "dd MMM yyyy")}`}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${projectSlug}/reports`}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          {canEdit && (
            <Button size="sm" onClick={() => setIsEditOpen(true)}>
              <IconPencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* Detail Card (Top) */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={report.user.image ?? undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{report.user.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconCalendar className="h-4 w-4" />
                    {format(reportDate, "EEEE, dd MMMM yyyy")}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {report.weather && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getWeatherIcon(report.weather)}
                    {report.weather}
                  </Badge>
                )}
                {report.location && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <IconMapPin className="h-3 w-3" />
                    {report.location}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Left Column: Stats */}
              <div className="md:col-span-1">
                <div className="rounded-lg border p-4 space-y-4 h-full">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {report.progressPercent}%
                      </span>
                    </div>
                    <Progress value={report.progressPercent} className="h-3" />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <IconUsers className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">
                        {report.totalWorkers}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Workers
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Task & Issues */}
              <div className="space-y-4 md:col-span-2">
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-semibold">Task Description</h4>
                  <p className="whitespace-pre-wrap text-sm">
                    {report.taskDescription}
                  </p>
                </div>

                {report.issues && (
                  <div className="rounded-lg border p-4">
                    <h4 className="mb-2 font-semibold">Issues / Problems</h4>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {report.issues}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Breakdown Card */}
        <Card>
          <CardHeader>
            <CardTitle>Task Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList
              projectId={project.id}
              reportId={report.id}
              tasks={report.tasks}
              canEdit={canEdit}
            />
          </CardContent>
        </Card>

        {/* Media Card (Bottom) */}
        <Card>
          <CardHeader>
            <CardTitle>Photos ({report.media.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {canEdit ? (
              <MediaUpload
                projectId={project.id}
                projectSlug={projectSlug}
                reportId={report.id}
                existingMedia={report.media}
                canEdit={canEdit}
              />
            ) : (
              <MediaGallery
                media={report.media}
                onDelete={handleDeleteMedia}
                canDelete={canEdit}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Sheet */}
      <ReportDialog
        projectId={project.id}
        report={report}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </PageLayout>
  )
}
