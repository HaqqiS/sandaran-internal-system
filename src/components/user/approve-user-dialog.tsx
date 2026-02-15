"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
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
  const [assignProject, setAssignProject] = useState(false)
  const [projectId, setProjectId] = useState<string>("")
  const [projectRole, setProjectRole] = useState<
    "MANDOR" | "ARCHITECT" | "FINANCE"
  >("MANDOR")

  const utils = api.useUtils()

  // Fetch projects only when needed
  const { data: projects } = api.project.getAll.useQuery(undefined, {
    enabled: open && role === "USER" && assignProject,
  })

  const approve = api.user.approveUser.useMutation({
    onSuccess: () => {
      toast.success(`${user?.name} has been approved successfully`)
      utils.user.getAllUsersWithFilter.invalidate()
      onOpenChange(false)
      // Reset state
      setRole("USER")
      setAssignProject(false)
      setProjectId("")
      setProjectRole("MANDOR")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve user")
    },
  })

  if (!user) return null

  const handleApprove = () => {
    if (assignProject && !projectId) {
      toast.error("Please select a project")
      return
    }

    approve.mutate({
      userId: user.id,
      roleGlobal: role,
      projectAssignment:
        assignProject && projectId
          ? {
              projectId,
              role: projectRole,
            }
          : undefined,
    })
  }

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
              onValueChange={(v) => {
                setRole(v as "USER" | "CEO" | "ADMIN")
                if (v !== "USER") setAssignProject(false)
              }}
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

          {role === "USER" && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="assignProject"
                  checked={assignProject}
                  onCheckedChange={(checked) => setAssignProject(!!checked)}
                />
                <Label htmlFor="assignProject">
                  Assign to Project (Optional)
                </Label>
              </div>

              {assignProject && (
                <div className="grid gap-4 pl-6">
                  <div className="grid gap-2">
                    <Label>Project</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Project Role</Label>
                    <Select
                      value={projectRole}
                      onValueChange={(v) =>
                        setProjectRole(v as "MANDOR" | "ARCHITECT" | "FINANCE")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANDOR">Mandor</SelectItem>
                        <SelectItem value="ARCHITECT">Architect</SelectItem>
                        <SelectItem value="FINANCE">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={approve.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={approve.isPending}>
            {approve.isPending ? "Approving..." : "Approve User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
