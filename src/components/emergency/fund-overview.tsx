"use client"

import { IconWallet } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useEmergencyFund } from "~/hooks/useEmergency"

interface FundOverviewProps {
  projectId: string
  actions?: React.ReactNode
}

export function FundOverview({ projectId, actions }: FundOverviewProps) {
  const { data: fund, isLoading } = useEmergencyFund(projectId)

  return (
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
                  Rp {Number(fund?.currentBalance || 0).toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {fund?.transactions?.length || 0} total transactions
                </p>
              </>
            )}
          </div>

          <div className="flex gap-2">{actions}</div>
        </div>
      </CardContent>
    </Card>
  )
}
