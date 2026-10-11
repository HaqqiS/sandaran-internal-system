"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
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
  const title = "Tambah Barang Baru";
  const description =
    "Buat barang logistik baru untuk dilacak pada proyek ini.";
  const [draft, setDraft] = useState<ItemFormDraft>({});
  const [isPending, setIsPending] = useState(false);
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

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      formId="item-form"
      submitLabel={isPending ? "Menyimpan..." : "Tambah Barang"}
      isPending={isPending}
      trigger={children}
    >
      <LogisticItemForm
        id="item-form"
        ref={formRef}
        projectId={projectId}
        draftValues={draft}
        onPendingChange={setIsPending}
        onSuccess={handleSuccess}
      />
    </ResponsiveFormDialog>
  );
}
