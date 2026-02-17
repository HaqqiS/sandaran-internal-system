"use client";

import {
  IconArrowUpRight,
  IconChartBar,
  IconChecklist,
  IconFolder,
} from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useCEOStats } from "~/hooks";
import { DashboardLayout } from "./shared/DashboardLayout";
import { StatsGrid } from "./shared/StatsGrid";
import { StatCard } from "./stat-card";

export function CEOView() {
  const { data: stats, isLoading } = useCEOStats();

  return (
    <DashboardLayout
      title="Executive Overview"
      description="High-level analytics and status across all projects"
    >
      {/* Top Stats */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 4 }}>
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects ?? 0}
          icon={IconFolder}
          isLoading={isLoading}
        />
        <StatCard
          title="Active Projects"
          value={stats?.activeProjects ?? 0}
          icon={IconChecklist}
          isLoading={isLoading}
        />
        <StatCard
          title="Overall Progress"
          value="75%"
          icon={IconChartBar}
          description="Average across active projects"
          trend={{ value: "+5%", label: "this month", positive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Financial Health"
          value="Healthy"
          icon={IconArrowUpRight}
          description="Based on budget utilization"
          trend={{ value: "On Track", label: "", positive: true }}
          isLoading={isLoading}
        />
      </StatsGrid>

      {/* Projects Overview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Projects Overview</CardTitle>
          <CardDescription>
            High-level status of all ongoing projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : !stats?.projects.length ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">No projects found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reports (Total)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {project.name}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                      ${
                        project.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : project.status === "DONE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                      >
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell>{project._count.dailyReports}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/projects/${project.slug}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/projects/${project.slug}/reports`}>
                            View Reports
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Future: Charts & Analytics Section */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle>Analytics & Trends</CardTitle>
          <CardDescription>
            Historical data and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <IconChartBar className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Charts and trend analysis coming soon...
            </p>
            <p className="text-xs text-muted-foreground">
              Historical data aggregation will be added in a future update
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
