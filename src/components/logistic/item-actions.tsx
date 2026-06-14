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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useIsMobile } from "~/hooks/use-mobile";
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
  const isMobile = useIsMobile();
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

      {/* ── Edit Dialog (same for all viewports) ──────────── */}
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

      {/* ── History: Drawer on mobile, Dialog on desktop ──── */}
      {isMobile ? (
        <Drawer open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DrawerContent className="flex flex-col h-[85dvh]">
            <DrawerHeader className="text-left shrink-0">
              <DrawerTitle>Riwayat Transaksi</DrawerTitle>
              <DrawerDescription>
                {item.name} · {item.unit}
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              <TransactionHistory projectId={projectId} itemId={item.id} />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
            <DialogHeader className="shrink-0">
              <DialogTitle>Riwayat Transaksi</DialogTitle>
              <DialogDescription>
                {item.name} · {item.unit}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto min-h-0 pr-1">
              <TransactionHistory projectId={projectId} itemId={item.id} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Delete Confirmation ────────────────────────────── */}
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
