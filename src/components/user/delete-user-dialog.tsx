"use client";

import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useDeleteUser } from "~/hooks/useUser";

interface DeleteUserDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
}: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    if (!user) return;
    deleteUser.mutate(
      { userId: user.id },
      {
        onSuccess: () => {
          toast.success(`${user.name} telah dihapus`);
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message || "Gagal menghapus pengguna");
        },
      },
    );
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hapus Pengguna</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus pengguna ini secara permanen?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground">{user.email}</div>
            <div className="mt-1 text-xs">
              Status:{" "}
              <span className="font-medium">
                {user.isActive ? "Aktif" : "Tidak Aktif"}
              </span>
            </div>
          </div>
          <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm font-medium text-destructive">
              ⚠️ Peringatan: Tindakan ini tidak dapat dibatalkan
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pengguna dan semua data terkait akan dihapus secara permanen dari
              sistem.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteUser.isPending}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending ? "Menghapus..." : "Hapus Pengguna"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
