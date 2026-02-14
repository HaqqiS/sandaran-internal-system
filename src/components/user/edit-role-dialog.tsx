"use client"

import type { GlobalRole } from "generated/prisma"
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

interface EditRoleDialogProps {
  user: {
    id: string
    name: string
    email: string
    roleGlobal: GlobalRole
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRoleDialog({
  user,
  open,
  onOpenChange,
}: EditRoleDialogProps) {
  const [role, setRole] = useState<GlobalRole>("USER")
  const utils = api.useUtils()

  // Update role when user changes
  useState(() => {
    if (user) {
      setRole(user.roleGlobal)
    }
  })

  const updateRole = api.user.updateGlobalRole.useMutation({
    onSuccess: () => {
      toast.success(`Role updated successfully for ${user?.name}`)
      utils.user.getAllUsersWithFilter.invalidate()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update role")
    },
  })

  if (!user) return null

  const hasRoleChanged = role !== user.roleGlobal

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Change the global role for {user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>User Information</Label>
            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="font-medium">{user.name}</div>
              <div className="text-muted-foreground">{user.email}</div>
              <div className="mt-1 text-xs">
                Current Role:{" "}
                <span className="font-medium">{user.roleGlobal}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Select New Role</Label>
            <RadioGroup
              value={role}
              onValueChange={(v) => setRole(v as GlobalRole)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NONE" id="none" />
                <Label htmlFor="none" className="font-normal">
                  <span className="font-medium">NONE</span> - No access
                </Label>
              </div>
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
            disabled={updateRole.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              updateRole.mutate({
                userId: user.id,
                roleGlobal: role,
              })
            }
            disabled={updateRole.isPending || !hasRoleChanged}
          >
            {updateRole.isPending ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
