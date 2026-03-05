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
  type ItemFormDraft,
  type ItemFormValues,
  LogisticItemForm,
} from "./item-form";

interface LogisticItemDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  children?: React.ReactNode;
}

export function LogisticItemDialog({
  projectId,
  open,
  onOpenChange,
  onSuccess,
  children,
}: LogisticItemDialogProps) {
  const isMobile = useIsMobile();
  const title = "Add New Item";
  const description = "Create a new logistic item to track in this project.";
  const [draft, setDraft] = useState<ItemFormDraft>({});
  const formRef = useRef<{ getValues: () => ItemFormValues }>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && formRef.current) {
      setDraft(formRef.current.getValues());
    }
    onOpenChange(isOpen);
  };

  const handleSuccess = () => {
    setDraft({});
    onSuccess();
    onOpenChange(false);
  };

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <LogisticItemForm
            ref={formRef}
            projectId={projectId}
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
          <LogisticItemForm
            ref={formRef}
            projectId={projectId}
            draftValues={draft}
            onSuccess={handleSuccess}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
