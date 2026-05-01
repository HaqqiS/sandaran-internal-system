"use client";

import {
  IconBox,
  IconCalendarEvent,
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconEye,
  IconFileText,
  IconLoader2,
  IconPencil,
  IconPlus,
  IconReport,
  IconTrash,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageLayout } from "~/components/layout";
import { ProjectDialog } from "~/components/project/project-dialog";
import { TeamManagementDialog } from "~/components/project/team-management-dialog";
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
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
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

  // New States for Expand/Collapse & Team Management
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [teamProjectId, setTeamProjectId] = useState<string | null>(null);

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

  // Expand / Collapse Logic
  const allProjectIds = useMemo(
    () => projects?.map((p) => p.id) || [],
    [projects],
  );
  const isAllExpanded =
    allProjectIds.length > 0 && expandedCards.size === allProjectIds.length;

  const toggleExpandAll = (checked: boolean) => {
    if (checked) {
      setExpandedCards(new Set(allProjectIds));
    } else {
      setExpandedCards(new Set());
    }
  };

  const toggleCard = (projectId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
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
          <div className="flex flex-col gap-4">
            {/* Toolbar for Expand/Collapse All */}
            <div className="flex items-center space-x-2 px-1 pb-2">
              <Checkbox
                id="expand-all"
                checked={isAllExpanded}
                onCheckedChange={toggleExpandAll}
              />
              <label
                htmlFor="expand-all"
                className="text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Expand Semua Proyek
              </label>
            </div>

            {/* List of Horizontal Cards */}
            {projects.map((project) => {
              const isExpanded = expandedCards.has(project.id);

              return (
                <Card
                  key={project.id}
                  className="overflow-hidden transition-all duration-300"
                >
                  {/* Row 1: Header */}
                  <div className="grid grid-cols-1 items-center gap-4 p-4 md:grid-cols-4 md:px-6 md:py-4">
                    {/* Header Left: Name & Desc */}
                    <div className="flex flex-col col-span-2 gap-1.5">
                      <h3 className="line-clamp-1 text-xl font-bold leading-none">
                        {project.name}
                      </h3>
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p
                              className={
                                isExpanded
                                  ? "line-clamp-3 cursor-pointer text-sm text-muted-foreground text-left"
                                  : "line-clamp-1 cursor-pointer text-sm text-muted-foreground text-left"
                              }
                            >
                              {project.description ||
                                project.location ||
                                "Belum ada deskripsi proyek."}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" align="start">
                            <p className="max-w-xs text-xs">
                              {project.description ||
                                project.location ||
                                "Belum ada deskripsi proyek."}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Header Middle: Status & Dates */}
                    <div className="flex flex-col gap-1.5 md:items-center">
                      <Badge
                        variant={
                          project.status === "ACTIVE"
                            ? "default"
                            : project.status === "DONE"
                              ? "secondary"
                              : "outline"
                        }
                        className="w-fit"
                      >
                        {project.status === "ACTIVE"
                          ? "Aktif"
                          : project.status === "DONE"
                            ? "Selesai"
                            : "Tertunda"}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <IconCalendarEvent className="mr-1.5 h-3.5 w-3.5" />
                        {project.startDate
                          ? format(new Date(project.startDate), "d MMM yy", {
                              locale: id,
                            })
                          : "-"}
                        {" s/d "}
                        {project.endDate
                          ? format(new Date(project.endDate), "d MMM yy", {
                              locale: id,
                            })
                          : "-"}
                      </div>
                    </div>

                    {/* Header Right: Expand & Options */}
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCard(project.id)}
                        className="text-muted-foreground"
                      >
                        {isExpanded ? "Show Less" : "Show More"}
                        {isExpanded ? (
                          <IconChevronUp className="ml-1.5 h-4 w-4" />
                        ) : (
                          <IconChevronDown className="ml-1.5 h-4 w-4" />
                        )}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
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
                    </div>
                  </div>

                  {/* Collapsible Content Wrapper */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key={`content-${project.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.04, 0.62, 0.23, 0.98],
                        }}
                        className="overflow-hidden"
                      >
                        {/* Row 2: Content Grid (Action Shortcuts) */}
                        <div className="grid grid-cols-2 gap-4 border-t bg-card p-4 md:grid-cols-4 md:px-6 md:py-4">
                          {/* Shortcut: Laporan Harian */}
                          <Link
                            href={`/projects/${project.slug}/reports`}
                            className="group flex flex-col gap-2 rounded-xl border bg-muted/20 p-4 shadow-sm transition-colors hover:border-primary/50 hover:bg-muted/50"
                          >
                            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                              <div className="flex items-center">
                                <IconReport className="mr-2 h-4 w-4" />
                                Laporan
                              </div>
                              <span className="text-xs font-bold bg-muted px-1.5 py-0.5 rounded-md">
                                {project._count.dailyReports}
                              </span>
                            </div>

                            {project.dailyReports.length > 0 ? (
                              <div className="flex flex-col gap-1 mt-1 flex-1">
                                <div className="text-sm font-medium line-clamp-2 leading-tight">
                                  {project.dailyReports[0]?.taskDescription ||
                                    "Tanpa deskripsi"}
                                </div>
                                <div className="mt-auto pt-1 flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="truncate pr-2">
                                    {formatDistanceToNow(
                                      new Date(
                                        project.dailyReports[0]?.reportDate ??
                                          new Date(),
                                      ),
                                      { addSuffix: true, locale: id },
                                    )}
                                  </span>
                                  <span className="font-semibold text-primary shrink-0">
                                    {project.dailyReports[0]?.progressPercent}%
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1 mt-1 flex-1">
                                <div className="text-sm font-medium text-muted-foreground italic">
                                  Belum ada aktivitas
                                </div>
                              </div>
                            )}
                          </Link>

                          {/* Shortcut: Kas Darurat */}
                          <Link
                            href={`/projects/${project.slug}/emergency`}
                            className="group flex flex-col gap-2 rounded-xl border bg-muted/20 p-4 shadow-sm transition-colors hover:border-primary/50 hover:bg-muted/50"
                          >
                            <div className="flex items-center text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                              <IconWallet className="mr-2 h-4 w-4" />
                              Kas Darurat
                            </div>

                            <div className="flex flex-col gap-1 mt-1">
                              <div
                                className="truncate text-xl md:text-2xl font-bold text-primary"
                                title={formatCurrency(
                                  Number(
                                    project.emergencyFund?.currentBalance || 0,
                                  ),
                                )}
                              >
                                {formatCurrency(
                                  Number(
                                    project.emergencyFund?.currentBalance || 0,
                                  ),
                                )}
                              </div>
                              {project.emergencyFund?.transactions &&
                              project.emergencyFund.transactions.length > 0 ? (
                                <div className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-auto pt-1">
                                  <span>Trx terbaru:</span>
                                  <span
                                    className={
                                      project.emergencyFund.transactions[0]
                                        ?.type === "WITHDRAWAL"
                                        ? "text-destructive font-medium"
                                        : "text-emerald-500 font-medium"
                                    }
                                  >
                                    {project.emergencyFund.transactions[0]
                                      ?.type === "WITHDRAWAL"
                                      ? "-"
                                      : "+"}
                                    {formatCurrency(
                                      Number(
                                        project.emergencyFund.transactions[0]
                                          ?.amount || 0,
                                      ),
                                    )}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground mt-auto pt-1">
                                  Belum ada transaksi
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* Shortcut: Dokumen */}
                          <Link
                            href={`/projects/${project.slug}/documents`}
                            className="group flex flex-col gap-2 rounded-xl border bg-muted/20 p-4 shadow-sm transition-colors hover:border-primary/50 hover:bg-muted/50"
                          >
                            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                              <div className="flex items-center">
                                <IconFileText className="mr-2 h-4 w-4" />
                                Dokumen
                              </div>
                              <span className="text-xs font-bold bg-muted px-1.5 py-0.5 rounded-md">
                                {project._count.documents}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                              {project.documents.length > 0 ? (
                                project.documents.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="truncate text-sm font-medium"
                                  >
                                    • {doc.fileName}
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm font-medium text-muted-foreground mt-1">
                                  Belum ada dokumen
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* Shortcut: Logistik */}
                          <Link
                            href={`/projects/${project.slug}/logistics`}
                            className="group flex flex-col gap-2 rounded-xl border bg-muted/20 p-4 shadow-sm transition-colors hover:border-primary/50 hover:bg-muted/50"
                          >
                            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                              <div className="flex items-center">
                                <IconBox className="mr-2 h-4 w-4" />
                                Logistik
                              </div>
                              <span className="text-xs font-bold bg-muted px-1.5 py-0.5 rounded-md">
                                {project._count.logistics}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                              {project.logistics.length > 0 ? (
                                project.logistics.map((item) => (
                                  <div
                                    key={item.id}
                                    className="truncate text-sm font-medium"
                                  >
                                    • {item.name}
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm font-medium text-muted-foreground mt-1">
                                  Belum ada item
                                </div>
                              )}
                            </div>
                          </Link>
                        </div>

                        {/* Row 3: Footer */}
                        <div className="grid grid-cols-1 items-center gap-4 border-t bg-muted/30 p-4 md:grid-cols-3 md:px-6 md:py-4">
                          {/* Footer Left: Members & Team Manage Btn */}
                          <div className="flex flex-wrap items-center gap-4">
                            <AvatarGroup>
                              {project.members.slice(0, 3).map((member) => (
                                <Avatar
                                  key={member.id}
                                  className="border-2 border-background"
                                >
                                  <AvatarImage src={member.user.image || ""} />
                                  <AvatarFallback>
                                    {member.user.name
                                      ?.substring(0, 2)
                                      .toUpperCase() || "UN"}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {project.members.length > 3 && (
                                <AvatarGroupCount className="border-2 border-background">
                                  +{project.members.length - 3}
                                </AvatarGroupCount>
                              )}
                            </AvatarGroup>
                            {canManage && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => setTeamProjectId(project.id)}
                              >
                                <IconUsers className="mr-1.5 h-3.5 w-3.5" />
                                Manage Team
                              </Button>
                            )}
                          </div>

                          {/* Footer Middle: Empty Spacer */}
                          <div className="hidden md:block"></div>

                          {/* Footer Right: View Button */}
                          <div className="flex justify-end">
                            <Button asChild className="w-full md:w-auto">
                              <Link href={`/projects/${project.slug}`}>
                                Buka Proyek
                                <IconEye className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-8 text-center">
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

      {/* Team Management Dialog */}
      {teamProjectId && (
        <TeamManagementDialog
          projectId={teamProjectId}
          open={!!teamProjectId}
          onOpenChange={(open) => !open && setTeamProjectId(null)}
        />
      )}
    </PageLayout>
  );
}
