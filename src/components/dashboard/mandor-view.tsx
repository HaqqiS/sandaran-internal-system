"use client";

import {
  IconClipboardCheck,
  IconListCheck,
  IconPhoto,
  IconWallet,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { WithdrawDialog } from "~/components/emergency/withdraw-dialog";
import { ReportDialog } from "~/components/report/report-dialog";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useMandorRecentReports, useMandorStats } from "~/hooks";
import { DashboardLayout } from "./shared/DashboardLayout";
import { QuickActionCard } from "./shared/QuickActionCard";
import { StatsGrid } from "./shared/StatsGrid";
import { StatCard } from "./stat-card";

export function MandorView() {
  const { data: stats, isLoading: statsLoading } = useMandorStats();
  const { data: recentReports, isLoading: reportsLoading } =
    useMandorRecentReports(3);

  const [selectedProject, setSelectedProject] = useState<{
    id: string;
    slug: string;
  } | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const handleCreateReport = (project: { id: string; slug: string }) => {
    setSelectedProject(project);
    setIsReportOpen(true);
  };

  const handleWithdrawal = (project: { id: string; slug: string }) => {
    setSelectedProject(project);
    setIsWithdrawOpen(true);
  };

  return (
    <DashboardLayout
      title="Mandor Dashboard"
      description="Field operations and daily report management"
    >
      {/* Top Stats */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 2 }}>
        <StatCard
          title="Assigned Projects"
          value={stats?.projectCount ?? 0}
          icon={IconListCheck}
          isLoading={statsLoading}
        />
        <StatCard
          title="Reports Due Today"
          value={stats?.reportsDue ?? 0}
          icon={IconClipboardCheck}
          description="Make sure to submit before 5 PM"
          variant={
            stats?.reportsDue && stats.reportsDue > 0 ? "warning" : "default"
          }
          trend={
            (stats?.reportsDue ?? 0) > 0
              ? {
                  value: stats?.reportsDue ?? 0,
                  label: "Pending",
                  positive: false,
                }
              : { value: "All Done", label: "Good job!", positive: true }
          }
          isLoading={statsLoading}
        />
      </StatsGrid>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Quick Actions */}
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Submit daily reports for your projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-sm text-muted-foreground">
                    Loading projects...
                  </p>
                </div>
              ) : !stats?.projects.length ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-sm text-muted-foreground">
                    No active projects assigned.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.projects.map((project, index) => (
                    <div key={project.id}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-semibold">
                            {project.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {project._count.dailyReports} reports submitted
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleWithdrawal({
                                id: project.id,
                                slug: project.slug ?? "",
                              })
                            }
                          >
                            <IconWallet className="mr-2 h-4 w-4" />
                            Withdraw
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleCreateReport({
                                id: project.id,
                                slug: project.slug ?? "",
                              })
                            }
                          >
                            Create Report
                          </Button>
                        </div>
                      </div>
                      {index < stats.projects.length - 1 && (
                        <Separator className="mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div className="lg:col-span-3 col-span-4 space-y-4">
          <QuickActionCard
            title="Navigation"
            description="Quick access"
            actions={[
              {
                label: "View All Projects",
                icon: <IconListCheck className="h-4 w-4" />,
                href: "/projects",
              },
              {
                label: "View Recent Reports",
                icon: <IconClipboardCheck className="h-4 w-4" />,
                href: "/reports",
              },
            ]}
          />

          {/* Recent Reports Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Your latest submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <p className="text-xs text-muted-foreground">
                    Loading reports...
                  </p>
                </div>
              ) : !recentReports?.length ? (
                <div className="flex items-center justify-center p-4">
                  <p className="text-xs text-muted-foreground">
                    No recent reports
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <Link
                      key={report.id}
                      href={`/projects/${report.project.slug}/reports/${report.slug}`}
                      className="block"
                    >
                      <div className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-accent">
                        {report.thumbnail ? (
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded">
                            <Image
                              src={report.thumbnail}
                              alt="Report thumbnail"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-muted">
                            <IconPhoto className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {report.project.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {report.taskDescription}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {format(new Date(report.reportDate), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      {selectedProject && (
        <ReportDialog
          projectId={selectedProject.id}
          open={isReportOpen}
          onOpenChange={(open) => {
            setIsReportOpen(open);
            if (!open) setSelectedProject(null);
          }}
        />
      )}

      {selectedProject && (
        <WithdrawDialog
          projectId={selectedProject.id}
          projectSlug={selectedProject.slug}
          open={isWithdrawOpen}
          onOpenChange={setIsWithdrawOpen}
        />
      )}
    </DashboardLayout>
  );
}
