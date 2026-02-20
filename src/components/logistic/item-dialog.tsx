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
import { LogisticItemForm } from "./item-form";

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

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <LogisticItemForm projectId={projectId} onSuccess={onSuccess} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto no-scrollbar flex-1">
          <LogisticItemForm projectId={projectId} onSuccess={onSuccess} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
