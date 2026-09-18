"use client";

import { useRef, useState } from "react";
import {
  DepositForm,
  type DepositFormDraft,
  type DepositFormRef,
} from "~/components/emergency/deposit-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";

interface DepositDialogProps {
  projectId: string;
  projectSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  transactionId?: string;
  initialValues?: DepositFormDraft;
}

export function DepositDialog({
  projectId,
  projectSlug,
  open,
  onOpenChange,
  mode = "create",
  transactionId,
  initialValues,
}: DepositDialogProps) {
  const isMobile = useIsMobile();
  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Dana Masuk" : "Tambah Dana Darurat";
  const description = isEdit
    ? "Ubah detail transaksi dana masuk ini."
    : "Tambah dana darurat untuk project ini.";
  const [draft, setDraft] = useState<DepositFormDraft>({});
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<DepositFormRef>(null);

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

  const handleSubmit = () => {
    formRef.current?.submit();
  };

  const submitLabel = isPending
    ? "Memproses..."
    : isEdit
      ? "Simpan Perubahan"
      : "Tambah Kas Masuk";

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <div className="flex flex-col max-h-[90dvh]">
            {/* Fixed header */}
            <div className="shrink-0 px-4 pt-4 pb-3 pr-12 border-b">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {description}
              </DialogDescription>
            </div>

            {/* Scrollable body */}
            <div
              className="flex-1 min-h-0 overflow-y-auto px-6 py-5"
              data-lenis-prevent
            >
              <DepositForm
                ref={formRef}
                projectId={projectId}
                projectSlug={projectSlug}
                mode={mode}
                transactionId={transactionId}
                draftValues={formDraftValues}
                onPendingChange={setIsPending}
                onSuccess={handleSuccess}
              />
            </div>

            {/* Fixed footer */}
            <div className="shrink-0 border-t bg-muted/50 px-4 py-3 flex justify-end gap-2 rounded-b-xl">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={isPending}>
                {submitLabel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="flex flex-col h-[85dvh]">
        <DrawerHeader className="text-left shrink-0 border-b pb-3">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div
          className="flex-1 min-h-0 overflow-y-auto px-4 py-4"
          data-lenis-prevent
        >
          <DepositForm
            ref={formRef}
            projectId={projectId}
            projectSlug={projectSlug}
            mode={mode}
            transactionId={transactionId}
            draftValues={formDraftValues}
            onPendingChange={setIsPending}
            onSuccess={handleSuccess}
          />
        </div>
        <DrawerFooter className="shrink-0 border-t mt-0 flex flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isPending}
          >
            {submitLabel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
