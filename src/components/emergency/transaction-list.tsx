"use client";

import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "~/components/shared/confirm-delete-dialog";
import { MediaPreview } from "~/components/shared/media-preview";
import { DataGrid } from "~/components/ui/data-grid";
import {
  useDeleteEmergencyTransaction,
  useEmergencyTransactions,
} from "~/hooks/useEmergency";
import { DepositDialog } from "./deposit-dialog";
import {
  type EmergencyTransactionWithRelations,
  getEmergencyTransactionColumns,
} from "./transaction-columns";
import { VerifyDialog } from "./verify-dialog";
import { WithdrawDialog } from "./withdraw-dialog";

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
  const [verifyTarget, setVerifyTarget] = useState<{
    id: string;
    mode: "review" | "undo";
  } | null>(null);
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
    isReviewed?: boolean;
  } | null>(null);

  // Edit state for WITHDRAWAL
  const [editWithdraw, setEditWithdraw] = useState<{
    transactionId: string;
    amount: string;
    description: string;
    proofPublicId?: string;
    proofUrl?: string;
    isReviewed?: boolean;
  } | null>(null);

  /**
   * Determine if the current user can edit/delete a given transaction
   */
  function canEditDelete(row: EmergencyTransactionWithRelations): boolean {
    // ADMIN can always edit/delete
    if (isAdmin) return true;

    // Owner check
    const isOwner = row.requestedById === currentUserId;
    if (!isOwner) return false;

    // WITHDRAWAL must be UNREVIEWED
    if (row.type === "WITHDRAWAL" && row.status !== "UNREVIEWED") return false;

    return true;
  }

  function handleEditClick(row: EmergencyTransactionWithRelations) {
    const isReviewed = row.status === "REVIEWED";
    const initialValues = {
      amount: String(Number(row.amount)),
      description: row.description,
      proofPublicId: row.publicId ?? undefined,
      proofUrl: row.url ?? undefined,
      isReviewed,
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

  const columns = getEmergencyTransactionColumns({
    canReview,
    canEditDelete,
    onVerify: setVerifyTarget,
    onEdit: handleEditClick,
    onDelete: setDeleteTarget,
    onPreviewImage: setLightboxImage,
  });

  if (isLoading) {
    return <div className="p-4 text-center">Memuat transaksi...</div>;
  }

  return (
    <div className="space-y-4 min-w-0 w-full">
      <DataGrid
        columns={columns}
        data={(transactions as EmergencyTransactionWithRelations[]) || []}
        filterColumn="description"
        filterPlaceholder="Cari keterangan transaksi..."
        initialColumnPinning={{
          left: ["description"],
          right: ["actions"],
        }}
        exportFilename="transaksi-dana-darurat"
        csvColumns={[
          {
            header: "Tanggal",
            accessor: (row) =>
              format(new Date(row.createdAt), "yyyy-MM-dd HH:mm"),
          },
          { header: "Keterangan", accessor: (row) => row.description },
          { header: "Tipe", accessor: (row) => row.type },
          { header: "Jumlah (IDR)", accessor: (row) => Number(row.amount) },
          { header: "Status", accessor: (row) => row.status },
          {
            header: "Pengaju",
            accessor: (row) => row.requester?.name ?? "-",
          },
        ]}
        emptyMessage="Tidak ada transaksi ditemukan."
      />

      {/* Review / Undo Review Dialog */}
      <VerifyDialog
        projectId={projectId}
        transactionId={verifyTarget?.id ?? null}
        open={!!verifyTarget}
        onOpenChange={(open: boolean) => !open && setVerifyTarget(null)}
        mode={verifyTarget?.mode ?? "review"}
      />

      {/* Lightbox */}
      <MediaPreview
        url={lightboxImage}
        open={!!lightboxImage}
        onOpenChange={(open: boolean) => !open && setLightboxImage(null)}
      />

      {/* Delete Confirmation AlertDialog */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Transaksi"
        itemName={deleteTarget?.description}
        description={
          <>
            Apakah Anda yakin ingin menghapus transaksi{" "}
            <span className="inline-block max-w-50 align-bottom font-semibold truncate sm:max-w-70 text-foreground">
              &quot;{deleteTarget?.description}&quot;
            </span>
            ? Tindakan ini tidak dapat dibatalkan dan saldo akan disesuaikan.
          </>
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteTransaction.isPending}
      />

      {/* Edit Deposit Dialog */}
      <DepositDialog
        projectId={projectId}
        projectSlug={projectSlug}
        open={!!editFund}
        onOpenChange={(open: boolean) => !open && setEditFund(null)}
        mode="edit"
        transactionId={editFund?.transactionId}
        isReviewed={editFund?.isReviewed}
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
        onOpenChange={(open: boolean) => !open && setEditWithdraw(null)}
        mode="edit"
        transactionId={editWithdraw?.transactionId}
        isReviewed={editWithdraw?.isReviewed}
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
