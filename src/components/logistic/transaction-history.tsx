"use client"

import { IconArrowDownLeft, IconArrowUpRight } from "@tabler/icons-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { useLogisticTransactions } from "~/hooks/useLogistic"

interface TransactionHistoryProps {
  projectId: string
  itemId: string
}

export function TransactionHistory({
  projectId,
  itemId,
}: TransactionHistoryProps) {
  const { data: transactions, isLoading } = useLogisticTransactions(
    projectId,
    itemId,
  )

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading history...
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <p>No transactions found for this item.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(transaction.createdAt), "dd MMM yyyy HH:mm")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {transaction.type === "IN" ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                    >
                      <IconArrowDownLeft className="mr-1 h-3 w-3" />
                      IN
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                    >
                      <IconArrowUpRight className="mr-1 h-3 w-3" />
                      OUT
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">
                  {transaction.quantity} {transaction.item.unit}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={transaction.user.image || undefined} />
                    <AvatarFallback>
                      {transaction.user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {transaction.user.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                {transaction.notes || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
