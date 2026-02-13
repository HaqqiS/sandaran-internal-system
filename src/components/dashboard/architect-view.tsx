"use client"

import {
  IconBrush,
  IconClipboardList,
  IconCloudUpload,
  IconFileText,
  IconRuler,
} from "@tabler/icons-react"
import { format } from "date-fns"
import Link from "next/link"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { useArchitectDashboard, useArchitectStats } from "~/hooks"
import { DashboardLayout } from "./shared/DashboardLayout"
import { QuickActionCard } from "./shared/QuickActionCard"
import { StatsGrid } from "./shared/StatsGrid"
import { StatCard } from "./stat-card"

export function ArchitectView() {
  const { data: stats, isLoading: statsLoading } = useArchitectStats()
  const { data: dashboard, isLoading: dashboardLoading } =
    useArchitectDashboard()

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null)

  const handleUpload = (docType: string) => {
    setSelectedDocType(docType)
    setUploadDialogOpen(true)
    // In a real implementation, this would open an upload dialog
    // For now, we'll just redirect to documents page
    window.location.href = "/documents/upload"
  }

  const isLoading = statsLoading || dashboardLoading

  return (
    <DashboardLayout
      title="Architect Dashboard"
      description="Design document management and project oversight"
    >
      {/* Top Stats */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 2 }}>
        <StatCard
          title="My Projects"
          value={stats?.projectCount ?? 0}
          icon={IconFileText}
          description="Projects needing design docs"
          isLoading={statsLoading}
        />
        <StatCard
          title="Uploaded Documents"
          value={stats?.uploadedDocuments ?? 0}
          icon={IconCloudUpload}
          trend={{ value: "+2", label: "this week", positive: true }}
          isLoading={statsLoading}
        />
      </StatsGrid>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Documents by Project */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>My Documents</CardTitle>
            <CardDescription>
              Design documents organized by project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">
                  Loading documents...
                </p>
              </div>
            ) : !dashboard?.documentsByProject.length ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">
                  No documents uploaded yet
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {dashboard.documentsByProject.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-lg border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{project.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {project.documentCount} documents
                        </p>
                      </div>
                      <IconFileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      asChild
                    >
                      <Link href={`/projects/${project.slug}/documents`}>
                        View All
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar: Upload shortcuts & Recent Reports */}
        <div className="col-span-3 space-y-4">
          {/* Quick Upload */}
          <QuickActionCard
            title="Quick Upload"
            description="Upload design documents"
            actions={[
              {
                label: "Upload Design",
                icon: <IconBrush className="h-4 w-4" />,
                onClick: () => handleUpload("DESIGN"),
                variant: "outline",
              },
              {
                label: "Upload Drawing",
                icon: <IconRuler className="h-4 w-4" />,
                onClick: () => handleUpload("DRAWING"),
                variant: "outline",
              },
              {
                label: "Upload Spec",
                icon: <IconFileText className="h-4 w-4" />,
                onClick: () => handleUpload("SPECIFICATION"),
                variant: "outline",
              },
            ]}
          />

          {/* Recent Reports (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Site Progress</CardTitle>
              <CardDescription>
                Recent reports from your projects (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div className="flex items-center justify-center p-4">
                  <p className="text-xs text-muted-foreground">
                    Loading reports...
                  </p>
                </div>
              ) : !dashboard?.recentReports.length ? (
                <div className="flex items-center justify-center p-4">
                  <p className="text-xs text-muted-foreground">
                    No recent reports
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboard.recentReports.map((report, index) => (
                    <div key={report.id}>
                      <div className="rounded-lg border p-3">
                        <div className="flex items-start gap-2">
                          <IconClipboardList className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {report.project.name}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {report.taskDescription}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {format(
                                new Date(report.reportDate),
                                "dd MMM yyyy",
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 w-full"
                          asChild
                        >
                          <Link
                            href={`/projects/${report.project.slug}/reports/${report.slug}`}
                          >
                            View Details
                          </Link>
                        </Button>
                      </div>
                      {index < dashboard.recentReports.length - 1 && (
                        <Separator className="mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
