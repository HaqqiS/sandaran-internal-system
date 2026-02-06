"use client"

import { IconLoader2, IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import { toast } from "sonner"
import { PageLayout } from "~/components/layout"
import type { ProjectListItem } from "~/components/project/project-columns"
import { ProjectDialog } from "~/components/project/project-dialog"
import { ProjectTable } from "~/components/project/project-table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { useDeleteProject, useProjectList } from "~/hooks"
import { isAdmin } from "~/lib/auth-guards"
import { useSessionStore } from "~/stores/use-session-store"
import type { GlobalRole } from "../../../../generated/prisma"

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjectList()
  const deleteProject = useDeleteProject()
  const session = useSessionStore((state) => state.session)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editProject, setEditProject] = useState<ProjectListItem | null>(null)
  const [deleteDialogProject, setDeleteDialogProject] =
    useState<ProjectListItem | null>(null)

  const canManage = isAdmin(
    session?.user?.roleGlobal as GlobalRole | null | undefined,
  )

  const handleDelete = async () => {
    if (!deleteDialogProject) return
    try {
      await deleteProject.mutateAsync({ projectId: deleteDialogProject.id })
      toast.success("Project deleted successfully")
      setDeleteDialogProject(null)
    } catch {
      // Error handled by global mutation cache
    }
  }

  if (error) {
    return (
      <PageLayout title="Projects">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-semibold text-destructive">
            Failed to load projects
          </h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Projects"
      actions={
        canManage && (
          <ProjectDialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <Button>
              <IconPlus className="mr-2 size-4" />
              New Project
            </Button>
          </ProjectDialog>
        )
      }
    >
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Manage your construction projects
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects && projects.length > 0 ? (
          <ProjectTable
            data={projects as ProjectListItem[]}
            canManage={canManage}
            onEdit={(project) => setEditProject(project)}
            onDelete={(project) => setDeleteDialogProject(project)}
          />
        ) : (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">No projects found.</p>
            {canManage && (
              <p className="mt-2 text-sm text-muted-foreground">
                Click "New Project" to create your first project.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <ProjectDialog
        project={
          editProject
            ? {
                id: editProject.id,
                name: editProject.name,
                slug: editProject.slug,
                description: undefined,
                location: editProject.location,
                startDate: editProject.startDate,
                endDate: editProject.endDate,
                status: editProject.status,
              }
            : undefined
        }
        open={!!editProject}
        onOpenChange={(open) => !open && setEditProject(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteDialogProject}
        onOpenChange={(open) => !open && setDeleteDialogProject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialogProject?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProject.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
}
