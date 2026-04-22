"use client";

import { IconLoader2, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageLayout } from "~/components/layout";
import type { ProjectListItem } from "~/components/project/project-columns";
import { ProjectDialog } from "~/components/project/project-dialog";
import { ProjectTable } from "~/components/project/project-table";
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
import { useDeleteProject, useProjectList } from "~/hooks";
import { isAdmin } from "~/lib/auth-guards";
import { useSessionStore } from "~/stores/use-session-store";
import type { GlobalRole } from "../../../../generated/prisma";

export function ProjectsClient() {
  const { data: projects, isLoading, error } = useProjectList();
  const deleteProject = useDeleteProject();
  const session = useSessionStore((state) => state.session);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<ProjectListItem | null>(null);
  const [deleteDialogProject, setDeleteDialogProject] =
    useState<ProjectListItem | null>(null);

  const canManage = isAdmin(
    session?.user?.roleGlobal as GlobalRole | null | undefined,
  );

  const handleDelete = async () => {
    if (!deleteDialogProject) return;
    try {
      await deleteProject.mutateAsync({ projectId: deleteDialogProject.id });
      toast.success("Proyek berhasil dihapus");
      setDeleteDialogProject(null);
    } catch {
      // Error handled by global mutation cache
    }
  };

  if (error) {
    return (
      <PageLayout title="Daftar Proyek">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-semibold text-destructive">
            Gagal memuat proyek
          </h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Daftar Proyek"
      actions={
        canManage && (
          <ProjectDialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <Button>
              <IconPlus className="mr-2 size-4" />
              Proyek Baru
            </Button>
          </ProjectDialog>
        )
      }
    >
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
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
            <p className="text-muted-foreground">Belum ada proyek.</p>
            {canManage && (
              <p className="mt-2 text-sm text-muted-foreground">
                Klik "Proyek Baru" untuk membuat proyek pertama Anda.
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
            <AlertDialogTitle>Hapus Proyek</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "{deleteDialogProject?.name}"?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProject.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
