"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import {
  ProjectForm,
  type ProjectFormDraft,
  type ProjectFormValues,
} from "./project-form";

interface ProjectDialogProps {
  project?: {
    id: string;
    name: string;
    slug: string;
    shortId?: string | null;
    description?: string | null;
    location?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    status: "ACTIVE" | "DONE" | "PAUSED";
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function ProjectDialog({
  project,
  open,
  onOpenChange,
  children,
}: ProjectDialogProps) {
  const isEditMode = Boolean(project);
  const [draft, setDraft] = useState<ProjectFormDraft>({});
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<{ getValues: () => ProjectFormValues }>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && formRef.current) {
      setDraft(formRef.current.getValues());
    }
    onOpenChange?.(isOpen);
  };

  const handleSuccess = () => {
    setDraft({});
    onOpenChange?.(false);
  };

  const title = isEditMode ? "Edit Proyek" : "Proyek Baru";
  const description = isEditMode
    ? "Ubah data dan detail proyek Anda."
    : "Buat proyek konstruksi atau interior baru.";

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      formId="project-form"
      submitLabel={isEditMode ? "Simpan Perubahan" : "Buat Proyek"}
      isPending={isPending}
      trigger={children}
      dialogClassName="sm:max-w-[525px]"
    >
      <ProjectForm
        id="project-form"
        ref={formRef}
        project={project}
        draftValues={draft}
        onPendingChange={setIsPending}
        onSuccess={handleSuccess}
      />
    </ResponsiveFormDialog>
  );
}
