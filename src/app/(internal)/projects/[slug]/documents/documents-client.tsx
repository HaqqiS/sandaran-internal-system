"use client";

import { IconArrowLeft, IconLoader2, IconPlus } from "@tabler/icons-react";
import type { ProjectDocument } from "generated/prisma";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentList } from "~/components/document/document-list";
import { UploadDialog } from "~/components/document/upload-dialog";
import { PageLayout } from "~/components/layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { useDeleteDocument } from "~/hooks/useDocument";
import { useProjectBySlug, useProjectMembers } from "~/hooks/useProject";
import { useSession } from "~/stores/use-session-store";

interface DocumentsClientProps {
  projectSlug: string;
}

export function DocumentsClient({ projectSlug }: DocumentsClientProps) {
  const { data: project, isLoading, error } = useProjectBySlug(projectSlug);
  const { data: members } = useProjectMembers(project?.id ?? "");
  const { session } = useSession();

  const deleteDocument = useDeleteDocument();

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [deleteDialogDoc, setDeleteDialogDoc] =
    useState<ProjectDocument | null>(null);

  // Find user's role
  const projectMember = members?.find((m) => m.userId === session?.user?.id);
  const role = projectMember?.role;

  // Permission Check: ARCHITECT or Global ADMIN can upload
  const canUpload =
    role === "ARCHITECT" || session?.user?.roleGlobal === "ADMIN";

  const handleDelete = async () => {
    if (!deleteDialogDoc || !project) return;
    try {
      await deleteDocument.mutateAsync({
        projectId: project.id,
        documentId: deleteDialogDoc.id,
      });
      toast.success("Document deleted successfully");
      setDeleteDialogDoc(null);
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <PageLayout title="Project Documents">
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
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
    );
  }

  return (
    <PageLayout
      title={`${project.name} - Documents`}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${projectSlug}`}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          {project && (
            <UploadDialog
              projectId={project.id}
              projectSlug={project.slug}
              open={showUploadDialog}
              onOpenChange={setShowUploadDialog}
            >
              {canUpload && (
                <Button>
                  <IconPlus className="mr-2 size-4" />
                  <span className="block md:hidden">Upload</span>
                  <span className="hidden md:block">Upload Document</span>
                </Button>
              )}
            </UploadDialog>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <DocumentList
          projectId={project.id}
          currentUserId={session?.user?.id ?? ""}
          onEdit={(_doc) => {
            // TODO: Implement Edit
            toast.info("Edit functionality coming soon");
          }}
          onDelete={(doc) => setDeleteDialogDoc(doc)}
        />
      </div>

      <AlertDialog
        open={!!deleteDialogDoc}
        onOpenChange={(open) => !open && setDeleteDialogDoc(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="inline-block max-w-[200px] align-bottom font-semibold truncate sm:max-w-[300px]">
                {deleteDialogDoc?.fileName}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDocument.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
