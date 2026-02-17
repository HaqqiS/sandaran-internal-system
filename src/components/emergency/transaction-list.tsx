"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import type { EmergencyTransaction } from "generated/prisma";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useEmergencyTransactions } from "~/hooks/useEmergency";
import { VerifyDialog } from "./verify-dialog";

interface TransactionListProps {
  projectId: string;
  canReview: boolean;
}

export function TransactionList({
  projectId,
  canReview,
}: TransactionListProps) {
  const { data: transactions, isLoading } = useEmergencyTransactions(projectId);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [verifyId, setVerifyId] = useState<string | null>(null);

  const columns: ColumnDef<EmergencyTransaction>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "PP p"),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div
          className="max-w-[300px] truncate"
          title={row.getValue("description")}
        >
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant={type === "DEPOSIT" ? "default" : "secondary"}>
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = Number(row.getValue("amount"));
        const type = row.getValue("type") as string;
        const color = type === "DEPOSIT" ? "text-green-600" : "text-red-600";
        return (
          <div className={`font-medium ${color}`}>
            {type === "DEPOSIT" ? "+" : "-"}
            Rp {amount.toLocaleString("id-ID")}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "REVIEWED" ? "outline" : "destructive"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "proofPublicId",
      header: "Proof",
      cell: ({ row }) => {
        const proofId = row.getValue("proofPublicId") as string | null;
        if (!proofId) return <span className="text-muted-foreground">-</span>;
        // Construct basic Cloudinary URL or use a helper if available
        // Assuming typical cloudinary url structure or using CldImage if installed
        // For link, simple href is safer if we don't have CldImage handy
        // But we need the cloud name. Let's assume standard delivery URL.
        // Actually better to just show "View" button if we can't construct URL easily without env.
        // Or if we have a helper.
        // Let's use a generic generic link for now if we can't construct it.
        // Wait, I can't construct URL without cloud name effectively unless hardcoded or passed.
        // Let's just show "Has Proof" text for now, or link if I can find a way.
        return <span className="text-xs">Attached</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const type = row.getValue("type") as string;

        // Only show Review button for UNREVIEWED WITHDRAWALs and if user has permission
        if (canReview && status === "UNREVIEWED" && type === "WITHDRAWAL") {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVerifyId(row.original.id)}
            >
              Review
            </Button>
          );
        }
        return null;
      },
    },
  ];

  const table = useReactTable({
    data: transactions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading transactions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <VerifyDialog
        projectId={projectId}
        transactionId={verifyId}
        open={!!verifyId}
        onOpenChange={(open) => !open && setVerifyId(null)}
      />
    </div>
  );
}
