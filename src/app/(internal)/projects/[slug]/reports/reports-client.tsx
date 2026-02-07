"use client"

import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react"
import type { GlobalRole, ProjectRole } from "generated/prisma"
import Link from "next/link"
import { useState } from "react"
import { PageLayout } from "~/components/layout"
import { ReportList } from "~/components/report/report-list"
import { ReportSheet } from "~/components/report/report-sheet"
import { Button } from "~/components/ui/button"
import { useProjectBySlug } from "~/hooks"
import { useSessionStore } from "~/stores/use-session-store"

interface ReportsClientProps {
  projectSlug: string
}

export function ReportsClient({ projectSlug }: ReportsClientProps) {
  const { data: project, isLoading, error } = useProjectBySlug(projectSlug)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const session = useSessionStore((state) => state.session)

  // Check if user can create reports (MANDOR or ARCHITECT, or ADMIN)
  const userRole = session?.user?.roleGlobal as GlobalRole | undefined
  const isAdmin = userRole === "ADMIN" || userRole === "CEO"
  const projectMember = project?.members.find(
    (m) => m.userId === session?.user?.id,
  )
  const memberRole = projectMember?.role as ProjectRole | undefined
  const canCreate =
    isAdmin || memberRole === "MANDOR" || memberRole === "ARCHITECT"

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <PageLayout title="Reports">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-semibold">Project not found</h2>
          <p className="text-muted-foreground">
            The project you are looking for does not exist.
          </p>
          <Button asChild variant="outline">
            <Link href="/projects">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={`${project.name} - Reports`}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href={`/projects/${projectSlug}`}>
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Link>
        </Button>
      }
    >
      <div className="p-4 md:p-6">
        <ReportList
          projectId={project.id}
          projectSlug={projectSlug}
          canCreate={canCreate}
          onCreateClick={() => setIsCreateOpen(true)}
        />
      </div>

      <ReportSheet
        projectId={project.id}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </PageLayout>
  )
}
