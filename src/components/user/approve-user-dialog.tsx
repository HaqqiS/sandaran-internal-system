"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useApproveUser, useProjectList } from "~/hooks";

interface ApproveUserDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveUserDialog({
  user,
  open,
  onOpenChange,
}: ApproveUserDialogProps) {
  const [role, setRole] = useState<"USER" | "EXECUTIVE" | "ADMIN">("USER");
  const [assignProject, setAssignProject] = useState(false);
  const [projectId, setProjectId] = useState<string>("");
  const [projectRole, setProjectRole] = useState<
    "SUPERVISOR" | "ARCHITECT" | "FINANCE" | "LOGISTIC"
  >("SUPERVISOR");

  const { data: projects } = useProjectList({
    enabled: open && role === "USER" && assignProject,
  });

  const approve = useApproveUser(); // Use the custom hook

  const handleApprove = () => {
    if (assignProject && !projectId) {
      toast.error("Silakan pilih proyek");
      return;
    }

    if (!user) return; // Guard clause

    approve.mutate(
      {
        userId: user.id,
        roleGlobal: role,
        projectAssignment:
          assignProject && projectId
            ? {
                projectId,
                role: projectRole,
              }
            : undefined,
      },
      {
        onSuccess: () => {
          toast.success(`${user.name} berhasil disetujui`);
          onOpenChange(false);
          // Reset state
          setRole("USER");
          setAssignProject(false);
          setProjectId("");
          setProjectRole("SUPERVISOR");
        },
        onError: (error) => {
          toast.error(error.message || "Gagal menyetujui pengguna");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Setujui Pengguna</DialogTitle>
          <DialogDescription>
            Setujui {user?.name} dan tetapkan peran global
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Informasi Pengguna</Label>
            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="font-medium">{user?.name}</div>
              <div className="text-muted-foreground">{user?.email}</div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Pilih Peran Global</Label>
            <RadioGroup
              value={role}
              onValueChange={(v: string) => {
                setRole(v as "USER" | "EXECUTIVE" | "ADMIN");
                if (v !== "USER") setAssignProject(false);
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="USER" id="user" />
                <Label htmlFor="user" className="font-normal">
                  <span className="font-medium">USER</span> - Akses reguler ke
                  proyek yang ditugaskan
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="EXECUTIVE" id="executive" />
                <Label htmlFor="executive" className="font-normal">
                  <span className="font-medium">EXECUTIVE</span> - Akses baca
                  seluruh proyek
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ADMIN" id="admin" />
                <Label htmlFor="admin" className="font-normal">
                  <span className="font-medium">ADMIN</span> - Akses penuh
                  sistem
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
                  Tambahkan ke Proyek (Opsional)
                </Label>
              </div>

              {assignProject && (
                <div className="grid gap-4 pl-6">
                  <div className="grid gap-2">
                    <Label>Proyek</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih proyek" />
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
                    <Label>Peran Proyek</Label>
                    <Select
                      value={projectRole}
                      onValueChange={(v) =>
                        setProjectRole(
                          v as
                            | "SUPERVISOR"
                            | "ARCHITECT"
                            | "FINANCE"
                            | "LOGISTIC",
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                        <SelectItem value="ARCHITECT">Arsitek</SelectItem>
                        <SelectItem value="FINANCE">Keuangan</SelectItem>
                        <SelectItem value="LOGISTIC">Logistik</SelectItem>
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
            Batal
          </Button>
          <Button onClick={handleApprove} disabled={approve.isPending}>
            {approve.isPending ? "Menyetujui..." : "Setujui Pengguna"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
