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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
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
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Team Management</SheetTitle>
            <SheetDescription>
              Add, remove, and manage roles for project members.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 mx-2">
            <MemberManagement projectId={projectId} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Team Management</DialogTitle>
          <DialogDescription>
            Add, remove, and manage roles for project members.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <MemberManagement projectId={projectId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
