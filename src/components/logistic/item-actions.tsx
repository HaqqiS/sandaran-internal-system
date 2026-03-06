"use client";

import {
  IconDotsVertical,
  IconEdit,
  IconHistory,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useDeleteLogisticItem } from "~/hooks/useLogistic";
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
}

export function ItemActions({ projectId, item }: ItemActionsProps) {
  const { session } = useSession();
  const { data: members } = useProjectMembers(projectId);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteItem = useDeleteLogisticItem();

  // Find user's role in this project
  const projectMember = members?.find((m) => m.userId === session?.user?.id);
  const role = projectMember?.role;

  const canManage = role === "FINANCE" || session?.user?.roleGlobal === "ADMIN";

  const handleDelete = async () => {
    try {
      await deleteItem.mutateAsync({
        projectId,
        itemId: item.id,
      });
      toast.success("Barang berhasil dihapus");
      setShowDeleteDialog(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <IconDotsVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowHistoryDialog(true)}>
            <IconHistory className="mr-2 h-4 w-4" />
            Lihat Riwayat
          </DropdownMenuItem>
          {canManage && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Edit Barang
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Hapus Barang
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Barang</DialogTitle>
            <DialogDescription>
              Perbarui nama atau satuan untuk barang ini.
            </DialogDescription>
          </DialogHeader>
          <LogisticItemForm
            projectId={projectId}
            item={item}
            onSuccess={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Riwayat Transaksi</DialogTitle>
            <DialogDescription>
              Riwayat untuk {item.name} ({item.unit})
            </DialogDescription>
          </DialogHeader>
          <TransactionHistory projectId={projectId} itemId={item.id} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Barang</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{item.name}</strong>?
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua
              transaksi terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteItem.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteItem.isPending}
            >
              {deleteItem.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
