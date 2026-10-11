"use client";

import { toast } from "sonner";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import { Button } from "~/components/ui/button";
import { useRejectUser } from "~/hooks/useUser";

interface RejectUserDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectUserDialog({
  user,
  open,
  onOpenChange,
}: RejectUserDialogProps) {
  const reject = useRejectUser();

  const handleReject = () => {
    if (!user) return;
    reject.mutate(
      { userId: user.id },
      {
        onSuccess: () => {
          toast.success(`${user.name} telah ditolak`);
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message || "Gagal menolak pengguna");
        },
      },
    );
  };

  if (!user) return null;

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tolak Pengguna"
      description="Apakah Anda yakin ingin menolak pendaftaran pengguna ini?"
      cancelLabel="Batal"
      customFooter={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reject.isPending}
            className="flex-1 sm:flex-none"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={reject.isPending}
            className="flex-1 sm:flex-none"
          >
            {reject.isPending ? "Menolak..." : "Tolak Pengguna"}
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
          Pengguna ini akan ditandai sebagai ditolak dan tidak dapat mengakses
          sistem.
        </p>
      </div>
    </ResponsiveFormDialog>
  );
}
