"use client";

import { useRef, useState } from "react";
import {
  DepositForm,
  type DepositFormDraft,
  type DepositFormRef,
} from "~/components/emergency/deposit-form";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";

interface DepositDialogProps {
  projectId: string;
  projectSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  transactionId?: string;
  initialValues?: DepositFormDraft;
  isReviewed?: boolean;
}

export function DepositDialog({
  projectId,
  projectSlug,
  open,
  onOpenChange,
  mode = "create",
  transactionId,
  initialValues,
  isReviewed,
}: DepositDialogProps) {
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
      <DepositForm
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
