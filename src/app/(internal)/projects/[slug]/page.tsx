"use client"

import {
  IconCalendar,
  IconCheckbox,
  IconFileText,
  IconLoader2,
  IconMapPin,
  IconPencil,
  IconUsers,
} from "@tabler/icons-react"
import { format } from "date-fns"
import * as React from "react"
import { PageLayout } from "~/components/layout"
import { MemberManagement } from "~/components/project/member-management"
import { ProjectDialog } from "~/components/project/project-dialog"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useProjectBySlug } from "~/hooks"
import { isAdmin } from "~/lib/auth-guards"
import { useSessionStore } from "~/stores/use-session-store"
import type { GlobalRole } from "../../../../../generated/prisma"

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = React.use(params)
  const { data: project, isLoading, error } = useProjectBySlug(slug)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const session = useSessionStore((state) => state.session)
  const canManage = isAdmin(
    session?.user?.roleGlobal as GlobalRole | null | undefined,
  )

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <PageLayout title="Project Not Found">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-semibold">Project not found</h2>
          <p className="text-muted-foreground">
            The project you are looking for does not exist or you don't have
            access.
          </p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={project.name}
      actions={
        canManage && (
          <ProjectDialog
            project={{
              id: project.id,
              name: project.name,
              slug: project.slug,
              description: project.description,
              location: project.location,
              startDate: project.startDate,
              endDate: project.endDate,
              status: project.status,
            }}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
          >
            <Button variant="outline" size="sm">
              <IconPencil className="mr-2 h-4 w-4" />
              Edit Project
            </Button>
          </ProjectDialog>
        )
      }
    >
      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* Header Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <IconCheckbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge
                variant={
                  project.status === "ACTIVE"
                    ? "default"
                    : project.status === "DONE"
                      ? "secondary"
                      : "outline"
                }
              >
                {project.status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports</CardTitle>
              <IconFileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project._count.dailyReports}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Count</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Timeline</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Start:{" "}
                {project.startDate
                  ? format(new Date(project.startDate), "PP")
                  : "-"}
              </div>
              <div className="text-xs text-muted-foreground">
                End:{" "}
                {project.endDate
                  ? format(new Date(project.endDate), "PP")
                  : "-"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="reports" disabled>
              Reports
            </TabsTrigger>
            <TabsTrigger value="documents" disabled>
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.description ? (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No description provided.
                  </p>
                )}
                {project.location && (
                  <div>
                    <h4 className="mb-1 flex items-center gap-1 text-sm font-semibold">
                      <IconMapPin className="h-3 w-3" /> Location
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {project.location}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
              </CardHeader>
              <CardContent>
                <MemberManagement projectId={project.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}
