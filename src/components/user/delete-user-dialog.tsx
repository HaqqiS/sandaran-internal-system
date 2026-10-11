"use client";

import { toast } from "sonner";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import { Button } from "~/components/ui/button";
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
    <ResponsiveFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Hapus Pengguna"
      description="Apakah Anda yakin ingin menghapus pengguna ini secara permanen?"
      cancelLabel="Batal"
      customFooter={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteUser.isPending}
            className="flex-1 sm:flex-none"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteUser.isPending}
            className="flex-1 sm:flex-none"
          >
            {deleteUser.isPending ? "Menghapus..." : "Hapus Pengguna"}
          </Button>
        </>
      }
      dialogClassName="sm:max-w-[425px]"
    >
      <div className="space-y-3">
        <div className="rounded-md bg-muted p-3 text-sm">
          <div className="font-medium text-foreground">{user.name}</div>
          <div className="text-muted-foreground">{user.email}</div>
        </div>
        <p className="text-sm text-muted-foreground">
          Tindakan ini tidak dapat dibatalkan. Data pengguna akan dihapus secara
          permanen dari sistem.
        </p>
      </div>
    </ResponsiveFormDialog>
  );
}
