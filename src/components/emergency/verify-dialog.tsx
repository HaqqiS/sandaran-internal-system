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
}

export function VerifyDialog({
  projectId,
  transactionId,
  open,
  onOpenChange,
}: VerifyDialogProps) {
  const verifyRequest = useVerifyEmergencyRequest();

  const handleVerify = async () => {
    if (!transactionId) return;

    try {
      await verifyRequest.mutateAsync({
        projectId,
        transactionId,
        status: "REVIEWED",
      });
      toast.success("Transaksi berhasil direview");
      onOpenChange(false);
    } catch (error) {
      toast.error("Gagal mereview transaksi");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Transaksi</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menandai transaksi ini sebagai sudah
            direview? Ini mengonfirmasi bahwa pengeluaran tersebut valid.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleVerify} disabled={verifyRequest.isPending}>
            {verifyRequest.isPending ? "Memproses..." : "Tandai Sudah Direview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
