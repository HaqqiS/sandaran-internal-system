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
  const isEditMode = !!project;
  const [draft, setDraft] = useState<ProjectFormDraft>({});
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

  const title = isEditMode ? "Edit Project" : "New Project";
  const description = isEditMode
    ? "Make changes to your project."
    : "Create a new construction project.";

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      trigger={children}
      dialogClassName="sm:max-w-[525px]"
    >
      <ProjectForm
        ref={formRef}
        project={project}
        draftValues={draft}
        onSuccess={handleSuccess}
      />
    </ResponsiveFormDialog>
  );
}
