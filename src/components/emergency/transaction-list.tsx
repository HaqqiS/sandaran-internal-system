"use client";

import { IconZoomIn } from "@tabler/icons-react";
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
import { MediaPreview } from "~/components/shared/media-preview";
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
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const columns: ColumnDef<EmergencyTransaction>[] = [
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "PP p"),
    },
    {
      accessorKey: "description",
      header: "Keterangan",
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
      header: "Tipe",
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
      header: "Jumlah",
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
      accessorKey: "publicId",
      header: "Bukti",
      cell: ({ row }) => {
        const proofUrl = row.original.url;
        if (!proofUrl) return <span className="text-muted-foreground">-</span>;
        return (
          <button
            type="button"
            className="group relative h-10 w-10 overflow-hidden rounded border bg-muted flex items-center justify-center cursor-pointer"
            onClick={() => setLightboxImage(proofUrl)}
          >
            {/* biome-ignore lint: using img for Cloudinary external URLs */}
            <img
              src={proofUrl}
              alt="Proof"
              className="h-full w-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
              <IconZoomIn className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>
        );
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
              Tinjau
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
    return <div className="p-4 text-center">Memuat transaksi...</div>;
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
                  Tidak ada transaksi ditemukan.
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

      <MediaPreview
        url={lightboxImage}
        open={!!lightboxImage}
        onOpenChange={(open) => !open && setLightboxImage(null)}
      />
    </div>
  );
}
