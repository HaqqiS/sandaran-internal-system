"use client";

import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconZoomIn,
} from "@tabler/icons-react";
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
import { toast } from "sonner";
import { MediaPreview } from "~/components/shared/media-preview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  useDeleteEmergencyTransaction,
  useEmergencyTransactions,
} from "~/hooks/useEmergency";
import { FundDialog } from "./fund-dialog";
import { VerifyDialog } from "./verify-dialog";
import { WithdrawDialog } from "./withdraw-dialog";

// Extended transaction type that includes requester relation
type TransactionWithRelations = EmergencyTransaction & {
  requester?: { id: string; name: string; image: string | null } | null;
  verifier?: { id: string; name: string; image: string | null } | null;
};

interface TransactionListProps {
  projectId: string;
  projectSlug: string;
  canReview: boolean;
  currentUserId?: string;
  isAdmin: boolean;
}

export function TransactionList({
  projectId,
  projectSlug,
  canReview,
  currentUserId,
  isAdmin,
}: TransactionListProps) {
  const { data: transactions, isLoading } = useEmergencyTransactions(projectId);
  const deleteTransaction = useDeleteEmergencyTransaction();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [verifyId, setVerifyId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    description: string;
  } | null>(null);

  // Edit state for DEPOSIT
  const [editFund, setEditFund] = useState<{
    transactionId: string;
    amount: string;
    description: string;
    proofPublicId?: string;
    proofUrl?: string;
  } | null>(null);

  // Edit state for WITHDRAWAL
  const [editWithdraw, setEditWithdraw] = useState<{
    transactionId: string;
    amount: string;
    description: string;
    proofPublicId?: string;
    proofUrl?: string;
  } | null>(null);

  /**
   * Determine if the current user can edit/delete a given transaction
   */
  function canEditDelete(row: TransactionWithRelations): boolean {
    // ADMIN can always edit/delete
    if (isAdmin) return true;

    // Owner check
    const isOwner = row.requestedById === currentUserId;
    if (!isOwner) return false;

    // WITHDRAWAL must be UNREVIEWED
    if (row.type === "WITHDRAWAL" && row.status !== "UNREVIEWED") return false;

    return true;
  }

  function handleEditClick(row: TransactionWithRelations) {
    const initialValues = {
      amount: String(Number(row.amount)),
      description: row.description,
      proofPublicId: row.publicId ?? undefined,
      proofUrl: row.url ?? undefined,
    };

    if (row.type === "DEPOSIT") {
      setEditFund({
        transactionId: row.id,
        ...initialValues,
      });
    } else {
      setEditWithdraw({
        transactionId: row.id,
        ...initialValues,
      });
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteTransaction.mutateAsync({
        projectId,
        transactionId: deleteTarget.id,
      });
      toast.success("Transaksi berhasil dihapus");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus transaksi";
      toast.error(message);
      console.error(error);
    } finally {
      setDeleteTarget(null);
    }
  }

  const columns: ColumnDef<TransactionWithRelations>[] = [
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
        const showReview =
          canReview && status === "UNREVIEWED" && type === "WITHDRAWAL";
        const showEditDelete = canEditDelete(row.original);

        if (!showReview && !showEditDelete) return null;

        return (
          <div className="flex items-center gap-1">
            {showReview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVerifyId(row.original.id)}
              >
                Tinjau
              </Button>
            )}
            {showEditDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="Aksi lainnya"
                  >
                    <IconDotsVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleEditClick(row.original)}
                  >
                    <IconEdit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() =>
                      setDeleteTarget({
                        id: row.original.id,
                        description: row.original.description,
                      })
                    }
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: (transactions as TransactionWithRelations[]) || [],
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

      {/* Review Dialog */}
      <VerifyDialog
        projectId={projectId}
        transactionId={verifyId}
        open={!!verifyId}
        onOpenChange={(open) => !open && setVerifyId(null)}
      />

      {/* Lightbox */}
      <MediaPreview
        url={lightboxImage}
        open={!!lightboxImage}
        onOpenChange={(open) => !open && setLightboxImage(null)}
      />

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transaksi &quot;
              {deleteTarget?.description}&quot;? Tindakan ini tidak dapat
              dibatalkan dan saldo akan disesuaikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTransaction.isPending}
            >
              {deleteTransaction.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Deposit Dialog */}
      <FundDialog
        projectId={projectId}
        projectSlug={projectSlug}
        open={!!editFund}
        onOpenChange={(open) => !open && setEditFund(null)}
        mode="edit"
        transactionId={editFund?.transactionId}
        initialValues={
          editFund
            ? {
                amount: editFund.amount,
                description: editFund.description,
                proofPublicId: editFund.proofPublicId,
                proofUrl: editFund.proofUrl,
              }
            : undefined
        }
      />

      {/* Edit Withdrawal Dialog */}
      <WithdrawDialog
        projectId={projectId}
        projectSlug={projectSlug}
        open={!!editWithdraw}
        onOpenChange={(open) => !open && setEditWithdraw(null)}
        mode="edit"
        transactionId={editWithdraw?.transactionId}
        initialValues={
          editWithdraw
            ? {
                amount: editWithdraw.amount,
                description: editWithdraw.description,
                proofPublicId: editWithdraw.proofPublicId,
                proofUrl: editWithdraw.proofUrl,
              }
            : undefined
        }
      />
    </div>
  );
}
