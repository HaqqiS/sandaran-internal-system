"use client";

import { useRef, useState } from "react";
import {
  FundForm,
  type FundFormDraft,
  type FundFormValues,
} from "~/components/emergency/fund-form";
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

interface FundDialogProps {
  projectId: string;
  projectSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  transactionId?: string;
  initialValues?: FundFormDraft;
}

export function FundDialog({
  projectId,
  projectSlug,
  open,
  onOpenChange,
  mode = "create",
  transactionId,
  initialValues,
}: FundDialogProps) {
  const isMobile = useIsMobile();
  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Dana Masuk" : "Tambah Dana Darurat";
  const description = isEdit
    ? "Ubah detail transaksi dana masuk ini."
    : "Add balance to the project's emergency fund. This will be recorded as a deposit.";
  const [draft, setDraft] = useState<FundFormDraft>({});
  const formRef = useRef<{ getValues: () => FundFormValues }>(null);

  // Use initialValues when available (edit mode), otherwise fall back to draft
  const formDraftValues = isEdit ? initialValues : draft;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && formRef.current && !isEdit) {
      setDraft(formRef.current.getValues());
    }
    onOpenChange(isOpen);
  };

  const handleSuccess = () => {
    setDraft({});
    onOpenChange(false);
  };

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <FundForm
            ref={formRef}
            projectId={projectId}
            projectSlug={projectSlug}
            mode={mode}
            transactionId={transactionId}
            draftValues={formDraftValues}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="flex flex-col h-[85dvh]">
        <DrawerHeader className="text-left shrink-0">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <FundForm
            ref={formRef}
            projectId={projectId}
            projectSlug={projectSlug}
            mode={mode}
            transactionId={transactionId}
            draftValues={formDraftValues}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
