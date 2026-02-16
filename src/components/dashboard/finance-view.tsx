"use client"

import { IconGavel, IconWallet } from "@tabler/icons-react"
import { format } from "date-fns"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  useFinanceFundBreakdown,
  useFinanceRecentTransactions,
  useFinanceStats,
} from "~/hooks"
import { api } from "~/trpc/react"
import { DashboardLayout } from "./shared/DashboardLayout"
import { StatsGrid } from "./shared/StatsGrid"
import { StatCard } from "./stat-card"

export function FinanceView() {
  const { data: stats, isLoading: statsLoading } = useFinanceStats()
  const { data: fundBreakdown, isLoading: fundsLoading } =
    useFinanceFundBreakdown()
  const { data: transactions, isLoading: txLoading } =
    useFinanceRecentTransactions(15)

  const utils = api.useUtils()
  const [reviewingIds, setReviewingIds] = useState<Set<string>>(new Set())

  const verifyMutation = api.emergency.verify.useMutation({
    onMutate: (variables) => {
      setReviewingIds((prev) => new Set(prev).add(variables.transactionId))
    },
    onSuccess: () => {
      toast.success("Transaction marked as reviewed")
      void utils.emergency.getRecentTransactions.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: (_data, _error, variables) => {
      setReviewingIds((prev) => {
        const next = new Set(prev)
        next.delete(variables.transactionId)
        return next
      })
    },
  })

  const handleMarkAsReviewed = (transactionId: string, projectId: string) => {
    verifyMutation.mutate({
      transactionId,
      projectId,
      status: "REVIEWED",
    })
  }

  const isLoading = statsLoading || fundsLoading || txLoading

  return (
    <DashboardLayout
      title="Finance Dashboard"
      description="Emergency fund management and transaction oversight"
    >
      {/* Top Stats */}
      <StatsGrid cols={{ mobile: 2, tablet: 2, desktop: 2 }}>
        <StatCard
          title="Pending Reviews"
          value={stats?.pendingApprovals ?? 0}
          icon={IconGavel}
          description="Emergency fund requests"
          variant={
            stats?.pendingApprovals && stats.pendingApprovals > 0
              ? "warning"
              : "default"
          }
          trend={
            (stats?.pendingApprovals ?? 0) > 0
              ? { value: "Action Required", label: "Urgent", positive: false }
              : { value: "All Clear", label: "", positive: true }
          }
          isLoading={statsLoading}
        />
        <StatCard
          title="Monthly Withdrawals"
          value={`Rp ${Number(stats?.monthlyWithdrawals ?? 0).toLocaleString(
            "id-ID",
          )}`}
          icon={IconWallet}
          description="Total approved this month"
          isLoading={statsLoading}
        />
      </StatsGrid>

      {/* Emergency Fund Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Fund by Project</CardTitle>
          <CardDescription>
            Current balance across all managed projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fundsLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">
                Loading fund breakdown...
              </p>
            </div>
          ) : !fundBreakdown?.length ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">
                No emergency funds available
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fundBreakdown.map((fund) => (
                <div
                  key={fund.projectId}
                  className="rounded-lg border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {fund.projectName}
                      </p>
                      <p className="mt-1 text-2xl font-bold">
                        Rp {Number(fund.currentBalance).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <IconWallet className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    asChild
                  >
                    <Link href={`/projects/${fund.projectSlug}`}>
                      View Project
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest emergency fund activities across all projects
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/emergency">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">
                Loading transactions...
              </p>
            </div>
          ) : !transactions?.length ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">
                No transactions found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">
                        {format(new Date(tx.createdAt), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {tx.project.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.type === "DEPOSIT" ? "default" : "outline"
                          }
                        >
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        Rp {Number(tx.amount).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.requester.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.status === "REVIEWED" ? "secondary" : "default"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {tx.status === "UNREVIEWED" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleMarkAsReviewed(tx.id, tx.project.id)
                            }
                            disabled={reviewingIds.has(tx.id)}
                          >
                            {reviewingIds.has(tx.id)
                              ? "Reviewing..."
                              : "Mark Reviewed"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
