"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
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
  const isMobile = useIsMobile();
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

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ProjectForm
            ref={formRef}
            project={project}
            draftValues={draft}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent className="flex flex-col h-[85dvh]">
        <DrawerHeader className="text-left shrink-0">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <ProjectForm
            ref={formRef}
            project={project}
            draftValues={draft}
            onSuccess={handleSuccess}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
