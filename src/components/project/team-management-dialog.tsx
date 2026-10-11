"use client";

import { MemberManagement } from "~/components/project/member-management";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";

interface TeamManagementDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamManagementDialog({
  projectId,
  open,
  onOpenChange,
}: TeamManagementDialogProps) {
  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Manajemen Tim"
      description="Tambah, hapus, dan kelola peran anggota proyek."
      cancelLabel="Tutup"
      showCancelOnly
      dialogClassName="sm:max-w-3xl"
    >
      <MemberManagement projectId={projectId} />
    </ResponsiveFormDialog>
  );
}
