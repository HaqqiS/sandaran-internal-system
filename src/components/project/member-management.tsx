"use client"

import { IconPlus, IconTrash } from "@tabler/icons-react"
import type { GlobalRole, ProjectRole } from "generated/prisma"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  useAddProjectMember,
  useProjectMembers,
  useRemoveMember,
  useUpdateMemberRole,
} from "~/hooks"
import { isAdmin } from "~/lib/auth-guards"
import { useSessionStore } from "~/stores/use-session-store"
import { UserSelect } from "./user-select"

interface MemberManagementProps {
  projectId: string
}

const PROJECT_ROLES: { value: ProjectRole; label: string }[] = [
  { value: "MANDOR", label: "Mandor" },
  { value: "ARCHITECT", label: "Architect" },
  { value: "FINANCE", label: "Finance" },
]

export function MemberManagement({ projectId }: MemberManagementProps) {
  const session = useSessionStore((state) => state.session)
  const canManage = isAdmin(
    session?.user?.roleGlobal as GlobalRole | null | undefined,
  )

  const { data: members, isLoading } = useProjectMembers(projectId)
  const addMember = useAddProjectMember()
  const updateRole = useUpdateMemberRole()
  const removeMember = useRemoveMember()

  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<ProjectRole>("MANDOR")
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string
    name: string | null
  } | null>(null)

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user")
      return
    }

    try {
      await addMember.mutateAsync({
        projectId,
        userId: selectedUserId,
        role: selectedRole,
      })
      toast.success("Member added successfully")
      setSelectedUserId("")
      setSelectedRole("MANDOR")
    } catch {
      // Error handled by global mutation cache
    }
  }

  const handleRoleChange = async (memberId: string, newRole: ProjectRole) => {
    try {
      await updateRole.mutateAsync({
        memberId,
        role: newRole,
      })
      toast.success("Role updated successfully")
    } catch {
      // Error handled by global mutation cache
    }
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) return
    try {
      await removeMember.mutateAsync({ memberId: memberToRemove.id })
      toast.success("Member removed successfully")
      setMemberToRemove(null)
    } catch {
      // Error handled by global mutation cache
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading members...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Member Section */}
      {canManage && (
        <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label>Select User</Label>
            <UserSelect
              onSelect={(userId) => setSelectedUserId(userId)}
              disabled={addMember.isPending}
            />
          </div>
          <div className="w-full space-y-2 sm:w-40">
            <Label>Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as ProjectRole)}
              disabled={addMember.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAddMember}
            disabled={!selectedUserId || addMember.isPending}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            {addMember.isPending ? "Adding..." : "Add Member"}
          </Button>
        </div>
      )}

      {/* Members Table */}
      {members && members.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                {canManage && (
                  <TableHead className="w-[80px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user.image || undefined} />
                        <AvatarFallback>
                          {member.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {member.user.name || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {member.user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          handleRoleChange(member.id, value as ProjectRole)
                        }
                        disabled={updateRole.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROJECT_ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="capitalize">
                        {member.role.toLowerCase()}
                      </span>
                    )}
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() =>
                          setMemberToRemove({
                            id: member.id,
                            name: member.user.name,
                          })
                        }
                        disabled={removeMember.isPending}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">No members yet.</p>
          {canManage && (
            <p className="mt-2 text-sm text-muted-foreground">
              Add team members using the form above.
            </p>
          )}
        </div>
      )}

      {/* Remove Confirmation */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{memberToRemove?.name}" from this
              project?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMember.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
