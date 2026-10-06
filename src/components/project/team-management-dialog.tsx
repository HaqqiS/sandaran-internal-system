"use client";

import { MemberManagement } from "~/components/project/member-management";
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
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="flex min-h-[60dvh] max-h-[85dvh] flex-col">
          <DrawerHeader className="shrink-0 border-b pb-3 text-left">
            <DrawerTitle>Team Management</DrawerTitle>
            <DrawerDescription>
              Add, remove, and manage roles for project members.
            </DrawerDescription>
          </DrawerHeader>
          <div
            className="flex min-h-0 flex-1 flex-col px-4 py-4"
            data-vaul-no-drag
          >
            <MemberManagement projectId={projectId} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] min-h-[450px] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Team Management</DialogTitle>
          <DialogDescription>
            Add, remove, and manage roles for project members.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <MemberManagement projectId={projectId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
