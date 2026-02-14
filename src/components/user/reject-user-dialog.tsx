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
import { api } from "~/trpc/react"

interface RejectUserDialogProps {
  user: {
    id: string
    name: string
    email: string
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RejectUserDialog({
  user,
  open,
  onOpenChange,
}: RejectUserDialogProps) {
  const utils = api.useUtils()

  const reject = api.user.rejectUser.useMutation({
    onSuccess: () => {
      toast.success(`${user?.name} has been rejected`)
      utils.user.getAllUsersWithFilter.invalidate()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject user")
    },
  })

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reject User</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject this user registration?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground">{user.email}</div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            This user will be marked as rejected and won't be able to access the
            system.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reject.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => reject.mutate({ userId: user.id })}
            disabled={reject.isPending}
          >
            {reject.isPending ? "Rejecting..." : "Reject User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
