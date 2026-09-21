"use client";

import type { ProjectDocument } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { EditForm } from "./edit-form";

interface EditDialogProps {
  projectId: string;
  document: ProjectDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditDialog({
  projectId,
  document: doc,
  open,
  onOpenChange,
  onSuccess,
}: EditDialogProps) {
  const isMobile = useIsMobile();
  const title = "Edit Dokumen";
  const descriptionText = "Perbarui informasi dan metadata dokumen.";

  if (!doc) return null;

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{descriptionText}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto px-1 no-scrollbar">
            <EditForm
              projectId={projectId}
              document={doc}
              onSuccess={handleSuccess}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex h-[85dvh] flex-col">
        <DrawerHeader className="shrink-0 text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{descriptionText}</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <EditForm
            projectId={projectId}
            document={doc}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
