"use client";

import {
  IconDotsVertical,
  IconEdit,
  IconHistory,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useProjectMembers } from "~/hooks/useProject";
import { useSession } from "~/stores/use-session-store";
import { LogisticItemForm } from "./item-form";
import { TransactionHistory } from "./transaction-history";

interface ItemActionsProps {
  projectId: string;
  item: {
    id: string;
    name: string;
    unit: string;
  };
  onDelete?: () => void;
}

export function ItemActions({ projectId, item, onDelete }: ItemActionsProps) {
  const { session } = useSession();
  const { data: members } = useProjectMembers(projectId);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [isEditPending, setIsEditPending] = useState(false);

  // Find user's role in this project
  const projectMember = members?.find((m) => m.userId === session?.user?.id);
  const role = projectMember?.role;

  const canManage = role === "FINANCE" || session?.user?.roleGlobal === "ADMIN";

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="Buka menu aksi"
          >
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setShowHistoryDialog(true)}>
            <IconHistory className="mr-2 h-4 w-4" />
            Lihat Riwayat
          </DropdownMenuItem>
          {canManage && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Edit Barang
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onDelete?.()}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Hapus Barang
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Edit Dialog ──────────── */}
      <ResponsiveFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title="Edit Barang"
        description="Perbarui nama atau satuan untuk barang ini."
        formId="edit-item-form"
        submitLabel={isEditPending ? "Menyimpan..." : "Simpan Perubahan"}
        isPending={isEditPending}
        dialogClassName="sm:max-w-md"
      >
        <LogisticItemForm
          id="edit-item-form"
          projectId={projectId}
          item={item}
          onPendingChange={setIsEditPending}
          onSuccess={() => setShowEditDialog(false)}
        />
      </ResponsiveFormDialog>

      {/* ── History Dialog ──────────── */}
      <ResponsiveFormDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        title="Riwayat Transaksi"
        description={`${item.name} · ${item.unit}`}
        cancelLabel="Tutup"
        showCancelOnly
        dialogClassName="sm:max-w-3xl"
      >
        <TransactionHistory projectId={projectId} itemId={item.id} />
      </ResponsiveFormDialog>
    </>
  );
}
