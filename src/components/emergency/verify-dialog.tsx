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
import { useVerifyEmergencyRequest } from "~/hooks/useEmergency";

interface VerifyDialogProps {
  projectId: string;
  transactionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "review" | "undo";
}

export function VerifyDialog({
  projectId,
  transactionId,
  open,
  onOpenChange,
  mode = "review",
}: VerifyDialogProps) {
  const verifyRequest = useVerifyEmergencyRequest();
  const isUndo = mode === "undo";

  const handleVerify = async () => {
    if (!transactionId) return;

    try {
      await verifyRequest.mutateAsync({
        projectId,
        transactionId,
        status: isUndo ? "UNREVIEWED" : "REVIEWED",
      });
      toast.success(
        isUndo
          ? "Status review transaksi berhasil dibatalkan"
          : "Transaksi berhasil direview",
      );
      onOpenChange(false);
    } catch (error) {
      toast.error(
        isUndo
          ? "Gagal membatalkan review transaksi"
          : "Gagal mereview transaksi",
      );
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isUndo ? "Batalkan Review Transaksi" : "Review Transaksi"}
          </DialogTitle>
          <DialogDescription>
            {isUndo
              ? "Apakah Anda yakin ingin membatalkan status review transaksi ini? Transaksi akan dikembalikan ke status belum ditinjau."
              : "Apakah Anda yakin ingin menandai transaksi ini sebagai sudah direview? Ini mengonfirmasi bahwa pengeluaran tersebut valid."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant={isUndo ? "destructive" : "default"}
            onClick={handleVerify}
            disabled={verifyRequest.isPending}
          >
            {verifyRequest.isPending
              ? "Memproses..."
              : isUndo
                ? "Batalkan Review"
                : "Tandai Sudah Direview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
