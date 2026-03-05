"use client";

import type * as React from "react";
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
import { UploadForm } from "./upload-form";

interface UploadDialogProps {
  projectId: string;
  projectSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function UploadDialog({
  projectId,
  projectSlug,
  open,
  onOpenChange,
  onSuccess,
  children,
}: UploadDialogProps) {
  const isMobile = useIsMobile();

  const title = "Upload Document";
  const descriptionText = "Upload design files, drawings, or specifications.";

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{descriptionText}</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto no-scrollbar max-h-[80vh] px-1">
            <UploadForm
              projectId={projectId}
              projectSlug={projectSlug}
              onSuccess={() => {
                onOpenChange(false);
                onSuccess?.();
              }}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent className="flex flex-col h-[85dvh]">
        <DrawerHeader className="text-left shrink-0">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{descriptionText}</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <UploadForm
            projectId={projectId}
            projectSlug={projectSlug}
            onSuccess={() => {
              onOpenChange(false);
              onSuccess?.();
            }}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
