"use client"

import { IconCashBanknote, IconGavel } from "@tabler/icons-react"
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

export function FinanceView() {
  const { data: stats, isLoading } = api.dashboard.getFinanceStats.useQuery()

  if (isLoading) {
    return <div>Loading Finance dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingApprovals ?? 0}
          icon={IconGavel}
          description="Emergency Fund requests"
          trend={
            (stats?.pendingApprovals ?? 0) > 0
              ? { value: "Action Required", label: "Urgent", positive: false }
              : { value: "All Clear", label: "", positive: true }
          }
        />
        <StatCard
          title="Budget Status"
          value="Healthy"
          icon={IconCashBanknote}
          description="Overall fund utilization"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Approval Queue</CardTitle>
            <CardDescription>Requests awaiting your review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(stats?.pendingApprovals ?? 0) > 0 ? (
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-yellow-800 font-medium">
                  {stats?.pendingApprovals} requests waiting for approval.
                </p>
                <Button asChild variant="outline" className="mt-2 w-full">
                  <Link href="/emergency/approvals">Go to Approvals</Link>
                </Button>
              </div>
            ) : (
              <div className="text-muted-foreground p-4 text-center">
                No pending approvals.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
