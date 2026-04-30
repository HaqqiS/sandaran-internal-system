"use client";

import {
  IconBox,
  IconCalendarEvent,
  IconDotsVertical,
  IconEye,
  IconFileText,
  IconLoader2,
  IconPencil,
  IconPlus,
  IconReport,
  IconTrash,
  IconWallet,
} from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PageLayout } from "~/components/layout";
import { ProjectDialog } from "~/components/project/project-dialog";
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
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useDeleteProject, useProjectList } from "~/hooks";
import { isAdmin } from "~/lib/auth-guards";
import type { projectRouter } from "~/server/api/routers/project.router";
import { useSessionStore } from "~/stores/use-session-store";
import type { GlobalRole } from "../../../../generated/prisma";

type ProjectListItem = inferRouterOutputs<
  typeof projectRouter
>["getAll"][number];

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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
      <div className="p-4 md:p-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {project.location || "Lokasi belum diatur"}
                  </CardDescription>
                  <CardAction>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -mr-2 -mt-2"
                        >
                          <IconDotsVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.slug}`}>
                            <IconEye className="mr-2 h-4 w-4" />
                            Detail Proyek
                          </Link>
                        </DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setEditProject(project)}
                            >
                              <IconPencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteDialogProject(project)}
                              className="text-destructive focus:text-destructive"
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <div className="mb-4 flex items-center justify-between">
                    <Badge
                      variant={
                        project.status === "ACTIVE"
                          ? "default"
                          : project.status === "DONE"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {project.status === "ACTIVE"
                        ? "Aktif"
                        : project.status === "DONE"
                          ? "Selesai"
                          : "Tertunda"}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <IconCalendarEvent className="mr-1 h-3 w-3" />
                      {project.startDate
                        ? format(new Date(project.startDate), "d MMM yy", {
                            locale: id,
                          })
                        : "-"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col gap-1 rounded-md border p-2">
                      <div className="flex items-center text-muted-foreground text-xs">
                        <IconReport className="mr-1.5 h-3.5 w-3.5" />
                        Laporan
                      </div>
                      <div className="font-semibold">
                        {project._count.dailyReports}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 rounded-md border p-2">
                      <div className="flex items-center text-muted-foreground text-xs">
                        <IconFileText className="mr-1.5 h-3.5 w-3.5" />
                        Dokumen
                      </div>
                      <div className="font-semibold">
                        {project._count.documents}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 rounded-md border p-2">
                      <div className="flex items-center text-muted-foreground text-xs">
                        <IconBox className="mr-1.5 h-3.5 w-3.5" />
                        Logistik
                      </div>
                      <div className="font-semibold">
                        {project._count.logistics}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 rounded-md border p-2">
                      <div className="flex items-center text-muted-foreground text-xs">
                        <IconWallet className="mr-1.5 h-3.5 w-3.5" />
                        Kas Darurat
                      </div>
                      <div
                        className="font-semibold truncate"
                        title={formatCurrency(
                          Number(project.emergencyFund?.currentBalance || 0),
                        )}
                      >
                        {formatCurrency(
                          Number(project.emergencyFund?.currentBalance || 0),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 border-t-0 bg-transparent flex gap-2">
                  <Button variant="secondary" className="w-full" asChild>
                    <Link href={`/projects/${project.slug}`}>Buka Proyek</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border p-8 text-center bg-card">
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
                description: editProject.description || undefined,
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
