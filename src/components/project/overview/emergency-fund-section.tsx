"use client";

import {
  IconChevronRight,
  IconLoader2,
  IconPlus,
  IconWallet,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  useEmergencyFund,
  useEmergencyTransactions,
} from "~/hooks/useEmergency";

interface EmergencyFundSectionProps {
  projectId: string;
  projectSlug: string;
  canAddFund?: boolean;
  canWithdraw?: boolean;
  onAddFund?: () => void;
  onWithdraw?: () => void;
}

export function EmergencyFundSection({
  projectId,
  projectSlug,
  canAddFund = false,
  canWithdraw = false,
  onAddFund,
  onWithdraw,
}: EmergencyFundSectionProps) {
  const { data: fund, isLoading: fundLoading } = useEmergencyFund(projectId);
  const { data: transactions, isLoading: transactionsLoading } =
    useEmergencyTransactions(projectId);

  const isLoading = fundLoading || transactionsLoading;
  const recentTransactions = transactions?.slice(0, 3) ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle>Emergency Fund</CardTitle>
        </div>
        <Link href={`/projects/${projectSlug}/emergency`}>
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Balance Section */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold mt-1">
                  Rp {Number(fund?.currentBalance || 0).toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {fund?.transactions?.length || 0} total transactions
                </p>
              </div>
              <IconWallet className="h-10 w-10 text-muted-foreground/50" />
            </div>

            {/* Action Buttons */}
            {(canAddFund || canWithdraw) && (
              <div className="flex gap-2">
                {canWithdraw && onWithdraw && (
                  <Button variant="outline" size="sm" onClick={onWithdraw}>
                    Withdraw
                  </Button>
                )}
                {canAddFund && onAddFund && (
                  <Button size="sm" onClick={onAddFund}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Add Funds
                  </Button>
                )}
              </div>
            )}

            {/* Recent Transactions */}
            {recentTransactions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Recent Activity</p>
                <div className="space-y-2">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-md border p-3 text-sm"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="font-medium line-clamp-1">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(transaction.createdAt),
                            "dd MMM yyyy, HH:mm",
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            transaction.type === "DEPOSIT"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {transaction.type}
                        </Badge>
                        <p
                          className={`font-medium ${
                            transaction.type === "DEPOSIT"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "DEPOSIT" ? "+" : "-"}
                          Rp{" "}
                          {Number(transaction.amount).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
