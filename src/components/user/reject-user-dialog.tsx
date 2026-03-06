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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tolak Pengguna</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menolak pendaftaran pengguna ini?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground">{user.email}</div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Pengguna ini akan ditandai sebagai ditolak dan tidak dapat mengakses
            sistem.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reject.isPending}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={reject.isPending}
          >
            {reject.isPending ? "Menolak..." : "Tolak Pengguna"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
