"use client";

import {
  IconActivity,
  IconLoader2,
  IconPencil,
  IconTrendingUp,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import type { GlobalRole, ProjectRole } from "generated/prisma";
import { useState } from "react";
import { FundDialog } from "~/components/emergency/fund-dialog";
import { WithdrawDialog } from "~/components/emergency/withdraw-dialog";
import { PageLayout } from "~/components/layout";

import {
  DocumentsSection,
  EmergencyFundSection,
  LogisticsSection,
  ProjectInfoSection,
  RecentReportsSection,
} from "~/components/project/overview";
import { ProjectDialog } from "~/components/project/project-dialog";
import { TeamManagementDialog } from "~/components/project/team-management-dialog";
import { ReportDialog } from "~/components/report/report-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useProjectBySlug, useReportsByProject } from "~/hooks";
import { useEmergencyFund } from "~/hooks/useEmergency";
import { isAdmin } from "~/lib/auth-guards";
import { useSessionStore } from "~/stores/use-session-store";

interface ProjectDetailClientProps {
  slug: string;
}

export function ProjectDetailClient({ slug }: ProjectDetailClientProps) {
  const { data: project, isLoading, error } = useProjectBySlug(slug);
  const { data: reportsData } = useReportsByProject(project?.id ?? "");
  const { data: emergencyFund } = useEmergencyFund(project?.id ?? "");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false);
  const [isFundOpen, setIsFundOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const session = useSessionStore((state) => state.session);
  const canManage = isAdmin(
    session?.user?.roleGlobal as GlobalRole | null | undefined,
  );

  // Check user roles
  const userRole = session?.user?.roleGlobal as GlobalRole | undefined;
  const isAdminRole = userRole === "ADMIN" || userRole === "CEO";

  const projectMember = project?.members.find(
    (m) => m.userId === session?.user?.id,
  );
  const memberRole = projectMember?.role as ProjectRole | undefined;

  const canCreateReport =
    isAdminRole || memberRole === "MANDOR" || memberRole === "ARCHITECT";

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <PageLayout title="Proyek Tidak Ditemukan">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-semibold">Proyek tidak ditemukan</h2>
          <p className="text-muted-foreground">
            Proyek yang Anda cari tidak ada atau Anda tidak memiliki akses.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={project.name}
      actions={
        canManage && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTeamOpen(true)}
            >
              <IconUsers className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Kelola Tim</span>
              <span className="inline sm:hidden">Tim</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
            >
              <IconPencil className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Edit Proyek</span>
              <span className="inline sm:hidden">Edit</span>
            </Button>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* Enhanced Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Overall Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Progres Keseluruhan
              </CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportsData?.reports && reportsData.reports.length > 0
                  ? Math.round(
                      reportsData.reports.reduce(
                        (acc, r) => acc + r.progressPercent,
                        0,
                      ) / reportsData.reports.length,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Berdasarkan {project._count.dailyReports} laporan
              </p>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anggota Tim</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.members.length}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {[
                  {
                    role: "MANDOR",
                    label: "Mandor",
                    count: project.members.filter((m) => m.role === "MANDOR")
                      .length,
                  },
                  {
                    role: "ARCHITECT",
                    label: "Arsitek",
                    count: project.members.filter((m) => m.role === "ARCHITECT")
                      .length,
                  },
                  {
                    role: "FINANCE",
                    label: "Keuangan",
                    count: project.members.filter((m) => m.role === "FINANCE")
                      .length,
                  },
                ]
                  .filter((r) => r.count > 0)
                  .map((r) => (
                    <Badge key={r.role} variant="outline" className="text-xs">
                      {r.label}: {r.count}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aktivitas Terbaru
              </CardTitle>
              <IconActivity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-base font-medium">
                {reportsData?.reports && reportsData.reports.length > 0
                  ? formatDistanceToNow(
                      new Date(reportsData?.reports[0]?.reportDate ?? ""),
                      { addSuffix: true, locale: id },
                    )
                  : "Belum ada aktivitas"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Laporan terakhir dikirim
              </p>
            </CardContent>
          </Card>

          {/* Budget Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kas Darurat</CardTitle>
              <IconWallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp{" "}
                {Number(emergencyFund?.currentBalance || 0).toLocaleString(
                  "id-ID",
                  { maximumFractionDigits: 0 },
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Saldo Dana Darurat
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Overview Sections */}
        <ProjectInfoSection project={project} />

        <RecentReportsSection
          projectId={project.id}
          projectSlug={project.slug}
          canCreate={canCreateReport}
          onCreate={() => setIsCreateReportOpen(true)}
        />

        <EmergencyFundSection
          projectId={project.id}
          projectSlug={project.slug}
        />

        <LogisticsSection projectId={project.id} projectSlug={project.slug} />

        <DocumentsSection projectId={project.id} projectSlug={project.slug} />
      </div>

      {canManage && (
        <ProjectDialog
          project={project}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}

      <ReportDialog
        projectId={project.id}
        projectSlug={project.slug}
        open={isCreateReportOpen}
        onOpenChange={setIsCreateReportOpen}
      />

      <FundDialog
        projectId={project.id}
        projectSlug={project.slug}
        open={isFundOpen}
        onOpenChange={setIsFundOpen}
      />

      <WithdrawDialog
        projectId={project.id}
        projectSlug={project.slug}
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
      />

      <TeamManagementDialog
        projectId={project.id}
        open={isTeamOpen}
        onOpenChange={setIsTeamOpen}
      />
    </PageLayout>
  );
}
