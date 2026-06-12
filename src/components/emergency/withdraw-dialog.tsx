"use client";

import { useRef, useState } from "react";
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
import {
  RequestForm,
  type WithdrawFormDraft,
  type WithdrawFormValues,
} from "./request-form";

interface WithdrawDialogProps {
  projectId: string;
  projectSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  transactionId?: string;
  initialValues?: WithdrawFormDraft;
}

export function WithdrawDialog({
  projectId,
  projectSlug,
  open,
  onOpenChange,
  mode = "create",
  transactionId,
  initialValues,
}: WithdrawDialogProps) {
  const isMobile = useIsMobile();
  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Penarikan Dana" : "Ajukan Penarikan Dana";
  const description = isEdit
    ? "Ubah detail penarikan dana darurat ini."
    : "Ajukan penarikan dana darurat untuk project ini.Lampirkan bukti jika ada.";
  const [draft, setDraft] = useState<WithdrawFormDraft>({});
  const formRef = useRef<{ getValues: () => WithdrawFormValues }>(null);

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
          <RequestForm
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
          <RequestForm
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
