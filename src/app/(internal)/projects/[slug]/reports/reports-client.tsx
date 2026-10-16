"use client";

import type { GlobalRole, ProjectRole } from "@prisma/client";
import {
  IconArrowLeft,
  IconLayoutGrid,
  IconList,
  IconLoader2,
  IconPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { PageLayout } from "~/components/layout";
import { ReportDialog } from "~/components/report/report-dialog";
import { ReportList } from "~/components/report/report-list";
import type { ReportViewMode } from "~/components/report/types";
import { Button } from "~/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { useProjectBySlug } from "~/hooks";
import { useSessionStore } from "~/stores/use-session-store";

const VIEW_MODE_STORAGE_KEY = "sandaran_reports_view_mode";

interface ReportsClientProps {
  projectSlug: string;
}

export function ReportsClient({ projectSlug }: ReportsClientProps) {
  const { data: project, isLoading, error } = useProjectBySlug(projectSlug);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ReportViewMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (saved === "grid" || saved === "list") return saved;
    }
    return "grid";
  });
  const session = useSessionStore((state) => state.session);

  const handleViewModeChange = (mode: ReportViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  };

  // Check if user can create reports (SUPERVISOR or ARCHITECT, or ADMIN)
  const userRole = session?.user?.roleGlobal as GlobalRole | undefined;
  const isAdmin = userRole === "ADMIN" || userRole === "EXECUTIVE";
  const projectMember = project?.members.find(
    (m) => m.userId === session?.user?.id,
  );
  const memberRole = projectMember?.role as ProjectRole | undefined;
  const canCreate =
    isAdmin || memberRole === "SUPERVISOR" || memberRole === "ARCHITECT";

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <PageLayout title="Laporan">
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-semibold">Proyek tidak ditemukan</h2>
          <p className="text-muted-foreground">
            Proyek yang Anda cari tidak ada.
          </p>
          <Button asChild variant="outline">
            <Link href="/projects">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Proyek
            </Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${project.name} — Laporan`}
      actions={
        <div className="flex items-center gap-2.5">
          <ToggleGroup
            type="single"
            spacing={1}
            value={viewMode}
            onValueChange={(val) =>
              val && handleViewModeChange(val as ReportViewMode)
            }
            className="rounded-lg border border-border/70 bg-muted/60 p-0.5 shadow-2xs"
          >
            <ToggleGroupItem
              value="grid"
              aria-label="Tampilan Grid"
              className="h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-all hover:bg-transparent hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs"
            >
              <IconLayoutGrid className="size-3.5" />
              <span>Grid</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              aria-label="Tampilan List"
              className="h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-all hover:bg-transparent hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs"
            >
              <IconList className="size-3.5" />
              <span>List</span>
            </ToggleGroupItem>
          </ToggleGroup>

          {canCreate && (
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <IconPlus className="mr-1.5 h-4 w-4" />
              Laporan Baru
            </Button>
          )}
        </div>
      }
    >
      <div className="p-4 md:p-6">
        <ReportList
          projectId={project.id}
          projectSlug={projectSlug}
          viewMode={viewMode}
          canCreate={canCreate}
          onCreateClick={() => setIsCreateOpen(true)}
        />
      </div>

      <ReportDialog
        projectId={project.id}
        projectSlug={projectSlug}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </PageLayout>
  );
}
