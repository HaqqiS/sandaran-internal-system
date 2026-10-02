"use client";

import { useRef, useState } from "react";
import {
  WithdrawForm,
  type WithdrawFormDraft,
  type WithdrawFormRef,
} from "~/components/emergency/withdraw-form";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";

interface WithdrawDialogProps {
  projectId: string;
  projectSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  transactionId?: string;
  initialValues?: WithdrawFormDraft;
  isReviewed?: boolean;
}

export function WithdrawDialog({
  projectId,
  projectSlug,
  open,
  onOpenChange,
  mode = "create",
  transactionId,
  initialValues,
  isReviewed,
}: WithdrawDialogProps) {
  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Penarikan Dana" : "Ajukan Penarikan Dana";
  const description = isEdit
    ? "Ubah detail penarikan dana darurat ini."
    : "Ajukan penarikan dana darurat untuk project ini. Lampirkan bukti jika ada.";
  const [draft, setDraft] = useState<WithdrawFormDraft>({});
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<WithdrawFormRef>(null);

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
      : "Ajukan Dana";

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      submitLabel={submitLabel}
      onSubmit={handleSubmit}
      isPending={isPending}
    >
      <WithdrawForm
        ref={formRef}
        projectId={projectId}
        projectSlug={projectSlug}
        mode={mode}
        transactionId={transactionId}
        draftValues={formDraftValues}
        isReviewed={isReviewed}
        onPendingChange={setIsPending}
        onSuccess={handleSuccess}
      />
    </ResponsiveFormDialog>
  );
}
