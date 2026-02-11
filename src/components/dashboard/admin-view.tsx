"use client"

import {
  IconAlertTriangle,
  IconBuildingSkyscraper,
  IconPlus,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { api } from "~/trpc/react"
import { StatCard } from "./stat-card"

export function AdminView() {
  const { data: stats, isLoading } = api.dashboard.getAdminStats.useQuery()

  if (isLoading) {
    return <div>Loading admin stats...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Projects"
          value={stats?.activeProjects ?? 0}
          icon={IconBuildingSkyscraper}
          description="Currently in progress"
        />
        <StatCard
          title="Pending Users"
          value={stats?.pendingUsers ?? 0}
          icon={IconUserCheck}
          description="Awaiting approval"
          trend={
            stats?.pendingUsers && stats.pendingUsers > 0
              ? {
                  value: stats.pendingUsers,
                  label: "users waiting",
                  positive: false, // red if pending
                }
              : undefined
          }
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={IconUsers}
        />
        <StatCard
          title="Logistics Alerts"
          value={stats?.lowStockItems ?? 0}
          icon={IconAlertTriangle}
          description="Items needing attention"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>
              Manage your system resources and users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Placeholder for future charts or lists */}
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">
                System activity chart will go here.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild className="w-full" variant="outline">
              <Link href="/users?tab=pending">
                <IconUserCheck className="mr-2 h-4 w-4" />
                Review Pending Users
              </Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href="/projects/new">
                <IconPlus className="mr-2 h-4 w-4" />
                Create New Project
              </Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href="/logistics">
                <IconAlertTriangle className="mr-2 h-4 w-4" />
                Check Low Stock
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
