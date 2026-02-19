"use client";

import {
  IconAlertTriangle,
  IconBuildingSkyscraper,
  IconCloud,
  IconPlus,
  IconUserCheck,
  IconUsers,
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
import { Separator } from "~/components/ui/separator";
import { useAdminStats, useUserListWithFilter } from "~/hooks";
import { DashboardLayout } from "./shared/DashboardLayout";
import { QuickActionCard } from "./shared/QuickActionCard";
import { StatsGrid } from "./shared/StatsGrid";
import { StatCard } from "./stat-card";

export function AdminView() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: pendingUsers, isLoading: usersLoading } = useUserListWithFilter(
    { filter: "pending", search: "" },
  );

  return (
    <DashboardLayout
      title="Admin Dashboard"
      description="System management and oversight"
    >
      {/* Top Stats */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 5 }}>
        <StatCard
          title="Active Projects"
          value={stats?.activeProjects ?? 0}
          icon={IconBuildingSkyscraper}
          description="Currently in progress"
          isLoading={statsLoading}
        />
        <StatCard
          title="Users"
          value={stats?.totalUsers ?? 0}
          icon={IconUsers}
          description={`${stats?.activeUsers ?? 0} Active · ${stats?.pendingUsers ?? 0} Pending · ${stats?.rejectedUsers ?? 0} Rejected`}
          variant={
            stats?.pendingUsers && stats.pendingUsers > 0
              ? "warning"
              : "default"
          }
          isLoading={statsLoading}
        />
        <StatCard
          title="Logistics Alerts"
          value={stats?.lowStockItems ?? 0}
          icon={IconAlertTriangle}
          description="Items needing attention"
          isLoading={statsLoading}
        />
        <StatCard
          title="Storage Used"
          value="2.4 GB"
          icon={IconCloud}
          description="Cloudinary storage"
          trend={{ value: "+12%", label: "this month", positive: false }}
          isLoading={statsLoading}
        />
      </StatsGrid>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pending Users Preview */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending User Approvals</CardTitle>
                <CardDescription>
                  Recent users awaiting activation
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/users?tab=pending">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">
                  Loading pending users...
                </p>
              </div>
            ) : !pendingUsers?.length ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">
                  No pending users at this time
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((user, index) => (
                  <div key={user.id}>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/users?highlight=${user.id}`}>Review</Link>
                      </Button>
                    </div>
                    {index < pendingUsers.length - 1 && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="col-span-4 lg:col-span-3">
          <QuickActionCard
            title="Quick Actions"
            description="Common administrative tasks"
            actions={[
              {
                label: "Review Pending Users",
                icon: <IconUserCheck className="h-4 w-4" />,
                href: "/users?tab=pending",
                variant: "outline",
              },
              {
                label: "Create New Project",
                icon: <IconPlus className="h-4 w-4" />,
                href: "/projects/new",
                variant: "outline",
              },
              {
                label: "Check Low Stock",
                icon: <IconAlertTriangle className="h-4 w-4" />,
                href: "/logistics",
                variant: "outline",
              },
            ]}
          />
        </div>
      </div>

      {/* System Overview Placeholder */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Activity metrics and system health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <IconBuildingSkyscraper className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              System activity chart coming soon...
            </p>
            <p className="text-xs text-muted-foreground">
              Real-time monitoring and analytics will be added in a future
              update
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
