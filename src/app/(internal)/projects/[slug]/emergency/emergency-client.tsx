"use client"

import { IconPlus } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import { FundDialog } from "~/components/emergency/fund-dialog"
import { FundOverview } from "~/components/emergency/fund-overview"
import { TransactionList } from "~/components/emergency/transaction-list"
import { WithdrawDialog } from "~/components/emergency/withdraw-dialog"
import { PageLayout } from "~/components/layout"
import { Button } from "~/components/ui/button"
import { useProjectBySlug } from "~/hooks"
import { useUserRole } from "~/hooks/use-user-role"
import { useSession } from "~/stores/use-session-store"

export function EmergencyClient() {
  const params = useParams()
  const slug = params?.slug as string

  const {
    data: project,
    isLoading: isProjectLoading,
    error,
  } = useProjectBySlug(slug)
  const { user } = useSession()
  const { isAdmin } = useUserRole()

  const [isFundOpen, setIsFundOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)

  if (isProjectLoading) {
    return (
      <PageLayout title="Emergency Fund">
        <div>Loading emergency fund details...</div>
      </PageLayout>
    )
  }

  if (error || !project) {
    return (
      <PageLayout title="Emergency Fund">
        <div>Project not found</div>
      </PageLayout>
    )
  }

  // Determine permissions based on project membership
  const projectMember = project.members.find((m) => m.userId === user?.id)
  const memberRole = projectMember?.role

  const canAddFund = isAdmin || memberRole === "FINANCE"
  const canWithdraw = isAdmin || memberRole === "MANDOR"
  const canReview = isAdmin || memberRole === "FINANCE"

  return (
    <PageLayout
      title="Emergency Fund"
      actions={
        <>
          {canWithdraw && (
            <Button variant="outline" onClick={() => setIsWithdrawOpen(true)}>
              Withdraw
            </Button>
          )}
          {canAddFund && (
            <Button onClick={() => setIsFundOpen(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Funds
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Emergency Fund</h2>
          <p className="text-muted-foreground">
            Manage emergency funds and view transaction history for{" "}
            {project.name}.
          </p>
        </div>

        <div className="grid gap-6">
          <FundOverview projectId={project.id} />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Transaction History</h3>
            <TransactionList projectId={project.id} canReview={canReview} />
          </div>
        </div>
      </div>

      <FundDialog
        projectId={project.id}
        open={isFundOpen}
        onOpenChange={setIsFundOpen}
      />

      <WithdrawDialog
        projectId={project.id}
        projectSlug={project.slug}
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
      />
    </PageLayout>
  )
}
