"use client"

import { IconPlus } from "@tabler/icons-react"
import type { ProjectDocument } from "generated/prisma"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { DocumentList } from "~/components/document/document-list"
import { UploadDialog } from "~/components/document/upload-dialog"
import { PageLayout } from "~/components/layout"
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
import { useDeleteDocument } from "~/hooks/useDocument"
import { useProjectBySlug, useProjectMembers } from "~/hooks/useProject"
import { useSession } from "~/stores/use-session-store"

export function DocumentsClient() {
  const params = useParams()
  const slug = params.slug as string

  const { data: project, isLoading, error } = useProjectBySlug(slug)
  const { data: members } = useProjectMembers(project?.id ?? "")
  const { session } = useSession()

  const deleteDocument = useDeleteDocument()

  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [deleteDialogDoc, setDeleteDialogDoc] =
    useState<ProjectDocument | null>(null)

  // Find user's role
  const projectMember = members?.find((m) => m.userId === session?.user?.id)
  const role = projectMember?.role

  // Permission Check: ARCHITECT or Global ADMIN can upload
  const canUpload =
    role === "ARCHITECT" || session?.user?.roleGlobal === "ADMIN"

  const handleDelete = async () => {
    if (!deleteDialogDoc || !project) return
    try {
      await deleteDocument.mutateAsync({
        projectId: project.id,
        documentId: deleteDialogDoc.id,
      })
      toast.success("Document deleted successfully")
      setDeleteDialogDoc(null)
    } catch {
      // Error handled by mutation
    }
  }

  if (error) {
    return (
      <PageLayout title="Project Documents">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-semibold text-destructive">
            Failed to load project
          </h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Project Documents"
      actions={
        canUpload && (
          <Button onClick={() => setShowUploadDialog(true)}>
            <IconPlus className="mr-2 size-4" />
            Upload Document
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Manage and view project design files, drawings, and specifications.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="text-muted-foreground">Loading...</span>
          </div>
        ) : !project ? (
          <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-xl font-semibold text-destructive">
              Project not found
            </h2>
          </div>
        ) : (
          <DocumentList
            projectId={project.id}
            currentUserId={session?.user?.id ?? ""}
            onEdit={(doc) => {
              // TODO: Implement Edit
              toast.info("Edit functionality coming soon")
            }}
            onDelete={(doc) => setDeleteDialogDoc(doc)}
          />
        )}
      </div>

      {project && (
        <UploadDialog
          projectId={project.id}
          projectSlug={project.slug}
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
        />
      )}

      <AlertDialog
        open={!!deleteDialogDoc}
        onOpenChange={(open) => !open && setDeleteDialogDoc(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialogDoc?.fileName}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDocument.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
}
