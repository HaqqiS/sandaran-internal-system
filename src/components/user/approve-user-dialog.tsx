"use client"

import { useState } from "react"
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
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { api } from "~/trpc/react"

interface ApproveUserDialogProps {
  user: {
    id: string
    name: string
    email: string
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApproveUserDialog({
  user,
  open,
  onOpenChange,
}: ApproveUserDialogProps) {
  const [role, setRole] = useState<"USER" | "CEO" | "ADMIN">("USER")
  const utils = api.useUtils()

  const approve = api.user.approveUserSimple.useMutation({
    onSuccess: () => {
      toast.success(`${user?.name} has been approved successfully`)
      utils.user.getAllUsersWithFilter.invalidate()
      onOpenChange(false)
      setRole("USER") // Reset to default
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve user")
    },
  })

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Approve User</DialogTitle>
          <DialogDescription>
            Approve {user.name} and assign a global role
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>User Information</Label>
            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="font-medium">{user.name}</div>
              <div className="text-muted-foreground">{user.email}</div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Select Global Role</Label>
            <RadioGroup
              value={role}
              onValueChange={(v) => setRole(v as "USER" | "CEO" | "ADMIN")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="USER" id="user" />
                <Label htmlFor="user" className="font-normal">
                  <span className="font-medium">USER</span> - Regular access to
                  assigned projects
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CEO" id="ceo" />
                <Label htmlFor="ceo" className="font-normal">
                  <span className="font-medium">CEO</span> - Read-only access to
                  all projects
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ADMIN" id="admin" />
                <Label htmlFor="admin" className="font-normal">
                  <span className="font-medium">ADMIN</span> - Full system
                  access
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={approve.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              approve.mutate({
                userId: user.id,
                roleGlobal: role,
              })
            }
            disabled={approve.isPending}
          >
            {approve.isPending ? "Approving..." : "Approve User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
