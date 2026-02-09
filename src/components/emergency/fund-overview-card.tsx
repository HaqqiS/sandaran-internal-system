"use client"

import { IconPlus, IconWallet } from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useEmergencyFund } from "~/hooks/useEmergency"
import { FundDialog } from "./fund-dialog"
import { WithdrawDialog } from "./withdraw-dialog"

interface FundOverviewCardProps {
  projectId: string
  projectSlug: string
  canAddFund: boolean
  canWithdraw: boolean
}

export function FundOverviewCard({
  projectId,
  projectSlug,
  canAddFund,
  canWithdraw,
}: FundOverviewCardProps) {
  const { data: fund, isLoading } = useEmergencyFund(projectId)
  const [isFundOpen, setIsFundOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Emergency Fund Balance
          </CardTitle>
          <IconWallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              {isLoading ? (
                <div className="h-8 w-32 animate-pulse rounded bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    Rp{" "}
                    {Number(fund?.currentBalance || 0).toLocaleString("id-ID")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fund?.transactions?.length || 0} total transactions
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-2">
              {canWithdraw && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWithdrawOpen(true)}
                >
                  Withdraw
                </Button>
              )}
              {canAddFund && (
                <Button size="sm" onClick={() => setIsFundOpen(true)}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Funds
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <FundDialog
        projectId={projectId}
        open={isFundOpen}
        onOpenChange={setIsFundOpen}
      />
      <WithdrawDialog
        projectId={projectId}
        projectSlug={projectSlug}
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
      />
    </>
  )
}
