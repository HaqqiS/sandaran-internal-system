"use client"

import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useVerifyEmergencyRequest } from "~/hooks/useEmergency"

interface VerifyDialogProps {
  projectId: string
  transactionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VerifyDialog({
  projectId,
  transactionId,
  open,
  onOpenChange,
}: VerifyDialogProps) {
  const verifyRequest = useVerifyEmergencyRequest()

  const handleVerify = async () => {
    if (!transactionId) return

    try {
      await verifyRequest.mutateAsync({
        projectId,
        transactionId,
        status: "REVIEWED",
      })
      toast.success("Transaction marked as reviewed")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to verify transaction")
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Transaction</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this transaction as reviewed? This
            confirms that the expense is valid.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleVerify} disabled={verifyRequest.isPending}>
            {verifyRequest.isPending ? "Processing..." : "Mark as Reviewed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
