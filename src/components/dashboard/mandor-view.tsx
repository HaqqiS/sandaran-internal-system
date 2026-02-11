"use client"

import { IconClipboardCheck, IconListCheck } from "@tabler/icons-react"
import { useState } from "react"
import { ReportDialog } from "~/components/report/report-dialog"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { api } from "~/trpc/react"
import { StatCard } from "./stat-card"

export function MandorView() {
  const { data: stats, isLoading } = api.dashboard.getMandorStats.useQuery()
  const [selectedProject, setSelectedProject] = useState<{
    id: string
    slug: string
  } | null>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)

  if (isLoading) {
    return <div>Loading Mandor dashboard...</div>
  }

  const handleCreateReport = (project: { id: string; slug: string }) => {
    setSelectedProject(project)
    setIsReportOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned Projects"
          value={stats?.projectCount ?? 0}
          icon={IconListCheck}
        />
        <StatCard
          title="Reports Due Today"
          value={stats?.reportsDue ?? 0}
          icon={IconClipboardCheck}
          description="Make sure to submit before 5 PM"
          trend={
            (stats?.reportsDue ?? 0) > 0
              ? { value: stats!.reportsDue!, label: "Pending", positive: false }
              : { value: "All Done", label: "Good job!", positive: true }
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Submit daily reports for your projects
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {stats?.projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <h4 className="font-semibold">{project.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {project._count.dailyReports} reports submitted
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    handleCreateReport({
                      id: project.id,
                      slug: project.slug ?? "",
                    })
                  }
                >
                  Create Report
                </Button>
              </div>
            ))}
            {stats?.projects.length === 0 && (
              <p className="text-muted-foreground">
                No active projects assigned.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedProject && (
        <ReportDialog
          projectId={selectedProject.id}
          open={isReportOpen}
          onOpenChange={(open) => {
            setIsReportOpen(open)
            if (!open) setSelectedProject(null)
          }}
        />
      )}
    </div>
  )
}
