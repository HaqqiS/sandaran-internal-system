"use client";

import type { ProjectDocument } from "@prisma/client";
import { useState } from "react";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import { EditForm } from "./edit-form";

interface EditDialogProps {
  projectId: string;
  projectSlug: string;
  document: ProjectDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditDialog({
  projectId,
  projectSlug,
  document: doc,
  open,
  onOpenChange,
  onSuccess,
}: EditDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);

  if (!doc) return null;

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Dokumen"
      description="Perbarui informasi dan metadata dokumen."
      formId="edit-doc-form"
      submitLabel={isPending ? "Menyimpan..." : "Simpan Perubahan"}
      isPending={isPending}
      submitDisabled={!canSubmit}
      dialogClassName="sm:max-w-xl"
    >
      <EditForm
        id="edit-doc-form"
        projectId={projectId}
        projectSlug={projectSlug}
        document={doc}
        onPendingChange={setIsPending}
        onCanSubmitChange={setCanSubmit}
        onSuccess={handleSuccess}
      />
    </ResponsiveFormDialog>
  );
}
